import { FORMS } from '../../core/mappings';
import { ClinicalFormSchema, ClinicalSection, ClinicalGroup, ClinicalField } from '../domain/types';

/**
 * Generador de Esquemas basados en Plantillas Canónicas (ALG, MIR, OBS).
 * Permite clonar la estructura original de Queryclin para crear versiones personalizadas.
 */
export class TemplateGenerator {
  
  static generateFromTemplate(formId: string): ClinicalFormSchema | null {
    const mapping = FORMS.find(f => f.id === formId);
    if (!mapping) return null;

    const sections: ClinicalSection[] = [];
    const sectionMap: Record<string, ClinicalSection> = {};

    // Mapear visualCategories a Secciones y Grupos
    Object.entries(mapping.visualCategories).forEach(([catKey, fields], index) => {
      const parts = catKey.split('>').map(s => s.trim());
      const sectionTitle = parts[0];
      const groupTitle = parts[1] || 'GENERAL';

      let section = sectionMap[sectionTitle];
      if (!section) {
        section = {
          id: `sec-${sectionTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          title: sectionTitle,
          order: index + 1,
          collapsible: false,
          groups: []
        };
        sectionMap[sectionTitle] = section;
        sections.push(section);
      }

      const group: ClinicalGroup = {
        id: `grp-${groupTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${index}`,
        title: groupTitle,
        layout: groupTitle.includes('CONSTANTES') || groupTitle.includes('ANALITICA') ? 'grid' : 'stack',
        columns: 4,
        fields: fields.map((f, fIdx) => ({
          id: `fld-${f.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${fIdx}`,
          sourceField: f,
          label: f,
          type: f.length > 50 ? 'textarea' : 'text',
          visible: true,
          searchable: true,
          highlightable: true,
          multiline: f.length > 50
        }))
      };

      section.groups.push(group);
    });

    return {
      id: `schema-tpl-${formId}-${Date.now()}`,
      name: `${mapping.name} (Copia Personalizada)`,
      version: '1.0',
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      header: [{
        id: 'hdr-1',
        layout: 'grid',
        fields: Object.entries(mapping.headerAliases || {}).map(([key, aliases]) => ({
          id: `hdr-fld-${key.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          sourceField: aliases[0] || key,
          label: key,
          type: 'text',
          visible: true,
          searchable: true,
          highlightable: true
        }))
      }],
      sidebar: [],
      sections: sections.sort((a, b) => a.order - b.order),
      unassignedFields: []
    };
  }

  static getAvailableTemplates() {
    return FORMS.map(f => ({ id: f.id, name: f.name }));
  }
}
