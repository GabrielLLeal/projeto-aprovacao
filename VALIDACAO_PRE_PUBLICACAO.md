# Validação antes da publicação

Esta branch não deve ser mesclada automaticamente. Os testes do GitHub validam lógica simulada e compilação; **não** substituem um teste em navegador real ou com a API Gemini configurada.

## Teste manual em navegador (em ambiente de prévia, não produção)

1. Abrir o Projeto Aprovação na prévia da branch, não no endereço principal.
2. Criar um conteúdo de estudo de teste, alterar progresso e configurações.
3. Anexar PDF com texto selecionável e imagem de teste. Fazer uma pergunta, fechar e reabrir a página, verificar histórico.
4. Em Configurações, exportar o backup JSON. Conferir se o arquivo foi baixado.
5. Em perfil de navegador descartável, restaurar o backup e conferir progresso, configurações, materiais e mensagens.
6. Repetir com JSON inválido e cancelar a confirmação. Nenhum dado deve ser alterado.
7. Testar PDF digitalizado: a extração textual pode falhar; não há OCR nesta versão.
8. Testar pergunta cuja resposta não existe nos anexos; a IA deve informar ausência de evidência.
9. Conferir manualmente se cada afirmação e página citada realmente aparece no PDF.
10. Confirmar que erros de Gemini não apagam os dados locais.

## Riscos conhecidos

- A API ainda não possui autenticação nem rate limiting persistente. Limites de tamanho de entrada não evitam abuso distribuído.
- A verificação de fonte é baseada em nomes de arquivos presentes no contexto e citados na resposta. Não verifica se a afirmação é sustentada pela página indicada.
- O Gemini pode desobedecer instruções; a versão atual não implementa um verificador independente de evidências.
- O backup exporta o que está salvo no localStorage e IndexedDB, mas PDFs originais não são necessariamente armazenados.
- As imagens são enviadas ao serviço de IA quando o usuário faz perguntas com imagens anexadas.
- A auditoria completa de dependências encontrou avisos em ferramentas de desenvolvimento; a auditoria de dependências de produção não encontrou vulnerabilidades conhecidas no último relatório.
- O código usa nomes de modelos Gemini configurados no backend; a disponibilidade real desses modelos e a chave privada devem ser confirmadas na prévia.

## Critérios para publicar

- Todos os testes e build do GitHub aprovados no commit final.
- Prévia Vercel testada no Chrome, incluindo exportação e restauração com dados descartáveis.
- Teste com Gemini real e validação manual das citações.
- Proteção de custo/abuso da API definida (autenticação e limitação de requisições).
- Backup dos dados reais feito pelo usuário antes da atualização.
- Aprovação explícita do usuário para mesclar a PR e publicar.
