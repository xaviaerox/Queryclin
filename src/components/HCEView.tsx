import { useState, useMemo, useEffect } from 'react';
import { HCEData } from '../lib/dataStore';
import { FieldCategory, classifyField } from '../lib/fieldDictionary';
import { SearchResult } from '../lib/searchEngine';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import HighlightedText from './HighlightedText';

interface HCEViewProps {
  results: SearchResult[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onBack: () => void;
  query: string;
  data: HCEData;
}

const TABS: FieldCategory[] = [
  'Demografía',
  'Antecedentes',
  'Anamnesis y Exploración',
  'Diagnóstico y Tratamiento',
  'Resultados',
  'Hospitalización',
  'OTROS'
];

export default function HCEView({ results, currentIndex, onIndexChange, onBack, query, data }: HCEViewProps) {
  const currentResult = results[currentIndex];
  const patient = currentResult.patient;
  
  const [selectedTomaId, setSelectedTomaId] = useState(currentResult.bestMatchUrl.idToma);
  const [selectedOrdenToma, setSelectedOrdenToma] = useState(currentResult.bestMatchUrl.ordenToma);
  const [activeTab, setActiveTab] = useState<FieldCategory>('Anamnesis y Exploración');

  useEffect(() => {
    setSelectedTomaId(currentResult.bestMatchUrl.idToma);
    setSelectedOrdenToma(currentResult.bestMatchUrl.ordenToma);

    // Auto-detectar la pestaña que contiene el primer match
    const currentToma = patient.tomas[currentResult.bestMatchUrl.idToma];
    const currentReg = currentToma?.registros.find(r => r.ordenToma === currentResult.bestMatchUrl.ordenToma);
    
    if (currentReg && query) {
      const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 1 && !['AND', 'OR', 'NOT'].includes(t.toUpperCase()));
      for (const [key, value] of Object.entries(currentReg.data)) {
        if (tokens.some(token => value.toLowerCase().includes(token))) {
          const category = classifyField(key);
          setActiveTab(category);
          break;
        }
      }
    }
  }, [currentResult.nhc, currentResult.bestMatchUrl.idToma, currentResult.bestMatchUrl.ordenToma, query, patient]);

  // Efecto para scroll automático al primer resaltado
  useEffect(() => {
    const timer = setTimeout(() => {
      const firstMatch = document.querySelector('.highlight-match');
      if (firstMatch) {
        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300); // Pequeño delay para asegurar que el DOM y la pestaña han cargado
    return () => clearTimeout(timer);
  }, [activeTab, selectedOrdenToma]);

  const toma = patient.tomas[selectedTomaId];
  const registro = toma?.registros.find(r => r.ordenToma === selectedOrdenToma) || toma?.latest;

  const categorizedFields = useMemo(() => {
    const result = {} as Record<FieldCategory, { key: string; value: string }[]>;
    TABS.forEach(tab => result[tab] = []);
    if (!registro) return result;

    for (const [key, value] of Object.entries(registro.data)) {
      if (!value || value.trim() === '') continue;
      const category = classifyField(key);
      result[category].push({ key, value });
    }
    return result;
  }, [registro]);

  if (!toma || !registro) return <div className="p-20 text-center bg-white/70 rounded-2xl border border-white/40">Error cargando información clínica.</div>;

  const hasNext = currentIndex < results.length - 1;
  const hasPrev = currentIndex > 0;

  return (
    <div className="flex flex-col h-full w-full gap-5">
      {/* Navigation Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/50 rounded-full transition-colors text-[#64748b]"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-[#1e293b] hidden sm:block">Expediente Clínico Electrónico</h2>
        </div>

        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#e2e8f0] shadow-sm">
          <div className="text-[13px] font-medium text-[#64748b] mr-2">
            Mostrando {currentIndex + 1} de {results.length} coincidencias
          </div>
          <div className="flex gap-1 border-l border-[#e2e8f0] pl-2">
            <button 
              disabled={!hasPrev}
              onClick={() => onIndexChange(currentIndex - 1)}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-[#1e293b]"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              disabled={!hasNext}
              onClick={() => onIndexChange(currentIndex + 1)}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-[#1e293b]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden flex-col lg:flex-row">
        {/* Tomas Sidebar */}
        <aside className="w-full lg:w-[280px] bg-white border border-[#e2e8f0] flex flex-col rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] overflow-hidden shrink-0">
          <div className="p-4 border-b border-[#f1f5f9] text-[12px] font-bold text-[#64748b] uppercase tracking-wider flex justify-between items-center bg-[#f8fafc]">
            <span>Tomas</span>
            <span className="bg-[#e2e8f0] text-[#475569] px-2 py-0.5 rounded text-[10px]">{Object.keys(patient.tomas).length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {Object.values(patient.tomas).map(t => (
              <div
                key={t.idToma}
                onClick={() => {
                  setSelectedTomaId(t.idToma);
                  setSelectedOrdenToma(t.latest.ordenToma);
                }}
                className={`p-3 px-4 border-b border-[#f1f5f9] cursor-pointer transition-colors ${
                  selectedTomaId === t.idToma 
                    ? 'bg-[#eff6ff] border-l-4 border-l-[#2563eb]' 
                    : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                }`}
              >
                <h4 className="text-[14px] font-semibold text-[#1e293b] mb-1">ID: {t.idToma}</h4>
                <p className="text-[12px] text-[#64748b]">{t.registros.length} Registros evolutivos</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col gap-5 overflow-y-auto lg:pr-2 hide-scrollbar">
          {/* Patient Profile Card (Original ZIP Style) */}
          <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-[24px] font-semibold text-[#1e293b] mb-2">Paciente {patient.nhc}</h1>
              <div className="flex gap-4 text-[13px] text-[#64748b] flex-wrap">
                <span className="bg-[#f1f5f9] px-2 py-1 rounded"><strong className="text-[#1e293b] font-semibold">N.H.C:</strong> {patient.nhc}</span>
                {categorizedFields['Demografía'].slice(0, 3).map(field => (
                  <span key={field.key} className="bg-[#f1f5f9] px-2 py-1 rounded"><strong className="text-[#1e293b] font-semibold">{field.key}:</strong> {field.value}</span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="bg-[#dcfce7] text-[#166534] px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide">HISTORIA ACTIVA</span>
            </div>
          </div>

          {/* Timeline Selector (Original ZIP Style) */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-3 flex items-center gap-3 flex-wrap">
            <div className="text-[13px] font-semibold text-[#1e293b]">ID Toma: <span className="font-normal text-[#64748b]">{selectedTomaId}</span></div>
            <div className="w-[1px] h-4 bg-[#cbd5e1] hidden sm:block"></div>
            <div className="text-[13px] font-semibold text-[#1e293b]">Registros (Orden_Toma):</div>
            <div className="flex gap-1 flex-wrap">
              {toma.registros.map(r => (
                <button
                  key={r.ordenToma}
                  onClick={() => setSelectedOrdenToma(r.ordenToma)}
                  className={`px-3 py-1 rounded border text-[12px] transition-colors ${
                    r.ordenToma === selectedOrdenToma
                      ? 'bg-[#2563eb] text-white border-[#2563eb] font-semibold shadow-sm'
                      : 'bg-white border-[#cbd5e1] text-[#475569] hover:bg-gray-50'
                  }`}
                >
                  Reg #{r.ordenToma} {r.ordenToma === toma.latest.ordenToma ? '(Último)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs Selector */}
          <div className="flex gap-2 border-b border-[#e2e8f0] overflow-x-auto hide-scrollbar shrink-0 pt-2">
            {TABS.map(tab => {
              const count = categorizedFields[tab].length;
              if (count === 0 && tab !== activeTab) return null;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-[14px] font-medium cursor-pointer whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab 
                      ? 'text-[#2563eb] border-[#2563eb]' 
                      : 'text-[#64748b] border-transparent hover:text-[#1e293b]'
                  }`}
                >
                  {tab} 
                  <span className={`text-[11px] px-1.5 py-0.5 rounded font-bold ${activeTab === tab ? 'bg-[#eff6ff] text-[#2563eb]' : 'bg-[#f1f5f9] text-[#94a3b8]'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
            {categorizedFields[activeTab].length === 0 ? (
              <div className="col-span-full text-center py-16 text-[#64748b] bg-white/50 rounded-2xl border border-dashed border-[#cbd5e1]">
                <p className="text-[14px] font-medium">No hay datos indexados en esta categoría evolutiva.</p>
              </div>
            ) : (
              categorizedFields[activeTab].map((field, idx) => (
                <div key={`${field.key}_${idx}`} className="bg-white border border-[#e2e8f0] rounded-xl p-5 flex flex-col gap-3 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] hover:border-[#cbd5e1] transition-colors">
                  <div className="text-[11px] font-bold uppercase text-[#64748b] tracking-wider border-b border-[#f1f5f9] pb-2">
                    {field.key}
                  </div>
                  <div className="text-[13.5px] text-[#1e293b] font-medium whitespace-pre-wrap leading-relaxed">
                    <HighlightedText text={field.value} query={query} />
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
