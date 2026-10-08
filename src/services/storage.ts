import { HealthCenter, Patient, Encounter, Medication } from '../types/medical';
import { INITIAL_HEALTH_CENTRES, INITIAL_PATIENTS } from '../data/mockData';

const STORAGE_KEYS = {
  CENTERS: 'medred_health_centers_v1',
  PATIENTS: 'medred_patients_v1',
  BACKUP_SNAPSHOTS: 'medred_backup_snapshots_v1',
};

export interface DatabaseBackupPayload {
  version: string;
  app: string;
  exportDate: string;
  checksum: string;
  stats: {
    totalPatients: number;
    totalHealthCenters: number;
    totalEncounters: number;
    totalMedications: number;
    totalChronic: number;
    totalTransmissible: number;
  };
  healthCenters: HealthCenter[];
  patients: Patient[];
}

export interface LocalSnapshot {
  id: string;
  label: string;
  timestamp: string;
  patientCount: number;
  centerCount: number;
  dataJson: string;
}

export const StorageService = {
  getHealthCenters(): HealthCenter[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CENTERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading health centers from localStorage', e);
    }
    // Seed default
    localStorage.setItem(STORAGE_KEYS.CENTERS, JSON.stringify(INITIAL_HEALTH_CENTRES));
    return INITIAL_HEALTH_CENTRES;
  },

  getHealthCenterById(id: string): HealthCenter | undefined {
    const centers = this.getHealthCenters();
    return centers.find((c) => c.id === id);
  },

  saveHealthCenters(centers: HealthCenter[]): void {
    localStorage.setItem(STORAGE_KEYS.CENTERS, JSON.stringify(centers));
  },

  addHealthCenter(center: HealthCenter): void {
    const centers = this.getHealthCenters();
    centers.push(center);
    this.saveHealthCenters(centers);
  },

  getPatients(): Patient[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading patients from localStorage', e);
    }
    // Seed default
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    return INITIAL_PATIENTS;
  },

  getPatientById(id: string): Patient | undefined {
    const patients = this.getPatients();
    return patients.find((p) => p.id === id);
  },

  savePatients(patients: Patient[]): void {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  },

  addPatient(patient: Patient): void {
    const patients = this.getPatients();
    patients.unshift(patient);
    this.savePatients(patients);
  },

  updatePatient(patient: Patient): void {
    const patients = this.getPatients();
    const index = patients.findIndex((p) => p.id === patient.id);
    if (index !== -1) {
      patients[index] = patient;
      this.savePatients(patients);
    }
  },

  addEncounterToPatient(patientId: string, encounter: Encounter): void {
    const patients = this.getPatients();
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      patient.encounters.unshift(encounter);
      this.savePatients(patients);
    }
  },

  addMedicationToPatient(patientId: string, medication: Medication): void {
    const patients = this.getPatients();
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      patient.activeMedications.push(medication);
      this.savePatients(patients);
    }
  },

  resetToInitial(): void {
    localStorage.setItem(STORAGE_KEYS.CENTERS, JSON.stringify(INITIAL_HEALTH_CENTRES));
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
  },

  // === DATABASE BACKUP & RESTORE METHODS ===

  /**
   * Generates a complete serialized backup object of the database
   */
  createBackupPayload(): DatabaseBackupPayload {
    const healthCenters = this.getHealthCenters();
    const patients = this.getPatients();

    let totalEncounters = 0;
    let totalMedications = 0;
    let totalChronic = 0;
    let totalTransmissible = 0;

    patients.forEach((p) => {
      totalEncounters += p.encounters.length;
      totalMedications += p.activeMedications.length;
      totalChronic += p.chronicDiseases.length;
      totalTransmissible += p.transmissibleDiseases.length;
    });

    const exportDate = new Date().toISOString();
    const rawData = JSON.stringify({ healthCenters, patients });
    // Simple checksum
    let hash = 0;
    for (let i = 0; i < rawData.length; i++) {
      hash = (hash << 5) - hash + rawData.charCodeAt(i);
      hash |= 0;
    }
    const checksum = `SHA-${Math.abs(hash).toString(16).toUpperCase()}`;

    return {
      version: '1.0.0',
      app: 'Nexus Asisten Care G.C - Historias Clínicas y Epidemiología',
      exportDate,
      checksum,
      stats: {
        totalPatients: patients.length,
        totalHealthCenters: healthCenters.length,
        totalEncounters,
        totalMedications,
        totalChronic,
        totalTransmissible,
      },
      healthCenters,
      patients,
    };
  },

  /**
   * Downloads a JSON backup file to the user's computer
   */
  downloadJsonBackup(): void {
    const payload = this.createBackupPayload();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateFormatted = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `NexusCare_Respaldo_BD_${dateFormatted}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  /**
   * Restores database from parsed backup payload
   */
  restoreFromBackupPayload(payload: DatabaseBackupPayload): boolean {
    if (!payload.healthCenters || !payload.patients || !Array.isArray(payload.patients)) {
      throw new Error('Formato de respaldo inválido: faltan colecciones requeridas de pacientes o centros.');
    }
    this.saveHealthCenters(payload.healthCenters);
    this.savePatients(payload.patients);

    // Save as restore point
    this.createLocalSnapshot(`Restauración desde respaldo (${payload.exportDate.slice(0, 10)})`);
    return true;
  },

  /**
   * Local snapshots management
   */
  getLocalSnapshots(): LocalSnapshot[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BACKUP_SNAPSHOTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading snapshots', e);
    }
    return [];
  },

  createLocalSnapshot(label: string = 'Punto de restauración manual'): LocalSnapshot {
    const payload = this.createBackupPayload();
    const snapshots = this.getLocalSnapshots();
    const newSnapshot: LocalSnapshot = {
      id: `snap-${Date.now()}`,
      label,
      timestamp: new Date().toISOString(),
      patientCount: payload.stats.totalPatients,
      centerCount: payload.stats.totalHealthCenters,
      dataJson: JSON.stringify(payload),
    };
    // Keep last 10 snapshots
    snapshots.unshift(newSnapshot);
    if (snapshots.length > 10) snapshots.pop();
    localStorage.setItem(STORAGE_KEYS.BACKUP_SNAPSHOTS, JSON.stringify(snapshots));
    return newSnapshot;
  },

  restoreLocalSnapshot(snapshotId: string): boolean {
    const snapshots = this.getLocalSnapshots();
    const snap = snapshots.find((s) => s.id === snapshotId);
    if (!snap) throw new Error('Punto de restauración no encontrado.');
    const payload: DatabaseBackupPayload = JSON.parse(snap.dataJson);
    this.saveHealthCenters(payload.healthCenters);
    this.savePatients(payload.patients);
    return true;
  },

  deleteLocalSnapshot(snapshotId: string): void {
    const snapshots = this.getLocalSnapshots().filter((s) => s.id !== snapshotId);
    localStorage.setItem(STORAGE_KEYS.BACKUP_SNAPSHOTS, JSON.stringify(snapshots));
  },
};
