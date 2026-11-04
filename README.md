# Projeto Aprovação — versão inicial

Aplicação web de estudos para vestibulares, construída com React, TypeScript e Vite.

## Requisitos
- Node.js LTS
- npm (instalado junto com Node.js)

## Como executar
1. Extraia o arquivo ZIP.
2. Abra a pasta `projeto-aprovacao` no Visual Studio Code.
3. Abra Terminal → Novo Terminal.
4. Execute:

```bash
npm install
npm run dev
```

5. Abra no navegador o endereço local exibido no terminal (normalmente http://localhost:5173).

## O que já funciona
- Navegação entre Dashboard, Cronograma, Disciplinas, Exercícios, Redação e Desempenho.
- Marcar atividades como concluídas.
- Criar e excluir atividades do cronograma.
- Adicionar disciplinas.
- Registrar sessões de exercícios e calcular percentual de acertos.
- Escrever e salvar redações.
- Temporizador Pomodoro de 25 minutos.
- Persistência local no navegador usando localStorage.

## Importante
Esta é a primeira versão funcional de interface (MVP). Os dados ficam salvos no navegador deste computador e navegador. Ainda não há login, sincronização em nuvem, banco Supabase ou integração com IA. Essas serão etapas seguintes.

O gráfico semanal inicial é demonstrativo; não representa horas reais. Os indicadores de atividades e conteúdos usam os dados registrados na aplicação.

## Próximas etapas
1. Validar a interface e corrigir ajustes.
2. Criar projeto Supabase e autenticação.
3. Migrar os dados locais para PostgreSQL.
4. Implementar histórico diário e relatórios reais.
5. Integrar tutor IA por backend seguro.
