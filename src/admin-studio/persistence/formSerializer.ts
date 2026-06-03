import { FormMapping } from '../../core/mappings';
import { FormSchema, Section, Field } from '../domain/schema';

export interface SerializedForm {
  version: number;
  createdAt: number;
  form: FormMapping;
}

/**
 * Serializa un FormMapping en la estructura de transporte estándar.
 */
export function serializeForm(form: FormMapping, version: number): SerializedForm {
  return {
    version,
    createdAt: Date.now(),
    form
  };
}

/**
 * Reconstruye un FormSchema básico a partir de un FormMapping para posibilitar su edición en el diseñador visual.
 */
export function mappingToSchema(form: FormMapping, version: string = '1.0'): FormSchema {
  const sections: Section[] = [];
  let order = 1;
  
  if (form.visualCategories) {
    for (const [catName, fields] of Object.entries(form.visualCategories)) {
      const sectionFields: Field[] = fields.map((fieldName, fidx) => {
        const isMultivalue = fieldName.includes('$') || fieldName.toLowerCase().includes('reacciones') || fieldName.toLowerCase().includes('alergia');
        return {
          id: `fld-${form.id}-${order}-${fidx}-${Math.random().toString(36).substring(2, 6)}`,
          sourceField: fieldName,
          label: fieldName.replace(/.*[\$]/, ''),
          type: isMultivalue ? 'multivalue' : 'text',
          searchable: true,
          highlightable: true,
          visible: true,
          multivalue: isMultivalue
        };
      });
      
      sections.push({
        id: `sec-${form.id}-${order}-${Math.random().toString(36).substring(2, 6)}`,
        title: catName,
        order: order++,
        collapsible: true,
        groups: [
          {
            id: `grp-${form.id}-${order}-${Math.random().toString(36).substring(2, 6)}`,
            title: 'Campos',
            layout: 'grid',
            columns: 2,
            fields: sectionFields
          }
        ]
      });
    }
  }
  
  return {
    id: form.id,
    name: form.name,
    version,
    status: 'published',
    header: [],
    sidebar: [],
    sections,
    unassignedFields: [],
    headerAliases: form.headerAliases || {},
    demographics: form.demographics || {},
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

