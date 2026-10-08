import React, { useState } from 'react';
import { Patient, HealthCenter, Medication } from '../types/medical';
import { MedicationChecker } from '../services/medicationChecker';
import { ExportService } from '../services/exportService';
import {
  X,
  FileDown,
  AlertTriangle,
  ShieldAlert,
  Building,
  CheckCircle2,
  Calendar,
  User,
  Heart,
  Pill,
  Clock,
  Plus,
  Stethoscope,
  Info,
} from 'lucide-react';

interface PatientDetailModalProps {
  patient: Patient;
  centers: HealthCenter[];
  onClose: () => void;
  onAddEncounterClick: (patient: Patient) => void;
  onAddMedication: (patientId: string, medication: Medication) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  centers,
  onClose,
  onAddEncounterClick,
  onAddMedication,
}) => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'antecedentes' | 'medicacion' | 'intercentros' | 'consultas'>('resumen');

  // Interactive drug testing state
  const [testMedName, setTestMedName] = useState('');
  const [testMedDose, setTestMedDose] = useState('');
  const [testMedCenterId, setTestMedCenterId] = useState(patient.primaryHealthCenterId);
  const [testMedDoctor, setTestMedDoctor] = useState('');

  // Run medication checks
  const warnings = MedicationChecker.evaluatePatientMedications(patient);

  // Cross center analysis
  const primaryCenterId = patient.primaryHealthCenterId;
  const otherCenterEncounters = patient.encounters.filter(
    (e) => e.healthCenterId !== primaryCenterId
  );
  const distinctOtherCenters = Array.from(
    new Set(otherCenterEncounters.map((e) => e.healthCenterName))
  );

  // Test prospective drug
  const prospectiveMed: Medication | undefined = testMedName
    ? {
        id: 'temp-test',
        name: testMedName,
        genericName: testMedName,
        dose: testMedDose || '1 dosis',
        frequency: 'Cada 12 horas',
        route: 'Oral',
        startDate: new Date().toISOString().split('T')[0],
        prescribingCenterId: testMedCenterId,
        prescribingCenterName:
          centers.find((c) => c.id === testMedCenterId)?.name || 'Centro Actual',
        prescribingDoctor: testMedDoctor || 'Médico Evaluador',
        instructions: '',
        status: 'Activo',
      }
    : undefined;

  const testWarnings = prospectiveMed
    ? MedicationChecker.evaluatePatientMedications(patient, prospectiveMed)
    : [];

  const handleSaveTestedMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMedName.trim()) return;

    const newMed: Medication = {
      id: `med-${Date.now()}`,
      name: testMedName,
      genericName: testMedName,
      dose: testMedDose || '1 tableta',
      frequency: 'Cada 12 horas',
      route: 'Oral',
      startDate: new Date().toISOString().split('T')[0],
      prescribingCenterId: testMedCenterId,
      prescribingCenterName:
        centers.find((c) => c.id === testMedCenterId)?.name || 'Centro Actual',
      prescribingDoctor: testMedDoctor || 'Médico Tratante',
      instructions: 'Prescrito tras verificación farmacológica sin contraindicaciones absolutas.',
      status: 'Activo',
    };

    onAddMedication(patient.id, newMed);
    setTestMedName('');
    setTestMedDose('');
    setTestMedDoctor('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold">
              {patient.sex === 'F' ? '♀' : '♂'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {patient.lastName}, {patient.firstName}
                </h2>
                <span className="text-xs font-mono bg-slate-800 text-teal-300 px-2 py-0.5 rounded border border-slate-700">
                  {patient.medicalRecordNumber}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 mt-0.5">
                <span>DNI: {patient.nationalId}</span>
                <span>·</span>
                <span>{patient.age} años</span>
                <span>·</span>
                <span>Grupo {patient.bloodType}</span>
                <span>·</span>
                <span className="text-teal-400 font-medium">
                  Base: {patient.primaryHealthCenterName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => ExportService.exportPatientRecordToPDF(patient)}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              <FileDown className="w-4 h-4 text-teal-400" />
              <span>Exportar Historia PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cross-center prominent alert banner if attended in other centers */}
        {distinctOtherCenters.length > 0 && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Atención Intercentros Registrada:</strong> Este paciente ha recibido{' '}
                <strong>{otherCenterEncounters.length} atención(es)</strong> en otros centros de la red:{' '}
                <span className="font-semibold">{distinctOtherCenters.join(', ')}</span>.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('intercentros')}
              className="font-medium text-amber-900 underline hover:text-amber-700 ml-4 shrink-0"
            >
              Ver Trazabilidad ➔
            </button>
          </div>
        )}

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`pb-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'resumen'
                ? 'border-teal-600 text-teal-800 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Resumen Clínico
          </button>
          <button
            onClick={() => setActiveTab('antecedentes')}
            className={`pb-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'antecedentes'
                ? 'border-teal-600 text-teal-800 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Antecedentes Clínicos ({patient.antecedents.pathological.length + patient.antecedents.allergies.length})
          </button>
          <button
            onClick={() => setActiveTab('medicacion')}
            className={`pb-2.5 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'medicacion'
                ? 'border-teal-600 text-teal-800 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Verificación Farmacológica</span>
            {warnings.filter((w) => w.severity === 'HIGH').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('intercentros')}
            className={`pb-2.5 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'intercentros'
                ? 'border-teal-600 text-teal-800 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Historial en Otros Centros ({otherCenterEncounters.length})</span>
            {distinctOtherCenters.length > 0 && (
              <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded">
                Red
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('consultas')}
            className={`pb-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'consultas'
                ? 'border-teal-600 text-teal-800 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Todas las Atenciones ({patient.encounters.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB: RESUMEN */}
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              {/* Critical Alert Box for Allergies */}
              {patient.antecedents.allergies.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-red-900 uppercase tracking-wide">
                      Alergias Confirmadas (Alto Riesgo)
                    </h4>
                    <p className="text-xs text-red-700 mt-0.5">
                      {patient.antecedents.allergies.join(' · ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Grid with Demographics & Vital Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Datos del Paciente
                  </span>
                  <div className="text-xs text-slate-700 space-y-1">
                    <p><strong className="text-slate-900">Fecha de Nac.:</strong> {patient.birthDate}</p>
                    <p><strong className="text-slate-900">Teléfono:</strong> {patient.phone}</p>
                    <p><strong className="text-slate-900">Dirección:</strong> {patient.address}</p>
                    <p><strong className="text-slate-900">Distrito:</strong> {patient.district}</p>
                    <p><strong className="text-slate-900">Inscripción:</strong> {patient.registrationDate}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Enfermedades Crónicas
                  </span>
                  {patient.chronicDiseases.length > 0 ? (
                    <div className="space-y-1.5 text-xs">
                      {patient.chronicDiseases.map((cd) => (
                        <div key={cd.id} className="pb-1 border-b border-slate-200 last:border-0">
                          <span className="font-medium text-slate-800">{cd.name}</span>
                          <div className="text-[11px] text-slate-500">
                            CIE-10: {cd.icd10} · Estado: <strong className={cd.controlledStatus === 'Controlado' ? 'text-emerald-700' : 'text-amber-700'}>{cd.controlledStatus}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Sin patologías crónicas registradas</p>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Vigilancia Transmisible & Otras
                  </span>
                  {patient.transmissibleDiseases.length > 0 ? (
                    <div className="space-y-1.5 text-xs">
                      {patient.transmissibleDiseases.map((td) => (
                        <div key={td.id} className="p-2 bg-amber-50 rounded border border-amber-200">
                          <div className="font-semibold text-amber-900">{td.name}</div>
                          <div className="text-[11px] text-amber-700 mt-0.5">
                            CIE-10: {td.icd10} · {td.classification} · Estado: {td.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Sin enfermedades transmisibles notificadas</p>
                  )}

                  {patient.otherConditions.map((oc) => (
                    <div key={oc.id} className="text-xs bg-teal-50 p-2 rounded border border-teal-200 text-teal-900">
                      <strong>{oc.type}:</strong> {oc.description}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
                <div className="text-xs text-slate-500">
                  ¿Desea registrar una consulta médica para este paciente en el sistema?
                </div>
                <button
                  onClick={() => onAddEncounterClick(patient)}
                  className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Registrar Nueva Atención / Consulta</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: ANTECEDENTES */}
          {activeTab === 'antecedentes' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Patológicos */}
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    Antecedentes Personales Patológicos
                  </h4>
                  {patient.antecedents.pathological.length > 0 ? (
                    <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                      {patient.antecedents.pathological.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">Sin antecedentes patológicos</p>
                  )}
                </div>

                {/* Quirúrgicos */}
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Antecedentes Quirúrgicos
                  </h4>
                  {patient.antecedents.surgical.length > 0 ? (
                    <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                      {patient.antecedents.surgical.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">Niega intervenciones quirúrgicas</p>
                  )}
                </div>

                {/* Familiares */}
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Antecedentes Heredofamiliares
                  </h4>
                  {patient.antecedents.family.length > 0 ? (
                    <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                      {patient.antecedents.family.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">Sin datos patológicos familiares</p>
                  )}
                </div>

                {/* No Patológicos / Estilo de vida */}
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Hábitos y No Patológicos
                  </h4>
                  {patient.antecedents.nonPathological.length > 0 ? (
                    <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                      {patient.antecedents.nonPathological.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">Sin factores de riesgo declarados</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: MEDICACIÓN & VERIFICACIÓN */}
          {activeTab === 'medicacion' && (
            <div className="space-y-6">
              {/* Warnings List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Auditoría de Medicación & Conciliación Farmacológica
                  </h4>
                  <span className="text-xs text-slate-500">
                    {warnings.length} alertas detectadas en régimen actual
                  </span>
                </div>

                {warnings.length > 0 ? (
                  <div className="space-y-2">
                    {warnings.map((w, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-lg border text-xs flex items-start gap-3 ${
                          w.severity === 'HIGH'
                            ? 'bg-red-50 border-red-200 text-red-900'
                            : w.severity === 'MEDIUM'
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-teal-50 border-teal-200 text-teal-900'
                        }`}
                      >
                        {w.severity === 'HIGH' ? (
                          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        ) : w.severity === 'MEDIUM' ? (
                          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        ) : (
                          <Building className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-bold">{w.title}</div>
                          <div className="mt-0.5">{w.message}</div>
                          {w.centerOrigin && (
                            <div className="mt-1 text-[11px] font-mono opacity-80">
                              Centro de origen: {w.centerOrigin}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Régimen farmacológico verificado. No se detectaron contraindicaciones alérgicas ni interacciones mayores en este paciente.
                    </span>
                  </div>
                )}
              </div>

              {/* Current Active Medications Table */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700 flex items-center justify-between">
                  <span>Medicamentos Prescritos Actualmente Activos</span>
                  <span className="text-slate-500 font-normal">
                    {patient.activeMedications.length} fármacos
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50/70 text-slate-600 text-left font-medium">
                      <tr>
                        <th className="px-4 py-2.5">Medicamento</th>
                        <th className="px-4 py-2.5">Dosis y Frecuencia</th>
                        <th className="px-4 py-2.5">Vía</th>
                        <th className="px-4 py-2.5">Centro que Prescribió</th>
                        <th className="px-4 py-2.5">Médico</th>
                        <th className="px-4 py-2.5">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {patient.activeMedications.length > 0 ? (
                        patient.activeMedications.map((m) => {
                          const isExternal = m.prescribingCenterId !== patient.primaryHealthCenterId;
                          return (
                            <tr key={m.id} className={isExternal ? 'bg-amber-50/30' : ''}>
                              <td className="px-4 py-2.5 font-semibold text-slate-800">
                                {m.name}
                                {isExternal && (
                                  <span className="block text-[10px] text-amber-700 font-normal">
                                    Prescrito en otro centro
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-slate-600">{m.dose}</td>
                              <td className="px-4 py-2.5 text-slate-600">{m.route}</td>
                              <td className="px-4 py-2.5 text-slate-700 font-medium">
                                {m.prescribingCenterName}
                              </td>
                              <td className="px-4 py-2.5 text-slate-600">{m.prescribingDoctor}</td>
                              <td className="px-4 py-2.5 text-slate-500">{m.startDate}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                            No hay medicamentos activos en este momento.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Test / Prescribe new medication with pre-flight check */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-teal-600" />
                  Verificador Previo de Nueva Prescripción
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Escriba el fármaco a recetar para verificar inmediatamente antes de autorizar si tiene contraindicaciones con los antecedentes alérgicos del paciente o con medicamentos dados en otros centros.
                </p>

                <form onSubmit={handleSaveTestedMedication} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Nombre del Fármaco (Ej. Amoxicilina, Warfarina, Losartán)
                      </label>
                      <input
                        type="text"
                        value={testMedName}
                        onChange={(e) => setTestMedName(e.target.value)}
                        placeholder="Ej. Ibuprofeno 400mg"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Dosis y Pauta
                      </label>
                      <input
                        type="text"
                        value={testMedDose}
                        onChange={(e) => setTestMedDose(e.target.value)}
                        placeholder="Ej. 1 tableta cada 8 horas por 5 días"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Centro que Prescribe
                      </label>
                      <select
                        value={testMedCenterId}
                        onChange={(e) => setTestMedCenterId(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        {centers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Immediate feedback warning */}
                  {testWarnings.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {testWarnings.map((tw, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-md text-xs border ${
                            tw.severity === 'HIGH'
                              ? 'bg-red-100 border-red-300 text-red-950 font-medium'
                              : 'bg-amber-100 border-amber-300 text-amber-950'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-600" />
                            <strong>{tw.title}</strong>
                          </div>
                          <p className="mt-1 text-[11px]">{tw.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {testMedName && testWarnings.filter((tw) => tw.severity === 'HIGH').length === 0 && (
                    <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Fármaco evaluado: seguro para prescribir a este paciente.</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={!testMedName.trim()}
                      className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar a la Medicación Activa del Paciente</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB: TRAZABILIDAD INTERCENTROS */}
          {activeTab === 'intercentros' && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Trazabilidad Asistencial en la Red de Salud
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Este módulo unifica todas las atenciones médicas del paciente en cualquiera de los {centers.length} centros de salud interconectados en el sistema.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                      Centro Base Adscrito
                    </span>
                    <span className="text-xs font-bold text-teal-700">
                      {patient.primaryHealthCenterName}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Atenciones totales registradas:</span>{' '}
                    <strong className="text-slate-900">{patient.encounters.length}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Atenciones en otros centros:</span>{' '}
                    <strong className="text-amber-800">{otherCenterEncounters.length}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Establecimientos exteriores visitados:</span>{' '}
                    <strong className="text-slate-900">
                      {distinctOtherCenters.length > 0 ? distinctOtherCenters.join(', ') : 'Ninguno'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Timeline of visits in other centers */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Detalle Cronológico de Visitas a Otros Centros
                </h4>

                {otherCenterEncounters.length > 0 ? (
                  <div className="space-y-3">
                    {otherCenterEncounters.map((enc) => (
                      <div
                        key={enc.id}
                        className="bg-white border-l-4 border-l-amber-500 border border-slate-200 rounded-r-lg p-4 shadow-xs space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-amber-600" />
                            <span className="font-bold text-slate-900 text-xs">
                              {enc.healthCenterName}
                            </span>
                            <span className="text-xs text-slate-500">({enc.service})</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{enc.date} a las {enc.time}</span>
                          </div>
                        </div>

                        <div className="text-xs space-y-1">
                          <p>
                            <strong className="text-slate-800">Médico Tratante:</strong> {enc.doctorName} ({enc.specialty})
                          </p>
                          <p>
                            <strong className="text-slate-800">Motivo de consulta:</strong> {enc.reason}
                          </p>
                          <p>
                            <strong className="text-slate-800">Diagnóstico Principal:</strong>{' '}
                            <span className="text-teal-800 font-semibold">{enc.primaryDiagnosis}</span>{' '}
                            <span className="font-mono text-slate-500">[{enc.icd10}]</span>
                          </p>
                          <p className="bg-slate-50 p-2 rounded text-slate-700 italic border border-slate-100">
                            "{enc.clinicalNotes}"
                          </p>
                          <p>
                            <strong className="text-slate-800">Plan Terapéutico indicado:</strong> {enc.treatmentPlan}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-xs">
                    Este paciente sólo ha recibido atenciones en su centro base ({patient.primaryHealthCenterName}). No cuenta con ingresos en otros centros de la red.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: TODAS LAS CONSULTAS */}
          {activeTab === 'consultas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Historial Clínico Integral ({patient.encounters.length} atenciones)
                </h4>
                <button
                  onClick={() => onAddEncounterClick(patient)}
                  className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nueva Consulta</span>
                </button>
              </div>

              <div className="space-y-3">
                {patient.encounters.map((enc) => {
                  const isOtherCenter = enc.healthCenterId !== patient.primaryHealthCenterId;
                  return (
                    <div
                      key={enc.id}
                      className={`border rounded-lg p-4 text-xs space-y-2 bg-white ${
                        isOtherCenter ? 'border-amber-300' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{enc.healthCenterName}</span>
                          {isOtherCenter && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded">
                              ATENDIDO EN OTRO CENTRO
                            </span>
                          )}
                          <span className="text-slate-500">· {enc.service}</span>
                        </div>
                        <div className="text-slate-500">
                          {enc.date} - {enc.time}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                        <div>
                          <strong className="text-slate-900">Diagnóstico:</strong> {enc.primaryDiagnosis} ({enc.icd10})
                        </div>
                        <div>
                          <strong className="text-slate-900">Médico:</strong> {enc.doctorName} - {enc.specialty}
                        </div>
                      </div>

                      {enc.vitalSigns && (
                        <div className="bg-slate-50 p-2 rounded text-[11px] text-slate-600 flex flex-wrap gap-4 border border-slate-100">
                          <span>PA: <strong>{enc.vitalSigns.bloodPressureSys}/{enc.vitalSigns.bloodPressureDia}</strong> mmHg</span>
                          <span>FC: <strong>{enc.vitalSigns.heartRate}</strong> lpm</span>
                          <span>FR: <strong>{enc.vitalSigns.respiratoryRate}</strong> rpm</span>
                          <span>Temp: <strong>{enc.vitalSigns.temperature}</strong> °C</span>
                          <span>SpO2: <strong>{enc.vitalSigns.oxygenSaturation}</strong>%</span>
                          <span>IMC: <strong>{enc.vitalSigns.bmi}</strong></span>
                        </div>
                      )}

                      <div className="text-slate-600">
                        <p><strong className="text-slate-900">Evolución clínica:</strong> {enc.clinicalNotes}</p>
                        <p className="mt-1"><strong className="text-slate-900">Tratamiento:</strong> {enc.treatmentPlan}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Identificador Único: {patient.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors"
          >
            Cerrar Expediente
          </button>
        </div>
      </div>
    </div>
  );
};
