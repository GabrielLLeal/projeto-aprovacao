export type AiMaterial = {
  id: string;
  topicId: string;
  name: string;
  type: string;
  size: number;
  addedAt: string;
  text: string;
  dataUrl?: string;
};

export type AiMessage = {
  id: string;
  topicId: string;
  role: "user" | "assistant";
  text: string;
  sources: string[];
  createdAt: string;
};

const DB_NAME = "projeto-aprovacao-ai";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("materials")) db.createObjectStore("materials", { keyPath: "id" });
      if (!db.objectStoreNames.contains("messages")) db.createObjectStore("messages", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transaction<T>(store: string, mode: IDBTransactionMode, action: (objectStore: IDBObjectStore, done: (value: T) => void, fail: (error: unknown) => void) => void): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    action(tx.objectStore(store), resolve, reject);
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listMaterials(topicId: string): Promise<AiMaterial[]> {
  return transaction<AiMaterial[]>("materials", "readonly", (store, done, fail) => {
    const request = store.getAll();
    request.onsuccess = () => done((request.result as AiMaterial[]).filter(item => item.topicId === topicId));
    request.onerror = () => fail(request.error);
  });
}

export async function putMaterial(material: AiMaterial): Promise<void> {
  await transaction<void>("materials", "readwrite", (store, done, fail) => {
    const request = store.put(material);
    request.onsuccess = () => done(undefined);
    request.onerror = () => fail(request.error);
  });
}

export async function deleteMaterial(id: string): Promise<void> {
  await transaction<void>("materials", "readwrite", (store, done, fail) => {
    const request = store.delete(id);
    request.onsuccess = () => done(undefined);
    request.onerror = () => fail(request.error);
  });
}

export async function listMessages(topicId: string): Promise<AiMessage[]> {
  return transaction<AiMessage[]>("messages", "readonly", (store, done, fail) => {
    const request = store.getAll();
    request.onsuccess = () => done((request.result as AiMessage[]).filter(item => item.topicId === topicId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
    request.onerror = () => fail(request.error);
  });
}

export async function putMessage(message: AiMessage): Promise<void> {
  await transaction<void>("messages", "readwrite", (store, done, fail) => {
    const request = store.put(message);
    request.onsuccess = () => done(undefined);
    request.onerror = () => fail(request.error);
  });
}
