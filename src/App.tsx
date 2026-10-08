import React, { useState, useEffect } from 'react';
import { HealthCenter, Patient, Encounter, Medication } from './types/medical';
import { StorageService } from './services/storage';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Navbar } from './components/Navbar';
import { PatientListView } from './components/PatientListView';
import { PatientDetailModal } from './components/PatientDetailModal';
import { NewPatientModal } from './components/NewPatientModal';
import { NewEncounterModal } from './components/NewEncounterModal';
import { StatisticsView } from './components/StatisticsView';
import { AsisView } from './components/AsisView';
import { CentersView } from './components/CentersView';
import { BackupRestoreView } from './components/BackupRestoreView';
import { DeploymentModal } from './components/DeploymentModal';
import { ZipBundleService } from './services/zipBundleService';

export default function App() {
  const [centers, setCenters] = useState<HealthCenter[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeTab, setActiveTab] = useState<'patients' | 'statistics' | 'asis' | 'centers' | 'backup'>('patients');
  const [selectedCenterId, setSelectedCenterId] = useState<string>('ALL');

  // PWA Install Hook
  const { isInstalled, canInstall, isIOS, promptInstall } = usePWAInstall();

  // Modals
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<Patient | null>(null);
  const [selectedPatientForEncounter, setSelectedPatientForEncounter] = useState<Patient | null>(null);
  const [showNewPatientModal, setShowNewPatientModal] = useState<boolean>(false);
  const [showDeploymentModal, setShowDeploymentModal] = useState<boolean>(false);

  // Initialize data on load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedCenters = StorageService.getHealthCenters();
    const loadedPatients = StorageService.getPatients();
    setCenters(loadedCenters);
    setPatients(loadedPatients);
  };

  const handleResetData = () => {
    if (window.confirm('¿Desea restablecer los datos de prueba a los valores iniciales de la Red de Salud?')) {
      StorageService.resetToInitial();
      loadData();
      setSelectedPatientForDetail(null);
    }
  };

  const handleSavePatient = (newPatient: Patient) => {
    StorageService.addPatient(newPatient);
    loadData();
    // Open the newly created patient immediately for review
    setSelectedPatientForDetail(newPatient);
  };

  const handleSaveEncounter = (patientId: string, encounter: Encounter) => {
    StorageService.addEncounterToPatient(patientId, encounter);
    loadData();

    // If modal is open for this patient, update it in place
    if (selectedPatientForDetail && selectedPatientForDetail.id === patientId) {
      const updated = StorageService.getPatientById(patientId);
      if (updated) setSelectedPatientForDetail(updated);
    }
  };

  const handleAddMedication = (patientId: string, medication: Medication) => {
    StorageService.addMedicationToPatient(patientId, medication);
    loadData();

    if (selectedPatientForDetail && selectedPatientForDetail.id === patientId) {
      const updated = StorageService.getPatientById(patientId);
      if (updated) setSelectedPatientForDetail(updated);
    }
  };

  const handleAddCenter = (newCenter: HealthCenter) => {
    StorageService.addHealthCenter(newCenter);
    loadData();
  };

  const handleSelectCenterForAsis = (centerId: string) => {
    setSelectedCenterId(centerId);
    setActiveTab('asis');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Application Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        centers={centers}
        selectedCenterId={selectedCenterId}
        setSelectedCenterId={setSelectedCenterId}
        onOpenNewPatient={() => setShowNewPatientModal(true)}
        onResetData={handleResetData}
        patientCount={patients.length}
        onOpenDeployment={() => setShowDeploymentModal(true)}
        onInstallPwa={promptInstall}
        canInstallPwa={canInstall}
        isPwaInstalled={isInstalled}
        onDownloadZip={() => ZipBundleService.downloadCompleteSoftwareZip()}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'patients' && (
          <PatientListView
            patients={patients}
            centers={centers}
            onSelectPatient={(p) => setSelectedPatientForDetail(p)}
            onOpenNewEncounter={(p) => setSelectedPatientForEncounter(p)}
            onOpenNewPatient={() => setShowNewPatientModal(true)}
          />
        )}

        {activeTab === 'statistics' && (
          <StatisticsView
            patients={patients}
            centers={centers}
            initialCenterId={selectedCenterId}
          />
        )}

        {activeTab === 'asis' && (
          <AsisView
            centers={centers}
            patients={patients}
            initialCenterId={selectedCenterId === 'ALL' ? 'cs-01' : selectedCenterId}
          />
        )}

        {activeTab === 'centers' && (
          <CentersView
            centers={centers}
            patients={patients}
            onSelectCenterForAsis={handleSelectCenterForAsis}
            onAddCenter={handleAddCenter}
          />
        )}

        {activeTab === 'backup' && (
          <BackupRestoreView
            patients={patients}
            centers={centers}
            onDataChanged={loadData}
          />
        )}
      </main>

      {/* Patient Detail Modal */}
      {selectedPatientForDetail && (
        <PatientDetailModal
          patient={selectedPatientForDetail}
          centers={centers}
          onClose={() => setSelectedPatientForDetail(null)}
          onAddEncounterClick={(p) => {
            setSelectedPatientForEncounter(p);
          }}
          onAddMedication={handleAddMedication}
        />
      )}

      {/* New Patient Registration Modal */}
      {showNewPatientModal && (
        <NewPatientModal
          centers={centers}
          onClose={() => setShowNewPatientModal(false)}
          onSave={handleSavePatient}
        />
      )}

      {/* New Encounter/Consultation Registration Modal */}
      {selectedPatientForEncounter && (
        <NewEncounterModal
          patient={selectedPatientForEncounter}
          centers={centers}
          onClose={() => setSelectedPatientForEncounter(null)}
          onSaveEncounter={handleSaveEncounter}
        />
      )}

      {/* Deployment & PC Execution Modal */}
      {showDeploymentModal && (
        <DeploymentModal
          onClose={() => setShowDeploymentModal(false)}
          onInstallPwa={promptInstall}
          canInstallPwa={canInstall}
          isPwaInstalled={isInstalled}
          isIOS={isIOS}
          onDownloadZip={() => ZipBundleService.downloadCompleteSoftwareZip()}
        />
      )}

      {/* Institutional Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Nexus Asisten Care G.C</strong> · Sistema Unificado de Historias Clínicas y Epidemiología de Red
          </div>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <button
              onClick={() => setShowDeploymentModal(true)}
              className="text-teal-400 hover:underline cursor-pointer"
            >
              Despliegue PC / Servidor
            </button>
            <span>·</span>
            <span>PWA & Offline Capable</span>
            <span>·</span>
            <span>Respaldo Criptográfico JSON</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
