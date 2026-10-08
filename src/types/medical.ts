export type Sex = 'M' | 'F' | 'Otro';

export type AgeGroup = 'Pediatrico' | 'Adolescente' | 'AdultoJoven' | 'Adulto' | 'AdultoMayor';

export interface HealthCenter {
  id: string;
  name: string;
  code: string;
  level: 'I-1 Puesto de Salud' | 'I-2 Centro de Salud' | 'I-3 Centro de Salud con Especialidad' | 'I-4 Centro Materno Infantil' | 'II-1 Hospital Comunitario';
  address: string;
  district: string;
  zone: string;
  director: string;
  phone: string;
  populationServed: number; // Población adscrita / jurisdicción
  consultingRooms: number;
  beds: number;
  hasEmergency: boolean;
  hasLaboratory: boolean;
  hasPharmacy: boolean;
  epidemiologicalRisk: 'Bajo' | 'Medio' | 'Alto' | 'Muy Alto';
}

export interface ClinicalAntecedents {
  pathological: string[]; // HTA, DM2, Asma, Dislipidemia, etc.
  surgical: string[]; // Apendicectomía, etc.
  family: string[]; // Cardiopatía isquémica familiar, etc.
  nonPathological: string[]; // Tabaquismo, Alcoholismo, Vacunación completa, Actividad física
  allergies: string[]; // Penicilina, AINEs, Sulfamidas, etc.
}

export interface ChronicDisease {
  id: string;
  name: string;
  icd10: string; // CIE-10
  diagnosisDate: string;
  severity: 'Leve' | 'Moderada' | 'Severa';
  controlledStatus: 'Controlado' | 'En seguimiento' | 'No Controlado';
  lastEvaluationDate: string;
}

export interface TransmissibleDisease {
  id: string;
  name: string;
  icd10: string;
  onsetDate: string; // Fecha inicio síntomas
  diagnosisDate: string;
  classification: 'Sospechoso' | 'Probable' | 'Confirmado';
  status: 'Activo' | 'Tratamiento' | 'Curado' | 'Alta';
  notificationType: 'Inmediata' | 'Semanal'; // Notificación epidemiológica
  epidemiologicalWeek: number; // 1 - 52
}

export interface OtherCondition {
  id: string;
  type: 'Gestante' | 'Discapacidad' | 'Salud Mental' | 'Polifarmacia' | 'Riesgo Cardiovascular' | 'Nutricional';
  description: string;
  notes?: string;
  gestationalWeeks?: number;
}

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  dose: string;
  frequency: string;
  route: 'Oral' | 'Intravenosa' | 'Intramuscular' | 'Subcutánea' | 'Inhalatoria' | 'Tópica';
  startDate: string;
  endDate?: string;
  prescribingCenterId: string;
  prescribingCenterName: string;
  prescribingDoctor: string;
  instructions: string;
  status: 'Activo' | 'Suspendido' | 'Finalizado';
}

export interface VitalSigns {
  bloodPressureSys: number; // mmHg
  bloodPressureDia: number; // mmHg
  heartRate: number; // lpm
  respiratoryRate: number; // rpm
  temperature: number; // °C
  oxygenSaturation: number; // %
  weightKg: number;
  heightCm: number;
  bmi: number;
}

export interface Encounter {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  healthCenterId: string;
  healthCenterName: string;
  service: 'Consulta Externa' | 'Urgencias' | 'Control Crónicos' | 'Epidemiología' | 'Materno Infantil' | 'Teleconsulta' | 'Laboratorio';
  doctorName: string;
  specialty: string;
  reason: string;
  primaryDiagnosis: string;
  icd10: string;
  vitalSigns?: VitalSigns;
  clinicalNotes: string;
  treatmentPlan: string;
  prescribedMedications: Medication[];
}

export interface Patient {
  id: string;
  medicalRecordNumber: string; // N° Historia Clínica
  nationalId: string; // DNI / Documento Identidad
  firstName: string;
  lastName: string;
  birthDate: string;
  age: number;
  sex: Sex;
  phone: string;
  address: string;
  district: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  primaryHealthCenterId: string;
  primaryHealthCenterName: string;
  registrationDate: string;
  
  antecedents: ClinicalAntecedents;
  chronicDiseases: ChronicDisease[];
  transmissibleDiseases: TransmissibleDisease[];
  otherConditions: OtherCondition[];
  activeMedications: Medication[];
  encounters: Encounter[];
}

export interface MedicationWarning {
  type: 'ALLERGY' | 'INTERACTION' | 'DUPLICATION' | 'CENTER_MISMATCH';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  medicationA?: string;
  medicationB?: string;
  centerOrigin?: string;
}

export type TimePeriod = 'semanal' | 'mensual' | 'trimestral' | 'anual';

export interface StatisticalFilter {
  period: TimePeriod;
  year: number;
  month?: number; // 1-12
  week?: number; // 1-52
  quarter?: number; // 1-4
  centerId: 'ALL' | string;
}

export interface AsisMetrics {
  center: HealthCenter | { name: string; address: string; populationServed: number };
  totalPatients: number;
  totalEncounters: number;
  pyramidData: {
    ageRange: string;
    maleCount: number;
    femaleCount: number;
    malePercent: number;
    femalePercent: number;
  }[];
  chronicPrevalence: {
    disease: string;
    cases: number;
    ratePer1000: number;
    percentage: number;
  }[];
  transmissibleIncidence: {
    disease: string;
    cases: number;
    confirmed: number;
    ratePer10000: number;
  }[];
  topDiagnoses: {
    icd10: string;
    description: string;
    count: number;
    percentage: number;
  }[];
  crossCenterMobility: {
    visitedOtherCentersCount: number;
    visitedOtherCentersPercentage: number;
    mostCommonExternalCenters: { centerName: string; count: number }[];
  }[];
  epidemiologicalRiskScore: number; // 0 - 100
  sanitaryProblems: {
    problem: string;
    severity: 'Alta' | 'Media' | 'Baja';
    affectedPopulation: string;
    recommendedIntervention: string;
  }[];
}
