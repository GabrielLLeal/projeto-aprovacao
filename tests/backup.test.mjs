import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function environment(initial = {}) {
  const local = new Map(Object.entries(initial));
  const stores = { materials: [], messages: [] };
  let confirms = true;
  let reloads = 0;
  let failLocalOnce = false;
  const localStorage = {
    get length() { return local.size; },
    key(i) { return [...local.keys()][i] ?? null; },
    getItem(k) { return local.get(k) ?? null; },
    setItem(k, v) {
      if (failLocalOnce) { failLocalOnce = false; throw new Error("QuotaExceededError"); }
      local.set(k, String(v));
    },
    removeItem(k) { local.delete(k); }
  };
  const db = {
    objectStoreNames: { contains: name => name in stores },
    createObjectStore(name) { stores[name] = []; },
    close() {},
    transaction(names, mode) {
      const tx = { error: null, oncomplete: null, onabort: null, onerror: null };
      let pending = 0;
      let scheduled = false;
      const finish = () => {
        if (scheduled) return;
        scheduled = true;
        setImmediate(() => {
          scheduled = false;
          if (pending === 0) tx.oncomplete?.();
        });
      };
      tx.objectStore = name => ({
        getAll() {
          const req = { result: null, onsuccess: null, onerror: null };
          pending++;
          queueMicrotask(() => {
            req.result = structuredClone(stores[name]);
            pending--;
            req.onsuccess?.();
            finish();
          });
          return req;
        },
        clear() { stores[name] = []; finish(); },
        put(record) { stores[name].push(structuredClone(record)); finish(); }
      });
      finish();
      return tx;
    }
  };
  const indexedDB = {
    open() {
      const req = { result: db, onsuccess: null, onerror: null, onupgradeneeded: null };
      queueMicrotask(() => req.onsuccess?.());
      return req;
    }
  };
  const document = {
    body: { appendChild() {} },
    createElement() { return { click() {}, remove() {} }; }
  };
  const URL = { createObjectURL() { return "blob:mock"; }, revokeObjectURL() {} };
  const exports = {};
  const source = readFileSync(new URL("../src/backup/backup.ts", import.meta.url), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(js, { exports, localStorage, indexedDB, document, URL, Blob, Date, setTimeout, window: { confirm: () => confirms, location: { reload: () => reloads++ } } });
  return { api: exports, local, stores, setConfirm(v) { confirms = v; }, failNextLocalWrite() { failLocalOnce = true; }, get reloads() { return reloads; } };
}
const backup = (local = {}, materials = [], messages = []) => JSON.stringify({
  format: "projeto-aprovacao-backup", version: 1, exportedAt: "2026-11-18T00:00:00Z",
  local, indexedDb: { materials, messages }
});
const file = text => ({ size: text.length, text: async () => text });

test("recusa JSON inválido sem modificar dados", async () => {
  const e = environment({ "pa-v2-essay": "original" });
  await assert.rejects(e.api.restoreBackup(file("{")), SyntaxError);
  assert.equal(e.local.get("pa-v2-essay"), "original");
});

test("recusa chaves fora do namespace do projeto", async () => {
  const e = environment({ "pa-v2-essay": "original" });
  await assert.rejects(e.api.restoreBackup(file(backup({ "outra-chave": "invasao" }))), /Dados locais inválidos/);
  assert.equal(e.local.get("pa-v2-essay"), "original");
});

test("cancelamento não altera nenhum dado", async () => {
  const e = environment({ "pa-v2-essay": "original" });
  e.setConfirm(false);
  assert.equal(await e.api.restoreBackup(file(backup({ "pa-v2-essay": "novo" }))), false);
  assert.equal(e.local.get("pa-v2-essay"), "original");
  assert.equal(e.reloads, 0);
});

test("restaura localStorage e IndexedDB após confirmação", async () => {
  const e = environment({ "pa-v2-essay": "antigo" });
  e.stores.materials.push({ id: "old" });
  const result = await e.api.restoreBackup(file(backup({ "pa-v2-essay": "novo" }, [{ id: "new" }])));
  assert.equal(result, true);
  assert.equal(e.local.get("pa-v2-essay"), "novo");
  assert.deepEqual(e.stores.materials.map(x => x.id), ["new"]);
  assert.equal(e.reloads, 1);
});

test("falha no localStorage reverte IndexedDB e dados locais", async () => {
  const e = environment({ "pa-v2-essay": "antigo" });
  e.stores.materials.push({ id: "old" });
  e.failNextLocalWrite();
  await assert.rejects(e.api.restoreBackup(file(backup({ "pa-v2-essay": "novo" }, [{ id: "new" }))), /QuotaExceededError/);
  assert.equal(e.local.get("pa-v2-essay"), "antigo");
  assert.deepEqual(e.stores.materials.map(x => x.id), ["old"]);
  assert.equal(e.reloads, 0);
});
