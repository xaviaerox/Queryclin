import { useState, useEffect } from 'react';
import { HCEData, storage, groupData } from './lib/dataStore';
import { parseCSV } from './lib/csvParser';
import { searchEngine, SearchResult } from './lib/searchEngine';
import Home from './components/Home';
import Results from './components/Results';
import HCEView from './components/HCEView';

export type ViewState = 'home' | 'results' | 'hce';

export default function App() {
  const [data, setData] = useState<HCEData | null>(null);
  const [view, setView] = useState<ViewState>('home');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const loaded = storage.loadData();
    if (loaded) {
      setData(loaded);
      searchEngine.loadIndex(loaded);
    }
  }, []);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const records = parseCSV(text);
      const grouped = groupData(records);
      setData(grouped);
      storage.saveData(grouped);
      searchEngine.buildIndex(grouped);
    };
    reader.readAsText(file);
  };

  const handleSearch = (q: string, filters?: { dateRange?: [string, string], service?: string }) => {
    setQuery(q);
    if (!data) return;
    const results = searchEngine.search(q, filters);
    setSearchResults(results);
    setView('results');
  };

  const handleClearData = () => {
    storage.clearData();
    setData(null);
    setView('home');
    setSearchResults([]);
  };

  return (
    <div className="h-screen flex flex-col bg-[#f4f7f9] text-[#1e293b] font-['Helvetica_Neue',Helvetica,Arial,sans-serif] overflow-hidden">
      <header className="h-[64px] bg-white/70 backdrop-blur-md border-b border-white/40 px-6 flex items-center justify-between z-[100] shrink-0">
        <div 
          className="text-[20px] font-black tracking-tight cursor-pointer flex items-center gap-2 text-[#2563eb]"
          onClick={() => setView('home')}
        >
          <span>Query<span className="font-light text-[#1e293b]">clin</span></span>
        </div>
        {data && (
          <div className="flex items-center gap-6 border-l border-black/10 pl-6 h-full">
            <button 
              onClick={() => handleSearch('')}
              className="flex flex-col items-end hover:opacity-80 active:scale-95 transition-all cursor-pointer group"
              title="Explorar el padrón completo de pacientes"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-[#64748b] group-hover:text-[#2563eb] transition-colors">Pacientes</span>
              <span className="text-[14px] font-bold text-[#1e293b]">{Object.keys(data.patients).length}</span>
            </button>
            <button 
              onClick={handleClearData}
              className="text-[12px] font-semibold text-red-600 hover:text-red-800 transition-colors"
            >
              Limpiar Datos
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {view === 'home' && (
            <Home 
              hasData={!!data} 
              onUpload={handleFileUpload} 
              onSearch={handleSearch} 
            />
          )}
          {view === 'results' && (
            <Results 
              results={searchResults} 
              query={query}
              onSelect={(res) => {
                const idx = searchResults.findIndex(r => r.nhc === res.nhc);
                setSelectedIndex(idx);
                setView('hce');
              }}
              onBack={() => setView('home')}
            />
          )}
          {view === 'hce' && selectedIndex !== -1 && data && (
            <HCEView 
              results={searchResults}
              currentIndex={selectedIndex}
              onIndexChange={setSelectedIndex}
              onBack={() => setView('results')}
              query={query}
              data={data}
            />
          )}
        </main>
      </div>
    </div>
  );
}
