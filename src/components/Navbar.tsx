import React from 'react';
import { HealthCenter } from '../types/medical';
import {
  FileText,
  BarChart3,
  Activity,
  Building2,
  Database,
  PlusCircle,
  RotateCcw,
  MapPin,
  Download,
  Terminal,
  Check,
  Smartphone,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'patients' | 'statistics' | 'asis' | 'centers' | 'backup';
  setActiveTab: (tab: 'patients' | 'statistics' | 'asis' | 'centers' | 'backup') => void;
  centers: HealthCenter[];
  selectedCenterId: string;
  setSelectedCenterId: (id: string) => void;
  onOpenNewPatient: () => void;
  onResetData: () => void;
  patientCount: number;
  onOpenDeployment: () => void;
  onInstallPwa: () => void;
  canInstallPwa: boolean;
  isPwaInstalled: boolean;
  onDownloadZip: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  centers,
  selectedCenterId,
  setSelectedCenterId,
  onOpenNewPatient,
  onResetData,
  patientCount,
  onOpenDeployment,
  onInstallPwa,
  canInstallPwa,
  isPwaInstalled,
  onDownloadZip,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Banner with Hospital Network context */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and system brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-inner font-bold tracking-tighter text-sm">
              NAC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base tracking-tight text-white">
                  Nexus Asisten Care G.C
                </span>
                <span className="hidden sm:inline-block text-[11px] font-mono text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/50">
                  RED ASISTENCIAL UNIFICADA
                </span>
              </div>
              <p className="text-xs text-slate-400 font-light truncate max-w-xs sm:max-w-md">
                Historias Clínicas · Vigilancia Epidemiológica · Trazabilidad Intercentros
              </p>
            </div>
          </div>

          {/* Quick Center Filter & Global Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Direct Software Download to Computer Button */}
            <button
              onClick={onDownloadZip}
              title="Descargar el software completo empaquetado en archivo ZIP para tu computadora"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar en PC</span>
            </button>

            {/* PWA Install Button */}
            {!isPwaInstalled && (
              <button
                onClick={onInstallPwa}
                title="Instalar como aplicación en PC o Móvil"
                className="hidden md:inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-teal-500/30 transition-colors shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                <span>Instalar App</span>
              </button>
            )}

            {/* PC / Server Deployment Bundle Modal */}
            <button
              onClick={onOpenDeployment}
              title="Ver paquetes para ejecutar en PC y Servidor"
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition-colors shadow-xs"
            >
              <Terminal className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Guía Despliegue</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-400">Jurisdicción:</span>
              <select
                value={selectedCenterId}
                onChange={(e) => setSelectedCenterId(e.target.value)}
                aria-label="Seleccionar jurisdicción o centro de salud"
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer max-w-xs truncate"
              >
                <option value="ALL" className="bg-slate-900 text-white">
                  Toda la Red en Conjunto ({centers.length} Centros)
                </option>
                {centers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenNewPatient}
              className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nueva Historia</span>
            </button>

            <button
              onClick={onResetData}
              title="Restablecer datos de prueba"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-t border-slate-800/80 pt-1 -mb-px overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab('patients')}
            className={`flex items-center gap-2 px-3 py-2.5 font-medium border-b-2 text-xs transition-colors whitespace-nowrap ${
              activeTab === 'patients'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Historias Médicas ({patientCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('statistics')}
            className={`flex items-center gap-2 px-3 py-2.5 font-medium border-b-2 text-xs transition-colors whitespace-nowrap ${
              activeTab === 'statistics'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Estadísticas Epidemiológicas & Exportación</span>
          </button>

          <button
            onClick={() => setActiveTab('asis')}
            className={`flex items-center gap-2 px-3 py-2.5 font-medium border-b-2 text-xs transition-colors whitespace-nowrap ${
              activeTab === 'asis'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Análisis ASIS por Centro</span>
          </button>

          <button
            onClick={() => setActiveTab('centers')}
            className={`flex items-center gap-2 px-3 py-2.5 font-medium border-b-2 text-xs transition-colors whitespace-nowrap ${
              activeTab === 'centers'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Red de Centros ({centers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-3 py-2.5 font-medium border-b-2 text-xs transition-colors whitespace-nowrap ${
              activeTab === 'backup'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Respaldo de Base de Datos</span>
          </button>
        </div>
      </div>
    </header>
  );
};
