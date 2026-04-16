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
    const nhcKey = Object.keys(record).find(k => k.toUpperCase().includes('N.H.C')) || 'N.H.C';
    const idTomaKey = Object.keys(record).find(k => k.toUpperCase().includes('ID_TOMA')) || 'ID_Toma';
    const ordenTomaKey = Object.keys(record).find(k => k.toUpperCase().includes('ORDEN_TOMA')) || 'Orden_Toma';

    const nhc = record[nhcKey];
    const idToma = record[idTomaKey];
    const ordenTomaStr = record[ordenTomaKey];
    
    if (!nhc) continue; // Skip invalid records

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

export const storage = {
  saveData: (data: HCEData) => {
    try {
      localStorage.setItem('hce_data', JSON.stringify(data));
    } catch (e) {
      console.error("Error saving to localStorage", e);
    }
  },
  loadData: (): HCEData | null => {
    try {
      const data = localStorage.getItem('hce_data');
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      // Validar compatibilidad de la base de datos local contra el refactor
      const firstPatient = Object.values(parsed.patients)[0] as any;
      if (firstPatient && firstPatient.episodes && !firstPatient.tomas) {
        console.warn("Detectado esquema de datos antiguo (Episodios). Purgando caché para forzar esquema de Tomas.");
        storage.clearData();
        return null;
      }
      
      return parsed;
    } catch (e) {
      console.error("Error loading from localStorage", e);
      return null;
    }
  },
  clearData: () => {
    localStorage.removeItem('hce_data');
    localStorage.removeItem('hce_index');
  }
};
