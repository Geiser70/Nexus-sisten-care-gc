import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculatedStatistics } from './statisticsCalculator';
import { Patient, HealthCenter, AsisMetrics } from '../types/medical';

export const ExportService = {
  /**
   * Generates a multi-sheet real Excel (.xlsx) file with all statistical calculations
   */
  exportStatisticsToExcel(
    stats: CalculatedStatistics,
    patients: Patient[],
    filenamePrefix: string = 'Reporte_Estadistico_NexusCare'
  ): void {
    const wb = XLSX.utils.book_new();

    // 1. Resumen General
    const summaryData = [
      ['SISTEMA INTEGRAL DE HISTORIAS CLÍNICAS Y EPIDEMIOLOGÍA - NEXUS ASISTEN CARE G.C'],
      ['REPORTE ESTADÍSTICO EPIDEMIOLÓGICO Y DE GESTIÓN ASISTENCIAL'],
      [],
      ['Parámetro', 'Valor'],
      ['Ámbito / Centro de Salud', stats.scopeLabel],
      ['Período Evaluado', stats.periodLabel],
      ['Población Asignada de Referencia', stats.populationReference],
      ['Total de Atenciones Registradas', stats.totalEncounters],
      ['Pacientes Únicos Atendidos', stats.uniquePatientsServed],
      ['Tasa de Cobertura de Consulta (x 1,000 hab.)', stats.coverageRatePer1000],
      ['Razón de Masculinidad (Hombres por 100 Mujeres)', stats.bySex.sexRatio],
      ['Distribución Sexo Femenino', `${stats.bySex.femaleCount} (${stats.bySex.femalePercent}%)`],
      ['Distribución Sexo Masculino', `${stats.bySex.maleCount} (${stats.bySex.malePercent}%)`],
      ['Tasa Prevalencia de Enf. Crónicas (x 1,000 hab.)', stats.chronicStats.prevalenceRatePer1000],
      ['Tasa de Control de Enfermedades Crónicas (%)', `${stats.chronicStats.controlledPercent}%`],
      ['Tasa Incidencia Enf. Transmisibles (x 10,000 hab.)', stats.transmissibleStats.incidenceRatePer10000],
      ['Atenciones en Otros Centros (Movilidad Intercentros)', `${stats.interCenterStats.totalCrossCenterEncounters} (${stats.interCenterStats.crossCenterPercentage}%)`],
      [],
      ['Fecha y Hora de Generación', new Date().toLocaleString('es-ES')],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen_General');

    // 2. Grupos Etarios y Sexo
    const demoData = [
      ['Grupo Etario', 'Rango de Edad', 'Total Casos', 'Porcentaje (%)'],
      ...stats.byAgeGroup.map((ag) => [ag.group, ag.label, ag.count, ag.percentage]),
      [],
      ['Desglose por Sexo', 'Cantidad', 'Porcentaje (%)', ''],
      ['Femenino', stats.bySex.femaleCount, stats.bySex.femalePercent, ''],
      ['Masculino', stats.bySex.maleCount, stats.bySex.malePercent, ''],
      ['Otro', stats.bySex.otherCount, 0, ''],
    ];
    const wsDemo = XLSX.utils.aoa_to_sheet(demoData);
    XLSX.utils.book_append_sheet(wb, wsDemo, 'Demografia_Edades');

    // 3. Enfermedades Crónicas
    const chronicData = [
      ['Enfermedad Crónica', 'Código CIE-10', 'Casos Totales', 'Casos Controlados', 'Proporción (%)'],
      ...stats.chronicStats.breakdown.map((c) => [
        c.name,
        c.icd10,
        c.cases,
        c.controlledCount,
        c.percentage,
      ]),
    ];
    const wsChronic = XLSX.utils.aoa_to_sheet(chronicData);
    XLSX.utils.book_append_sheet(wb, wsChronic, 'Enfermedades_Cronicas');

    // 4. Enfermedades Transmisibles (Vigilancia)
    const transData = [
      ['Enfermedad Transmisible', 'Código CIE-10', 'Total Casos', 'Casos Confirmados', 'En Tratamiento Activo', 'Semana Epidemiológica'],
      ...stats.transmissibleStats.breakdown.map((t) => [
        t.name,
        t.icd10,
        t.cases,
        t.confirmed,
        t.activeInTreatment,
        t.epidemiologicalWeek,
      ]),
    ];
    const wsTrans = XLSX.utils.aoa_to_sheet(transData);
    XLSX.utils.book_append_sheet(wb, wsTrans, 'Vigilancia_Transmisibles');

    // 5. Morbilidad y Diagnósticos CIE-10
    const diagData = [
      ['Ranking', 'Código CIE-10', 'Descripción Diagnóstica', 'Frecuencia Absoluta', 'Frecuencia Relativa (%)'],
      ...stats.topDiagnoses.map((d, idx) => [
        idx + 1,
        d.icd10,
        d.description,
        d.count,
        d.percentage,
      ]),
    ];
    const wsDiag = XLSX.utils.aoa_to_sheet(diagData);
    XLSX.utils.book_append_sheet(wb, wsDiag, 'Morbilidad_CIE10');

    // 6. Base de Datos de Historias Médicas
    const patientsData = [
      [
        'N° Historia',
        'DNI',
        'Apellidos y Nombres',
        'Edad',
        'Sexo',
        'Centro Adscrito',
        'Dirección',
        'Enfermedades Crónicas',
        'Enfermedades Transmisibles',
        'Medicación Activa',
        'Alergias Conocidas',
        'Atenciones en Otros Centros',
      ],
      ...patients.map((p) => {
        const otherCenters = Array.from(
          new Set(
            p.encounters
              .filter((e) => e.healthCenterId !== p.primaryHealthCenterId)
              .map((e) => e.healthCenterName)
          )
        ).join(', ') || 'Sin atenciones exteriores';

        return [
          p.medicalRecordNumber,
          p.nationalId,
          `${p.lastName}, ${p.firstName}`,
          p.age,
          p.sex,
          p.primaryHealthCenterName,
          p.address,
          p.chronicDiseases.map((c) => c.name).join('; ') || 'Ninguna',
          p.transmissibleDiseases.map((t) => `${t.name} (${t.status})`).join('; ') || 'Ninguna',
          p.activeMedications.map((m) => `${m.name} (${m.dose})`).join('; ') || 'Sin medicación',
          p.antecedents.allergies.join('; ') || 'Niega',
          otherCenters,
        ];
      }),
    ];
    const wsPatients = XLSX.utils.aoa_to_sheet(patientsData);
    XLSX.utils.book_append_sheet(wb, wsPatients, 'Historias_Clinicas');

    // Trigger download
    const cleanFilename = `${filenamePrefix}_${stats.periodLabel.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(wb, cleanFilename);
  },

  /**
   * Generates a PDF report of Statistics & Epidemiological Indicators
   */
  exportStatisticsToPDF(
    stats: CalculatedStatistics,
    filenamePrefix: string = 'Reporte_Estadistico_NexusCare'
  ): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor: [number, number, number] = [15, 76, 129]; // Deep clinical navy
    const accentColor: [number, number, number] = [13, 148, 136]; // Teal

    // Header styling
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 22, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('NEXUS ASISTEN CARE G.C - SISTEMA EPIDEMIOLÓGICO ASIS', 14, 10);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('INFORME ESTADÍSTICO DE MORBILIDAD, POBLACIÓN Y TRAZABILIDAD INTERCENTROS', 14, 16);

    // Meta box
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Ámbito: ${stats.scopeLabel}`, 14, 30);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período de Análisis: ${stats.periodLabel}  |  Fecha de Emisión: ${new Date().toLocaleDateString('es-ES')}`, 14, 36);

    // Summary KPIs Table
    autoTable(doc, {
      startY: 42,
      head: [['Indicador Epidemiológico / Asistencial', 'Cálculo Obtenido', 'Referencia / Población']],
      body: [
        ['Población Asignada en Jurisdicción', stats.populationReference.toLocaleString(), 'Habitantes censados'],
        ['Total Atenciones Realizadas', stats.totalEncounters.toString(), 'Consultas y urgencias'],
        ['Tasa de Cobertura Asistencial', `${stats.coverageRatePer1000} por 1,000 hab.`, 'Meta >= 300 x 1,000'],
        ['Pacientes Únicos Atendidos', stats.uniquePatientsServed.toString(), 'Registrados en base'],
        ['Razón de Masculinidad', `${stats.bySex.sexRatio} hombres x 100 mujeres`, 'Índice demográfico'],
        ['Tasa Prevalencia Enf. Crónicas', `${stats.chronicStats.prevalenceRatePer1000} por 1,000 hab.`, `${stats.chronicStats.totalChronicPatients} pacientes crónicos`],
        ['Tasa de Control de Enfermedades Crónicas', `${stats.chronicStats.controlledPercent}%`, 'Bajo tratamiento estricto'],
        ['Tasa Incidencia Transmisibles', `${stats.transmissibleStats.incidenceRatePer10000} por 10,000 hab.`, `${stats.transmissibleStats.totalCases} casos notificados`],
        ['Tasa de Movilidad Intercentros', `${stats.interCenterStats.crossCenterPercentage}% (${stats.interCenterStats.totalCrossCenterEncounters} atenciones)`, 'Pacientes vistos en otros centros'],
      ],
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 2 },
    });

    const currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    // Chronic Diseases Table
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Distribución de Enfermedades Crónicas No Transmisibles (ECNT)', 14, currentY);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Diagnóstico Crónico', 'CIE-10', 'Casos', 'Controlados', 'Adherencia (%)']],
      body: stats.chronicStats.breakdown.length > 0
        ? stats.chronicStats.breakdown.map((c) => [
            c.name,
            c.icd10,
            c.cases.toString(),
            c.controlledCount.toString(),
            c.cases > 0 ? `${((c.controlledCount / c.cases) * 100).toFixed(1)}%` : '0%',
          ])
        : [['Sin registros en el período', '-', '0', '0', '-']],
      theme: 'striped',
      headStyles: { fillColor: accentColor, textColor: 255, fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 },
    });

    const chronicY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    // Transmissible Table
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Vigilancia Epidemiológica de Enfermedades Transmisibles', 14, chronicY);

    autoTable(doc, {
      startY: chronicY + 3,
      head: [['Patología Transmisible', 'CIE-10', 'Total Casos', 'Confirmados', 'En Tratamiento', 'Semana Ep.']],
      body: stats.transmissibleStats.breakdown.length > 0
        ? stats.transmissibleStats.breakdown.map((t) => [
            t.name,
            t.icd10,
            t.cases.toString(),
            t.confirmed.toString(),
            t.activeInTreatment.toString(),
            `SE-${t.epidemiologicalWeek}`,
          ])
        : [['No se reportaron brotes activos en el período', '-', '0', '0', '0', '-']],
      theme: 'striped',
      headStyles: { fillColor: [180, 83, 9], textColor: 255, fontSize: 8 }, // Amber/alert tone
      styles: { fontSize: 8, cellPadding: 2 },
    });

    // Page 2: Demography, CIE-10, Intercenter Mobility
    doc.addPage();

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 16, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISIS DE MORBILIDAD Y MOVILIDAD INTERCENTROS DE SALUD', 14, 11);

    // Morbidity CIE-10
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.text('Primeras Causas de Consulta Externa y Emergencias (CIE-10)', 14, 25);

    autoTable(doc, {
      startY: 28,
      head: [['Ranking', 'CIE-10', 'Diagnóstico Clínico', 'Frecuencia Absoluta', '% del Total']],
      body: stats.topDiagnoses.length > 0
        ? stats.topDiagnoses.map((d, idx) => [
            `#${idx + 1}`,
            d.icd10,
            d.description,
            d.count.toString(),
            `${d.percentage}%`,
          ])
        : [['1', 'Z00.0', 'Examen médico general', '1', '100%']],
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 },
    });

    const secondY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    // Cross-Center Mobility Table
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Trazabilidad de Atenciones Intercentros (Red Integrada de Salud)', 14, secondY);

    autoTable(doc, {
      startY: secondY + 3,
      head: [['Establecimiento de Origen / Adscripción', 'N° Pacientes que Recibieron Atención Exterior']],
      body: stats.interCenterStats.originCenterBreakdown.length > 0
        ? stats.interCenterStats.originCenterBreakdown.map((o) => [
            o.centerName,
            `${o.patientCount} paciente(s)`,
          ])
        : [['Todos los pacientes atendidos en sus centros de origen', '0']],
      theme: 'striped',
      headStyles: { fillColor: accentColor, textColor: 255, fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 },
    });

    const footerY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.text('Documento oficial generado automáticamente por el Sistema Nexus Asisten Care G.C.', 14, footerY);
    doc.text('Firma y Sello del Director del Establecimiento de Salud / Epidemiólogo Responsable', 120, footerY + 12);
    doc.line(115, footerY + 10, 200, footerY + 10);

    const cleanFilename = `${filenamePrefix}_${stats.periodLabel.replace(/\s+/g, '_')}.pdf`;
    doc.save(cleanFilename);
  },

  /**
   * Generates a complete individual Patient Medical Record PDF (with Antecedents, Cross-Center visits, Active meds)
   */
  exportPatientRecordToPDF(patient: Patient): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor: [number, number, number] = [15, 76, 129];
    const redAlert: [number, number, number] = [220, 38, 38];

    // Banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('HISTORIA CLÍNICA ELECTRÓNICA UNIFICADA', 14, 9);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`N° HISTORIA: ${patient.medicalRecordNumber}  |  DNI: ${patient.nationalId}  |  RED INTERCENTROS`, 14, 15);

    // Patient info block
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.text(`Paciente: ${patient.lastName}, ${patient.firstName}`, 14, 28);
    doc.text(`Edad: ${patient.age} años  |  Sexo: ${patient.sex === 'M' ? 'Masculino' : 'Femenino'}  |  Grupo Sanguíneo: ${patient.bloodType}`, 14, 33);
    doc.text(`Centro Base Adscrito: ${patient.primaryHealthCenterName}`, 14, 38);
    doc.text(`Dirección: ${patient.address} (${patient.district})  |  Teléfono: ${patient.phone}`, 14, 43);

    // Allergies alert box
    let alertY = 49;
    if (patient.antecedents.allergies.length > 0) {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(redAlert[0], redAlert[1], redAlert[2]);
      doc.rect(14, alertY, 182, 10, 'FD');
      doc.setTextColor(redAlert[0], redAlert[1], redAlert[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(`ALERGIAS CONFIRMADAS: ${patient.antecedents.allergies.join(', ')}`, 18, alertY + 6.5);
      alertY += 14;
    }

    // Antecedents Table
    autoTable(doc, {
      startY: alertY,
      head: [['Antecedentes Personales Patológicos', 'Quirúrgicos', 'Familiares', 'No Patológicos / Estilo Vida']],
      body: [[
        patient.antecedents.pathological.join('\n• ') || 'Ninguno',
        patient.antecedents.surgical.join('\n• ') || 'Niega',
        patient.antecedents.family.join('\n• ') || 'Sin datos',
        patient.antecedents.nonPathological.join('\n• ') || 'Sin riesgo',
      ]],
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 8 },
      styles: { fontSize: 7.5, cellPadding: 2 },
    });

    const postAntY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

    // Active Medications Table
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Medicación Activa y Conciliación Farmacológica', 14, postAntY);

    autoTable(doc, {
      startY: postAntY + 2,
      head: [['Medicamento', 'Dosis / Frecuencia', 'Vía', 'Centro que Prescribió', 'Médico', 'Fecha Inicio']],
      body: patient.activeMedications.length > 0
        ? patient.activeMedications.map((m) => [
            m.name,
            m.dose,
            m.route,
            m.prescribingCenterName,
            m.prescribingDoctor,
            m.startDate,
          ])
        : [['Sin medicación farmacológica activa actualmente', '-', '-', '-', '-', '-']],
      theme: 'striped',
      headStyles: { fillColor: [13, 148, 136], textColor: 255, fontSize: 8 },
      styles: { fontSize: 7.5, cellPadding: 2 },
    });

    const postMedY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

    // Cross-Center Encounters Timeline Table
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Historial de Atenciones Clínicas en la Red (Incluye Otros Centros)', 14, postMedY);

    autoTable(doc, {
      startY: postMedY + 2,
      head: [['Fecha', 'Establecimiento de Salud', 'Servicio', 'Diagnóstico Principal (CIE-10)', 'Médico Tratante', 'Observaciones']],
      body: patient.encounters.length > 0
        ? patient.encounters.map((e) => {
            const isOtherCenter = e.healthCenterId !== patient.primaryHealthCenterId;
            return [
              e.date,
              isOtherCenter ? `[OTRO CENTRO] ${e.healthCenterName}` : e.healthCenterName,
              e.service,
              `${e.primaryDiagnosis} (${e.icd10})`,
              e.doctorName,
              e.treatmentPlan.substring(0, 70) + (e.treatmentPlan.length > 70 ? '...' : ''),
            ];
          })
        : [['Sin consultas previas registradas', '-', '-', '-', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 8 },
      styles: { fontSize: 7, cellPadding: 2 },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.text('Copia fiel de la Historia Clínica Digital Unificada. Nexus Asisten Care G.C.', 14, finalY);

    doc.save(`HC_${patient.medicalRecordNumber}_${patient.lastName.replace(/\s+/g, '_')}.pdf`);
  },

  /**
   * Generates ASIS report PDF
   */
  exportAsisToPDF(asis: AsisMetrics): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor: [number, number, number] = [15, 76, 129];
    const tealColor: [number, number, number] = [13, 148, 136];

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('DOCUMENTO DE ANÁLISIS DE SITUACIÓN DE SALUD (ASIS)', 14, 10);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('DIAGNÓSTICO SOCIO-SANITARIO, DEMOGRÁFICO Y PRIORIZACIÓN DE PROBLEMAS', 14, 16);

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Establecimiento: ${asis.center.name}`, 14, 30);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dirección y Jurisdicción: ${asis.center.address}`, 14, 35);
    doc.text(`Población Asignada: ${asis.center.populationServed.toLocaleString()} habitantes  |  Riesgo Epidemiológico Global: ${asis.epidemiologicalRiskScore}/100`, 14, 40);

    // Demographic Pyramid summary
    autoTable(doc, {
      startY: 46,
      head: [['Rango Quinquenal / Etario', 'Hombres', 'Mujeres', 'Total Rango']],
      body: asis.pyramidData.map((p) => [
        p.ageRange,
        p.maleCount.toString(),
        p.femaleCount.toString(),
        (p.maleCount + p.femaleCount).toString(),
      ]),
      theme: 'striped',
      headStyles: { fillColor: tealColor, textColor: 255, fontSize: 8 },
      styles: { fontSize: 7.5, cellPadding: 1.8 },
    });

    const pyramidY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Matriz de Problemas Sanitarios Priorizados e Intervenciones', 14, pyramidY);

    autoTable(doc, {
      startY: pyramidY + 3,
      head: [['Problema de Salud Identificado', 'Severidad', 'Población Vulnerable Afectada', 'Intervención Sanitaria Recomendada']],
      body: asis.sanitaryProblems.map((sp) => [
        sp.problem,
        sp.severity,
        sp.affectedPopulation,
        sp.recommendedIntervention,
      ]),
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 8 },
      styles: { fontSize: 7.5, cellPadding: 2 },
    });

    doc.save(`ASIS_${asis.center.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  },
};
