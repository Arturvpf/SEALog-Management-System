# Frontend SEALog

O visual foi adaptado do [projeto de referência no Lovable](https://lovable.dev/projects/04e064f5-1aa0-44bb-ae44-acac58a21712): paleta creme/azul-marinho, fontes Figtree e Outfit, cartões, navegação e tabelas. A identidade usa o PNG transparente “SEALog — Operador Logístico” enviado pelo usuário, em `public/sealog-logo.png`, na entrada e na navegação. O arquivo foi preservado sem alterações.

O aplicativo continua usando React, Vite, React Router e Zustand. Os seis perfis, permissões, pedidos com múltiplas entregas, distribuição, histórico, ocorrências, parceiras, portal do cliente e financeiro seguem os fluxos locais. Dados e sessão continuam persistidos no `localStorage` do navegador, com dados de demonstração na primeira execução.

## Executar

```sh
npm ci
npm run dev
```

## Validar

```sh
npm run build
npx playwright install chromium
npm run test:e2e
```

Os testes usam contextos isolados do Chromium em desktop e celular, com horário fixado em 29/10/2026 no fuso America/Fortaleza. Exercitam navegação e permissões, cadastro e persistência, conclusão de dados pendentes, busca, distribuição, atualização de status, decisões, cadastro de parceiras, totais financeiros e exportações CSV. Capturas das telas ficam em `test-results/`, ignorado pelo Git.

Os tokens visuais ficam em `src/index.css` e `tailwind.config.js`. `Layout.tsx` concentra a navegação e os cabeçalhos; os formulários e componentes compartilhados herdam os mesmos estilos.
