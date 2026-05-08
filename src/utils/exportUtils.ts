import { Patient } from '../core/types';

export type ExportMode = 'all' | 'latest';

/**
 * Transforma el dataset de pacientes para exportación, aplicando consolidación si se requiere.
 * 
 * REGLA CLÍNICA: La "última toma" se calcula por:
 * 1. Mayor Id_Toma
 * 2. Mayor Orden_Toma dentro de ese Id_Toma
 */
export function transformPatientsForExport(patients: Patient[], mode: ExportMode): any[] {
  const exportData: any[] = [];

  patients.forEach(p => {
    if (mode === 'all') {
      // Exportación Completa: Todos los registros de todas las tomas
      Object.values(p.tomas).forEach(toma => {
        toma.registros.forEach(reg => {
          exportData.push({
            'NHC': p.nhc,
            'Identificador_Toma': toma.idToma,
            'Version_Registro': reg.ordenToma,
            ...p.demographics,
            ...reg.data
          });
        });
      });
    } else {
      // Exportación Última Toma: Solo el registro más reciente por paciente
      let latestToma: any = null;
      let latestReg: any = null;

      Object.values(p.tomas).forEach(toma => {
        // Id_Toma suele ser numérico o representable como tal para comparación
        const currentId = Number(toma.idToma);
        const latestId = latestToma ? Number(latestToma.idToma) : -1;

        if (!latestToma || currentId > latestId) {
          latestToma = toma;
          // Al cambiar de toma, reseteamos el registro más reciente
          latestReg = null;
        }

        if (currentId === latestId || !latestReg) {
          toma.registros.forEach(reg => {
            if (!latestReg || reg.ordenToma > latestReg.ordenToma) {
              latestReg = reg;
            }
          });
        }
      });

      if (latestToma && latestReg) {
        exportData.push({
          'NHC': p.nhc,
          'Identificador_Toma': latestToma.idToma,
          'Version_Registro': latestReg.ordenToma,
          ...p.demographics,
          ...latestReg.data
        });
      }
    }
  });

  return exportData;
}
