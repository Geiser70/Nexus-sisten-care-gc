import React, { useState } from 'react';
import { Patient, HealthCenter, Encounter } from '../types/medical';
import { X, Stethoscope, Building, HeartPulse } from 'lucide-react';

interface NewEncounterModalProps {
  patient: Patient;
  centers: HealthCenter[];
  onClose: () => void;
  onSaveEncounter: (patientId: string, encounter: Encounter) => void;
}

export const NewEncounterModal: React.FC<NewEncounterModalProps> = ({
  patient,
  centers,
  onClose,
  onSaveEncounter,
}) => {
  const [healthCenterId, setHealthCenterId] = useState(patient.primaryHealthCenterId);
  const [service, setService] = useState<Encounter['service']>('Consulta Externa');
  const [doctorName, setDoctorName] = useState('Dr. Carlos Vega');
  const [specialty, setSpecialty] = useState('Medicina General');
  const [reason, setReason] = useState('');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [icd10, setIcd10] = useState('Z00.0');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');

  // Vital signs
  const [bpSys, setBpSys] = useState(120);
  const [bpDia, setBpDia] = useState(80);
  const [hr, setHr] = useState(75);
  const [temp, setTemp] = useState(36.7);
  const [spo2, setSpo2] = useState(98);

  const selectedCenter = centers.find((c) => c.id === healthCenterId) || centers[0];
  const isDifferentFromBase = healthCenterId !== patient.primaryHealthCenterId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !primaryDiagnosis) return;

    const newEncounter: Encounter = {
      id: `enc-${Date.now()}`,
      patientId: patient.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      healthCenterId: selectedCenter.id,
      healthCenterName: selectedCenter.name,
      service,
      doctorName,
      specialty,
      reason,
      primaryDiagnosis,
      icd10: icd10.toUpperCase(),
      vitalSigns: {
        bloodPressureSys: Number(bpSys),
        bloodPressureDia: Number(bpDia),
        heartRate: Number(hr),
        respiratoryRate: 18,
        temperature: Number(temp),
        oxygenSaturation: Number(spo2),
        weightKg: 70,
        heightCm: 165,
        bmi: 25.7,
      },
      clinicalNotes,
      treatmentPlan,
      prescribedMedications: [],
    };

    onSaveEncounter(patient.id, newEncounter);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Stethoscope className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Registrar Atención / Consulta Médica
              </h2>
              <p className="text-xs text-slate-400">
                Paciente: {patient.lastName}, {patient.firstName} ({patient.medicalRecordNumber})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Health Center Selector with Cross-Center Warning */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 uppercase tracking-wider block">
                Establecimiento de Salud de la Atención
              </label>
              {isDifferentFromBase && (
                <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                  ATENCIÓN EN OTRO CENTRO (RED ASISTENCIAL)
                </span>
              )}
            </div>
            <select
              value={healthCenterId}
              onChange={(e) => setHealthCenterId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium text-slate-800"
            >
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.id === patient.primaryHealthCenterId ? '★ (Centro Base del Paciente)' : ''}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">
              Ubicación del centro: {selectedCenter.address}
            </p>
          </div>

          {/* Service and Doctor info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Servicio Asistencial</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value as Encounter['service'])}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="Consulta Externa">Consulta Externa</option>
                <option value="Urgencias">Urgencias</option>
                <option value="Control Crónicos">Control Crónicos</option>
                <option value="Epidemiología">Epidemiología</option>
                <option value="Materno Infantil">Materno Infantil</option>
                <option value="Laboratorio">Laboratorio / Diagnóstico</option>
                <option value="Teleconsulta">Teleconsulta</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Médico Responsable</label>
              <input
                type="text"
                required
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Especialidad</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Reason and Diagnoses */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Diagnóstico Principal Clínico *
              </label>
              <input
                type="text"
                required
                value={primaryDiagnosis}
                onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                placeholder="Ej. Hipertensión arterial descompensada / Faringitis aguda"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Código CIE-10 *</label>
              <input
                type="text"
                required
                value={icd10}
                onChange={(e) => setIcd10(e.target.value)}
                placeholder="Ej. I10, A97.0, E11.9"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Motivo de Consulta *</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. Cefalea occipital pulsátil y acúfenos de 24 horas de evolución"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Vital Signs Row */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Signos Vitales y Triaje
            </label>
            <div className="grid grid-cols-5 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 block">PA Sist. (mmHg)</span>
                <input
                  type="number"
                  value={bpSys}
                  onChange={(e) => setBpSys(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-center text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">PA Diast. (mmHg)</span>
                <input
                  type="number"
                  value={bpDia}
                  onChange={(e) => setBpDia(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-center text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">FC (lpm)</span>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-center text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Temp (°C)</span>
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-center text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">SpO2 (%)</span>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-center text-xs"
                />
              </div>
            </div>
          </div>

          {/* Clinical notes and plan */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Notas de Evolución Clínica</label>
            <textarea
              rows={2}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Examen físico, hallazgos clínicos relevantes..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Plan de Tratamiento / Indicaciones</label>
            <textarea
              rows={2}
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              placeholder="Fármacos recomendados, reposo, pautas de alarma o derivación..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
            >
              Guardar Atención en Historia Clínica
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
