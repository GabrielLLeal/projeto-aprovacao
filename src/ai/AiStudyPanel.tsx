import React, { useEffect, useMemo, useState } from "react";
import { FileText, ImagePlus, LoaderCircle, MessageCircle, Send, Sparkles, Trash2 } from "lucide-react";
import { deleteMaterial, listMaterials, listMessages, putMaterial, putMessage } from "./storage";
import type { AiMaterial, AiMessage } from "./storage";
import "./ai.css";

function makeId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

async function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function extractPdfText(file: File): Promise<string> {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjs.getDocument({ data: bytes }).promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items.map((item: any) => item.str || "").join(" ").trim();
      pages.push(`[${file.name} — página ${pageNumber}]\n${text}`);
    }
    return pages.join("\n\n");
  } catch {
    return "";
  }
}

export default function AiStudyPanel({ topicId, topicTitle }: { topicId: string; topicTitle: string }) {
  const [materials, setMaterials] = useState<AiMaterial[]>([]);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([listMaterials(topicId), listMessages(topicId)]).then(([savedMaterials, savedMessages]) => {
      if (active) { setMaterials(savedMaterials); setMessages(savedMessages); }
    }).catch(() => setNotice("Não foi possível abrir o histórico local deste conteúdo."));
    return () => { active = false; };
  }, [topicId]);

  const context = useMemo(() => materials.filter(item => item.text).map(item => item.text).join("\n\n"), [materials]);

  async function addFiles(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!file.type.includes("pdf") && !file.type.startsWith("image/")) { setNotice("Envie apenas arquivos PDF ou imagens."); continue; }
      if (file.size > 10_000_000) { setNotice(`${file.name}: o limite é 10 MB por arquivo.`); continue; }
      setNotice(`Processando ${file.name}...`);
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const text = isPdf ? await extractPdfText(file) : "";
      const material: AiMaterial = { id: makeId(), topicId, name: file.name, type: file.type, size: file.size, addedAt: new Date().toISOString(), text, dataUrl: isPdf ? undefined : await readImage(file) };
      await putMaterial(material);
      setMaterials(old => [...old, material]);
    }
    setNotice("Material salvo neste navegador.");
  }

  async function removeMaterial(material: AiMaterial) {
    await deleteMaterial(material.id);
    setMaterials(old => old.filter(item => item.id !== material.id));
  }

  async function ask(prompt: string, mode = "pergunta") {
    const text = prompt.trim();
    if (!text || busy) return;
    setBusy(true); setNotice("");
    const userMessage: AiMessage = { id: makeId(), topicId, role: "user", text, sources: [], createdAt: new Date().toISOString() };
    await putMessage(userMessage); setMessages(old => [...old, userMessage]); setQuestion("");
    try {
      const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topicTitle, mode, question: text, context, images: materials.filter(item => item.dataUrl).map(item => ({ name: item.name, dataUrl: item.dataUrl })), sources: materials.map(item => item.name) }) });
      const payload = await response.json();
      const answer = payload.answer || payload.error || "A IA não retornou uma resposta.";
      const assistantMessage: AiMessage = { id: makeId(), topicId, role: "assistant", text: answer, sources: payload.sources || [], createdAt: new Date().toISOString() };
      await putMessage(assistantMessage); setMessages(old => [...old, assistantMessage]);
    } catch { setNotice("Não foi possível conectar ao backend da IA."); }
    finally { setBusy(false); }
  }

  return <section className="ai-panel panel">
    <div className="panel-heading"><div><h2><Sparkles size={17} /> Estudar com IA</h2><p>A IA consulta primeiro os materiais associados a este conteúdo.</p></div></div>
    <div className="ai-materials"><div className="ai-section-title"><strong>Materiais de referência</strong><label className="secondary-button ai-upload"><ImagePlus size={15} /> Adicionar PDF ou imagem<input type="file" accept="application/pdf,image/*" multiple onChange={e => addFiles(e.target.files)} /></label></div>
      {!materials.length && <p className="muted">Envie uma apostila ou foto para começar.</p>}
      {materials.map(material => <div className="ai-material" key={material.id}><FileText size={16}/><div><b>{material.name}</b><small>{Math.ceil(material.size / 1024)} KB · {material.text ? "PDF processado" : "imagem pronta para análise"}</small></div><button className="icon-button" title="Remover material" onClick={() => removeMaterial(material)}><Trash2 size={15}/></button></div>)}
    </div>
    <div className="ai-actions"><button className="secondary-button" onClick={() => ask("Faça um resumo organizado deste conteúdo.", "resumo")} disabled={busy}>Gerar resumo</button><button className="secondary-button" onClick={() => ask("Explique este conteúdo de forma simples para o ENEM.", "explicação")} disabled={busy}>Explicar de forma simples</button><button className="secondary-button" onClick={() => ask("Crie uma pergunta de revisão baseada nos materiais.", "revisão")} disabled={busy}>Pergunta de revisão</button></div>
    <div className="ai-chat">{messages.map(message => <div className={`ai-message ${message.role}`} key={message.id}><span>{message.role === "user" ? "Você" : "IA"}</span><p>{message.text}</p>{message.sources.length > 0 && <small>Fontes: {message.sources.join(", ")}</small>}</div>)}{busy && <div className="ai-message assistant"><LoaderCircle className="spin" size={15}/> Processando com os materiais deste conteúdo...</div>}</div>
    <form className="ai-question" onSubmit={e => { e.preventDefault(); ask(question); }}><textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Pergunte sobre este conteúdo..." rows={3}/><button className="primary-button" disabled={busy || !question.trim()}><Send size={15}/> Perguntar</button></form>
    {notice && <p className="ai-notice">{notice}</p>}
  </section>;
}
