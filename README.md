# FaltaFácil (v1) — Gestão de Faltas de Alunos (GitHub Pages)

Protótipo acadêmico em HTML/CSS/JS para registrar faltas por turma e data e gerar relatórios.
- Dados fictícios
- Persistência em LocalStorage
- Exportação CSV/JSON
- Sem back-end (compatível com GitHub Pages)

## Como executar localmente
Basta abrir o `index.html` no navegador.

## Como publicar no GitHub Pages
1. Crie um repositório no GitHub (ex.: `gestao-faltas`).
2. Envie os arquivos para a branch `main`.
3. Vá em **Settings → Pages**.
4. Em **Build and deployment**, selecione:
   - Source: `Deploy from a branch`
   - Branch: `main` / root
5. Salve e acesse o link do Pages.

## Estrutura
- `index.html`: layout e seções
- `styles.css`: estilo e responsividade
- `app.js`: dados fictícios, registro, relatórios, exportação

## Observações
Os dados ficam salvos no navegador (LocalStorage). Se limpar cache/dados do site, perde os registros.