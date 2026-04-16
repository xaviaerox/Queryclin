import { SearchResult } from '../lib/searchEngine';
import { ArrowLeft, FileText, Download, Activity, User } from 'lucide-react';

interface ResultsProps {
  results: SearchResult[];
  query: string;
  onSelect: (result: SearchResult) => void;
  onBack: () => void;
}

export default function Results({ results, query, onSelect, onBack }: ResultsProps) {
  const handleExportCSV = () => {
    if (results.length === 0) return;

    const tempKeys = new Set<string>();
    results.forEach(res => {
       res.matchedRegistros.forEach(match => {
          Object.keys(match.record.data).forEach(k => tempKeys.add(k));
       });
    });
    const keys = Array.from(tempKeys);
    
    const metaKeys = ['NHC_ID', 'ID_TOMA', 'ORDEN_TOMA', 'SCORE_BUSQUEDA'];

    let csvContent = '\uFEFF'; 
    csvContent += [...metaKeys, ...keys].map(k => `"${k.replace(/"/g, '""')}"`).join(',') + '\n';

    results.forEach(res => {
      res.matchedRegistros.forEach(match => {
        const row = [
          res.nhc,
          match.idToma,
          match.ordenToma.toString(),
          match.score.toString(),
          ...keys.map(k => match.record.data[k] || '')
        ];
        
        csvContent += row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',') + '\n';
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeQuery = query.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.href = url;
    link.setAttribute('download', `queryclin_export_${safeQuery || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/50 rounded-full transition-colors text-[#64748b]"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-[#1e293b]">Pacientes Coincidentes</h2>
            <p className="text-[#64748b] text-sm">
              {results.length} pacientes hallados {query ? `para "${query}"` : 'en base de datos'}.
            </p>
          </div>
        </div>

        {results.length > 0 && (
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-[#2563eb] hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
            title="Exportar a CSV"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {results.map((res, idx) => {
          const record = res.patient.demographics;
          const nameKey = Object.keys(record).find(k => k.toUpperCase().includes('NOMBRE')) || '';
          const name = nameKey ? record[nameKey] : `Sin nombre registrado`;

          return (
            <div 
              key={`result_${res.nhc}_${idx}`}
              onClick={() => onSelect(res)}
              className="bg-white/70 backdrop-blur-md p-5 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-white/40 hover:border-[#2563eb] transition-all cursor-pointer flex items-center gap-6 group"
            >
              <div className="w-12 h-12 bg-[#eff6ff] text-[#2563eb] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <User size={24} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[16px] font-semibold text-[#1e293b] flex items-center gap-2 group-hover:text-[#2563eb] transition-colors">
                    {name}
                  </h3>
                  <span className="text-[11px] font-bold bg-[#dcfce7] text-[#166534] px-2.5 py-1 rounded-full">
                    Score: {res.totalScore.toFixed(1)}
                  </span>
                </div>
                
                <div className="flex gap-2 flex-wrap mt-3 items-center text-[12px] text-[#475569]">
                  <span className="bg-[#f1f5f9] px-2.5 py-1 rounded font-medium flex items-center gap-1">NHC: {res.nhc}</span>
                  <span className="bg-[#f1f5f9] px-2.5 py-1 rounded font-medium flex items-center gap-1">
                    <Activity size={14} className="text-[#2563eb]" /> 
                    {res.matchingTomasCount} Tomas implicadas
                  </span>
                  <span className="bg-[#f1f5f9] px-2.5 py-1 rounded font-medium">
                    {res.matchedRegistros.length} Registros totales
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {results.length === 0 && (
          <div className="text-center py-20 bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm">
            <div className="w-16 h-16 bg-[#f1f5f9] rounded-full flex items-center justify-center mx-auto mb-4 text-[#94a3b8]">
              <FileText size={32} />
            </div>
            <p className="text-[#64748b] text-lg font-medium">No se han encontrado pacientes coincidentes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
