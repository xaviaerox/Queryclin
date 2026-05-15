import React, { useState } from 'react';
import { AdminDashboard } from './ui/AdminDashboard';
import { FormDesigner } from './ui/FormDesigner';

interface AdminRootProps {
  onExit: () => void;
}

export function AdminRoot({ onExit }: AdminRootProps) {
  const [selectedSchemaId, setSelectedSchemaId] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  if (!isAuthorized) {
    return (
      <div className="absolute inset-0 z-[200] bg-[var(--bg-clinical)]">
        <div className="flex flex-col h-full">
          <div className="bg-[var(--surface-clinical)] border-b border-[var(--border-clinical)] px-6 py-4 flex justify-between items-center shadow-sm">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--accent-clinical)] rounded-full animate-pulse"></div>
                <span className="text-[var(--text-primary)] font-black text-xs uppercase tracking-[0.2em]">Queryclin Security Layer</span>
             </div>
             <button 
              onClick={onExit} 
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs uppercase tracking-widest transition-colors"
             >
                &times; Cancelar
             </button>
          </div>
          <PasscodeGate onCorrect={() => setIsAuthorized(true)} />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[100] bg-[var(--bg-clinical)] overflow-hidden flex flex-col">
      {/* Banner Superior de Gobernanza */}
      <div className="bg-[#0f172a] text-white px-6 py-2.5 flex justify-between items-center border-b border-white/5 relative z-[110] shadow-xl">
        <div className="flex items-center gap-4">
           <div className="flex flex-col">
              <span className="text-[var(--accent-clinical)] font-black text-[10px] uppercase tracking-[0.3em] leading-none mb-1">Queryclin Admin Studio</span>
              <span className="text-white/40 font-bold text-[8px] uppercase tracking-widest leading-none">Security Status: Active • Admin Session</span>
           </div>
        </div>
        <button 
          onClick={onExit}
          className="bg-white/5 hover:bg-red-500/10 text-white/60 hover:text-red-400 border border-white/10 hover:border-red-500/20 px-4 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
        >
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
          Exit Admin Mode
        </button>
      </div>

      <div className="flex-1 overflow-auto animate-in fade-in duration-500">
        {selectedSchemaId ? (
          <FormDesigner 
            schemaId={selectedSchemaId} 
            onBack={() => setSelectedSchemaId(null)} 
          />
        ) : (
          <AdminDashboard 
            onSelectSchema={id => setSelectedSchemaId(id)} 
          />
        )}
      </div>
    </div>
  );
}

function PasscodeGate({ onCorrect }: { onCorrect: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === "admin123") {
      onCorrect();
    } else {
      setError(true);
      setCode("");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--bg-clinical)]">
      <div className="max-w-sm w-full bg-[var(--surface-clinical)] border border-[var(--border-clinical)] rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-clinical)]/5 rounded-full -mr-16 -mt-16"></div>
        
        <div className="flex justify-center mb-10 relative z-10">
           <div className="w-20 h-20 bg-[var(--accent-clinical)]/10 border border-[var(--accent-clinical)]/20 rounded-3xl flex items-center justify-center shadow-inner">
              <svg className="w-10 h-10 text-[var(--accent-clinical)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
           </div>
        </div>
        
        <h2 className="text-3xl font-black mb-2 text-[var(--text-primary)] text-center tracking-tight uppercase">Acceso Privado</h2>
        <p className="text-[10px] text-[var(--text-secondary)] mb-10 font-black uppercase tracking-[0.3em] text-center opacity-40">Admin Governance Portal</p>
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="space-y-3">
            <input 
              type="password" 
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-[var(--bg-clinical)] border border-[var(--border-clinical)] rounded-2xl p-6 text-3xl tracking-[0.8em] text-center focus:ring-2 focus:ring-[var(--accent-clinical)] focus:border-transparent outline-none transition-all text-[var(--accent-clinical)] placeholder:text-[var(--border-clinical)]"
              placeholder="••••"
            />
            {error && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-[0.2em] animate-bounce">Credenciales Inválidas</p>}
          </div>
          
          <button className="w-full bg-[var(--accent-clinical)] hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-xl shadow-blue-500/20 active:scale-95">
            Desbloquear Engine
          </button>
        </form>
      </div>
      <p className="mt-16 text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-[0.4em] opacity-30">Queryclin Security Protocol v6.5.0</p>
    </div>
  );
}
