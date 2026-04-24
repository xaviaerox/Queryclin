import { useState, useEffect, useMemo } from 'react';
import { SearchResult } from '../lib/searchEngine';
import { ArrowLeft, ChevronLeft, ChevronRight, User, AlertTriangle, Activity, FileSpreadsheet } from 'lucide-react';
import HighlightedText from './HighlightedText';
import { db } from '../lib/db';
import { Patient, Toma, getGender } from '../lib/dataStore';
import { SECTION_ORDER, SECTION_LABELS, classifyFields } from '../lib/fieldDictionary';

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

// ─── Separador Temporal de Toma ────────────────────────────────────────────────
function TomaDivider({ idToma, fecha, hora, usuario, index }: { idToma: string; fecha: string; hora: string; usuario: string; index: number }) {
  return (
    <div id={`toma-${idToma}`} className="flex items-center gap-4 scroll-mt-8">
      <div className={`flex items-center gap-4 ${index === 0 ? 'mt-4' : 'mt-16'} mb-8 w-full`}>
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${index === 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[14px] font-black text-[var(--text-primary)] uppercase tracking-tight">
              {index === 0 ? 'Última Intervención / Toma' : `Sesión Clínica - ${fecha}`}
            </span>
            {index === 0 && (
              <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                Actual
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] font-bold">
            <span>{fecha} a las {hora}</span>
            <span className="opacity-40">·</span>
            <span>{usuario}</span>
            <span className="opacity-40">·</span>
            <span className="font-mono opacity-60">#{idToma.slice(0, 8)}</span>
          </div>
        </div>
        <div className="flex-1 h-[1px] bg-[var(--border-clinical)]" />
      </div>
    </div>
  );
}

// ─── Navegador Lateral (Timeline) ─────────────────────────────────────────────
function TomaNav({ sortedTomas, onScrollTo }: { sortedTomas: Toma[]; onScrollTo: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-4 sticky top-[240px] max-h-[60vh] overflow-y-auto pr-6 hide-scrollbar">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2 px-3 opacity-50">
        Navegación Cronológica
      </h3>
      <div className="flex flex-col border-l-2 border-[var(--border-clinical)] ml-3">
        {sortedTomas.map((t, idx) => (
          <button
            key={t.idToma}
            onClick={() => onScrollTo(`toma-${t.idToma}`)}
            className="group flex flex-col items-start gap-1 py-4 px-5 -ml-[2px] border-l-2 border-transparent hover:border-[var(--accent-clinical)] hover:bg-[var(--accent-clinical)]/5 transition-all text-left"
          >
            <span className={`text-[13px] font-black ${idx === 0 ? 'text-[var(--accent-clinical)]' : 'text-[var(--text-primary)]'} group-hover:text-[var(--accent-clinical)]`}>
              {t.latest?.data['FECHA_TOMA'] || 'Sin fecha'}
            </span>
            <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-70">
              {t.latest?.data['HORA_TOMA'] || '--:--'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Componente Principal HCEView ──────────────────────────────────────────────
export default function HCEView({ results, currentIndex, query, onBack, onNavigate }: HCEViewProps) {
  const currentResult = results[currentIndex];
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentResult) return;
    let active = true;
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
        const dateStr = t.latest.data['FECHA_TOMA'] || '';
        const timeStr = t.latest.data['HORA_TOMA'] || '00:00';
        let d = dateStr;
        if (d.includes('/')) {
          const p = d.split('/');
          if (p.length === 3) d = `${p[2]}-${p[1]}-${p[0]}`;
        }
        return new Date(`${d}T${timeStr}`).getTime() || 0;
      };
      return getTime(b as unknown as Toma) - getTime(a as unknown as Toma);
    });
  }, [patient]);

  const hasNext = currentIndex < results.length - 1;
  const hasPrev = currentIndex > 0;

  const handleExportPatient = () => {
    if (!patient) return;
    const allKeys = new Set<string>();
    (Object.values(patient.tomas) as Toma[]).forEach(t => t.registros.forEach(r => Object.keys(r.data).forEach(k => allKeys.add(k))));
    const keys = Array.from(allKeys);
    let csv = '\uFEFF' + keys.map(k => `"${k}"`).join(';') + '\n';
    (Object.values(patient.tomas) as Toma[]).forEach(t => t.registros.forEach(r => {
      csv += keys.map(k => `"${String(r.data[k] || '').replace(/"/g, '""')}"`).join(';') + '\n';
    }));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `HCE_${patient.nhc}.csv`;
    link.click();
  };

  const scrollToToma = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

  return (
    <div className="flex flex-col w-full pb-40">
      
      {/* Navegación Superior */}
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
            <button disabled={!hasPrev} onClick={() => onNavigate(currentIndex - 1)} className="p-1.5 hover:bg-[var(--bg-clinical)] rounded-lg disabled:opacity-20 transition-all">
              <ChevronLeft size={20} />
            </button>
            <button disabled={!hasNext} onClick={() => onNavigate(currentIndex + 1)} className="p-1.5 hover:bg-[var(--bg-clinical)] rounded-lg disabled:opacity-20 transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Cabecera Demográfica Fija */}
      <div className="bg-[var(--surface-clinical)] border border-[var(--border-clinical)] rounded-3xl p-8 mb-12 shadow-xl ring-1 ring-[var(--accent-clinical)]/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-8">
            <PatientAvatar gender={getGender(demo)} />
            <div className="flex flex-col">
              <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight uppercase leading-none mb-2">
                {demo.NOMBRE || `Paciente ${patient.nhc}`}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1 rounded-full">
                  Historia Activa
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
          <button onClick={handleExportPatient} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all shadow-lg active:scale-95">
            <FileSpreadsheet size={18} />
            Descargar HCE
          </button>
        </div>
      </div>

      {/* Cuerpo Principal: Sidebar + Contenido + Espaciador Simétrico */}
      <div className="flex gap-12 items-start justify-center">
        
        {/* Navegador Izquierdo */}
        <aside className="w-56 shrink-0 hidden lg:block">
          <TomaNav sortedTomas={sortedTomas} onScrollTo={scrollToToma} />
        </aside>

        {/* Contenido Central */}
        <div className="flex-1 min-w-0 max-w-4xl">
          {sortedTomas.map((toma, idx) => {
            const sections = classifyFields(toma.registros);
            return (
              <div key={toma.idToma} className="mb-24 last:mb-0">
                <TomaDivider 
                   idToma={toma.idToma} 
                   fecha={toma.latest?.data['FECHA_TOMA'] || '--'} 
                   hora={toma.latest?.data['HORA_TOMA'] || '--'} 
                   usuario={toma.latest?.data['USUARIO_TOMA'] || 'Sistema'}
                   index={idx} 
                />

                {/* Información Crítica Especial (Alergias/Motivo) */}
                {sections['Alergias y Motivo'] && sections['Alergias y Motivo'].length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-900/30 rounded-3xl p-8 mb-10 shadow-sm">
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

                {/* Resto de Categorías */}
                {SECTION_ORDER.filter(s => s !== 'Alergias y Motivo').map(section => {
                  const fields = sections[section];
                  if (!fields || fields.length === 0) return null;
                  return (
                    <div key={`${toma.idToma}-${section}`} className="bg-[var(--surface-clinical)] border-2 border-[var(--border-clinical)] rounded-3xl p-8 mb-8 shadow-md">
                      <SectionHeader label={SECTION_LABELS[section]} />
                      <div className="flex flex-col gap-6">
                        {fields.map(f => (
                          <ClinicalField key={f.key} label={f.key} value={f.value} query={query} highlight={queryTokens.some(t => f.value.toLowerCase().includes(t))} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Espaciador Derecho (Simetría) */}
        <aside className="w-56 shrink-0 hidden lg:block"></aside>
      </div>
    </div>
  );
}
