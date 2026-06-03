import { FormMapping } from '../../core/mappings';
import { SerializedForm } from './formSerializer';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: SerializedForm;
}

/**
 * Valida de forma estricta un objeto JSON importado para asegurar que cumple con el contrato de FormMapping.
 */
export function validateFormJSON(jsonObj: any): ValidationResult {
  if (!jsonObj || typeof jsonObj !== 'object') {
    return { valid: false, error: 'El archivo JSON no es un objeto válido.' };
  }

  // 1. Verificar raíces del contenedor de transporte
  if (jsonObj.version === undefined) {
    return { valid: false, error: 'Formato inválido: Falta la propiedad "version".' };
  }
  
  if (typeof jsonObj.version !== 'number') {
    return { valid: false, error: 'Formato inválido: "version" debe ser un número.' };
  }

  if (jsonObj.createdAt === undefined) {
    return { valid: false, error: 'Formato inválido: Falta la propiedad "createdAt".' };
  }

  if (!jsonObj.form || typeof jsonObj.form !== 'object') {
    return { valid: false, error: 'Formato inválido: Falta la propiedad "form" o no es un objeto.' };
  }

  const form = jsonObj.form as FormMapping;

  // 2. Verificar estructura interna de FormMapping
  if (!form.id || typeof form.id !== 'string' || form.id.trim() === '') {
    return { valid: false, error: 'FormMapping inválido: Falta la propiedad "id" del formulario.' };
  }

  if (!form.name || typeof form.name !== 'string' || form.name.trim() === '') {
    return { valid: false, error: 'FormMapping inválido: Falta la propiedad "name" del formulario.' };
  }

  // 3. Verificar sección de claves de localización (keys)
  if (!form.keys || typeof form.keys !== 'object') {
    return { valid: false, error: 'FormMapping inválido: Falta la propiedad "keys" o no es un objeto.' };
  }

  const keys = form.keys;
  if (!keys.nhc || typeof keys.nhc !== 'string' || keys.nhc.trim() === '') {
    return { valid: false, error: 'Claves de localización incompletas: Falta la clave "nhc".' };
  }

  if (!keys.idToma || typeof keys.idToma !== 'string' || keys.idToma.trim() === '') {
    return { valid: false, error: 'Claves de localización incompletas: Falta la clave "idToma".' };
  }

  if (!keys.ordenToma || typeof keys.ordenToma !== 'string' || keys.ordenToma.trim() === '') {
    return { valid: false, error: 'Claves de localización incompletas: Falta la clave "ordenToma".' };
  }

  if (!keys.fechaToma || typeof keys.fechaToma !== 'string' || keys.fechaToma.trim() === '') {
    return { valid: false, error: 'Claves de localización incompletas: Falta la clave "fechaToma".' };
  }

  // 4. Verificar sección de mapeo de visualCategories
  if (!form.visualCategories || typeof form.visualCategories !== 'object' || Array.isArray(form.visualCategories)) {
    return { valid: false, error: 'FormMapping inválido: Falta "visualCategories" o no es un objeto.' };
  }

  for (const [categoryName, fields] of Object.entries(form.visualCategories)) {
    if (!Array.isArray(fields)) {
      return { valid: false, error: `Categoría visual inválida: "${categoryName}" debe contener una lista de campos.` };
    }
    for (const field of fields) {
      if (typeof field !== 'string' || field.trim() === '') {
        return { valid: false, error: `Campo inválido detectado en la categoría "${categoryName}". Todos los campos deben ser texto.` };
      }
    }
  }

  // 5. Verificar sección de demographics si existe
  if (form.demographics && (typeof form.demographics !== 'object' || Array.isArray(form.demographics))) {
    return { valid: false, error: 'FormMapping inválido: "demographics" debe ser un mapa de alias a campos origen.' };
  }

  return {
    valid: true,
    data: jsonObj as SerializedForm
  };
}
