import React, { useState, useMemo } from 'react';
import { Patient, HealthCenter, AgeGroup, Sex } from '../types/medical';
import { getAgeGroup, getAgeGroupLabel } from '../services/statisticsCalculator';
import {
  Search,
  Filter,
  UserCheck,
  Building,
  ShieldAlert,
  Heart,
  Activity,
  Plus,
  Stethoscope,
  Eye,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface PatientListViewProps {
  patients: Patient[];
  centers: HealthCenter[];
  onSelectPatient: (patient: Patient) => void;
  onOpenNewEncounter: (patient: Patient) => void;
  onOpenNewPatient: () => void;
}

type MainCategoryFilter =
  | 'ALL'
  | 'CHRONIC'
  | 'AGE_GROUPS'
  | 'BY_SEX'
  | 'TRANSMISSIBLE'
  | 'OTHER_CONDITIONS'
  | 'CROSS_CENTER';

export const PatientListView: React.FC<PatientListViewProps> = ({
  patients,
  centers,
  onSelectPatient,
  onOpenNewEncounter,
  onOpenNewPatient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MainCategoryFilter>('ALL');
  const [selectedChronicSubfilter, setSelectedChronicSubfilter] = useState<string>('ALL');
  const [selectedAgeSubfilter, setSelectedAgeSubfilter] = useState<AgeGroup | 'ALL'>('ALL');
  const [selectedSexSubfilter, setSelectedSexSubfilter] = useState<Sex | 'ALL'>('ALL');
  const [selectedCenterFilter, setSelectedCenterFilter] = useState<string>('ALL');

  // Filtered patients calculation
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // 1. Search term match (name, dni, record number, icd10, disease)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesBasic =
          patient.firstName.toLowerCase().includes(query) ||
          patient.lastName.toLowerCase().includes(query) ||
          patient.nationalId.includes(query) ||
          patient.medicalRecordNumber.toLowerCase().includes(query) ||
          patient.primaryHealthCenterName.toLowerCase().includes(query);

        const matchesChronic = patient.chronicDiseases.some(
          (c) => c.name.toLowerCase().includes(query) || c.icd10.toLowerCase().includes(query)
        );
        const matchesTransmissible = patient.transmissibleDiseases.some(
          (t) => t.name.toLowerCase().includes(query) || t.icd10.toLowerCase().includes(query)
        );
        const matchesAllergies = patient.antecedents.allergies.some((a) =>
          a.toLowerCase().includes(query)
        );

        if (!matchesBasic && !matchesChronic && !matchesTransmissible && !matchesAllergies) {
          return false;
        }
      }

      // 2. Health Center filter
      if (selectedCenterFilter !== 'ALL' && patient.primaryHealthCenterId !== selectedCenterFilter) {
        return false;
      }

      // 3. Category filters
      switch (categoryFilter) {
        case 'CHRONIC':
          if (patient.chronicDiseases.length === 0) return false;
          if (selectedChronicSubfilter !== 'ALL') {
            return patient.chronicDiseases.some((cd) =>
              cd.name.toLowerCase().includes(selectedChronicSubfilter.toLowerCase())
            );
          }
          return true;

        case 'AGE_GROUPS':
          if (selectedAgeSubfilter !== 'ALL') {
            return getAgeGroup(patient.age) === selectedAgeSubfilter;
          }
          return true;

        case 'BY_SEX':
          if (selectedSexSubfilter !== 'ALL') {
            return patient.sex === selectedSexSubfilter;
          }
          return true;

        case 'TRANSMISSIBLE':
          return patient.transmissibleDiseases.length > 0;

        case 'OTHER_CONDITIONS':
          return patient.otherConditions.length > 0;

        case 'CROSS_CENTER':
          // Patient has had at least one visit to a center different from their base center
          return patient.encounters.some(
            (e) => e.healthCenterId !== patient.primaryHealthCenterId
          );

        default:
          return true;
      }
    });
  }, [
    patients,
    searchTerm,
    categoryFilter,
    selectedChronicSubfilter,
    selectedAgeSubfilter,
    selectedSexSubfilter,
    selectedCenterFilter,
  ]);

  // Aggregate counts for category tabs
  const categoryCounts = useMemo(() => {
    return {
      all: patients.length,
      chronic: patients.filter((p) => p.chronicDiseases.length > 0).length,
      transmissible: patients.filter((p) => p.transmissibleDiseases.length > 0).length,
      other: patients.filter((p) => p.otherConditions.length > 0).length,
      crossCenter: patients.filter((p) =>
        p.encounters.some((e) => e.healthCenterId !== p.primaryHealthCenterId)
      ).length,
    };
  }, [patients]);

  return (
    <div className="space-y-5">
      {/* Search Bar & Primary Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por DNI, N° Historia, Nombre, CIE-10, Medicación o Alergia..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCenterFilter}
            onChange={(e) => setSelectedCenterFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="ALL">Todos los Centros Base</option>
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenNewPatient}
            className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Historia</span>
          </button>
        </div>
      </div>

      {/* Main Categories Segmented Navigation (Anti-slop clean design) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => {
              setCategoryFilter('ALL');
              setSelectedChronicSubfilter('ALL');
              setSelectedAgeSubfilter('ALL');
              setSelectedSexSubfilter('ALL');
            }}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              categoryFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todas las Historias ({categoryCounts.all})
          </button>

          <button
            onClick={() => setCategoryFilter('CHRONIC')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              categoryFilter === 'CHRONIC'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Enfermedades Crónicas ({categoryCounts.chronic})
          </button>

          <button
            onClick={() => setCategoryFilter('TRANSMISSIBLE')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              categoryFilter === 'TRANSMISSIBLE'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Vigilancia Transmisibles ({categoryCounts.transmissible})
          </button>

          <button
            onClick={() => setCategoryFilter('AGE_GROUPS')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              categoryFilter === 'AGE_GROUPS'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Grupos Etarios
          </button>

          <button
            onClick={() => setCategoryFilter('BY_SEX')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              categoryFilter === 'BY_SEX'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Por Sexo
          </button>

          <button
            onClick={() => setCategoryFilter('OTHER_CONDITIONS')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              categoryFilter === 'OTHER_CONDITIONS'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Condiciones Especiales ({categoryCounts.other})
          </button>

          <button
            onClick={() => setCategoryFilter('CROSS_CENTER')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              categoryFilter === 'CROSS_CENTER'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Atendidos en Otros Centros ({categoryCounts.crossCenter})
          </button>
        </div>

        {/* Subfilter Bar for Chronic */}
        {categoryFilter === 'CHRONIC' && (
          <div className="flex items-center gap-1.5 pl-1 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-medium">Patología:</span>
            {['ALL', 'Hipertensión', 'Diabetes', 'EPOC', 'Asma', 'Renal'].map((item) => (
              <button
                key={item}
                onClick={() => setSelectedChronicSubfilter(item)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedChronicSubfilter === item
                    ? 'bg-teal-700 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item === 'ALL' ? 'Todas las Crónicas' : item}
              </button>
            ))}
          </div>
        )}

        {/* Subfilter Bar for Age Groups */}
        {categoryFilter === 'AGE_GROUPS' && (
          <div className="flex items-center gap-1.5 pl-1 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-medium">Rango:</span>
            {(['ALL', 'Pediatrico', 'Adolescente', 'AdultoJoven', 'Adulto', 'AdultoMayor'] as const).map(
              (group) => (
                <button
                  key={group}
                  onClick={() => setSelectedAgeSubfilter(group)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    selectedAgeSubfilter === group
                      ? 'bg-teal-700 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {group === 'ALL' ? 'Todos los Rangos' : getAgeGroupLabel(group)}
                </button>
              )
            )}
          </div>
        )}

        {/* Subfilter Bar for Sex */}
        {categoryFilter === 'BY_SEX' && (
          <div className="flex items-center gap-1.5 pl-1 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-medium">Sexo:</span>
            {[
              { val: 'ALL', label: 'Todos' },
              { val: 'F', label: 'Femenino' },
              { val: 'M', label: 'Masculino' },
            ].map((s) => (
              <button
                key={s.val}
                onClick={() => setSelectedSexSubfilter(s.val as Sex | 'ALL')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedSexSubfilter === s.val
                    ? 'bg-teal-700 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Patients Database Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              Registros Encontrados: {filteredPatients.length}
            </span>
            <span className="text-slate-400">·</span>
            <span>Base sincronizada en tiempo real</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Haga clic en cualquier fila para ver el expediente completo y verificar medicamentos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">N° Historia / DNI</th>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">Edad / Sexo</th>
                <th className="px-4 py-3">Centro Base Adscrito</th>
                <th className="px-4 py-3">Diagnósticos Principales</th>
                <th className="px-4 py-3">Atenciones en Otros Centros</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => {
                  const otherCenters = patient.encounters.filter(
                    (e) => e.healthCenterId !== patient.primaryHealthCenterId
                  );
                  const distinctOtherCenters = Array.from(
                    new Set(otherCenters.map((e) => e.healthCenterName))
                  );
                  const hasAllergies = patient.antecedents.allergies.length > 0;

                  return (
                    <tr
                      key={patient.id}
                      onClick={() => onSelectPatient(patient)}
                      className="hover:bg-slate-50/90 cursor-pointer transition-colors"
                    >
                      {/* Medical Record & DNI */}
                      <td className="px-4 py-3">
                        <div className="font-mono font-semibold text-teal-800">
                          {patient.medicalRecordNumber}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          DNI {patient.nationalId}
                        </div>
                      </td>

                      {/* Name & Allergies Warning */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {patient.lastName}, {patient.firstName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{patient.address}</span>
                          {hasAllergies && (
                            <span
                              title={`Alergia: ${patient.antecedents.allergies.join(', ')}`}
                              className="text-red-700 font-medium flex items-center gap-0.5"
                            >
                              <ShieldAlert className="w-3 h-3 text-red-600 inline" />
                              Alergia
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Age & Sex */}
                      <td className="px-4 py-3">
                        <div className="text-slate-800 font-medium">
                          {patient.age} años ({patient.sex === 'F' ? 'Fem' : 'Masc'})
                        </div>
                        <div className="text-[10px] text-slate-400 font-light">
                          {getAgeGroupLabel(getAgeGroup(patient.age))}
                        </div>
                      </td>

                      {/* Health Center */}
                      <td className="px-4 py-3">
                        <div className="text-slate-800 font-medium max-w-xs truncate">
                          {patient.primaryHealthCenterName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {patient.district}
                        </div>
                      </td>

                      {/* Diagnostics (Chronic / Transmissible) */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 max-w-xs">
                          {patient.chronicDiseases.length > 0 && (
                            <div className="text-slate-800 text-[11px] font-medium truncate">
                              • {patient.chronicDiseases.map((c) => c.name).join(', ')}
                            </div>
                          )}
                          {patient.transmissibleDiseases.length > 0 && (
                            <div className="text-amber-800 text-[11px] font-semibold truncate">
                              • {patient.transmissibleDiseases.map((t) => `${t.name} (${t.status})`).join(', ')}
                            </div>
                          )}
                          {patient.otherConditions.length > 0 && (
                            <div className="text-teal-700 text-[11px] font-medium truncate">
                              • {patient.otherConditions.map((o) => o.type).join(', ')}
                            </div>
                          )}
                          {patient.chronicDiseases.length === 0 &&
                            patient.transmissibleDiseases.length === 0 &&
                            patient.otherConditions.length === 0 && (
                              <span className="text-slate-400 text-[11px] italic">
                                Control de rutina
                              </span>
                            )}
                        </div>
                      </td>

                      {/* Inter-Center Cross Attendances */}
                      <td className="px-4 py-3">
                        {otherCenters.length > 0 ? (
                          <div className="text-xs">
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                              <Building className="w-3 h-3 text-amber-700" />
                              {otherCenters.length} en otro(s) centro(s)
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-xs">
                              {distinctOtherCenters.join(' · ')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Solo en centro base
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectPatient(patient)}
                            title="Ver expediente clínico completo y verificar medicamentos"
                            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenNewEncounter(patient)}
                            title="Registrar nueva consulta médica"
                            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Stethoscope className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No se encontraron historias clínicas que coincidan con los criterios seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
