import type { VercelRequest, VercelResponse } from "@vercel/node";

const NOT_FOUND = "Não encontrei essa informação nos materiais anexados.";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: "A IA ainda não está configurada. Adicione GEMINI_API_KEY nas variáveis privadas da Vercel." });
  const { question, context, mode, topicTitle, sources, images } = req.body || {};
  if (!question || typeof question !== "string") return res.status(400).json({ error: "Envie uma pergunta válida." });
  const sourceText = typeof context === "string" ? context.slice(0, 120000) : "";
  const instruction = `Você é uma tutora de estudos para o ENEM. Responda em português do Brasil. O conteúdo atual é: ${topicTitle || "não informado"}. Use exclusivamente os materiais anexados abaixo. Se a resposta não estiver neles, responda exatamente: "${NOT_FOUND}". Não invente arquivo, página, trecho ou fonte. Se os materiais forem insuficientes, diga isso claramente. Modo: ${mode || "pergunta"}.\n\nMATERIAIS:\n${sourceText || "Nenhum material textual foi processado."}\n\nPERGUNTA:\n${question}`;
  try {
    const imageParts = Array.isArray(images) ? images.slice(0, 4).flatMap((image: { name?: string; dataUrl?: string }) => {
      const match = image.dataUrl?.match(/^data:([^;]+);base64,(.+)$/);
      return match ? [{ text: `Imagem de apoio: ${image.name || "anexo"}` }, { inlineData: { mimeType: match[1], data: match[2] } }] : [];
    }) : [];
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" + encodeURIComponent(process.env.GEMINI_API_KEY), {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: instruction }, ...imageParts] }], generationConfig: { temperature: 0.2 } })
    });
    const payload = await response.json();
    if (!response.ok) { console.error("Gemini API error", response.status, payload?.error?.status || payload?.error?.message || "unknown"); return res.status(502).json({ error: "O Gemini não conseguiu responder agora. Verifique o modelo, a permissão da chave e a cota da API." }); }
    const answer = payload?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("\n").trim();
    return res.status(200).json({ answer: answer || NOT_FOUND, sources: Array.isArray(sources) ? sources : [] });
  } catch { return res.status(502).json({ error: "Não foi possível conectar ao Gemini." }); }
}
