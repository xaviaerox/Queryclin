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
  saveData: async (_data: HCEData) => {
    // Ya no guardamos el monolito hce_data para permitir escalado a 100k.
    // La persistencia ahora la gestiona el worker directamente en los stores fragmentados.
  },
  loadData: async (): Promise<HCEData | null> => {
    // Retornamos un objeto vacío para mantener compatibilidad con el estado de la UI,
    // pero los datos reales se cargan bajo demanda desde db.stores.patients.
    return { patients: {} };
  },
  clearData: async () => {
    await db.clear();
  }
};
