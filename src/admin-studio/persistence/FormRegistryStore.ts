import { FormMapping } from '../../core/mappings';
import { db as coreDb } from '../../storage/indexedDB';

export interface StoredForm {
  id: string;
  name: string;
  version: number;
  createdAt: number;
  updatedAt: number;
  payload: FormMapping;
}

export class FormRegistryStore {
  private readonly dbName = 'QueryclinRegistryDB';
  private readonly storeName = 'forms';
  private readonly version = 1;
  private dbInstance: IDBDatabase | null = null;

  private async openDB(): Promise<IDBDatabase> {
    if (this.dbInstance) return this.dbInstance;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };

      request.onsuccess = () => {
        this.dbInstance = request.result;
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private async getKeys(): Promise<string[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private async getByKey(key: string): Promise<StoredForm | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Intenta obtener la versión activa del esquema desde el coreDb de Queryclin
   */
  private async tryGetSchemaVersion(id: string): Promise<number | null> {
    try {
      const activeKey = `ACTIVE_VERSION_${id}`;
      const activeVersionStr = await coreDb.getFromStore(coreDb.stores.clinical_schemas, activeKey);
      if (activeVersionStr) {
        const parsed = parseFloat(activeVersionStr);
        if (!isNaN(parsed)) return parsed;
      }
    } catch (e) {
      console.warn(`[FormRegistryStore] No se pudo obtener la versión activa del esquema para ${id}:`, e);
    }
    return null;
  }

  /**
   * Guarda un formulario. Si no se especifica versión, se intenta obtener de las versiones existentes.
   */
  async saveForm(form: FormMapping, version?: number): Promise<void> {
    // Eliminar la marca de borrado si existía para reactivarlo
    try {
      await this.undeleteForm(form.id);
    } catch (e) {
      console.warn(`[FormRegistryStore] Error al remover tombstone de eliminación para ${form.id}:`, e);
    }

    let finalVersion = version;

    if (finalVersion === undefined) {
      // 1. Intentar obtener la versión activa del esquema actual
      const schemaVer = await this.tryGetSchemaVersion(form.id);
      if (schemaVer !== null) {
        finalVersion = schemaVer;
      } else {
        // 2. Buscar en las versiones guardadas locales de este formulario
        const allVersions = await this.getAllVersionsOfForm(form.id);
        if (allVersions.length > 0) {
          const maxVer = Math.max(...allVersions.map(v => v.version));
          finalVersion = maxVer; // Sobrescribe la versión existente
        } else {
          finalVersion = 1.0;
        }
      }
    }

    const key = `${form.id}_v${finalVersion}`;
    const existing = await this.getByKey(key);

    const storedForm: StoredForm = {
      id: form.id,
      name: form.name,
      version: finalVersion,
      createdAt: existing ? existing.createdAt : Date.now(),
      updatedAt: Date.now(),
      payload: form,
    };

    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(storedForm, key);

      request.onsuccess = () => {
        console.log(`[FormRegistryStore] Formulario ${form.name} guardado con clave ${key}`);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Obtiene la versión más reciente de un formulario específico por su ID.
   */
  async getForm(id: string): Promise<StoredForm | null> {
    const versions = await this.getAllVersionsOfForm(id);
    if (versions.length === 0) return null;
    // Retornar la versión más alta
    return versions.sort((a, b) => b.version - a.version)[0];
  }

  /**
   * Obtiene todas las versiones de un formulario específico.
   */
  async getAllVersionsOfForm(id: string): Promise<StoredForm[]> {
    const keys = await this.getKeys();
    const relevantKeys = keys.filter(k => k.startsWith(`${id}_v`));
    
    if (relevantKeys.length === 0) return [];

    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const results: StoredForm[] = [];
      let count = 0;

      relevantKeys.forEach(key => {
        const request = store.get(key);
        request.onsuccess = () => {
          if (request.result) results.push(request.result);
          count++;
          if (count === relevantKeys.length) resolve(results);
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  /**
   * Obtiene la versión más reciente de todos los formularios guardados.
   */
  async getAllForms(): Promise<StoredForm[]> {
    const keys = (await this.getKeys()).filter(k => !k.startsWith('DELETED_'));
    if (keys.length === 0) return [];

    const db = await this.openDB();
    const allStored: StoredForm[] = await new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const results: StoredForm[] = [];
      let count = 0;

      keys.forEach(key => {
        const request = store.get(key);
        request.onsuccess = () => {
          if (request.result) results.push(request.result);
          count++;
          if (count === keys.length) resolve(results);
        };
        request.onerror = () => reject(request.error);
      });
    });

    // Agrupar por ID y quedarse con la versión más reciente
    const latestMap = new Map<string, StoredForm>();
    for (const item of allStored) {
      if (item && item.id) {
        const existing = latestMap.get(item.id);
        if (!existing || item.version > existing.version) {
          latestMap.set(item.id, item);
        }
      }
    }

    return Array.from(latestMap.values());
  }

  /**
   * Marca un formulario como eliminado agregando una marca de borrado (tombstone).
   */
  async markFormAsDeleted(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(true, `DELETED_${id}`);

      request.onsuccess = () => {
        console.log(`[FormRegistryStore] Tombstone de eliminación creado para: ${id}`);
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Elimina la marca de borrado de un formulario (para reactivación).
   */
  async undeleteForm(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(`DELETED_${id}`);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtiene la lista de IDs de formularios marcados como eliminados.
   */
  async getDeletedFormIds(): Promise<Set<string>> {
    const keys = await this.getKeys();
    const deletedKeys = keys.filter(k => k.startsWith('DELETED_'));
    const deletedIds = deletedKeys.map(k => k.replace('DELETED_', ''));
    return new Set(deletedIds);
  }

  /**
   * Elimina todas las versiones de un formulario por su ID y lo marca como eliminado.
   */
  async deleteForm(id: string): Promise<void> {
    const keys = await this.getKeys();
    const targetKeys = keys.filter(k => k.startsWith(`${id}_v`));

    const db = await this.openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      targetKeys.forEach(key => store.delete(key));

      transaction.oncomplete = () => {
        console.log(`[FormRegistryStore] Formulario ${id} (todas las versiones) eliminado de IndexedDB.`);
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });

    // Guardar marca de borrado (tombstone)
    await this.markFormAsDeleted(id);
  }

  /**
   * Limpia todo el almacén de registros.
   */
  async clearAll(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('[FormRegistryStore] Todos los formularios borrados de la persistencia.');
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

export const formRegistryStore = new FormRegistryStore();
