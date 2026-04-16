import { HCEData, Patient, RegistroToma } from './dataStore';

export interface SearchResult {
  nhc: string;
  patient: Patient;
  totalScore: number;
  matchingTomasCount: number;
  bestMatchUrl: { idToma: string; ordenToma: number };
  matchedRegistros: { idToma: string; ordenToma: number; score: number; record: RegistroToma }[];
}

export class SearchEngine {
  private index: Record<string, { nhc: string, idToma: string, ordenToma: number, count: number }[]> = {};
  private documentCount = 0;
  private data: HCEData | null = null;

  buildIndex(data: HCEData) {
    this.data = data;
    this.index = {};
    this.documentCount = 0;

    for (const nhc in data.patients) {
      const patient = data.patients[nhc];
      for (const idToma in patient.tomas) {
        const toma = patient.tomas[idToma];
        for (const registro of toma.registros) {
          this.documentCount++;
          const tokens = this.tokenizeRecord(registro.data);
          
          const termCounts: Record<string, number> = {};
          for (const token of tokens) {
            termCounts[token] = (termCounts[token] || 0) + 1;
          }

          for (const term in termCounts) {
            if (!this.index[term]) {
              this.index[term] = [];
            }
            this.index[term].push({
              nhc,
              idToma,
              ordenToma: registro.ordenToma,
              count: termCounts[term]
            });
          }
        }
      }
    }
    
    try {
      localStorage.setItem('hce_index', JSON.stringify({ index: this.index, documentCount: this.documentCount }));
    } catch (e) {
      console.error("Could not save index to localStorage", e);
    }
  }

  loadIndex(data: HCEData) {
    this.data = data;
    try {
      const saved = localStorage.getItem('hce_index');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.index = parsed.index;
        this.documentCount = parsed.documentCount;
      } else {
        this.buildIndex(data);
      }
    } catch (e) {
      this.buildIndex(data);
    }
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1);
  }

  private tokenizeRecord(record: Record<string, string>): string[] {
    const tokens: string[] = [];
    for (const [key, value] of Object.entries(record)) {
      tokens.push(...this.tokenize(key));
      tokens.push(...this.tokenize(value));
    }
    return tokens;
  }

  search(query: string, filters?: { dateRange?: [string, string], service?: string }): SearchResult[] {
    if (!this.data) return [];
    
    // Escudo de seguridad (Backward Compatibility) para evitar fallos si el usuario no refrescó tras el refactor
    const firstPatient = Object.values(this.data.patients)[0] as any;
    if (firstPatient && firstPatient.episodes && !firstPatient.tomas) {
      console.warn("Memoria RAM desactualizada. Por favor recarga la página o vuelve a subir el CSV.");
      return [];
    }
    
    const rawTerms = query.split(/\s+/).filter(t => t.length > 0);
    const must: string[] = [];
    const mustNot: string[] = [];
    const should: string[] = [];

    for (let i = 0; i < rawTerms.length; i++) {
      let term = rawTerms[i];
      if (term.toUpperCase() === 'AND') continue;
      if (term.toUpperCase() === 'OR') {
        if (i + 1 < rawTerms.length) {
          should.push(...this.tokenize(rawTerms[i+1]));
          i++;
        }
        continue;
      }
      if (term.toUpperCase() === 'NOT' || term.startsWith('-')) {
        const t = term.startsWith('-') ? term.substring(1) : rawTerms[++i];
        if (t) mustNot.push(...this.tokenize(t));
        continue;
      }
      must.push(...this.tokenize(term));
    }

    if (must.length === 0 && should.length === 0) {
      return this.getAllRecords(filters);
    }

    // Mapping NHC -> Detailed Matches
    const patientMatches: Record<string, {
      nhc: string,
      patient: Patient,
      totalScore: number,
      registros: Record<string, { idToma: string, ordenToma: number, score: number, record: RegistroToma }>
    }> = {};

    const processTerms = (terms: string[], isMust: boolean, isShould: boolean) => {
      for (const term of terms) {
        const matchingIndexTerms = Object.keys(this.index).filter(t => t.includes(term));
        
        for (const indexTerm of matchingIndexTerms) {
          const docs = this.index[indexTerm];
          const idf = Math.log(this.documentCount / (docs.length || 1));
          
          for (const doc of docs) {
            const tf = doc.count;
            const weight = indexTerm === term ? 2.0 : 1.0;
            const score = tf * idf * weight;

            if (!patientMatches[doc.nhc]) {
              patientMatches[doc.nhc] = {
                nhc: doc.nhc,
                patient: this.data!.patients[doc.nhc],
                totalScore: 0,
                registros: {}
              };
            }
            
            patientMatches[doc.nhc].totalScore += score;
            
            const regId = `${doc.idToma}_${doc.ordenToma}`;
            if (!patientMatches[doc.nhc].registros[regId]) {
              const toma = this.data!.patients[doc.nhc].tomas[doc.idToma];
              const registro = toma.registros.find((r: any) => r.ordenToma === doc.ordenToma)!;
              patientMatches[doc.nhc].registros[regId] = {
                idToma: doc.idToma,
                ordenToma: doc.ordenToma,
                score: 0,
                record: registro
              };
            }
            patientMatches[doc.nhc].registros[regId].score += score;
          }
        }
      }
    };

    processTerms(must, true, false);
    processTerms(should, false, true);

    for (const term of mustNot) {
      const matchingIndexTerms = Object.keys(this.index).filter(t => t.includes(term));
      for (const indexTerm of matchingIndexTerms) {
        const docs = this.index[indexTerm];
        for (const doc of docs) {
          if (patientMatches[doc.nhc]) {
            delete patientMatches[doc.nhc];
          }
        }
      }
    }

    let results: SearchResult[] = [];
    
    for (const nhc in patientMatches) {
      const pm = patientMatches[nhc];
      
      const flatRegistros = Object.values(pm.registros).sort((a, b) => b.score - a.score);
      
      if (flatRegistros.length === 0) continue;
      
      if (must.length > 0) {
        // Enforce MUST at the patient level globally (if patient has all MUST terms across ALL matching records combined)
        // OR enforce it strictly per matched record. Given clinical context, users want patients who have ALL terms.
        const allPatientTokens = new Set<string>();
        flatRegistros.forEach(r => {
           this.tokenizeRecord(r.record.data).forEach(t => allPatientTokens.add(t));
        });
        const hasAllMust = must.every(m => Array.from(allPatientTokens).some(t => t.includes(m)));
        if (!hasAllMust) continue;
      }

      const uniqueTomasCount = new Set(flatRegistros.map(r => r.idToma)).size;

      results.push({
        nhc: pm.nhc,
        patient: pm.patient,
        totalScore: pm.totalScore,
        matchingTomasCount: uniqueTomasCount,
        bestMatchUrl: { idToma: flatRegistros[0].idToma, ordenToma: flatRegistros[0].ordenToma },
        matchedRegistros: flatRegistros
      });
    }

    return this.applyFiltersAndSort(results, filters);
  }

  private getAllRecords(filters?: { dateRange?: [string, string], service?: string }): SearchResult[] {
    const results: SearchResult[] = [];
    if (!this.data) return results;

    const firstPatient = Object.values(this.data.patients)[0] as any;
    if (firstPatient && firstPatient.episodes && !firstPatient.tomas) return results;

    for (const nhc in this.data.patients) {
      const patient = this.data.patients[nhc];
      const allRegistros: { idToma: string; ordenToma: number; score: number; record: RegistroToma }[] = [];
      const uniqueTomasCount = Object.keys(patient.tomas).length;
      
      // Let's just grab the latest of each toma for display by default in getAllRecords
      for (const idToma in patient.tomas) {
        const toma = patient.tomas[idToma];
        allRegistros.push({
          idToma,
          ordenToma: toma.latest.ordenToma,
          score: 1,
          record: toma.latest
        });
      }

      if (allRegistros.length === 0) continue;

      results.push({
        nhc,
        patient,
        totalScore: 1, // baseline
        matchingTomasCount: uniqueTomasCount,
        bestMatchUrl: { idToma: allRegistros[0].idToma, ordenToma: allRegistros[0].ordenToma },
        matchedRegistros: allRegistros
      });
    }
    return this.applyFiltersAndSort(results, filters);
  }

  private applyFiltersAndSort(results: SearchResult[], filters?: { dateRange?: [string, string], service?: string }): SearchResult[] {
    let filtered = results;
    
    if (filters) {
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        const start = new Date(filters.dateRange[0]).getTime();
        const end = new Date(filters.dateRange[1]).getTime();
        filtered = filtered.filter(res => {
          // Check if ANY matched registro is within date
          return res.matchedRegistros.some(r => {
             const dateKey = Object.keys(r.record.data).find(k => k.toUpperCase().includes('FECHA_TOMA'));
             if (!dateKey || !r.record.data[dateKey]) return false;
             let dateStr = r.record.data[dateKey];
             if (dateStr.includes('/')) {
               const parts = dateStr.split('/');
               if (parts.length === 3) dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
             }
             const time = new Date(dateStr).getTime();
             return time >= start && time <= end;
          });
        });
      }

      if (filters.service) {
        const srv = filters.service.toLowerCase();
        filtered = filtered.filter(res => {
           return res.matchedRegistros.some(r => {
              const srvKey = Object.keys(r.record.data).find(k => k.toUpperCase().includes('SERVICIO') || k.toUpperCase().includes('PROCESO'));
              if (!srvKey || !r.record.data[srvKey]) return false;
              return r.record.data[srvKey].toLowerCase().includes(srv);
           });
        });
      }
    }

    return filtered.sort((a, b) => b.totalScore - a.totalScore);
  }
}

export const searchEngine = new SearchEngine();
