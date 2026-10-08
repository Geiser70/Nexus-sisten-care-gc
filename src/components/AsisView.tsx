import React, { useState, useMemo } from 'react';
import { HealthCenter, Patient } from '../types/medical';
import { StatisticsCalculator } from '../services/statisticsCalculator';
import { ExportService } from '../services/exportService';
import {
  Activity,
  MapPin,
  Building,
  Users,
  FileDown,
  AlertTriangle,
  ShieldCheck,
  Stethoscope,
  Droplets,
  Wind,
  Phone,
  CheckCircle,
} from 'lucide-react';

interface AsisViewProps {
  centers: HealthCenter[];
  patients: Patient[];
  initialCenterId?: string;
}

export const AsisView: React.FC<AsisViewProps> = ({
  centers,
  patients,
  initialCenterId = 'cs-01',
}) => {
  const [selectedCenterId, setSelectedCenterId] = useState<string>(initialCenterId);

  const asis = useMemo(() => {
    return StatisticsCalculator.generateAsis(selectedCenterId, centers, patients);
  }, [selectedCenterId, centers, patients]);

  const handleExportPDF = () => {
    ExportService.exportAsisToPDF(asis);
  };

  return (
    <div className="space-y-6">
      {/* Header with selector & PDF export */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Análisis de Situación de Salud (ASIS)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnóstico demográfico, socio-ambiental y epidemiológico territorial
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCenterId}
            onChange={(e) => setSelectedCenterId(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 flex-1 sm:flex-none max-w-sm truncate"
          >
            <option value="ALL">Red Asistencial Integrada (Toda la Jurisdicción)</option>
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs shrink-0"
          >
            <FileDown className="w-4 h-4" />
            <span>Descargar ASIS PDF</span>
          </button>
        </div>
      </div>

      {/* Facility & Territorial Identity Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{asis.center.name}</span>
              {'level' in asis.center && asis.center.level && (
                <span className="text-[11px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {asis.center.level}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Dirección: <strong>{asis.center.address}</strong></span>
            </div>
            {'director' in asis.center && asis.center.director && (
              <div className="text-xs text-slate-500 mt-1">
                Responsable Sanitario: <strong className="text-slate-700">{asis.center.director}</strong>
              </div>
            )}
          </div>

          {/* Demographic & Risk Badge */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Población en Jurisdicción
              </span>
              <span className="text-lg font-bold text-slate-900">
                {asis.center.populationServed.toLocaleString()} hab.
              </span>
            </div>

            <div className="border-l border-slate-200 pl-3">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Score de Riesgo
              </span>
              <span
                className={`text-lg font-bold ${
                  asis.epidemiologicalRiskScore > 70
                    ? 'text-rose-700'
                    : asis.epidemiologicalRiskScore > 40
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}
              >
                {asis.epidemiologicalRiskScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Infrastructure & Services (if specific center) */}
        {'consultingRooms' in asis.center && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">Consultorios:</span>
              <strong className="text-slate-900 text-sm">{asis.center.consultingRooms}</strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">Camas de Observación:</span>
              <strong className="text-slate-900 text-sm">{asis.center.beds}</strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">Tópico Urgencias:</span>
              <strong className={asis.center.hasEmergency ? 'text-emerald-700' : 'text-slate-500'}>
                {asis.center.hasEmergency ? 'Operativo 24h' : 'No disponible'}
              </strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">Laboratorio Clínico:</span>
              <strong className={asis.center.hasLaboratory ? 'text-emerald-700' : 'text-slate-500'}>
                {asis.center.hasLaboratory ? 'Automatizado' : 'Derivación externa'}
              </strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">Farmacia Institucional:</span>
              <strong className={asis.center.hasPharmacy ? 'text-emerald-700' : 'text-slate-500'}>
                {asis.center.hasPharmacy ? 'Dispensación activa' : 'Cerrada'}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Demographic Pyramid & Morbidity Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demographic Population Structure (Pirámide de Población) */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Estructura Demográfica (Pirámide Poblacional)
            </h3>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-800"></span> Hombres
              </span>
              <span className="flex items-center gap-1 text-teal-800 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-teal-600"></span> Mujeres
              </span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {asis.pyramidData.map((bracket) => {
              const maxVal = Math.max(
                ...asis.pyramidData.flatMap((b) => [b.maleCount, b.femaleCount, 4])
              );
              const maleWidth = (bracket.maleCount / maxVal) * 100;
              const femaleWidth = (bracket.femaleCount / maxVal) * 100;

              return (
                <div key={bracket.ageRange} className="flex items-center text-xs">
                  {/* Male Side */}
                  <div className="w-2/5 flex items-center justify-end pr-2 gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-600">{bracket.maleCount}</span>
                    <div className="h-4 bg-slate-800 rounded-l-xs transition-all duration-300" style={{ width: `${Math.max(4, maleWidth)}%` }} />
                  </div>

                  {/* Center Label */}
                  <div className="w-1/5 text-center text-[11px] font-medium text-slate-500 bg-slate-50 py-0.5 rounded border border-slate-200">
                    {bracket.ageRange}
                  </div>

                  {/* Female Side */}
                  <div className="w-2/5 flex items-center pl-2 gap-1.5">
                    <div className="h-4 bg-teal-600 rounded-r-xs transition-all duration-300" style={{ width: `${Math.max(4, femaleWidth)}%` }} />
                    <span className="text-[11px] font-semibold text-teal-800">{bracket.femaleCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Socio-Environmental Determinants & Geographic Health Factors */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Determinantes Sociales y Ambientales de la Salud
            </h3>
            <span className="text-[11px] text-slate-500">Evaluación Territorial</span>
          </div>

          <div className="p-4 space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
              <Droplets className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800">
                  Agua y Saneamiento en la Jurisdicción
                </h4>
                <p className="text-slate-600 mt-0.5">
                  La dirección ({asis.center.address}) comprende zonas con suministro intermitente de agua potable por red y acopio en recipientes intradomiciliarios, factor predisponente para la proliferación del vector del Dengue (Aedes aegypti).
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
              <Wind className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800">
                  Calidad del Aire y Hacinamiento Domiciliario
                </h4>
                <p className="text-slate-600 mt-0.5">
                  Densidad habitacional media-alta con ventilación limitada en viviendas multifamiliares, lo que eleva el riesgo de transmisión de Tuberculosis pulmonar (TBC) e infecciones respiratorias agudas graves.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
              <Building className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800">
                  Accesibilidad Geográfica y Red de Referencia
                </h4>
                <p className="text-slate-600 mt-0.5">
                  Conexión directa a vías metropolitanas. La movilidad de pacientes hacia hospitales de segundo nivel (Hospital La Esperanza) es fluida para urgencias quirúrgicas y complicaciones crónicas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prioritized Health Problems Matrix & Interventions */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Matriz de Problemas Sanitarios Priorizados (Método ASIS)
            </h3>
            <p className="text-[11px] text-slate-500">
              Priorización técnica de problemas y paquete de intervenciones programadas
            </p>
          </div>
          <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            Plan Operativo Anual
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50/70 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="px-5 py-3">Problema Sanitario Identificado</th>
                <th className="px-4 py-3">Severidad</th>
                <th className="px-4 py-3">Población Vulnerable</th>
                <th className="px-5 py-3">Intervención Recomendada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {asis.sanitaryProblems.map((sp, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3 font-semibold text-slate-800 max-w-sm">
                    {sp.problem}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        sp.severity === 'Alta'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {sp.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {sp.affectedPopulation}
                  </td>
                  <td className="px-5 py-3 text-slate-800 font-medium max-w-md">
                    {sp.recommendedIntervention}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
