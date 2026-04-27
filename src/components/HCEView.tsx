import { useState, useEffect, useMemo } from 'react';
import { SearchResult } from '../lib/searchEngine';
import { ArrowLeft, ChevronLeft, ChevronRight, User, AlertTriangle, Calendar, Clock, Hash } from 'lucide-react';
import HighlightedText from './HighlightedText';
import { db } from '../storage/indexedDB';
import { Patient, Toma, getGender } from '../core/types';
import { SECTION_ORDER, SECTION_LABELS, classifyFields } from '../core/clinicalTaxonomy';

interface HCEViewProps {
  results: SearchResult[];
  currentIndex: number;
  query: string;
  onBack: () => void;
  onNavigate: (index: number) => void;
}

// ─── Avatar de Paciente ───────────────────────────────────────────────────────
function PatientAvatar({ gender, size = 28 }: { gender: 'male' | 'female' | 'neutral', size?: number }) {
  const cfg = {
    male:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-500',    border: 'border-cyan-500/20' },
    female:  { bg: 'bg-purple-400/10',  text: 'text-purple-400',  border: 'border-purple-400/20' },
    neutral: { bg: 'bg-[var(--accent-clinical)]/10', text: 'text-[var(--accent-clinical)]', border: 'border-[var(--accent-clinical)]/20' },
  }[gender];
  return (
    <div className={`w-14 h-14 ${cfg.bg} ${cfg.text} ${cfg.border} border-2 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
      <User size={size} />
    </div>
  );
}

// ─── Chip de Dato Demográfico ──────────────────────────────────────────────────
function DemoChip({ label, value }: { key?: any; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 bg-[var(--bg-clinical)] border border-[var(--border-clinical)] px-3 py-1.5 rounded-lg text-[12px]">
      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-70">{label}</span>
      <span className="font-bold text-[var(--text-primary)]">{value}</span>
    </span>
  );
}

// ─── Campo Clínico Individual ──────────────────────────────────────────────────
function ClinicalField({ label, value, query, highlight }: { key?: any; label: string; value: string; query: string; highlight?: boolean }) {
  const isLong = value.length > 80;
  const isBoolean = ['SI','NO','SÍ','TRUE','FALSE','POSITIVO','NEGATIVO'].includes(value.trim().toUpperCase());

  return (
    <div className={`flex flex-col gap-1.5 border-b border-[var(--border-clinical)]/60 last:border-0 pb-4 last:pb-0 ${highlight ? 'bg-[var(--accent-clinical)]/5 rounded-xl p-3 -mx-3 ring-1 ring-[var(--accent-clinical)]/20' : ''}`}>
      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--accent-clinical)] leading-none mb-1">
        {label.replace(/_/g, ' ')}
      </span>
      {isBoolean ? (
        <span className={`inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-lg text-[12px] font-black uppercase tracking-wide ${
          ['SI','SÍ','TRUE','POSITIVO'].includes(value.trim().toUpperCase())
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'bg-red-600 text-white shadow-sm'
        }`}>
          {value}
        </span>
      ) : isLong ? (
        <p className="text-[15px] text-slate-900 dark:text-slate-100 leading-[1.75] whitespace-pre-wrap font-bold">
          <HighlightedText text={value} query={query} />
        </p>
      ) : (
        <span className="text-[16px] text-slate-900 dark:text-slate-100 font-black leading-snug">
          <HighlightedText text={value} query={query} />
        </span>
      )}
    </div>
  );
}

// ─── Cabecera de Sección Clínica ───────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-6 px-1">
      <span className="text-[12px] font-black uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 px-4 py-1.5 rounded-lg border border-emerald-500/20">
        {label}
      </span>
      <div className="h-[2px] flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
    </div>
  );
}

// ─── Helpers de Fecha/Hora ─────────────────────────────────────────────────────
function extractFecha(data: Record<string, string>): string {
  const raw = data['EC_Fecha_Toma'] || data['FECHA_TOMA'] || '';
  if (!raw) return '--';
  // Tomar solo la parte de fecha (antes del espacio si hay hora incluida)
  return raw.includes(' ') ? raw.split(' ')[0] : raw;
}

function extractHora(data: Record<string, string>): string {
  const raw = data['EC_Fecha_Toma'] || '';
  // Si la fecha incluye la hora tras un espacio, extraerla
  if (raw.includes(' ')) return raw.split(' ')[1]?.slice(0, 5) || '--:--';
  return data['HORA_TOMA'] || data['EC_Hora_Toma'] || '--:--';
}

// ─── Timeline Lateral de Tomas ─────────────────────────────────────────────────
function TomaTimeline({
  sortedTomas,
  activeIndex,
  onSelect,
}: {
  sortedTomas: Toma[];
  activeIndex: number;
  onSelect: (idx: number) => void;
}) {
  return (
    <div className="flex flex-col gap-0 sticky top-[240px] max-h-[65vh] overflow-y-auto hide-scrollbar">
      <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] mb-3 px-2 opacity-50">
        Historial de Tomas ({sortedTomas.length})
      </h3>
      <div className="flex flex-col border-l-2 border-[var(--border-clinical)] ml-2">
        {sortedTomas.map((t, idx) => {
          const isActive = idx === activeIndex;
          const isLatest = idx === 0;
          const fecha = extractFecha(t.latest?.data || {});
          const hora = extractHora(t.latest?.data || {});
          const orden = t.latest?.ordenToma ?? (t.registros?.[0]?.ordenToma ?? idx + 1);
          const usuario = t.latest?.data['Usuario'] || t.latest?.data['USUARIO_TOMA'] || '';

          return (
            <button
              key={t.idToma}
              onClick={() => onSelect(idx)}
              className={`group flex flex-col items-start gap-1.5 py-4 px-4 -ml-[2px] border-l-2 transition-all text-left rounded-r-xl
                ${isActive
                  ? 'border-[var(--accent-clinical)] bg-[var(--accent-clinical)]/8'
                  : 'border-transparent hover:border-[var(--accent-clinical)]/50 hover:bg-[var(--accent-clinical)]/4'
                }`}
            >
              {/* Orden Toma + Badge */}
              <div className="flex items-center gap-2 w-full">
                <span className={`text-[11px] font-black flex items-center gap-1 ${isActive ? 'text-[var(--accent-clinical)]' : 'text-[var(--text-secondary)]'}`}>
                  <Hash size={9} />
                  Toma {orden}
                </span>
                {isLatest && (
                  <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                    Última
                  </span>
                )}
              </div>

              {/* Fecha */}
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-primary)]">
                <Calendar size={10} className={isActive ? 'text-[var(--accent-clinical)]' : 'text-[var(--text-secondary)] opacity-60'} />
                <span>{fecha}</span>
              </div>

              {/* Hora */}
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-secondary)] opacity-70">
                <Clock size={9} />
                <span>{hora}</span>
              </div>

              {/* Usuario si existe */}
              {usuario && (
                <span className="text-[9px] text-[var(--text-secondary)] opacity-50 truncate max-w-[140px]">{usuario}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Componente Principal HCEView ──────────────────────────────────────────────
export default function HCEView({ results, currentIndex, query, onBack, onNavigate }: HCEViewProps) {
  const currentResult = results[currentIndex];
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  // Índice de la toma activa (0 = más reciente)
  const [activeTomaIndex, setActiveTomaIndex] = useState(0);

  useEffect(() => {
    if (!currentResult) return;
    let active = true;
    setActiveTomaIndex(0); // Reset al cambiar de paciente
    const fetchPatient = async () => {
      setLoading(true);
      try {
        const p = await db.getFromStore(db.stores.patients, currentResult.nhc);
        if (active && p) {
          setPatient(p);
          setLoading(false);
          window.scrollTo({ top: 0, behavior: 'instant' });
        } else if (active) {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching patient:", err);
        if (active) setLoading(false);
      }
    };
    fetchPatient();
    return () => { active = false; };
  }, [currentResult?.nhc]);

  const sortedTomas = useMemo(() => {
    if (!patient || !patient.tomas) return [];
    return Object.values(patient.tomas).sort((a, b) => {
      const getTime = (t: Toma) => {
        if (!t || !t.latest || !t.latest.data) return 0;
        let d = t.latest.data['EC_Fecha_Toma'] || t.latest.data['FECHA_TOMA'] || '';
        if (d.includes(' ')) d = d.split(' ')[0];
        if (d.includes('/')) {
          const p = d.split('/');
          if (p.length === 3) d = `${p[2]}-${p[1]}-${p[0]}`;
        }
        const timeStr = t.latest.data['HORA_TOMA'] || t.latest.data['EC_Hora_Toma'] || '00:00';
        return new Date(`${d}T${timeStr}`).getTime() || 0;
      };
      return getTime(b as unknown as Toma) - getTime(a as unknown as Toma);
    });
  }, [patient]);

  // Toma que se está mostrando actualmente
  const activeToma = sortedTomas[activeTomaIndex];

  const hasNext = currentIndex < results.length - 1;
  const hasPrev = currentIndex > 0;
  const hasPrevToma = activeTomaIndex > 0;
  const hasNextToma = activeTomaIndex < sortedTomas.length - 1;

  if (!currentResult) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 text-center">
        <h2 className="text-xl font-black text-[var(--accent-clinical)] uppercase tracking-widest">Error de Referencia</h2>
        <p className="text-sm text-[var(--text-secondary)] font-bold">No se ha podido localizar el expediente seleccionado.</p>
        <button onClick={onBack} className="mt-4 px-8 py-3 bg-[var(--accent-clinical)] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
          Volver a Resultados
        </button>
      </div>
    );
  }

  if (loading || !patient) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-12 h-12 border-4 border-[var(--accent-clinical)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--text-secondary)] font-bold animate-pulse">Recuperando Historia Clínica...</p>
      </div>
    );
  }

  const demo = patient.demographics || {};
  const queryTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const sections = activeToma ? classifyFields(activeToma.registros) : {};

  const fechaActiva = activeToma ? extractFecha(activeToma.latest?.data || {}) : '--';
  const horaActiva = activeToma ? extractHora(activeToma.latest?.data || {}) : '--';
  const ordenActivo = activeToma?.latest?.ordenToma ?? (activeToma?.registros?.[0]?.ordenToma ?? 1);

  return (
    <div className="flex flex-col w-full pb-40">

      {/* ── Navegación Superior ───────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold transition-colors">
          <ArrowLeft size={20} />
          <span>Volver al Listado</span>
        </button>
        <div className="flex items-center gap-4 bg-[var(--surface-clinical)] border border-[var(--border-clinical)] px-4 py-2 rounded-2xl shadow-sm">
          <span className="text-[12px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
            Expediente {currentIndex + 1} de {results.length}
          </span>
          <div className="flex gap-1 border-l border-[var(--border-clinical)] pl-3">
            <button disabled={!hasPrev} onClick={() => { onNavigate(currentIndex - 1); }} className="p-1.5 hover:bg-[var(--bg-clinical)] rounded-lg disabled:opacity-20 transition-all">
              <ChevronLeft size={20} />
            </button>
            <button disabled={!hasNext} onClick={() => { onNavigate(currentIndex + 1); }} className="p-1.5 hover:bg-[var(--bg-clinical)] rounded-lg disabled:opacity-20 transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Cabecera Demográfica ──────────────────────────────────────── */}
      <div className="bg-[var(--surface-clinical)] border border-[var(--border-clinical)] rounded-3xl p-8 mb-8 shadow-xl ring-1 ring-[var(--accent-clinical)]/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-8">
            <PatientAvatar gender={getGender(demo)} />
            <div className="flex flex-col">
              <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight uppercase leading-none mb-2">
                {demo.PROCESO || demo.NOMBRE || `Paciente ${patient.nhc}`}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1 rounded-full">
                  Historia Activa · {sortedTomas.length} toma{sortedTomas.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 max-w-xl">
            <DemoChip label="NHC" value={patient.nhc} />
            {['EDAD', 'SEXO', 'CIUDAD', 'POSTAL'].map(k => {
              const key = Object.keys(demo).find(dk => dk.toUpperCase().includes(k));
              return key ? <DemoChip key={k} label={k === 'POSTAL' ? 'C.P.' : k} value={demo[key]} /> : null;
            })}
          </div>
        </div>
      </div>

      {/* ── Cuerpo Principal ─────────────────────────────────────────── */}
      <div className="flex gap-8 items-start justify-center">

        {/* Timeline Lateral Izquierdo */}
        <aside className="w-52 shrink-0 hidden lg:block">
          <TomaTimeline
            sortedTomas={sortedTomas}
            activeIndex={activeTomaIndex}
            onSelect={(idx) => { setActiveTomaIndex(idx); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        </aside>

        {/* Contenido de la Toma Activa */}
        <div className="flex-1 min-w-0 max-w-4xl">

          {/* ── Cabecera de la Toma Activa ─────────────────────────── */}
          {activeToma ? (
            <>
              <div className="flex items-center justify-between mb-6 bg-[var(--surface-clinical)] border border-[var(--accent-clinical)]/20 rounded-2xl px-6 py-4 shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 mb-1">Toma</span>
                    <span className="text-[18px] font-black text-[var(--accent-clinical)] flex items-center gap-1.5">
                      <Hash size={14} />
                      {ordenActivo}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-[var(--border-clinical)]" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 mb-1">Fecha</span>
                    <span className="text-[14px] font-black text-[var(--text-primary)] flex items-center gap-1.5">
                      <Calendar size={12} className="text-[var(--accent-clinical)]" />
                      {fechaActiva}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-[var(--border-clinical)]" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 mb-1">Hora</span>
                    <span className="text-[14px] font-black text-[var(--text-primary)] flex items-center gap-1.5">
                      <Clock size={12} className="text-[var(--accent-clinical)]" />
                      {horaActiva}
                    </span>
                  </div>
                  {activeTomaIndex === 0 && (
                    <>
                      <div className="w-px h-8 bg-[var(--border-clinical)]" />
                      <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-600 text-white px-2.5 py-1 rounded-full">
                        Más Reciente
                      </span>
                    </>
                  )}
                </div>

                {/* Flechas de navegación de toma */}
                <div className="flex items-center gap-2">
                  <button
                    disabled={!hasPrevToma}
                    onClick={() => { setActiveTomaIndex(i => i - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-black text-[var(--text-secondary)] hover:text-[var(--accent-clinical)] hover:bg-[var(--accent-clinical)]/8 rounded-lg disabled:opacity-20 transition-all border border-transparent hover:border-[var(--accent-clinical)]/20"
                  >
                    <ChevronLeft size={14} />
                    Anterior
                  </button>
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50">
                    {activeTomaIndex + 1} / {sortedTomas.length}
                  </span>
                  <button
                    disabled={!hasNextToma}
                    onClick={() => { setActiveTomaIndex(i => i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-black text-[var(--text-secondary)] hover:text-[var(--accent-clinical)] hover:bg-[var(--accent-clinical)]/8 rounded-lg disabled:opacity-20 transition-all border border-transparent hover:border-[var(--accent-clinical)]/20"
                  >
                    Siguiente
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* ── Información Crítica (Alergias/Motivo) ─────────── */}
              {sections['Alergias y Motivo'] && sections['Alergias y Motivo'].length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-900/30 rounded-3xl p-8 mb-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 text-amber-700">
                    <AlertTriangle size={20} />
                    <span className="text-[12px] font-black uppercase tracking-widest">Información Crítica</span>
                  </div>
                  <div className="flex flex-col gap-6">
                    {sections['Alergias y Motivo'].map(f => (
                      <ClinicalField key={f.key} label={f.key} value={f.value} query={query} highlight={queryTokens.some(t => f.value.toLowerCase().includes(t))} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Resto de Secciones ────────────────────────────── */}
              {SECTION_ORDER.filter(s => s !== 'Alergias y Motivo').map(section => {
                const fields = sections[section as keyof typeof sections];
                if (!fields || fields.length === 0) return null;
                return (
                  <div key={section} className="bg-[var(--surface-clinical)] border-2 border-[var(--border-clinical)] rounded-3xl p-8 mb-8 shadow-md">
                    <SectionHeader label={SECTION_LABELS[section as keyof typeof SECTION_LABELS]} />
                    <div className="flex flex-col gap-6">
                      {fields.map((f: { key: string; value: string }) => (
                        <ClinicalField key={f.key} label={f.key} value={f.value} query={query} highlight={queryTokens.some(t => f.value.toLowerCase().includes(t))} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="text-center py-20 text-[var(--text-secondary)] font-bold">
              No hay tomas disponibles para este paciente.
            </div>
          )}
        </div>

        {/* Espaciador Derecho */}
        <aside className="w-52 shrink-0 hidden lg:block" />
      </div>
    </div>
  );
}
