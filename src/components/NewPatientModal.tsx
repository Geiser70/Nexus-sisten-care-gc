import React, { useState } from 'react';
import { Patient, HealthCenter, Sex, ChronicDisease, TransmissibleDisease } from '../types/medical';
import { X, UserPlus, ShieldAlert, Heart, Activity } from 'lucide-react';

interface NewPatientModalProps {
  centers: HealthCenter[];
  onClose: () => void;
  onSave: (patient: Patient) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  centers,
  onClose,
  onSave,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [birthDate, setBirthDate] = useState('1985-05-15');
  const [sex, setSex] = useState<Sex>('F');
  const [bloodType, setBloodType] = useState<Patient['bloodType']>('O+');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Distrito Norte');
  const [primaryCenterId, setPrimaryCenterId] = useState(centers[0]?.id || 'cs-01');

  // Antecedents inputs
  const [allergiesInput, setAllergiesInput] = useState('');
  const [pathologicalInput, setPathologicalInput] = useState('');
  const [surgicalInput, setSurgicalInput] = useState('');
  const [familyInput, setFamilyInput] = useState('');

  // Initial Chronic & Transmissible conditions
  const [hasHta, setHasHta] = useState(false);
  const [hasDm2, setHasDm2] = useState(false);
  const [hasEpoc, setHasEpoc] = useState(false);
  const [hasAsma, setHasAsma] = useState(false);
  const [hasDengue, setHasDengue] = useState(false);
  const [hasTbc, setHasTbc] = useState(false);
  const [isPregnant, setIsPregnant] = useState(false);

  // Compute age from birthdate
  const calculateAge = (bDate: string) => {
    const diff = Date.now() - new Date(bDate).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !nationalId) return;

    const chosenCenter = centers.find((c) => c.id === primaryCenterId) || centers[0];
    const generatedAge = calculateAge(birthDate);

    // Build chronic list
    const chronicDiseases: ChronicDisease[] = [];
    if (hasHta) {
      chronicDiseases.push({
        id: `cd-${Date.now()}-1`,
        name: 'Hipertensión Arterial Esencial',
        icd10: 'I10',
        diagnosisDate: new Date().toISOString().split('T')[0],
        severity: 'Moderada',
        controlledStatus: 'En seguimiento',
        lastEvaluationDate: new Date().toISOString().split('T')[0],
      });
    }
    if (hasDm2) {
      chronicDiseases.push({
        id: `cd-${Date.now()}-2`,
        name: 'Diabetes Mellitus Tipo 2',
        icd10: 'E11.9',
        diagnosisDate: new Date().toISOString().split('T')[0],
        severity: 'Moderada',
        controlledStatus: 'En seguimiento',
        lastEvaluationDate: new Date().toISOString().split('T')[0],
      });
    }
    if (hasEpoc) {
      chronicDiseases.push({
        id: `cd-${Date.now()}-3`,
        name: 'Enfermedad Pulmonar Obstructiva Crónica (EPOC)',
        icd10: 'J44.9',
        diagnosisDate: new Date().toISOString().split('T')[0],
        severity: 'Moderada',
        controlledStatus: 'En seguimiento',
        lastEvaluationDate: new Date().toISOString().split('T')[0],
      });
    }
    if (hasAsma) {
      chronicDiseases.push({
        id: `cd-${Date.now()}-4`,
        name: 'Asma Bronquial',
        icd10: 'J45.0',
        diagnosisDate: new Date().toISOString().split('T')[0],
        severity: 'Leve',
        controlledStatus: 'Controlado',
        lastEvaluationDate: new Date().toISOString().split('T')[0],
      });
    }

    // Build transmissible list
    const transmissibleDiseases: TransmissibleDisease[] = [];
    if (hasDengue) {
      transmissibleDiseases.push({
        id: `td-${Date.now()}-1`,
        name: 'Dengue sin signos de alarma',
        icd10: 'A97.0',
        onsetDate: new Date().toISOString().split('T')[0],
        diagnosisDate: new Date().toISOString().split('T')[0],
        classification: 'Probable',
        status: 'Activo',
        notificationType: 'Inmediata',
        epidemiologicalWeek: 40,
      });
    }
    if (hasTbc) {
      transmissibleDiseases.push({
        id: `td-${Date.now()}-2`,
        name: 'Tuberculosis Pulmonar BK(+)',
        icd10: 'A15.0',
        onsetDate: new Date().toISOString().split('T')[0],
        diagnosisDate: new Date().toISOString().split('T')[0],
        classification: 'Confirmado',
        status: 'Tratamiento',
        notificationType: 'Inmediata',
        epidemiologicalWeek: 40,
      });
    }

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      medicalRecordNumber: `HC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      nationalId,
      firstName,
      lastName,
      birthDate,
      age: generatedAge,
      sex,
      phone: phone || 'No registrado',
      address: address || 'Sector Central',
      district,
      bloodType,
      primaryHealthCenterId: chosenCenter.id,
      primaryHealthCenterName: chosenCenter.name,
      registrationDate: new Date().toISOString().split('T')[0],
      antecedents: {
        pathological: pathologicalInput
          ? pathologicalInput.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        surgical: surgicalInput
          ? surgicalInput.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        family: familyInput
          ? familyInput.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        nonPathological: ['Estilo de vida regular'],
        allergies: allergiesInput
          ? allergiesInput.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      },
      chronicDiseases,
      transmissibleDiseases,
      otherConditions: isPregnant
        ? [
            {
              id: `oc-${Date.now()}`,
              type: 'Gestante',
              description: 'Gestante bajo control prenatal',
              gestationalWeeks: 18,
            },
          ]
        : [],
      activeMedications: [],
      encounters: [],
    };

    onSave(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Apertura de Historia Clínica Electrónica
              </h2>
              <p className="text-xs text-slate-400">
                Registro oficial de paciente en la Red de Salud
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

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* Personal Information */}
          <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider mb-2 pb-1 border-b border-slate-200">
              1. Identificación del Paciente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">DNI / Documento *</label>
                <input
                  type="text"
                  required
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="8 dígitos"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nombres *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nombres completos"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Apellidos *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Apellidos paterno y materno"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Fecha de Nacimiento *</label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Sexo *</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as Sex)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="F">Femenino</option>
                  <option value="M">Masculino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Grupo Sanguíneo</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value as Patient['bloodType'])}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="O+">O Rh+</option>
                  <option value="O-">O Rh-</option>
                  <option value="A+">A Rh+</option>
                  <option value="A-">A Rh-</option>
                  <option value="B+">B Rh+</option>
                  <option value="B-">B Rh-</option>
                  <option value="AB+">AB Rh+</option>
                  <option value="AB-">AB Rh-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location & Primary Health Center */}
          <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider mb-2 pb-1 border-b border-slate-200">
              2. Ubicación y Centro de Salud Adscrito
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Centro de Salud Base *</label>
                <select
                  value={primaryCenterId}
                  onChange={(e) => setPrimaryCenterId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {centers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Dirección Domiciliaria</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Av. o Calle y N°"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Teléfono Móvil</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="999-000-000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Clinical Antecedents & Allergies */}
          <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider mb-2 pb-1 border-b border-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>3. Antecedentes Clínicos y Alergias (Crítico para Verificación de Medicación)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-red-900 mb-1">
                  Alergias Conocidas (Separar por comas: Ej. Penicilina, AINEs, Sulfas)
                </label>
                <input
                  type="text"
                  value={allergiesInput}
                  onChange={(e) => setAllergiesInput(e.target.value)}
                  placeholder="Ej. Penicilina, Metamizol"
                  className="w-full px-3 py-2 bg-red-50/50 border border-red-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 text-red-900"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Antecedentes Patológicos (Ej. Hipertensión previa, Asma)
                </label>
                <input
                  type="text"
                  value={pathologicalInput}
                  onChange={(e) => setPathologicalInput(e.target.value)}
                  placeholder="Ej. Gastritis crónica, HTA"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Antecedentes Quirúrgicos
                </label>
                <input
                  type="text"
                  value={surgicalInput}
                  onChange={(e) => setSurgicalInput(e.target.value)}
                  placeholder="Ej. Apendicectomía 2020"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Antecedentes Heredofamiliares
                </label>
                <input
                  type="text"
                  value={familyInput}
                  onChange={(e) => setFamilyInput(e.target.value)}
                  placeholder="Ej. Madre con Diabetes tipo 2"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Categorías Epidemiológicas: Crónicas y Transmisibles */}
          <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider mb-2 pb-1 border-b border-slate-200">
              4. Clasificación Epidemiológica Inicial
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasHta}
                  onChange={(e) => setHasHta(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium text-slate-800">Hipertensión (HTA)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDm2}
                  onChange={(e) => setHasDm2(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium text-slate-800">Diabetes Tipo 2</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasEpoc}
                  onChange={(e) => setHasEpoc(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium text-slate-800">EPOC</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAsma}
                  onChange={(e) => setHasAsma(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium text-slate-800">Asma Bronquial</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDengue}
                  onChange={(e) => setHasDengue(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-medium text-amber-900">Dengue Activo</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasTbc}
                  onChange={(e) => setHasTbc(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-medium text-amber-900">Tuberculosis (TBC)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPregnant}
                  onChange={(e) => setIsPregnant(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium text-teal-900">Gestante</span>
              </label>
            </div>
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
              Crear y Almacenar Historia Clínica
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
