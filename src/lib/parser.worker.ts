/**
 * Web Worker Inteligente: Procesa, indexa y guarda directamente en IndexedDB.
 */
import { parseCSV } from './csvParser';
import { groupData } from './dataStore';
import { db } from './db';
import { searchEngine } from './searchEngine';

self.onmessage = async (e: MessageEvent) => {
  const { csvText } = e.data;
  
  try {
    console.log("[Worker] Fase 1: Parseo de CSV (Optimizado)...");
    const records = parseCSV(csvText);
    
    console.log("[Worker] Fase 2: Agrupación lógica de pacientes...");
    const grouped = groupData(records);
    
    // IMPORTANTE: Liberar el string original de memoria lo antes posible
    // (JavaScript no garantiza el recolector de basura inmediato, pero ayuda)
    (e.data.csvText as any) = null;

    console.log("[Worker] Fase 3: Indexación Semántica Fragmentada con Flushing...");
    await searchEngine.buildIndex(grouped);

    console.log("[Worker] Fase 4: Persistencia granular de pacientes...");
    const nhcs = Object.keys(grouped.patients);
    const totalPatients = nhcs.length;
    const batchSize = 1000; // Reducido para mayor suavidad en el hilo principal
    
    for (let i = 0; i < nhcs.length; i += batchSize) {
      const batch: Record<string, any> = {};
      const slice = nhcs.slice(i, i + batchSize);
      slice.forEach(nhc => batch[nhc] = grouped.patients[nhc]);
      await db.saveBatch(db.stores.patients, batch);
      
      // Liberar memoria inmediatamente de los pacientes guardados
      slice.forEach(nhc => delete (grouped.patients as any)[nhc]);
      
      if (i % 5000 === 0 || i + batchSize >= totalPatients) {
        self.postMessage({ 
          type: 'progress',
          progress: Math.min(i + batchSize, totalPatients), 
          total: totalPatients 
        });
      }

    }

    await db.saveBatch(db.stores.metadata, { 'patient_count': totalPatients });
    
    self.postMessage({ 
      success: true, 
      count: totalPatients
    });
    
  } catch (error) {
    console.error("[Worker] Error crítico:", error);
    self.postMessage({ success: false, error: (error as Error).message });
  }
};

