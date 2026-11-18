import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function environment(initial = {}) {
  const local = new Map(Object.entries(initial));
  const stores = { materials: [], messages: [] };
  let confirms = true;
  let reloads = 0;
  let failLocalOnce = false;
  let exportedBlob = null;
  let downloads = 0;
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
    createElement() { return { click() { downloads++; }, remove() {} }; }
  };
  const mockURL = { createObjectURL(blob) { exportedBlob = blob; return "blob:mock"; }, revokeObjectURL() {} };
  const exports = {};
  const source = readFileSync(new URL("../src/backup/backup.ts", import.meta.url), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(js, { exports, localStorage, indexedDB, document, URL: mockURL, Blob, Date, setTimeout, window: { confirm: () => confirms, location: { reload: () => reloads++ } } });
  return { api: exports, local, stores, setConfirm(v) { confirms = v; }, failNextLocalWrite() { failLocalOnce = true; }, get reloads() { return reloads; }, get exportedBlob() { return exportedBlob; }, get downloads() { return downloads; } };
}
const backup = (local = {}, materials = [], messages = []) => JSON.stringify({
  format: "projeto-aprovacao-backup", version: 1, exportedAt: "2026-11-18T00:00:00Z",
  local, indexedDb: { materials, messages }
});
const file = text => ({ size: text.length, text: async () => text });

test("recusa JSON inválido sem modificar dados", async () => {
  const e = environment({ "pa-v2-essay": "original" });
  await assert.rejects(e.api.restoreBackup(file("{")), /JSON|Unexpected|Expected/);
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
  await assert.rejects(e.api.restoreBackup(file(backup({ "pa-v2-essay": "novo" }, [{ id: "new" }]))), /QuotaExceededError/);
  assert.equal(e.local.get("pa-v2-essay"), "antigo");
  assert.deepEqual(e.stores.materials.map(x => x.id), ["old"]);
  assert.equal(e.reloads, 0);
});


test("exporta dados de estudo e registros da IA em JSON", async () => {
  const e = environment({ "pa-v2-progress": '{"completed":3}', "unrelated": "private" });
  e.stores.materials.push({ id: "material-1", topicId: "math", text: "frações" });
  e.stores.messages.push({ id: "message-1", topicId: "math", text: "explicação" });
  await e.api.createBackup();
  assert.equal(e.downloads, 1);
  assert.ok(e.exportedBlob);
  const data = JSON.parse(await e.exportedBlob.text());
  assert.equal(data.format, "projeto-aprovacao-backup");
  assert.equal(data.version, 1);
  assert.equal(data.local["pa-v2-progress"], '{"completed":3}');
  assert.equal(data.local.unrelated, undefined);
  assert.equal(data.indexedDb.materials[0].id, "material-1");
  assert.equal(data.indexedDb.messages[0].id, "message-1");
});


test("backup exportado pode ser importado em outro ambiente preservando dados", async () => {
  const original = environment({ "pa-v2-subjects": '[{"id":"mat"}]', "pa-v2-settings": '{"dark":true}' });
  original.stores.materials.push({ id: "pdf-1", topicId: "mat", name: "Apostila", text: "Conteúdo" });
  original.stores.messages.push({ id: "msg-1", topicId: "mat", role: "assistant", text: "Resposta", sources: [] });
  await original.api.createBackup();
  const json = await original.exportedBlob.text();
  const destino = environment({ "pa-v2-subjects": "dados antigos" });
  destino.stores.materials.push({ id: "material-antigo" });
  assert.equal(await destino.api.restoreBackup(file(json)), true);
  assert.equal(destino.local.get("pa-v2-subjects"), '[{"id":"mat"}]');
  assert.equal(destino.local.get("pa-v2-settings"), '{"dark":true}');
  assert.deepEqual(destino.stores.materials.map(x => x.id), ["pdf-1"]);
  assert.deepEqual(destino.stores.messages.map(x => x.id), ["msg-1"]);
  assert.equal(destino.reloads, 1);
});
