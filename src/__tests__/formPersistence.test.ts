import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateFormJSON } from '../admin-studio/persistence/formImporter';
import { serializeForm, mappingToSchema } from '../admin-studio/persistence/formSerializer';
import { loadRuntimeForms } from '../admin-studio/runtime/runtimeFormsLoader';
import { formRegistryStore } from '../admin-studio/persistence/FormRegistryStore';
import { FormMapping } from '../core/mappings';

vi.mock('../../core/mappings', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../core/mappings')>();
  return {
    ...original,
    RUNTIME_FORMS: [
      {
        id: 'hce_shared_id',
        name: 'Runtime Code Version',
        keys: { nhc: 'NHC', idToma: 'IT', ordenToma: 'OT', fechaToma: 'FT' },
        demographics: {},
        visualCategories: {}
      }
    ]
  };
});

// Mock de la base de datos IndexedDB para pruebas unitarias aisladas
const dbStore: Record<string, any> = {};

const mockRequest = (result: any) => {
  const req = {
    result,
    onsuccess: null as any,
    onerror: null as any,
  };
  setTimeout(() => {
    if (req.onsuccess) req.onsuccess({ target: req });
  }, 0);
  return req;
};

const mockTransaction = {
  objectStore: () => ({
    get: (key: string) => mockRequest(dbStore[key]),
    put: (val: any, key: string) => {
      dbStore[key] = val;
      return mockRequest(key);
    },
    delete: (key: string) => {
      delete dbStore[key];
      return mockRequest(key);
    },
    getAllKeys: () => mockRequest(Object.keys(dbStore)),
    clear: () => {
      for (const k in dbStore) delete dbStore[k];
      return mockRequest(null);
    }
  }),
  oncomplete: null as any,
  onerror: null as any,
};

const mockDB = {
  transaction: () => {
    setTimeout(() => {
      if (mockTransaction.oncomplete) mockTransaction.oncomplete();
    }, 0);
    return mockTransaction;
  },
  objectStoreNames: {
    contains: () => true
  },
  close: () => {}
};

vi.stubGlobal('indexedDB', {
  open: () => mockRequest(mockDB)
});

// Mock de la base de datos principal de Queryclin
vi.mock('../../storage/indexedDB', () => ({
  db: {
    stores: {
      clinical_schemas: 'clinical_schemas'
    },
    getFromStore: vi.fn(async () => '1.0')
  }
}));

describe('Form Registry Layer & Persistence', () => {
  beforeEach(() => {
    // Vaciar el almacén antes de cada prueba
    for (const key in dbStore) {
      delete dbStore[key];
    }
    vi.restoreAllMocks();
  });

  describe('FormRegistryStore', () => {
    it('SaveForm persists correctly and retrieves it', async () => {
      const mockForm: FormMapping = {
        id: 'hce_custom',
        name: 'Custom Form',
        keys: {
          nhc: 'N.H.C',
          idToma: 'Id_Toma',
          ordenToma: 'Orden_Toma',
          fechaToma: 'EC_Fecha_Toma'
        },
        demographics: {},
        visualCategories: {
          '01-DATOS': ['Campo1', 'Campo2']
        }
      };

      await formRegistryStore.saveForm(mockForm, 1.0);
      const stored = await formRegistryStore.getForm('hce_custom');
      
      expect(stored).not.toBeNull();
      expect(stored!.id).toBe('hce_custom');
      expect(stored!.name).toBe('Custom Form');
      expect(stored!.version).toBe(1.0);
      expect(stored!.payload.visualCategories['01-DATOS']).toContain('Campo1');
    });

    it('getAllForms should retrieve only the latest version of each form', async () => {
      const mockForm1: FormMapping = {
        id: 'hce_custom',
        name: 'Custom Form',
        keys: { nhc: 'NHC', idToma: 'IT', ordenToma: 'OT', fechaToma: 'FT' },
        demographics: {},
        visualCategories: {}
      };

      await formRegistryStore.saveForm(mockForm1, 1.0);
      await formRegistryStore.saveForm(mockForm1, 2.0);

      const allForms = await formRegistryStore.getAllForms();
      expect(allForms.length).toBe(1);
      expect(allForms[0].version).toBe(2.0);
    });

    it('deleteForm deletes all versions of the form and sets tombstone, and saveForm clears it', async () => {
      const mockForm: FormMapping = {
        id: 'hce_to_delete',
        name: 'Delete Form',
        keys: { nhc: 'NHC', idToma: 'IT', ordenToma: 'OT', fechaToma: 'FT' },
        demographics: {},
        visualCategories: {}
      };

      await formRegistryStore.saveForm(mockForm, 1.0);
      await formRegistryStore.saveForm(mockForm, 2.0);

      await formRegistryStore.deleteForm('hce_to_delete');
      const stored = await formRegistryStore.getForm('hce_to_delete');
      expect(stored).toBeNull();

      // Verificar que el ID está marcado como eliminado
      let deletedIds = await formRegistryStore.getDeletedFormIds();
      expect(deletedIds.has('hce_to_delete')).toBe(true);

      // Re-guardar debe eliminar la marca de borrado
      await formRegistryStore.saveForm(mockForm, 1.0);
      deletedIds = await formRegistryStore.getDeletedFormIds();
      expect(deletedIds.has('hce_to_delete')).toBe(false);
    });
  });

  describe('formSerializer', () => {
    it('serializeForm creates correct payload structure', () => {
      const mockForm: FormMapping = {
        id: 'hce_custom',
        name: 'Custom Form',
        keys: { nhc: 'NHC', idToma: 'IT', ordenToma: 'OT', fechaToma: 'FT' },
        demographics: {},
        visualCategories: {}
      };

      const serialized = serializeForm(mockForm, 1.2);
      expect(serialized.version).toBe(1.2);
      expect(serialized.form.id).toBe('hce_custom');
      expect(serialized.createdAt).toBeLessThanOrEqual(Date.now());
    });

    it('mappingToSchema reconstructs design FormSchema structure', () => {
      const mockForm: FormMapping = {
        id: 'hce_custom',
        name: 'Custom Form',
        keys: { nhc: 'NHC', idToma: 'IT', ordenToma: 'OT', fechaToma: 'FT' },
        demographics: { cp: 'CP' },
        visualCategories: {
          '01-SECCION': ['Field1', 'Field2$SubValue']
        }
      };

      const schema = mappingToSchema(mockForm, '1.5');
      expect(schema.id).toBe('hce_custom');
      expect(schema.name).toBe('Custom Form');
      expect(schema.version).toBe('1.5');
      expect(schema.demographics!.cp).toBe('CP');
      expect(schema.sections.length).toBe(1);
      expect(schema.sections[0].title).toBe('01-SECCION');
      expect(schema.sections[0].groups[0].fields.length).toBe(2);
    });
  });

  describe('formImporter', () => {
    it('validateFormJSON should validate correct schema', () => {
      const validPayload = {
        version: 1,
        createdAt: Date.now(),
        form: {
          id: 'hce_valid',
          name: 'Valid Form',
          keys: {
            nhc: 'NHC',
            idToma: 'Id_Toma',
            ordenToma: 'Orden_Toma',
            fechaToma: 'EC_Fecha_Toma'
          },
          visualCategories: {
            '01-CATEGORIA': ['Campo1']
          }
        }
      };

      const res = validateFormJSON(validPayload);
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('validateFormJSON should catch invalid schemas missing properties', () => {
      const invalidPayload = {
        version: 1,
        createdAt: Date.now(),
        form: {
          id: 'hce_invalid',
          // Falta name y keys
          visualCategories: {}
        }
      };

      const res = validateFormJSON(invalidPayload);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Falta la propiedad "name"');
    });
  });

  describe('runtimeFormsLoader', () => {
    it('loadRuntimeForms merges static + dynamic and prevents static overwriting', async () => {
      // 1. Simular que el registro de IndexedDB devuelve un formulario con ID 'hce_alg' (que es estático) y otro 'hce_new_dynamic' (aditivo)
      const mockDynamicForms = [
        {
          id: 'hce_alg', // ID estático en conflicto
          name: 'Dynamic HCE-ALG',
          version: 1.0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          payload: {
            id: 'hce_alg',
            name: 'Dynamic HCE-ALG',
            keys: { nhc: 'NHC', idToma: 'IT', ordenToma: 'OT', fechaToma: 'FT' },
            demographics: {},
            visualCategories: {}
          }
        },
        {
          id: 'hce_new_dynamic', // Formulario nuevo legítimo
          name: 'New Dynamic Form',
          version: 2.0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          payload: {
            id: 'hce_new_dynamic',
            name: 'New Dynamic Form',
            keys: { nhc: 'NHC', idToma: 'IT', ordenToma: 'OT', fechaToma: 'FT' },
            demographics: {},
            visualCategories: {}
          }
        }
      ];

      vi.spyOn(formRegistryStore, 'getAllForms').mockResolvedValue(mockDynamicForms);

      const merged = await loadRuntimeForms();

      // Verificar que 'hce_alg' es el estático original, no fue sobrescrito
      const algForm = merged.find(f => f.id === 'hce_alg');
      expect(algForm).toBeDefined();
      expect(algForm!.name).toBe('HCE-ALG'); // Nombre estático intacto

      // Verificar que 'hce_new_dynamic' se agregó correctamente
      const dynamicForm = merged.find(f => f.id === 'hce_new_dynamic');
      expect(dynamicForm).toBeDefined();
      expect(dynamicForm!.name).toBe('New Dynamic Form');
    });

    it('loadRuntimeForms filters out forms marked as deleted', async () => {
      const mockDynamicForms = [
        {
          id: 'hce_new_dynamic',
          name: 'New Dynamic Form',
          version: 2.0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          payload: {
            id: 'hce_new_dynamic',
            name: 'New Dynamic Form',
            keys: { nhc: 'NHC', idToma: 'IT', ordenToma: 'OT', fechaToma: 'FT' },
            demographics: {},
            visualCategories: {}
          }
        }
      ];

      vi.spyOn(formRegistryStore, 'getAllForms').mockResolvedValue(mockDynamicForms);
      // Simular que 'hce_new_dynamic' está en el set de borrados
      vi.spyOn(formRegistryStore, 'getDeletedFormIds').mockResolvedValue(new Set(['hce_new_dynamic']));

      const merged = await loadRuntimeForms();

      // No debe cargarse porque está marcado como eliminado
      const dynamicForm = merged.find(f => f.id === 'hce_new_dynamic');
      expect(dynamicForm).toBeUndefined();
    });

    it('loadRuntimeForms overrides RUNTIME_FORMS (mocked as hce_shared_id) with IndexedDB version if IDs match', async () => {
      // RUNTIME_FORMS tiene 'hce_shared_id' con name 'Runtime Code Version'
      // Agregamos en IndexedDB una versión modificada con el mismo ID pero nombre 'IndexedDB Version'
      const mockDynamicForms = [
        {
          id: 'hce_shared_id',
          name: 'IndexedDB Version',
          version: 2.0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          payload: {
            id: 'hce_shared_id',
            name: 'IndexedDB Version',
            keys: { nhc: 'NHC', idToma: 'IT', ordenToma: 'OT', fechaToma: 'FT' },
            demographics: {},
            visualCategories: {}
          }
        }
      ];

      vi.spyOn(formRegistryStore, 'getAllForms').mockResolvedValue(mockDynamicForms);
      vi.spyOn(formRegistryStore, 'getDeletedFormIds').mockResolvedValue(new Set());

      const merged = await loadRuntimeForms();

      // Debe contener la versión de IndexedDB (con nombre 'IndexedDB Version') y no la de RUNTIME_FORMS (nombre 'Runtime Code Version')
      const targetForm = merged.find(f => f.id === 'hce_shared_id');
      expect(targetForm).toBeDefined();
      expect(targetForm!.name).toBe('IndexedDB Version');
    });
  });
});
