# Projeto Aprovação

Plataforma web de organização de estudos para o ENEM, construída com React, TypeScript e Vite.

## Executar localmente

- Requer Node.js 20 ou superior.
- `npm install`
- `npm run dev`
- `npm run build`

## Publicar na Vercel

O projeto usa Vite. Configure:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

A função `api/ai.ts` é uma função serverless da Vercel. Configure a variável privada `GEMINI_API_KEY` no painel da Vercel, em **Settings → Environment Variables**. Nunca coloque a chave real no frontend, no ZIP ou no GitHub.

## IA baseada nos materiais

Na tela de detalhes de cada conteúdo, o painel **Estudar com IA** permite anexar PDFs e imagens, guardar os materiais no IndexedDB deste navegador, gerar resumo, explicação ou pergunta de revisão e manter o histórico por conteúdo.

Os PDFs têm o texto extraído por página no navegador com `pdfjs-dist`, preservando rótulos de arquivo e página para referência. Imagens ficam disponíveis para análise quando a chave estiver configurada no backend. O endpoint retorna uma mensagem clara quando `GEMINI_API_KEY` não está configurada.

A primeira versão limita arquivos a 10 MB e usa o armazenamento local do navegador. IndexedDB não sincroniza automaticamente entre dispositivos e pode ser limpo pelo usuário. Para produção, recomenda-se migrar arquivos e histórico para armazenamento autenticado no servidor.

## Dados existentes

Disciplinas, conteúdos, cronograma, exercícios, redação, preferências e modo de cor continuam salvos no `localStorage`. Materiais e histórico da IA ficam no IndexedDB, separados por conteúdo.

## Limitações desta primeira entrega

- A resposta real do Gemini depende da configuração de `GEMINI_API_KEY` na Vercel.
- PDFs escaneados sem camada de texto precisam de OCR ou análise visual no backend; o navegador não inventa texto.
- Referências de arquivo e página são enviadas com o texto extraído; a precisão depende do conteúdo recuperado.
- O projeto não promete uso ilimitado: limites de API, tamanho de arquivos e custos dependem da conta Gemini.
