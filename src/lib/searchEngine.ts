import { HCEData, Patient, RegistroToma } from './dataStore';
import { db } from './db';

export interface SearchResult {
  nhc: string;
  patient: Patient;
  totalScore: number;
  matchingTomasCount: number;
  bestMatchUrl: { idToma: string; ordenToma: number };
  matchedRegistros: { idToma: string; ordenToma: number; score: number; record: RegistroToma }[];
}

export class SearchEngine {
  private index: Record<string, any> = {};
  private documentCount = 0;
  private data: HCEData | null = null;
  // Ya no usamos patientSkeletons en memoria para ahorrar 100MB+ de RAM

  async buildIndex(data: HCEData) {
    if (!data || !data.patients) {
      console.warn("[SearchEngine] Intento de indexación sin datos válidos.");
      return;
    }
    this.index = {};
    this.documentCount = 0;
    const skeletons: Record<string, any> = {};

    for (const nhc in data.patients) {
      const patient = data.patients[nhc];
      skeletons[nhc] = { nhc: patient.nhc, demographics: patient.demographics, tomas: {} };

      for (const idToma in patient.tomas) {
        for (const registro of patient.tomas[idToma].registros) {
          this.documentCount++;
          const tokens = this.tokenizeRecord(registro.data);
          const termCounts: Record<string, number> = {};
          for (const token of tokens) termCounts[token] = (termCounts[token] || 0) + 1;

          for (const term in termCounts) {
            if (!this.index[term]) this.index[term] = [];
            this.index[term].push({ nhc, idToma, ordenToma: registro.ordenToma, count: termCounts[term] });
          }
        }
      }
    }

    console.log(`[SearchEngine] Indexación completada. Guardando índice fragmentado...`);
    
    // Guardar esqueletos
    await db.saveBatch(db.stores.metadata, { 'patient_skeletons': skeletons, 'document_count': this.documentCount });
    
    // Guardar índice fragmentado por términos en bloques para no colgar el worker
    const terms = Object.keys(this.index);
    const batchSize = 2000;
    for (let i = 0; i < terms.length; i += batchSize) {
      const batch: Record<string, any> = {};
      const slice = terms.slice(i, i + batchSize);
      slice.forEach(t => batch[t] = this.index[t]);
      await db.saveBatch(db.stores.search_index, batch);
      // Liberar RAM conforme guardamos
      slice.forEach(t => delete this.index[t]);
    }
  }

  async loadIndex(data: HCEData) {
    this.data = data;
    const skeletons = await db.getFromStore(db.stores.metadata, 'patient_skeletons');
    const docCount = await db.getFromStore(db.stores.metadata, 'document_count');
    if (skeletons) this.patientSkeletons = skeletons;
    if (docCount) this.documentCount = docCount;
  }

  private tokenize(text: string): string[] {
    if (!text) return [];
    // Versión ultra-rápida: solo minúsculas y split por caracteres no alfanuméricos
    return text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .split(/[^a-z0-9]+/)
      .filter(t => t.length > 2); // Ignorar palabras de 1-2 letras (stop-words básicas)
  }

  private tokenizeRecord(record: Record<string, string>): string[] {
    const tokens: string[] = [];
    const values = Object.values(record);
    for (let i = 0; i < values.length; i++) {
      const val = values[i];
      if (val) {
        tokens.push(...this.tokenize(val));
      }
    }
    return tokens;
  }

  async search(query: string, filters?: { dateRange?: [string, string], service?: string }): Promise<SearchResult[]> {
    const rawTerms = query.split(/\s+/).filter(t => t.length > 0);
    const must: string[] = [];
    const mustNot: string[] = [];
    const should: string[] = [];

    for (let i = 0; i < rawTerms.length; i++) {
      const term = rawTerms[i];
      const prev = rawTerms[i - 1]?.toUpperCase();
      const tokens = this.tokenize(term);
      if (tokens.length === 0) continue;
      if (prev === 'NOT' || term.startsWith('-')) mustNot.push(...tokens);
      else if (rawTerms[i+1]?.toUpperCase()==='OR' || prev==='OR') should.push(...tokens);
      else must.push(...tokens);
    }

    if (must.length === 0 && should.length === 0) return await this.getAllRecords(filters);

    const patientMatches: Record<string, any> = {};
    
    const processTerms = async (terms: string[]) => {
      for (const term of terms) {
        // CARGA BAJO DEMANDA: Traer solo la parte del índice necesaria
        const docs = await db.getFromStore(db.stores.search_index, term);
        if (!docs) continue;

        const idf = Math.log(this.documentCount / (docs.length || 1)) + 1;
        for (const doc of docs) {
          const score = doc.count * idf;
          if (!patientMatches[doc.nhc]) {
            patientMatches[doc.nhc] = { nhc: doc.nhc, totalScore: 0, registros: {} };
          }
          patientMatches[doc.nhc].totalScore += score;
          const regId = `${doc.idToma}_${doc.ordenToma}`;
          if (!patientMatches[doc.nhc].registros[regId]) {
            patientMatches[doc.nhc].registros[regId] = { idToma: doc.idToma, ordenToma: doc.ordenToma, score: 0 };
          }
          patientMatches[doc.nhc].registros[regId].score += score;
        }
      }
    };

    await processTerms(must);
    await processTerms(should);

    const mustNotNhcs = new Set<string>();
    for (const term of mustNot) {
      const matchingIndexTerms = Object.keys(this.index).filter(t => t.includes(term));
      for (const indexTerm of matchingIndexTerms) {
        this.index[indexTerm].forEach(doc => mustNotNhcs.add(doc.nhc));
      }
    }

    let results: SearchResult[] = [];
    
    for (const nhc in patientMatches) {
      if (mustNotNhcs.has(nhc)) continue;

      const pm = patientMatches[nhc];
      const flatRegistros = Object.values(pm.registros).sort((a, b) => b.score - a.score);
      
      if (flatRegistros.length === 0) continue;

      // Verificación Booleana Estricta sobre el índice (no sobre el registro físico)
      // Para 100k pacientes, esto es vital para evitar el acceso a disco/memoria RAM masiva
      const uniqueTomasCount = new Set(flatRegistros.map(r => r.idToma)).size;

      results.push({
        nhc: pm.nhc,
        patient: { nhc: pm.nhc, demographics: {}, tomas: {} }, // Placeholder
        totalScore: pm.totalScore,
        matchingTomasCount: uniqueTomasCount,
        bestMatchUrl: { idToma: flatRegistros[0].idToma, ordenToma: flatRegistros[0].ordenToma },
        matchedRegistros: flatRegistros
      });
    }

    return this.applyFiltersAndSort(results, filters);
  }

  private async getAllRecords(filters?: { dateRange?: [string, string], service?: string }): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    // Consultamos todos los NHCs desde el almacén de pacientes
    const database = await db.open();
    const transaction = database.transaction(db.stores.patients, 'readonly');
    const store = transaction.objectStore(db.stores.patients);
    const keysRequest = store.getAllKeys();

    return new Promise((resolve) => {
      keysRequest.onsuccess = () => {
        const nhcs = keysRequest.result as string[];
        for (const nhc of nhcs) {
          results.push({
            nhc,
            patient: { nhc, demographics: {}, tomas: {} }, 
            totalScore: 1,
            matchingTomasCount: 1,
            bestMatchUrl: { idToma: 'N/A', ordenToma: 0 },
            matchedRegistros: []
          });
        }
        resolve(this.applyFiltersAndSort(results, filters));
      };
    });
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
