import { FormMapping } from '../../core/mappings';
import { serializeForm } from './formSerializer';

/**
 * Serializa y descarga automáticamente un archivo JSON con la definición del formulario.
 */
export function exportFormToJSON(form: FormMapping, version: number): void {
  const serialized = serializeForm(form, version);
  const jsonString = JSON.stringify(serialized, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  const timestamp = Date.now();
  const cleanName = form.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  a.href = url;
  a.download = `form-${cleanName}-${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Cleanup
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}
