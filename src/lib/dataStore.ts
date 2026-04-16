export interface ClinicalRecord {
  [key: string]: string;
}

export interface RegistroToma {
  ordenToma: number;
  data: ClinicalRecord;
}

export interface Toma {
  idToma: string;
  registros: RegistroToma[];
  // Helper to get the latest record
  latest: RegistroToma;
}

export interface Patient {
  nhc: string;
  tomas: Record<string, Toma>;
  // Demographics from the latest record
  demographics: ClinicalRecord;
}

export interface HCEData {
  patients: Record<string, Patient>;
}

export function groupData(records: ClinicalRecord[]): HCEData {
  const patients: Record<string, Patient> = {};

  for (const record of records) {
    // Find keys for grouping, handling possible variations in case/spacing
    // Normalización de claves para que coincidan con el METAPROMPT (NHC_ID, ID_TOMA, ORDEN_TOMA)
    const nhcKey = Object.keys(record).find(k => k.toUpperCase().replace(/\W/g, '').includes('NHC')) || 'NHC_ID';
    const idTomaKey = Object.keys(record).find(k => k.toUpperCase().includes('ID_TOMA')) || 'ID_TOMA';
    const ordenTomaKey = Object.keys(record).find(k => k.toUpperCase().includes('ORDEN_TOMA')) || 'ORDEN_TOMA';

    const nhc = record[nhcKey];
    const idToma = record[idTomaKey] || 'TOMA_UNICA';
    const ordenTomaStr = record[ordenTomaKey];
    
    if (!nhc) continue; // Si no hay NHC, no podemos indexar el registro

    const ordenToma = parseInt(ordenTomaStr, 10) || 0;

    if (!patients[nhc]) {
      patients[nhc] = {
        nhc,
        tomas: {},
        demographics: record
      };
    }

    if (!patients[nhc].tomas[idToma]) {
      patients[nhc].tomas[idToma] = {
        idToma,
        registros: [],
        latest: { ordenToma: -1, data: {} }
      };
    }

    const toma = patients[nhc].tomas[idToma];
    const registro = { ordenToma, data: record };
    toma.registros.push(registro);

    if (ordenToma > toma.latest.ordenToma) {
      toma.latest = registro;
      // Update demographics to the latest available
      patients[nhc].demographics = record;
    }
  }

  // Sort registros descending
  for (const nhc in patients) {
    for (const idToma in patients[nhc].tomas) {
      patients[nhc].tomas[idToma].registros.sort((a, b) => b.ordenToma - a.ordenToma);
    }
  }

  return { patients };
}

import { db } from './db';

export const storage = {
  saveData: async (data: HCEData) => {
    try {
      // Guardar el monolito entero solo si es pequeño, para grandes volúmenes se usa el worker directamente en los otros almacenes
      await db.saveBatch(db.stores.metadata, { 'hce_data': data });
    } catch (e) {
      console.error("Error saving to IndexedDB", e);
    }
  },
  loadData: async (): Promise<HCEData | null> => {
    try {
      const data = await db.getFromStore(db.stores.metadata, 'hce_data');
      if (!data) return null;
      
      return data;
    } catch (e) {
      console.error("Error loading from IndexedDB", e);
      return null;
    }
  },
  clearData: async () => {
    await db.clear();
    localStorage.removeItem('hce_index'); // El índice ligero aún puede estar en localStorage o limpiarse también
  }
};
