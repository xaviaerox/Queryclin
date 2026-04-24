/**
 * Utilidades de normalización de cadenas de texto para el procesamiento del lenguaje natural clínico.
 */

/**
 * Convierte un string a minúsculas y elimina tildes/diacríticos.
 * Ideal para indexación y comparación de términos.
 */
export const normalizeString = (str: string): string => {
  if (!str) return '';
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Limpia un término a su forma más compacta (solo letras y números),
 * eliminando espacios y caracteres especiales.
 */
export const compactString = (str: string): string => {
  return normalizeString(str).replace(/[^a-z0-9]/g, '');
};
