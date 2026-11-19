import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function setup(body, options = {}) {
  const exports = {};
  const source = readFileSync(new URL("../api/ai.ts", import.meta.url), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  let calls = 0;
  let lastRequest;
  const fetch = async (_url, init) => {
    calls++;
    lastRequest = init;
    return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: options.answer ?? "Não encontrei essa informação nos materiais anexados." }] } }] }) };
  };
  runInNewContext(js, { exports, process: { env: { GEMINI_API_KEY: options.key === false ? "" : "test-only" } }, fetch, AbortController, setTimeout, clearTimeout, console });
  const req = { method: options.method ?? "POST", body };
  const res = { statusCode: 200, status(n) { this.statusCode = n; return this; }, json(data) { this.data = data; return this; } };
  return { execute: async () => { await exports.default(req, res); return res; }, get calls() { return calls; }, get lastRequest() { return lastRequest; } };
}

test("recusa requisicao sem pergunta", async () => {
  const e = setup({ context: "[Apostila.pdf — página 1] texto" });
  const res = await e.execute();
  assert.equal(res.statusCode, 400);
  assert.equal(e.calls, 0);
});

test("recusa pergunta sem material sem chamar IA", async () => {
  const e = setup({ question: "Explique cinemática", context: "" });
  const res = await e.execute();
  assert.equal(res.statusCode, 200);
  assert.match(res.data.answer, /Não encontrei/);
  assert.deepEqual(Array.from(res.data.sources), []);
  assert.equal(e.calls, 0);
});

test("rejeita metodo nao permitido", async () => {
  const e = setup({ question: "Oi" }, { method: "GET" });
  assert.equal((await e.execute()).statusCode, 405);
});

test("nao expoe fontes nao citadas e instrui IA a usar apenas anexos", async () => {
  const e = setup({ question: "O que é velocidade?", context: "[Fisica.pdf — página 2] Velocidade é deslocamento por tempo.\n[Outro.pdf — página 1] Introdução." }, { answer: "Segundo Fisica.pdf, página 2, velocidade relaciona deslocamento e tempo." });
  const res = await e.execute();
  assert.equal(res.statusCode, 200);
  assert.deepEqual(Array.from(res.data.sources), ["Fisica.pdf"]);
  const prompt = JSON.parse(e.lastRequest.body).contents[0].parts[0].text;
  assert.match(prompt, /EXCLUSIVAMENTE/);
  assert.match(prompt, /Não use conhecimento geral/);
});

test("nao atribui fontes a resposta de ausencia de informacao", async () => {
  const e = setup({ question: "Tema ausente", context: "[Fisica.pdf — página 2] Movimento." });
  const res = await e.execute();
  assert.deepEqual(Array.from(res.data.sources), []);
});

test("rejeita pergunta excessiva sem chamar Gemini", async () => {
  const e = setup({ question: "x".repeat(4001), context: "[Fisica.pdf — página 1] Texto" });
  assert.equal((await e.execute()).statusCode, 413);
  assert.equal(e.calls, 0);
});

test("rejeita contexto excessivo sem chamar Gemini", async () => {
  const e = setup({ question: "Resumo", context: "a".repeat(120001) });
  assert.equal((await e.execute()).statusCode, 413);
  assert.equal(e.calls, 0);
});

test("rejeita mais de quatro imagens", async () => {
  const e = setup({ question: "Explique", images: Array.from({ length: 5 }, () => ({ name: "foto", dataUrl: "data:image/png;base64,YQ==" })) });
  assert.equal((await e.execute()).statusCode, 413);
  assert.equal(e.calls, 0);
});

test("rejeita formato de imagem nao permitido", async () => {
  const e = setup({ question: "Explique", images: [{ name: "anexo.svg", dataUrl: "data:image/svg+xml;base64,YQ==" }] });
  const res = await e.execute();
  assert.equal(res.statusCode, 400);
  assert.equal(e.calls, 0);
});

test("rejeita campo images que nao seja lista", async () => {
  const e = setup({ question: "Explique", images: "arquivo" });
  assert.equal((await e.execute()).statusCode, 400);
  assert.equal(e.calls, 0);
});
