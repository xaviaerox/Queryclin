import { HCEData, Patient, RegistroToma } from './dataStore';
import { db } from './db';

export interface SearchResult {
  nhc: string;
  patient: any; // Usamos any porque ahora es un esqueleto fragmentado
  totalScore: number;
  matchingTomasCount: number;
  bestMatchUrl: { idToma: string; ordenToma: number };
  matchedRegistros: { idToma: string; ordenToma: number; score: number; record?: RegistroToma }[];
}

export class SearchEngine {
  private documentCount = 0;
  private patientSkeletons: Record<string, any> = {};
  private data: HCEData | null = null;

  async buildIndex(data: HCEData) {
    if (!data || !data.patients) {
      console.warn("[SearchEngine] Intento de indexación sin datos válidos.");
      return;
    }
    
    let index: Record<string, any> = {};
    this.documentCount = 0;
    const skeletons: Record<string, any> = {};

    for (const nhc in data.patients) {
      const patient = data.patients[nhc];
      // Esqueleto optimizado con resumen de servicios y fechas para filtros instantáneos
      skeletons[nhc] = { 
        nhc: patient.nhc, 
        demographics: patient.demographics, 
        services: new Set<string>(),
        dates: { start: Infinity, end: -Infinity }
      };

      for (const idToma in patient.tomas) {
        for (const registro of patient.tomas[idToma].registros) {
          this.documentCount++;
          
          // Indexación de atributos para filtros rápidos
          const srvKey = Object.keys(registro.data).find(k => k.toUpperCase().includes('SERVICIO') || k.toUpperCase().includes('PROCESO'));
          if (srvKey && registro.data[srvKey]) {
            skeletons[nhc].services.add(registro.data[srvKey].toLowerCase());
          }
          
          const dateKey = Object.keys(registro.data).find(k => k.toUpperCase().includes('FECHA_TOMA'));
          if (dateKey && registro.data[dateKey]) {
             let dateStr = registro.data[dateKey];
             if (dateStr.includes('/')) {
               const parts = dateStr.split('/');
               if (parts.length === 3) dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
             }
             const time = new Date(dateStr).getTime();
             if (!isNaN(time)) {
               skeletons[nhc].dates.start = Math.min(skeletons[nhc].dates.start, time);
               skeletons[nhc].dates.end = Math.max(skeletons[nhc].dates.end, time);
             }
          }

          const tokens = this.tokenizeRecord(registro.data);
          const termCounts: Record<string, number> = {};
          for (const token of tokens) termCounts[token] = (termCounts[token] || 0) + 1;

          for (const term in termCounts) {
            if (!index[term]) index[term] = [];
            index[term].push({ nhc, idToma, ordenToma: registro.ordenToma, count: termCounts[term] });
          }
        }
      }
      // Convertir Set a Array para persistencia
      skeletons[nhc].services = Array.from(skeletons[nhc].services);
    }

    console.log(`[SearchEngine] Indexación completada. Guardando metadatos fragmentados...`);
    
    // Guardar esqueletos fragmentados para evitar límites de IDB (100k registros)
    const nhcs = Object.keys(skeletons);
    const skeletonBatchSize = 5000;
    let fragmentCount = 0;
    for (let i = 0; i < nhcs.length; i += skeletonBatchSize) {
      const slice = nhcs.slice(i, i + skeletonBatchSize);
      const batch: Record<string, any> = {};
      slice.forEach(nhc => batch[nhc] = skeletons[nhc]);
      await db.saveBatch(db.stores.metadata, { [`skeletons_frag_${fragmentCount}`]: batch });
      fragmentCount++;
    }

    await db.saveBatch(db.stores.metadata, { 
      'skeleton_fragments': fragmentCount, 
      'document_count': this.documentCount 
    });
    
    // Guardar índice fragmentado por términos
    const terms = Object.keys(index);
    const termBatchSize = 2000;
    for (let i = 0; i < terms.length; i += termBatchSize) {
      const batch: Record<string, any> = {};
      const slice = terms.slice(i, i + termBatchSize);
      slice.forEach(t => batch[t] = index[t]);
      await db.saveBatch(db.stores.search_index, batch);
      slice.forEach(t => delete index[t]);
    }
  }

  async loadIndex(data: HCEData) {
    this.data = data;
    this.patientSkeletons = {};
    const fragCount = await db.getFromStore(db.stores.metadata, 'skeleton_fragments');
    const docCount = await db.getFromStore(db.stores.metadata, 'document_count');
    
    if (fragCount) {
      for (let i = 0; i < fragCount; i++) {
        const frag = await db.getFromStore(db.stores.metadata, `skeletons_frag_${i}`);
        if (frag) Object.assign(this.patientSkeletons, frag);
      }
    }
    if (docCount) this.documentCount = docCount;
  }

  private tokenize(text: string): string[] {
    if (!text) return [];
    // Soporte para términos cortos (pH, O2) e indicadores clínicos
    return text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .split(/[^a-z0-9]+/)
      .filter(t => t.length >= 1); // Reducido para capturar códigos y abreviaturas
  }

  private tokenizeRecord(record: Record<string, string>): string[] {
    const tokens: string[] = [];
    const values = Object.values(record);
    for (const val of values) {
      if (val) tokens.push(...this.tokenize(val));
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
      
      if (prev === 'NOT' || term.startsWith('-')) {
        mustNot.push(...tokens);
      } else if (rawTerms[i+1]?.toUpperCase() === 'OR' || prev === 'OR') {
        should.push(...tokens);
      } else {
        must.push(...tokens);
      }
    }

    if (must.length === 0 && should.length === 0) return await this.getAllRecords(filters);

    const patientMatches: Record<string, any> = {};
    
    const processTerms = async (terms: string[]) => {
      for (const term of terms) {
        // CARGA BAJO DEMANDA de la DB
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

    // CORRECCIÓN NOT: Consultar individualmente en la base de datos
    const mustNotNhcs = new Set<string>();
    for (const term of mustNot) {
      const docs = await db.getFromStore(db.stores.search_index, term);
      if (docs) docs.forEach((doc: any) => mustNotNhcs.add(doc.nhc));
    }

    let results: SearchResult[] = [];
    for (const nhc in patientMatches) {
      if (mustNotNhcs.has(nhc)) continue;

      const pm = patientMatches[nhc];
      const flatRegistros = Object.values(pm.registros).sort((a: any, b: any) => b.score - a.score);
      
      if (flatRegistros.length === 0) continue;

      const uniqueTomasCount = new Set(flatRegistros.map((r: any) => r.idToma)).size;

      results.push({
        nhc: pm.nhc,
        patient: this.patientSkeletons[pm.nhc] || { nhc: pm.nhc, demographics: {}, tomas: {} },
        totalScore: pm.totalScore,
        matchingTomasCount: uniqueTomasCount,
        bestMatchUrl: { idToma: (flatRegistros[0] as any).idToma, ordenToma: (flatRegistros[0] as any).ordenToma },
        matchedRegistros: flatRegistros as any
      });
    }

    return this.applyFiltersAndSort(results, filters);
  }

  private async getAllRecords(filters?: { dateRange?: [string, string], service?: string }): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const nhcs = Object.keys(this.patientSkeletons);
    
    for (const nhc of nhcs) {
      results.push({
        nhc,
        patient: this.patientSkeletons[nhc],
        totalScore: 1,
        matchingTomasCount: 1,
        bestMatchUrl: { idToma: 'N/A', ordenToma: 0 },
        matchedRegistros: []
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
          const skel = this.patientSkeletons[res.nhc];
          if (!skel || !skel.dates) return false;
          // Optimización: Si el rango del paciente no solapa con el filtro, descartar
          return !(skel.dates.end < start || skel.dates.start > end);
        });
      }

      if (filters.service) {
        const srv = filters.service.toLowerCase();
        filtered = filtered.filter(res => {
          const skel = this.patientSkeletons[res.nhc];
          if (!skel || !skel.services) return false;
          return skel.services.some((s: string) => s.includes(srv));
        });
      }
    }

    return filtered.sort((a, b) => b.totalScore - a.totalScore);
  }
}

export const searchEngine = new SearchEngine();
