import type { VercelRequest, VercelResponse } from "@vercel/node";

const NOT_FOUND = "Não encontrei essa informação nos materiais anexados.";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: "A IA ainda não está configurada. Adicione GEMINI_API_KEY nas variáveis privadas da Vercel." });
  const { question, context, mode, topicTitle, sources, images } = req.body || {};
  if (!question || typeof question !== "string") return res.status(400).json({ error: "Envie uma pergunta válida." });
  const sourceText = typeof context === "string" ? context.slice(0, 120000) : "";
  const instruction = `Você é uma tutora de estudos para o ENEM. Responda em português do Brasil. O conteúdo atual é: ${topicTitle || "não informado"}. Use os materiais anexados como prioridade e baseie neles as respostas sempre que trouxerem a informação. Quando não houver materiais ou quando eles não forem suficientes, responda normalmente usando seu conhecimento geral, deixando claro que essa parte não foi encontrada nos anexos. Nunca invente arquivo, página, trecho ou fonte. Se a resposta depender de informação atual ou incerta, avise o estudante. Modo: ${mode || "pergunta"}.\n\nMATERIAIS:\n${sourceText || "Nenhum material textual foi processado."}\n\nPERGUNTA:\n${question}`;
  try {
    const imageParts = Array.isArray(images) ? images.slice(0, 4).flatMap((image: { name?: string; dataUrl?: string }) => {
      const match = image.dataUrl?.match(/^data:([^;]+);base64,(.+)$/);
      return match ? [{ text: `Imagem de apoio: ${image.name || "anexo"}` }, { inlineData: { mimeType: match[1], data: match[2] } }] : [];
    }) : [];
    const models = ["gemini-3.8-flash", "gemini-3.5-flash-lite"];
    let response: Response | undefined;
    let payload: any = undefined;
    let lastStatus = 0;

    for (const model of models) {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
          response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: instruction }, ...imageParts] }], generationConfig: { temperature: 0.2 } }),
            signal: controller.signal,
          });
          payload = await response.json();
          lastStatus = response.status;
          if (response.ok) break;
          if (response.status !== 503) break;
          await new Promise((resolve) => setTimeout(resolve, 1200));
        } catch (error) {
          if ((error as { name?: string }).name !== "AbortError") throw error;
          lastStatus = 504;
        } finally {
          clearTimeout(timeout);
        }
        if (response?.ok || (lastStatus !== 503 && lastStatus !== 504)) break;
      }
      if (response?.ok) break;
      response = undefined;
    }

    if (!response?.ok) {
      console.error("Gemini API error", lastStatus, payload?.error?.status || payload?.error?.message || "timeout/unavailable");
      return res.status(502).json({ error: "O Gemini está temporariamente indisponível. Tente novamente em alguns segundos." });
    }
    const answer = payload?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("\n").trim();
    return res.status(200).json({ answer: answer || NOT_FOUND, sources: Array.isArray(sources) ? sources : [] });
  } catch { return res.status(502).json({ error: "Não foi possível conectar ao Gemini." }); }
}
