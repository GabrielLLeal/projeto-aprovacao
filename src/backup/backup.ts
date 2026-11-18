/** Backup portátil dos dados locais do Projeto Aprovação. */
const PREFIX = "pa-v2-";
const DB_NAME = "projeto-aprovacao-ai";
const STORES = ["materials", "messages"] as const;
const FORMAT = "projeto-aprovacao-backup";

type Backup = {
  format: typeof FORMAT;
  version: 1;
  exportedAt: string;
  local: Record<string, string>;
  indexedDb: Record<string, Array<{ id: string; [key: string]: unknown }>>;
};

function snapshotLocal(): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) result[key] = localStorage.getItem(key) ?? "";
  }
  return result;
}

function replaceLocal(data: Record<string, string>): void {
  for (const key of Object.keys(snapshotLocal())) localStorage.removeItem(key);
  for (const [key, value] of Object.entries(data)) localStorage.setItem(key, value);
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      for (const name of STORES) {
        if (!request.result.objectStoreNames.contains(name)) {
          request.result.createObjectStore(name, { keyPath: "id" });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function readStore(db: IDBDatabase, name: string): Promise<Backup["indexedDb"][string]> {
  return new Promise((resolve, reject) => {
    const request = db.transaction(name, "readonly").objectStore(name).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function validate(value: unknown): asserts value is Backup {
  if (!value || typeof value !== "object") throw new Error("Backup inválido.");
  const data = value as Partial<Backup>;
  if (data.format !== FORMAT || data.version !== 1 ||
      !data.local || typeof data.local !== "object" || Array.isArray(data.local) ||
      !data.indexedDb || typeof data.indexedDb !== "object") {
    throw new Error("Formato de backup não reconhecido.");
  }
  if (Object.entries(data.local).some(([key, val]) => !key.startsWith(PREFIX) || typeof val !== "string")) {
    throw new Error("Dados locais inválidos.");
  }
  for (const name of STORES) {
    const records = data.indexedDb[name];
    if (!Array.isArray(records) || records.some(record =>
      !record || typeof record !== "object" || typeof record.id !== "string")) {
      throw new Error(`Registros inválidos: ${name}.`);
    }
  }
}

export async function createBackup(): Promise<void> {
  const db = await openDb();
  let indexedDb: Backup["indexedDb"];
  try {
    const [materials, messages] = await Promise.all(STORES.map(name => readStore(db, name)));
    indexedDb = { materials, messages };
  } finally {
    db.close();
  }
  const data: Backup = {
    format: FORMAT, version: 1, exportedAt: new Date().toISOString(),
    local: snapshotLocal(), indexedDb
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `projeto-aprovacao-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function restoreBackup(file: File): Promise<boolean> {
  if (file.size > 100 * 1024 * 1024) throw new Error("Backup excede 100 MB.");
  const parsed: unknown = JSON.parse(await file.text());
  validate(parsed);
  if (!window.confirm("A restauração substituirá os dados deste navegador. Faça um backup antes. Continuar?")) return false;

  // O IndexedDB é restaurado numa transação atômica. Se falhar, recuperamos o localStorage.
  const previousLocal = snapshotLocal();
  try {
    replaceLocal(parsed.local);
  } catch (error) {
    try { replaceLocal(previousLocal); } catch {
      throw new Error("Falha no armazenamento local e na recuperação. Não recarregue a página; exporte os dados que ainda estiverem disponíveis.");
    }
    throw error;
  }

  let db: IDBDatabase;
  try {
    db = await openDb();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction([...STORES], "readwrite");
        tx.oncomplete = () => resolve();
        tx.onabort = () => reject(tx.error ?? new Error("Restauração interrompida."));
        tx.onerror = () => reject(tx.error ?? new Error("Erro na restauração."));
        for (const name of STORES) {
          const store = tx.objectStore(name);
          store.clear();
          for (const record of parsed.indexedDb[name]) store.put(record);
        }
      });
    } finally { db.close(); }
  } catch (error) {
    try { replaceLocal(previousLocal); } catch {
      throw new Error("Falha ao recuperar os dados locais após erro no IndexedDB. Não recarregue a página.");
    }
    throw error;
  }
  window.location.reload();
  return true;
}
