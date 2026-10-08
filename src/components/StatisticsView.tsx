import React, { useState, useMemo } from 'react';
import { HealthCenter, Patient, StatisticalFilter, TimePeriod } from '../types/medical';
import { StatisticsCalculator } from '../services/statisticsCalculator';
import { ExportService } from '../services/exportService';
import {
  FileSpreadsheet,
  FileDown,
  Calendar,
  Building,
  TrendingUp,
  Users,
  Activity,
  HeartPulse,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react';

interface StatisticsViewProps {
  patients: Patient[];
  centers: HealthCenter[];
  initialCenterId?: string;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  patients,
  centers,
  initialCenterId = 'ALL',
}) => {
  const [period, setPeriod] = useState<TimePeriod>('anual');
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(10); // Octubre
  const [week, setWeek] = useState<number>(40); // Semana 40
  const [quarter, setQuarter] = useState<number>(3); // Q3
  const [centerId, setCenterId] = useState<string>(initialCenterId);

  // Compute stats dynamically
  const filter: StatisticalFilter = useMemo(
    () => ({
      period,
      year,
      month,
      week,
      quarter,
      centerId,
    }),
    [period, year, month, week, quarter, centerId]
  );

  const stats = useMemo(() => {
    return StatisticsCalculator.calculateStatistics(patients, centers, filter);
  }, [patients, centers, filter]);

  // Handlers for export
  const handleExportExcel = () => {
    ExportService.exportStatisticsToExcel(stats, patients, `Estadisticas_${centerId === 'ALL' ? 'Red_Total' : 'Centro'}`);
  };

  const handleExportPDF = () => {
    ExportService.exportStatisticsToPDF(stats, `Reporte_Oficial_${centerId === 'ALL' ? 'Red_Total' : 'Centro'}`);
  };

  return (
    <div className="space-y-6">
      {/* Control Panel: Filters for Time Period, Year, Center & Action Exports */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Módulo de Cálculo Estadístico y Epidemiología
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cálculo automatizado de indicadores según períodos temporales y centros de la red
            </p>
          </div>

          {/* Real Export Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar a Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <FileDown className="w-4 h-4" />
              <span>Exportar a PDF (.pdf)</span>
            </button>
          </div>
        </div>

        {/* Filter Selection Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Health Center Scope */}
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Ámbito Asistencial / Centro de Salud
            </label>
            <select
              value={centerId}
              onChange={(e) => setCenterId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">Red Integrada de Salud (Base en Conjunto)</option>
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.level})
                </option>
              ))}
            </select>
          </div>

          {/* Temporal Period Type */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Periodicidad</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as TimePeriod)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="semanal">Semanal (Semanas Epidem.)</option>
              <option value="mensual">Mensual</option>
              <option value="trimestral">Trimestral</option>
              <option value="anual">Anual Consolidado</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Año</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>
          </div>

          {/* Dynamic specific sub-period selector */}
          <div>
            {period === 'semanal' && (
              <>
                <label className="block font-semibold text-slate-700 mb-1">Semana Epidemiológica</label>
                <select
                  value={week}
                  onChange={(e) => setWeek(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {Array.from({ length: 52 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w}>
                      SE-{w}
                    </option>
                  ))}
                </select>
              </>
            )}

            {period === 'mensual' && (
              <>
                <label className="block font-semibold text-slate-700 mb-1">Mes</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {[
                    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre',
                  ].map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </>
            )}

            {period === 'trimestral' && (
              <>
                <label className="block font-semibold text-slate-700 mb-1">Trimestre</label>
                <select
                  value={quarter}
                  onChange={(e) => setQuarter(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value={1}>Q1 (Ene - Mar)</option>
                  <option value={2}>Q2 (Abr - Jun)</option>
                  <option value={3}>Q3 (Jul - Set)</option>
                  <option value={4}>Q4 (Oct - Dic)</option>
                </select>
              </>
            )}

            {period === 'anual' && (
              <div className="pt-6 text-slate-400 font-medium">Todo el año consolidado</div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards: Biostatistical Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Encounters */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Atenciones
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {stats.totalEncounters}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {stats.uniquePatientsServed} pacientes únicos
          </p>
        </div>

        {/* Coverage Rate */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Tasa de Cobertura
          </span>
          <div className="text-xl font-bold text-teal-800 mt-1">
            {stats.coverageRatePer1000}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            por 1,000 habitantes
          </p>
        </div>

        {/* Chronic Prevalence */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Prevalencia Crónicos
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {stats.chronicStats.prevalenceRatePer1000}
          </div>
          <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
            {stats.chronicStats.controlledPercent}% controlados
          </p>
        </div>

        {/* Transmissible Incidence */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Incidencia Transmisibles
          </span>
          <div className="text-xl font-bold text-amber-800 mt-1">
            {stats.transmissibleStats.incidenceRatePer10000}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            x 10,000 hab. ({stats.transmissibleStats.totalCases} casos)
          </p>
        </div>

        {/* Inter-Center Mobility */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Movilidad Intercentros
          </span>
          <div className="text-xl font-bold text-indigo-800 mt-1">
            {stats.interCenterStats.crossCenterPercentage}%
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {stats.interCenterStats.totalCrossCenterEncounters} atenciones externas
          </p>
        </div>

        {/* Sex Ratio */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Razón Masculinidad
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {stats.bySex.sexRatio}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            hombres por 100 mujeres
          </p>
        </div>
      </div>

      {/* Main Grid: Demographics, Chronic and Transmissible Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Demographics (Age groups & Sex) */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Distribución por Grupos Etarios y Sexo
            </h3>
            <span className="text-[11px] text-slate-500">
              Total {stats.uniquePatientsServed} pacientes
            </span>
          </div>

          <div className="p-4 space-y-4">
            {/* Sex bar breakdown */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-700">
                <span>Mujeres: {stats.bySex.femaleCount} ({stats.bySex.femalePercent}%)</span>
                <span>Hombres: {stats.bySex.maleCount} ({stats.bySex.malePercent}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-teal-600 h-full transition-all duration-300"
                  style={{ width: `${stats.bySex.femalePercent}%` }}
                />
                <div
                  className="bg-slate-700 h-full transition-all duration-300"
                  style={{ width: `${stats.bySex.malePercent}%` }}
                />
              </div>
            </div>

            {/* Age groups table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead>
                  <tr className="text-slate-500 font-semibold text-[11px] uppercase">
                    <th className="py-2 text-left">Grupo Etario</th>
                    <th className="py-2 text-right">Pacientes</th>
                    <th className="py-2 text-right">% Relativo</th>
                    <th className="py-2 text-right">Barra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {stats.byAgeGroup.map((ag) => (
                    <tr key={ag.group}>
                      <td className="py-2 font-medium">{ag.label}</td>
                      <td className="py-2 text-right font-semibold">{ag.count}</td>
                      <td className="py-2 text-right text-slate-500">{ag.percentage}%</td>
                      <td className="py-2 pl-4 text-right">
                        <div className="w-24 ml-auto h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="bg-teal-600 h-full"
                            style={{ width: `${Math.min(100, ag.percentage * 2)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Table 2: Top Diagnoses CIE-10 */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Primeras Causas de Morbilidad (CIE-10)
            </h3>
            <span className="text-[11px] text-slate-500">Ranking en el período</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
              <thead className="bg-slate-50/70 text-slate-600 font-semibold text-[11px] uppercase">
                <tr>
                  <th className="px-4 py-2.5">#</th>
                  <th className="px-4 py-2.5">CIE-10</th>
                  <th className="px-4 py-2.5">Diagnóstico Clínico</th>
                  <th className="px-4 py-2.5 text-right">Frecuencia</th>
                  <th className="px-4 py-2.5 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {stats.topDiagnoses.length > 0 ? (
                  stats.topDiagnoses.map((d, idx) => (
                    <tr key={d.icd10}>
                      <td className="px-4 py-2 text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2 font-mono font-semibold text-teal-800">
                        {d.icd10}
                      </td>
                      <td className="px-4 py-2 text-slate-800 font-medium max-w-xs truncate">
                        {d.description}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-slate-900">
                        {d.count}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-500">{d.percentage}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-xs">
                      No hay consultas registradas para este filtro temporal.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grid: Chronic Diseases & Transmissible Surveillance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 3: Chronic Diseases Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Vigilancia de Enfermedades Crónicas No Transmisibles
            </h3>
            <span className="text-[11px] text-teal-800 font-medium">
              {stats.chronicStats.totalChronicPatients} personas con ECNT
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
              <thead className="bg-slate-50/70 text-slate-600 font-semibold text-[11px] uppercase">
                <tr>
                  <th className="px-4 py-2.5">Patología</th>
                  <th className="px-4 py-2.5">CIE-10</th>
                  <th className="px-4 py-2.5 text-right">Casos</th>
                  <th className="px-4 py-2.5 text-right">Controlados</th>
                  <th className="px-4 py-2.5 text-right">Adherencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {stats.chronicStats.breakdown.length > 0 ? (
                  stats.chronicStats.breakdown.map((c) => {
                    const adhPercent = c.cases > 0 ? Math.round((c.controlledCount / c.cases) * 100) : 0;
                    return (
                      <tr key={c.name}>
                        <td className="px-4 py-2 font-medium text-slate-800">{c.name}</td>
                        <td className="px-4 py-2 font-mono text-slate-500">{c.icd10}</td>
                        <td className="px-4 py-2 text-right font-semibold text-slate-900">{c.cases}</td>
                        <td className="px-4 py-2 text-right text-emerald-800 font-medium">
                          {c.controlledCount}
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          <span
                            className={
                              adhPercent >= 70
                                ? 'text-emerald-700'
                                : adhPercent >= 50
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }
                          >
                            {adhPercent}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                      Sin registros crónicos en este período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 4: Transmissible Diseases Surveillance */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Vigilancia Epidemiológica de Transmisibles (Brotes)
            </h3>
            <span className="text-[11px] text-amber-800 font-medium">
              {stats.transmissibleStats.totalCases} notificaciones
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
              <thead className="bg-slate-50/70 text-slate-600 font-semibold text-[11px] uppercase">
                <tr>
                  <th className="px-4 py-2.5">Patología</th>
                  <th className="px-4 py-2.5">CIE-10</th>
                  <th className="px-4 py-2.5 text-right">Casos</th>
                  <th className="px-4 py-2.5 text-right">Confirmados</th>
                  <th className="px-4 py-2.5 text-right">Semana Ep.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {stats.transmissibleStats.breakdown.length > 0 ? (
                  stats.transmissibleStats.breakdown.map((t) => (
                    <tr key={t.name}>
                      <td className="px-4 py-2 font-medium text-amber-900">{t.name}</td>
                      <td className="px-4 py-2 font-mono text-slate-500">{t.icd10}</td>
                      <td className="px-4 py-2 text-right font-semibold text-slate-900">{t.cases}</td>
                      <td className="px-4 py-2 text-right text-emerald-800 font-semibold">
                        {t.confirmed}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-slate-600">
                        SE-{t.epidemiologicalWeek}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                      Sin alertas transmisibles activas en este período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inter-Center Mobility Matrix (Trazabilidad entre Centros) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Trazabilidad y Derivaciones Intercentros (Red de Salud)
            </h3>
            <p className="text-[11px] text-slate-500">
              Pacientes que requirieron atención en un centro de salud distinto a su centro adscrito
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
            {stats.interCenterStats.totalCrossCenterEncounters} atenciones externas
          </span>
        </div>

        <div className="p-5">
          {stats.interCenterStats.originCenterBreakdown.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {stats.interCenterStats.originCenterBreakdown.map((origin) => (
                <div
                  key={origin.centerName}
                  className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Centro de Origen:</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {origin.centerName}
                  </div>
                  <div className="text-xs text-indigo-700 font-semibold pt-1">
                    {origin.patientCount} paciente(s) atendido(s) fuera
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              Todos los pacientes se atendieron en su centro asignado durante este período.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
