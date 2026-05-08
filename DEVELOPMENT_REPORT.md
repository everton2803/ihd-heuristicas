# Relatório — Desenvolvimento e Evolução (FaltaFácil)

## 1. Objetivo do projeto
Criar uma plataforma web estática (GitHub Pages) para **gestão de faltas de alunos**, com:
- Registro de faltas por turma e data
- Justificativa opcional
- Relatórios por período
- Exportação de dados
- Boa usabilidade e acessibilidade básica

## 2. Escopo e restrições
- Sem banco de dados e sem back-end (compatível com GitHub Pages)
- Dados fictícios para simulação
- Persistência via LocalStorage

## 3. Versões e evolução

### v0 — Rascunho (ideação)
**Decisões iniciais**
- Definição do fluxo principal: selecionar turma → escolher data → marcar faltas → salvar
- Definição da necessidade de relatórios e exportações

**Riscos identificados**
- Sem back-end: necessidade de persistência local
- Evitar confusão do usuário (feedback e validação)

### v1 — Implementação funcional (entregue)
**Funcionalidades**
- Cadastro fictício de turmas e alunos
- Registro de faltas por data (marcação por aluno)
- Campo de justificativa (opcional)
- “Carregar” para recuperar marcações já salvas
- Relatórios com KPIs e resumo por aluno
- Exportação CSV e JSON
- Reset de dados (LocalStorage)

**Boas práticas aplicadas**
- HTML semântico (header/main/section)
- Labels em inputs e foco visível
- Feedback ao usuário (toast)
- Layout responsivo

## 4. Evidências (imagens)
Inserir prints:
- Tela Registro com turma/data selecionada
- Lista de alunos com faltas marcadas
- Toast após salvar
- Tela Relatórios com KPIs e tabela
- Exportação CSV/JSON (download)

## 5. Próximas evoluções planejadas (v2+)
- v2: Busca por aluno + histórico individual (linha expandível)
- v3: “Desfazer” (undo) e confirmação de reset
- v4: Validação avançada (ex.: impedir salvar sem turma/data)
- v5: Acessibilidade ampliada (atalhos, navegação por teclado aprimorada, contraste)
- v6: Indicadores por mês (gráfico simples sem libs)

> Observação: as evoluções v2+ serão implementadas incrementalmente, cada uma com sua justificativa de usabilidade e avaliação heurística.