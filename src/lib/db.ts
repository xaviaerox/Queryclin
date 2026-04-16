/**
 * DB optimizada para Big Data: Soporte para índice fragmentado.
 */
export const db = {
  dbName: 'QueryclinDB',
  version: 3,
  stores: {
    patients: 'patients',
    metadata: 'metadata',
    search_index: 'search_index' // Almacenamiento por término
  },

  open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onupgradeneeded = (e: any) => {
        const database = e.target.result;
        Object.values(this.stores).forEach(storeName => {
          if (!database.objectStoreNames.contains(storeName)) {
            database.createObjectStore(storeName);
          }
        });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async saveBatch(storeName: string, items: Record<string, any>): Promise<void> {
    const database = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      for (const key in items) {
        store.put(items[key], key);
      }
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  async getFromStore(storeName: string, key: string): Promise<any> {
    const database = await this.open();
    const transaction = database.transaction(storeName, 'readonly');
    const request = transaction.objectStore(storeName).get(key);
    return new Promise(r => request.onsuccess = () => r(request.result));
  },

  async clear(): Promise<void> {
    const database = await this.open();
    const tx = database.transaction(Object.values(this.stores), 'readwrite');
    Object.values(this.stores).forEach(s => tx.objectStore(s).clear());
  }
};
