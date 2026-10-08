import React, { useState } from 'react';
import { HealthCenter, Patient } from '../types/medical';
import {
  Building2,
  MapPin,
  Phone,
  UserCheck,
  Activity,
  Plus,
  ShieldAlert,
  Stethoscope,
  BedDouble,
  Layers,
  CheckCircle2,
  X,
} from 'lucide-react';

interface CentersViewProps {
  centers: HealthCenter[];
  patients: Patient[];
  onSelectCenterForAsis: (centerId: string) => void;
  onAddCenter: (center: HealthCenter) => void;
}

export const CentersView: React.FC<CentersViewProps> = ({
  centers,
  patients,
  onSelectCenterForAsis,
  onAddCenter,
}) => {
  const [showNewCenterModal, setShowNewCenterModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [level, setLevel] = useState<HealthCenter['level']>('I-3 Centro de Salud con Especialidad');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Distrito Norte');
  const [director, setDirector] = useState('');
  const [phone, setPhone] = useState('');
  const [populationServed, setPopulationServed] = useState(35000);
  const [consultingRooms, setConsultingRooms] = useState(8);
  const [beds, setBeds] = useState(4);
  const [hasEmergency, setHasEmergency] = useState(true);
  const [hasLaboratory, setHasLaboratory] = useState(true);
  const [hasPharmacy, setHasPharmacy] = useState(true);
  const [risk, setRisk] = useState<HealthCenter['epidemiologicalRisk']>('Medio');

  const handleCreateCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;

    const newCenter: HealthCenter = {
      id: `cs-${Date.now()}`,
      name,
      code: code || `CS-GEN-${Math.floor(100 + Math.random() * 900)}`,
      level,
      address,
      district,
      zone: 'Microred Territorial',
      director: director || 'Director Médico Designado',
      phone: phone || '+51 1 000-0000',
      populationServed: Number(populationServed),
      consultingRooms: Number(consultingRooms),
      beds: Number(beds),
      hasEmergency,
      hasLaboratory,
      hasPharmacy,
      epidemiologicalRisk: risk,
    };

    onAddCenter(newCenter);
    setShowNewCenterModal(false);
    setName('');
    setAddress('');
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Red de Establecimientos de Salud Interconectados
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Directorio asistencial de la red integral, capacidades resolutivas y poblaciones adscritas
          </p>
        </div>

        <button
          onClick={() => setShowNewCenterModal(true)}
          className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Centro</span>
        </button>
      </div>

      {/* Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {centers.map((center) => {
          // Calculate patients assigned to this center
          const assignedPatients = patients.filter(
            (p) => p.primaryHealthCenterId === center.id
          );
          // Calculate total visits received at this center
          const totalVisitsReceived = patients.reduce(
            (acc, p) => acc + p.encounters.filter((e) => e.healthCenterId === center.id).length,
            0
          );

          return (
            <div
              key={center.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 block w-fit mb-1">
                      {center.code} · {center.level}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {center.name}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      center.epidemiologicalRisk === 'Muy Alto'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : center.epidemiologicalRisk === 'Alto'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : center.epidemiologicalRisk === 'Medio'
                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    Riesgo {center.epidemiologicalRisk}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{center.address} ({center.district})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{center.director}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{center.phone}</span>
                  </div>
                </div>

                {/* Infrastructure indicators */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">Población</span>
                    <strong className="text-slate-800">
                      {center.populationServed.toLocaleString()}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">Consultorios</span>
                    <strong className="text-slate-800">{center.consultingRooms}</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">Camas</span>
                    <strong className="text-slate-800">{center.beds}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                  <span className={center.hasEmergency ? 'text-emerald-700 font-medium' : 'line-through text-slate-400'}>
                    ✓ Urgencias
                  </span>
                  <span className={center.hasLaboratory ? 'text-emerald-700 font-medium' : 'line-through text-slate-400'}>
                    ✓ Laboratorio
                  </span>
                  <span className={center.hasPharmacy ? 'text-emerald-700 font-medium' : 'line-through text-slate-400'}>
                    ✓ Farmacia
                  </span>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {assignedPatients.length} pacientes adscritos
                </span>
                <button
                  onClick={() => onSelectCenterForAsis(center.id)}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors inline-flex items-center gap-1"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Ver ASIS ➔</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to register new health center */}
      {showNewCenterModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">
                  Registrar Nuevo Establecimiento de Salud
                </h3>
              </div>
              <button
                onClick={() => setShowNewCenterModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCenter} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nombre del Centro *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Centro de Salud I-3 Bella Unión"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Código del Centro</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ej. CS-BU-006"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nivel de Categorización</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as HealthCenter['level'])}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="I-1 Puesto de Salud">I-1 Puesto de Salud</option>
                  <option value="I-2 Centro de Salud">I-2 Centro de Salud</option>
                  <option value="I-3 Centro de Salud con Especialidad">I-3 Centro de Salud con Especialidad</option>
                  <option value="I-4 Centro Materno Infantil">I-4 Centro Materno Infantil</option>
                  <option value="II-1 Hospital Comunitario">II-1 Hospital Comunitario</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Dirección Exacta *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Av. o Jr. y N°"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Distrito / Sector</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Director / Responsable</label>
                  <input
                    type="text"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    placeholder="Dr. Nombre Apellido"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Población Asignada (Habitantes)</label>
                  <input
                    type="number"
                    value={populationServed}
                    onChange={(e) => setPopulationServed(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasEmergency}
                    onChange={(e) => setHasEmergency(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Tópico Urgencias</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasLaboratory}
                    onChange={(e) => setHasLaboratory(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Laboratorio</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPharmacy}
                    onChange={(e) => setHasPharmacy(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Farmacia</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewCenterModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Agregar a la Red
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
