import { Patient, Medication, MedicationWarning } from '../types/medical';

// Knowledge base of known clinical drug interactions and cross-sensitivities
const ALLERGY_RULES: { keyword: string; alertDrugs: string[]; warningTitle: string }[] = [
  {
    keyword: 'penicilina',
    alertDrugs: ['amoxicilina', 'ampicilina', 'penicilina', 'piperacilina', 'amoxicilina / clavulánico', 'oxacilina'],
    warningTitle: 'Contraindicación Absoluta: Alergia a Penicilinas',
  },
  {
    keyword: 'aine',
    alertDrugs: ['ibuprofeno', 'ketorolaco', 'naproxeno', 'diclofenaco', 'meloxicam', 'indometacina', 'aspirina', 'metamizol'],
    warningTitle: 'Contraindicación: Hipersensibilidad a AINEs',
  },
  {
    keyword: 'metamizol',
    alertDrugs: ['metamizol', 'dipirona', 'ketorolaco', 'ibuprofeno'],
    warningTitle: 'Alergia confirmada a Dipirona/Metamizol',
  },
  {
    keyword: 'sulfa',
    alertDrugs: ['cotrimoxazol', 'sulfametoxazol', 'sulfadiazina', 'trimetoprima-sulfametoxazol'],
    warningTitle: 'Alergia a Sulfonamidas',
  },
  {
    keyword: 'cefalosporina',
    alertDrugs: ['cefalexina', 'ceftriaxona', 'cefuroxima', 'cefazolina', 'cefotaxima'],
    warningTitle: 'Alergia cruzada con Cefalosporinas',
  },
];

const DRUG_INTERACTION_RULES: {
  drugA: string[];
  drugB: string[];
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
}[] = [
  {
    drugA: ['warfarina', 'acenocumarol'],
    drugB: ['ibuprofeno', 'ketorolaco', 'naproxeno', 'aspirina', 'diclofenaco', 'meloxicam'],
    severity: 'HIGH',
    title: 'Interacción Grave: Riesgo Mayor de Hemorragia Digestiva/Sistémica',
    description: 'La combinación de anticoagulantes orales cumarínicos con AINEs incrementa exponencialmente el riesgo de hemorragia gastrointestinal grave por sinergia antiplaquetaria y lesión mucosa.',
  },
  {
    drugA: ['losartan', 'valsartan', 'candesartan', 'irbesartan'],
    drugB: ['enalapril', 'captopril', 'ramipril', 'lisinopril'],
    severity: 'HIGH',
    title: 'Duplicación Terapéutica Inadecuada: Doble Bloqueo SRAA',
    description: 'Uso simultáneo de un ARA-II con un IECA. No confiere beneficio adicional y aumenta el riesgo de hiperpotasemia severa, hipotensión e insuficiencia renal aguda.',
  },
  {
    drugA: ['metformina'],
    drugB: ['contraste yodado', 'medio de contraste'],
    severity: 'HIGH',
    title: 'Riesgo de Acidosis Láctica',
    description: 'Suspender metformina 48h antes de estudios contrastados por riesgo de falla renal aguda y acumulación de metformina.',
  },
  {
    drugA: ['enalapril', 'losartan', 'captopril'],
    drugB: ['espironolactona', 'eplerenona'],
    severity: 'MEDIUM',
    title: 'Riesgo de Hiperpotasemia Moderada',
    description: 'Requiere monitorización estricta de electrolitos séricos (Potasio K+) y función renal (Creatinina).',
  },
  {
    drugA: ['furosemida', 'hidroclorotiazida'],
    drugB: ['ibuprofeno', 'ketorolaco', 'naproxeno'],
    severity: 'MEDIUM',
    title: 'Antagonismo del Efecto Diurético e Hipotensor',
    description: 'Los AINEs inhiben la síntesis de prostaglandinas renales, atenuando el efecto de los diuréticos y deteriorando la tasa de filtrado glomerular.',
  },
];

export const MedicationChecker = {
  /**
   * Evaluates a patient's full active medication list and detects:
   * - Cross-center origin of prescriptions
   * - Drug-allergy alerts
   * - Dangerous drug-drug interactions
   * - Duplication warnings
   */
  evaluatePatientMedications(patient: Patient, prospectiveMedication?: Medication): MedicationWarning[] {
    const warnings: MedicationWarning[] = [];
    const allMedications = [...patient.activeMedications];
    if (prospectiveMedication) {
      allMedications.push(prospectiveMedication);
    }

    const patientAllergies = patient.antecedents.allergies.map((a) => a.toLowerCase());

    // 1. Check ALLERGIES against active drugs
    allMedications.forEach((med) => {
      const medNameLower = (med.name + ' ' + (med.genericName || '')).toLowerCase();
      
      // Match each known allergy category
      for (const rule of ALLERGY_RULES) {
        const matchesAllergyKeyword = patientAllergies.some((pa) => pa.includes(rule.keyword));
        if (matchesAllergyKeyword) {
          const isTriggerDrug = rule.alertDrugs.some((ad) => medNameLower.includes(ad));
          if (isTriggerDrug) {
            warnings.push({
              type: 'ALLERGY',
              severity: 'HIGH',
              title: `${rule.warningTitle}: ${med.name}`,
              message: `El paciente tiene registro en antecedentes de alergia (${rule.keyword.toUpperCase()}). La prescripción de "${med.name}" está contraindicada.`,
              medicationA: med.name,
              centerOrigin: med.prescribingCenterName,
            });
          }
        }
      }

      // Explicit literal string match in case custom allergies are written
      for (const allergy of patient.antecedents.allergies) {
        const cleanAllergy = allergy.toLowerCase().split('(')[0].trim();
        if (cleanAllergy.length > 3 && medNameLower.includes(cleanAllergy)) {
          // Avoid duplicate
          const already = warnings.some((w) => w.medicationA === med.name && w.type === 'ALLERGY');
          if (!already) {
            warnings.push({
              type: 'ALLERGY',
              severity: 'HIGH',
              title: `Alerta Crítica de Alergia: ${med.name}`,
              message: `Prescripción coincide directamente con antecedente alérgico registrado: "${allergy}".`,
              medicationA: med.name,
              centerOrigin: med.prescribingCenterName,
            });
          }
        }
      }
    });

    // 2. Check DRUG-DRUG INTERACTIONS
    for (let i = 0; i < allMedications.length; i++) {
      for (let j = i + 1; j < allMedications.length; j++) {
        const medA = allMedications[i];
        const medB = allMedications[j];
        const nameA = (medA.name + ' ' + medA.genericName).toLowerCase();
        const nameB = (medB.name + ' ' + medB.genericName).toLowerCase();

        // Check if from different centers
        const differentCenters = medA.prescribingCenterId !== medB.prescribingCenterId;

        // Check known rules
        for (const rule of DRUG_INTERACTION_RULES) {
          const matchAInDrugA = rule.drugA.some((d) => nameA.includes(d));
          const matchBInDrugB = rule.drugB.some((d) => nameB.includes(d));

          const matchBInDrugA = rule.drugA.some((d) => nameB.includes(d));
          const matchAInDrugB = rule.drugB.some((d) => nameA.includes(d));

          if ((matchAInDrugA && matchBInDrugB) || (matchBInDrugA && matchAInDrugB)) {
            warnings.push({
              type: 'INTERACTION',
              severity: rule.severity,
              title: rule.title,
              message: `${rule.description} [${medA.name} recetado en "${medA.prescribingCenterName}" vs ${medB.name} en "${medB.prescribingCenterName}"]`,
              medicationA: medA.name,
              medicationB: medB.name,
              centerOrigin: differentCenters ? `${medA.prescribingCenterName} ⇄ ${medB.prescribingCenterName}` : medA.prescribingCenterName,
            });
          }
        }

        // Check exact duplicate generic
        if (medA.genericName && medB.genericName && medA.genericName.toLowerCase() === medB.genericName.toLowerCase() && medA.id !== medB.id) {
          warnings.push({
            type: 'DUPLICATION',
            severity: 'MEDIUM',
            title: `Duplicidad de Medicación: ${medA.genericName}`,
            message: `El paciente tiene dos registros activos para el mismo principio activo: "${medA.name}" (origen: ${medA.prescribingCenterName}) y "${medB.name}" (origen: ${medB.prescribingCenterName}). Verifique adherencia o sobre-dosificación.`,
            medicationA: medA.name,
            medicationB: medB.name,
            centerOrigin: `${medA.prescribingCenterName} / ${medB.prescribingCenterName}`,
          });
        }
      }
    }

    // 3. Highlight Cross-Center Prescriptions for Doctor Awareness
    const primaryCenterId = patient.primaryHealthCenterId;
    allMedications.forEach((med) => {
      if (med.prescribingCenterId && med.prescribingCenterId !== primaryCenterId) {
        warnings.push({
          type: 'CENTER_MISMATCH',
          severity: 'LOW',
          title: `Trazabilidad de Red: Fármaco Prescrito en Otro Centro`,
          message: `El fármaco "${med.name}" fue prescrito originalmente en el establecimiento exterior "${med.prescribingCenterName}" por ${med.prescribingDoctor}. Requiere conciliación farmacológica en este centro.`,
          medicationA: med.name,
          centerOrigin: med.prescribingCenterName,
        });
      }
    });

    return warnings;
  },
};
