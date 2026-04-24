/**
 * Utilidades para el parseo heurístico de fechas clínicas.
 */

/**
 * Intenta convertir un string de fecha (en variados formatos clínicos) a un timestamp numérico.
 * Soporta delimitadores mixtos y formatos como DD/MM/YYYY, YYYY-MM-DD, etc.
 * Retorna null si la fecha no es válida.
 */
export const parseClinicalDate = (dateStrRaw: any): number | null => {
  if (!dateStrRaw) return null;
  
  let dateStr = String(dateStrRaw);
  
  if (dateStr.includes('/') || dateStr.includes('-')) {
    const sep = dateStr.includes('/') ? '/' : '-';
    const parts = dateStr.split(sep);
    
    // Si viene en formato DD/MM/YYYY o DD-MM-YYYY, lo invertimos a formato ISO para JS Date
    if (parts.length === 3 && parts[2].length === 4) {
      dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  
  const time = new Date(dateStr).getTime();
  return isNaN(time) ? null : time;
};
