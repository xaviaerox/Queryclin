import React, { useState, useEffect, useMemo } from 'react';
import { Sun, Moon, Database, Users, HelpCircle } from 'lucide-react';
import { HCEData } from './lib/dataStore';
import { searchEngine, SearchResult } from './lib/searchEngine';
import { db } from './lib/db';
import Home from './components/Home';
import Results from './components/Results';
import HCEView from './components/HCEView';
import Help from './components/Help';
import Evolution from './components/Evolution';

/**
 * Error Boundary para mitigar fallos en tiempo de renderizado
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state: { hasError: boolean } = { hasError: false };
  props!: { children: React.ReactNode };

  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-clinical)] text-center p-10">
          <h2 className="text-2xl font-black text-[var(--accent-clinical)] mb-4">Sistema Temporalmente Fuera de Servicio</h2>
          <p className="text-[var(--text-secondary)] mb-6">Se ha detectado una excepción en la interfaz. Por favor, reinicia la sesión.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[var(--accent-clinical)] text-white font-bold rounded-xl shadow-lg">
            Reiniciar Aplicación
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const VERSION = '3.7.0';
export const BUILD_DATE = '24/04/2026 12:30';

export type ViewState = 'home' | 'results' | 'hce' | 'help' | 'evolution';

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [data, setData] = useState<HCEData | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [patientCount, setPatientCount] = useState<number>(0);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('queryclin_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const initData = async () => {
      // Tarea A3: Persistencia de Sesión y Privacidad
      const isSessionActive = sessionStorage.getItem('queryclin_active_session');
      if (!isSessionActive) {
        console.warn("[Privacidad] Nueva sesión detectada. Limpiando IndexedDB para prevenir retención de datos médicos.");
        await db.clear();
        sessionStorage.setItem('queryclin_active_session', 'true');
        setData(null);
        setPatientCount(0);
        return;
      }

      const count = await db.getFromStore(db.stores.metadata, 'patient_count');
      if (count) {
        setData({ patients: {} });
        setPatientCount(count);
        await searchEngine.loadIndex({ patients: {} });
        await searchEngine.loadDictionary();
      }
    };
    initData();
  }, []);

  // Tarea A3: Advertencia en beforeunload si hay datos cargados
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (patientCount > 0) {
        const msg = "Si abandonas la página se perderán los datos clínicos cargados en memoria.";
        e.returnValue = msg;
        return msg;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [patientCount]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('queryclin_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleFileUpload = (file: File) => {
    setIsProcessing(true);
    setProgressPercent(0);
    const reader = new FileReader();
    reader.onload = (e) => {
      // FIX UTF-8: Leer como ArrayBuffer y decodificar explícitamente para evitar fallos de codificación
      const buffer = e.target?.result as ArrayBuffer;
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(buffer);

      const worker = new Worker(new URL('./lib/parser.worker.ts', import.meta.url) + '?v=' + Date.now(), { type: 'module' });
      worker.postMessage({ csvText: text });
      worker.onmessage = async (event) => {
        const { type, progress, total, message, patientCount } = event.data;

        if (type === 'progress') {
          const percent = Math.round((progress / total) * 100);
          setProgressPercent(percent);
          console.log(`[Ingesta] Progreso: ${progress} / ${total} (${percent}%)`);
          return;
        }

        if (type === 'complete') {
          try {
            console.log("[App] Ingesta completada. Sincronizando interfaz...");
            await searchEngine.loadIndex({ patients: {} }); 
            await searchEngine.loadDictionary();
            
            setPatientCount(patientCount);
            // IMPORTANTE: Informar a la UI de que los datos están listos
            setData({ patients: searchEngine.getPatientSkeletons() }); 
            setIsProcessing(false);
            worker.terminate();
          } catch (err: any) {
            console.error("[App] Error al cargar el índice tras la ingesta:", err);
            alert("Error al activar el buscador: " + err.message);
            setIsProcessing(false);
            worker.terminate();
          }
        } else if (type === 'error') {
          console.error("Error en el worker:", message);
          alert("Error crítico durante la ingesta: " + message);
          setIsProcessing(false);
          worker.terminate();
        }
      };


      worker.onerror = (err) => {
        console.error("Fallo crítico del worker:", err);
        setIsProcessing(false);
        worker.terminate();
      };
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSearch = async (q: string, filters?: { dateRange?: [string, string], service?: string }) => {
    setQuery(q);
    const results = await searchEngine.search(q, filters);
    setSearchResults(results);
    setView('results');
  };

  const handleClearData = async () => {
    // Tarea B1: Confirmación de Borrado
    if (window.confirm("¿Está seguro de que desea eliminar todos los registros clínicos de la memoria? Esta acción no se puede deshacer y requerirá volver a importar el archivo CSV.")) {
      try {
        setIsProcessing(true);
        await db.clear();
        searchEngine.startIndexing(); // Reinicia el estado interno del buscador
        setData(null);
        setPatientCount(0);
        setSearchResults([]);
        setView('home');
        setIsProcessing(false);
        console.log("[UI] Estado reseteado tras limpieza de DB.");
      } catch (err) {
        console.error("Error al limpiar la base de datos:", err);
        alert("No se pudo limpiar la base de datos completamente.");
        setIsProcessing(false);
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-[var(--bg-clinical)] text-[var(--text-primary)] font-sans overflow-hidden">
        <header className="h-[64px] bg-[var(--glass-bg)] backdrop-blur-md border-b border-[var(--border-clinical)] px-6 flex items-center justify-between z-[100] shrink-0">
          <div className="flex items-center gap-2">
            <div 
              className="text-[20px] font-black tracking-tight cursor-pointer text-[var(--accent-clinical)]"
              onClick={() => setView('home')}
            >
              Query<span className="font-light text-[var(--text-primary)]">clin</span>
            </div>
            <button 
              onClick={() => setView('evolution')}
              className="px-2 py-0.5 text-[9px] font-black bg-[var(--accent-clinical)]/10 text-[var(--accent-clinical)] border border-[var(--accent-clinical)]/20 rounded-full hover:bg-[var(--accent-clinical)] hover:text-white transition-all active:scale-95" 
              title={`Compilación: ${BUILD_DATE} | Click para ver la evolución del proyecto`}
            >
              V{VERSION}
            </button>
          </div>
          
          <div className="flex items-center gap-4 h-full">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-[var(--border-clinical)] transition-colors text-[var(--text-secondary)]"
              title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={() => setView('help')}
              className={`p-2 rounded-full transition-all ${view === 'help' ? 'bg-[var(--accent-clinical)] text-white' : 'hover:bg-[var(--border-clinical)] text-[var(--text-secondary)]'}`}
              title="Guía de uso y documentación"
            >
              <HelpCircle size={20} />
            </button>
            {data && (
              <div className="flex items-center gap-6 border-l border-[var(--border-clinical)] pl-4 h-full">
                <button 
                  onClick={() => handleSearch('')}
                  className="flex flex-col items-end hover:opacity-80 active:scale-95 transition-all cursor-pointer group"
                  title="Explorar el padrón completo de pacientes"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] group-hover:text-[var(--accent-clinical)] transition-colors">Pacientes</span>
                  <span className="text-[14px] font-bold text-[var(--text-primary)]">{patientCount}</span>
                </button>
                <button 
                  onClick={handleClearData}
                  className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50/50 transition-all"
                  title="Limpiar base de datos local"
                >
                  <Database size={20} />
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative bg-[var(--bg-clinical)]">
          {isProcessing && (
            <div className="fixed inset-0 bg-[var(--bg-clinical)]/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
              <div className="w-20 h-20 border-4 border-[var(--accent-clinical)] border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(var(--accent-clinical-rgb),0.2)]"></div>
              
              <div className="max-w-md w-full space-y-6 text-center">
                <h2 className="text-2xl font-black text-[var(--text-primary)]">Procesando registros médicos...</h2>
                <p className="text-[var(--text-secondary)] font-medium">Queryclin está organizando e indexando la base de datos local para permitir la búsqueda instantánea de los pacientes importados.</p>
                
                {/* Barra de Progreso Evolutiva */}
                <div className="w-full bg-[var(--surface-clinical)] h-4 rounded-full border border-[var(--border-clinical)] overflow-hidden shadow-inner p-1">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--accent-clinical)] to-emerald-500 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(var(--accent-clinical-rgb),0.4)]"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60">
                  <span>Estado: Ingesta Activa</span>
                  <span>{progressPercent}% Completado</span>
                </div>
              </div>
            </div>
          )}

          {(view === 'home' || view === 'results') && (
            <div className={`transition-all duration-500 ease-in-out ${view === 'results' ? 'border-b border-[var(--border-clinical)] pb-6 bg-[var(--surface-clinical)] shadow-sm' : ''}`}>
              <Home 
                onUpload={handleFileUpload} 
                onSearch={handleSearch} 
                getSuggestions={(q) => searchEngine.getSuggestions(q)}
                hasData={!!data || patientCount > 0} 
                compact={view === 'results'}
              />
            </div>
          )}
          {view === 'results' && (
            <div className="pt-8">
              <Results 
                results={searchResults} 
                query={query}
                onBack={() => { setQuery(''); setView('home'); }} 
                onSelect={(res) => {
                  const idx = searchResults.findIndex(r => r.nhc === res.nhc);
                  setSelectedIndex(idx);
                  setView('hce');
                }}
              />
            </div>
          )}
          {view === 'hce' && selectedIndex !== -1 && (
            <HCEView 
              results={searchResults}
              currentIndex={selectedIndex}
              onBack={() => setView('results')}
              query={query}
              onNavigate={(idx: number) => setSelectedIndex(idx)}
            />
          )}
          {view === 'help' && (
            <Help onBack={() => setView('home')} />
          )}
          {view === 'evolution' && (
            <Evolution onBack={() => setView('home')} />
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
