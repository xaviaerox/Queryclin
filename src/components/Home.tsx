import React, { useState, useRef } from 'react';
import { Search, Upload, ShieldCheck, Database, Zap, Filter, Calendar, Stethoscope } from 'lucide-react';

interface HomeProps {
  hasData: boolean;
  onUpload: (file: File) => void;
  onSearch: (query: string, filters?: { dateRange?: [string, string], service?: string }) => void;
}

export default function Home({ hasData, onUpload, onSearch }: HomeProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [service, setService] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, {
      dateRange: dateStart || dateEnd ? [dateStart, dateEnd] : undefined,
      service: service || undefined
    });
  };

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <div className="bg-white/70 backdrop-blur-md p-12 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-white/40 max-w-md w-full">
          <div className="w-16 h-16 bg-[#eff6ff] text-[#2563eb] rounded-full flex items-center justify-center mx-auto mb-6">
            <Upload size={32} />
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-[#1e293b]">Inicializar Memoria Local</h2>
          <p className="text-[#64748b] text-sm mb-8 leading-relaxed">
            Importe la matriz de datos estructurada (.csv) para cargar la base en la memoria temporal.
          </p>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                 onUpload(file);
                 if (fileInputRef.current) fileInputRef.current.value = '';
              }
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            Importar Base de Datos
          </button>
          
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#f1f5f9]">
            <div className="space-y-2">
              <ShieldCheck className="mx-auto text-[#64748b]" size={20} />
              <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Aislamiento<br/>Local-First</p>
            </div>
            <div className="space-y-2">
              <Database className="mx-auto text-[#64748b]" size={20} />
              <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Motor en<br/>RAM</p>
            </div>
            <div className="space-y-2">
              <Zap className="mx-auto text-[#64748b]" size={20} />
              <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Booleano<br/>Avanzado</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-20 w-full relative z-20">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-semibold tracking-tight mb-4 text-[#1e293b]">
          Explorador de Historias Clínicas
        </h1>
        <p className="text-[#64748b]">
          El analizador es compatible con sintaxis Booleana estricta (AND, OR, NOT).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative max-w-[600px] mx-auto">
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-[#64748b]" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por identificadores, diagnóstico o clínica..."
            className="w-full pl-11 pr-32 py-3 text-sm bg-white border border-[#e2e8f0] rounded-full shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-shadow"
          />
          <div className="absolute right-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-full transition-colors ${showFilters ? 'bg-[#eff6ff] text-[#2563eb]' : 'text-[#64748b] hover:bg-gray-50'}`}
              title="Filtros"
            >
              <Filter size={18} />
            </button>
            <button
              type="submit"
              className="bg-[#2563eb] hover:bg-blue-700 text-white px-5 py-1.5 rounded-full text-sm font-medium transition-colors"
            >
              Consultar
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="absolute top-full left-0 right-0 mt-4 bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] z-20 grid grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#1e293b] mb-2">
                <Calendar size={16} /> Rango de Fechas
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-sm text-[#1e293b]"
                />
                <span className="text-[#64748b]">-</span>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-sm text-[#1e293b]"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#1e293b] mb-2">
                <Stethoscope size={16} /> Especialidad / Servicio
              </label>
              <input
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="Ej: ALG, URGENCIAS..."
                className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-sm text-[#1e293b]"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
