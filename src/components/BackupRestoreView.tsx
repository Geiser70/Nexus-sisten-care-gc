import React, { useState, useRef } from 'react';
import { StorageService, DatabaseBackupPayload, LocalSnapshot } from '../services/storage';
import { ExportService } from '../services/exportService';
import { StatisticsCalculator } from '../services/statisticsCalculator';
import { HealthCenter, Patient } from '../types/medical';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  FileSpreadsheet,
  Clock,
  HardDrive,
  Check,
  Trash2,
} from 'lucide-react';

interface BackupRestoreViewProps {
  patients: Patient[];
  centers: HealthCenter[];
  onDataChanged: () => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  patients,
  centers,
  onDataChanged,
}) => {
  const [snapshots, setSnapshots] = useState<LocalSnapshot[]>(StorageService.getLocalSnapshots());
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pendingRestorePayload, setPendingRestorePayload] = useState<DatabaseBackupPayload | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick stats
  const totalEncounters = patients.reduce((acc, p) => acc + p.encounters.length, 0);
  const totalMedications = patients.reduce((acc, p) => acc + p.activeMedications.length, 0);

  const handleDownloadJsonBackup = () => {
    StorageService.downloadJsonBackup();
    setStatusMessage({
      type: 'success',
      text: 'Archivo de respaldo JSON generado y descargado exitosamente a su equipo.',
    });
  };

  const handleDownloadExcelBackup = () => {
    const stats = StatisticsCalculator.calculateStatistics(patients, centers, {
      period: 'anual',
      year: 2026,
      centerId: 'ALL',
    });
    ExportService.exportStatisticsToExcel(stats, patients, 'MedRed_Respaldo_Tabular_Completo');
    setStatusMessage({
      type: 'success',
      text: 'Respaldo tabular en formato Excel (.xlsx) exportado exitosamente.',
    });
  };

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const label = snapshotLabel.trim() || `Punto guardado el ${new Date().toLocaleTimeString('es-ES')}`;
    StorageService.createLocalSnapshot(label);
    setSnapshots(StorageService.getLocalSnapshots());
    setSnapshotLabel('');
    setStatusMessage({
      type: 'success',
      text: `Punto de restauración local creado: "${label}".`,
    });
  };

  const handleRestoreSnapshot = (id: string, label: string) => {
    if (window.confirm(`¿Confirma que desea restaurar la base de datos al punto: "${label}"? Los datos actuales serán reemplazados.`)) {
      try {
        StorageService.restoreLocalSnapshot(id);
        onDataChanged();
        setStatusMessage({
          type: 'success',
          text: `Base de datos restaurada con éxito al punto: "${label}".`,
        });
      } catch (err) {
        setStatusMessage({
          type: 'error',
          text: `Error al restaurar: ${(err as Error).message}`,
        });
      }
    }
  };

  const handleDeleteSnapshot = (id: string) => {
    StorageService.deleteLocalSnapshot(id);
    setSnapshots(StorageService.getLocalSnapshots());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.patients || !parsed.healthCenters) {
          throw new Error('El archivo no contiene las colecciones válidas de Nexus Asisten Care G.C.');
        }
        setPendingRestorePayload(parsed);
      } catch (err) {
        setStatusMessage({
          type: 'error',
          text: `Archivo de respaldo inválido: ${(err as Error).message}`,
        });
        setPendingRestorePayload(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmFileRestore = () => {
    if (!pendingRestorePayload) return;
    try {
      StorageService.restoreFromBackupPayload(pendingRestorePayload);
      onDataChanged();
      setSnapshots(StorageService.getLocalSnapshots());
      setStatusMessage({
        type: 'success',
        text: `¡Base de datos restaurada exitosamente! Se importaron ${pendingRestorePayload.patients.length} historias clínicas y ${pendingRestorePayload.healthCenters.length} centros de salud.`,
      });
      setPendingRestorePayload(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: `Error durante la restauración: ${(err as Error).message}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Centro de Respaldo y Restauración de Base de Datos
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Exportación criptográfica, copias de seguridad portátiles, migración a servidores y puntos de recuperación
          </p>
        </div>

        {/* Action downloads */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadJsonBackup}
            className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Respaldo (.json)</span>
          </button>

          <button
            onClick={handleDownloadExcelBackup}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Todo a Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Notification banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Database Current Volume Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Historias Médicas
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">{patients.length}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Expedientes activos</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Centros de Salud
          </span>
          <div className="text-xl font-bold text-teal-800 mt-1">{centers.length}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Establecimientos en red</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Consultas Registradas
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">{totalEncounters}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Atenciones e interconsultas</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Fármacos Conciliados
          </span>
          <div className="text-xl font-bold text-indigo-800 mt-1">{totalMedications}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Prescripciones vigentes</p>
        </div>
      </div>

      {/* Grid: Restore from File & Local Snapshots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Restore from File Module */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Restaurar Base de Datos desde Archivo JSON
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Format .JSON</span>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600">
                Seleccione un archivo de copia de seguridad previamente generado (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">.json</code>). El sistema verificará su integridad y le mostrará un resumen previo antes de reemplazar los datos.
              </p>

              {/* Upload Input */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50 hover:bg-slate-100/60 transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                  id="backup-file-input"
                />
                <label
                  htmlFor="backup-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <Upload className="w-7 h-7 text-teal-600" />
                  <span className="font-semibold text-slate-800">
                    Haga clic aquí para seleccionar el archivo de respaldo
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {pendingFileName || 'Archivos compatibles: NexusCare_Respaldo_BD_*.json'}
                  </span>
                </label>
              </div>

              {/* Pre-flight inspection card */}
              {pendingRestorePayload && (
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-900 text-xs">
                      Respaldo Válido Verificado
                    </span>
                    <span className="text-[10px] font-mono text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                      Checksum: {pendingRestorePayload.checksum}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-700 text-[11px]">
                    <div>
                      <strong>Fecha de Creación:</strong> {new Date(pendingRestorePayload.exportDate).toLocaleString('es-ES')}
                    </div>
                    <div>
                      <strong>Versión de Esquema:</strong> {pendingRestorePayload.version}
                    </div>
                    <div>
                      <strong>Historias Clínicas:</strong> {pendingRestorePayload.stats?.totalPatients || pendingRestorePayload.patients.length} pacientes
                    </div>
                    <div>
                      <strong>Centros de Salud:</strong> {pendingRestorePayload.stats?.totalHealthCenters || pendingRestorePayload.healthCenters.length} establecimientos
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmFileRestore}
                    className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg transition-colors shadow-xs"
                  >
                    Confirmar y Restaurar Base de Datos Ahora
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Local Snapshots / Restore Points */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Puntos de Restauración Locales
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {snapshots.length} puntos guardados
              </span>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Form to create snapshot */}
              <form onSubmit={handleCreateSnapshot} className="flex gap-2">
                <input
                  type="text"
                  value={snapshotLabel}
                  onChange={(e) => setSnapshotLabel(e.target.value)}
                  placeholder="Ej. Respaldo previo a ingreso de campaña semanal"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors shrink-0"
                >
                  Crear Punto
                </button>
              </form>

              {/* Snapshots list */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {snapshots.length > 0 ? (
                  snapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">
                          {snap.label}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{new Date(snap.timestamp).toLocaleString('es-ES')}</span>
                          <span>·</span>
                          <span>{snap.patientCount} pacientes</span>
                          <span>·</span>
                          <span>{snap.centerCount} centros</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleRestoreSnapshot(snap.id, snap.label)}
                          title="Restaurar a este estado"
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold rounded transition-colors"
                        >
                          Restaurar
                        </button>
                        <button
                          onClick={() => handleDeleteSnapshot(snap.id)}
                          title="Eliminar este punto"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400">
                    No hay puntos de restauración guardados aún. Cree uno para congelar el estado actual.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
