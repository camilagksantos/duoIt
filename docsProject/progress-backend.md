# Progresso do Back-end

Status geral: em andamento
Atualizado em: 2026-11-24

## 1. Etapas

| Etapa | Status |
|-------|--------|
| Contexto do back-end | feito |
| Modelagem atual (módulos, grupos, palavras e cards FSRS) | feito |
| Projeto Spring Boot criado (Spring Boot 4.1.2, Java 26) | feito |
| Entidades do MVP (`LearningModule`, `Submodule`, `Word`) | feito |
| PostgreSQL no Docker (`duoItAPI/docker-compose.yml`) | feito |
| Conexão com PostgreSQL | feito |
| Entidade `Card` e agendamento FSRS-5 (`Fsrs`, `FsrsScheduler`, com testes) | feito |
| Entrada no Review por conclusão dos Termos (`POST /api/terms/complete`) e sessão do Review (`/api/review/session`) | feito |
| Endpoints de sessão e de resposta (`/api/study`) | feito |
| Carga de conteúdo (18 módulos, 59 grupos e 1.370 palavras) | feito |
| Progresso por submódulo (`GET /api/progress`) | feito |
| Revisão diária e revisão geral (`/api/review/session`, `/api/review/all`) | feito |
| Separação do progresso do curso e das avaliações do Review | feito |
| Sessão por submódulo (`/api/study/session?submodule=`) | mantida para o exercício futuro; front ainda não usa |
| `review_log` | pendente |
| Endpoints de leitura de módulos e submódulos | fora do escopo atual |
| Endpoints de leitura de palavras | Termos do Grupo disponíveis via `/api/terms` |

## 2. Histórico

- 2026-11-05: documento criado. Contexto do back-end definido.
- 2026-11-05: PostgreSQL 16.15 no Docker, com `docker compose up -d` em `duoItAPI/`. Container `duoit-postgres` saudável, consulta de versão feita.
- 2026-11-05: projeto Spring Boot 4.1.2 criado em `duoItAPI/` (Java 26, Web MVC, JPA, PostgreSQL, Validation).
- 2026-11-23: todos os 18 módulos carregados no banco: 59 grupos e 1.370 palavras, sem termos repetidos. `ContentSeeder` lê cada `content/*.json` e pula os módulos que já existem. Os identificadores dos grupos batem com o front.
- 2026-11-23: conteúdo de todos os 18 módulos escrito em `docsProject/content-*.md`, para revisão. Nada disso foi carregado no banco ainda. Verificação feita: nenhuma palavra repetida entre módulos.
- 2026-11-23: conteúdo do 5.1 carregado no banco (87 palavras, 2 grupos) a partir de `resources/content/basic-review.json`. O seeder de exemplo foi substituído por `ContentSeeder`. Testado: sessão do grupo A traz 10 cards (limite diário), o card respondido avança e o grupo B aparece como bloqueado.
- 2026-11-23: progresso separado do Review. Só a avaliação do exercício do grupo (`/api/study/cards/{id}/answer`) marca `exercise_answered_at` e conta para o progresso. `POST /api/review/cards/{id}/answer` atualiza o agendamento sem contar. Testado: resposta do Review não altera o progresso; resposta do exercício altera.
- 2026-11-23: `POST /api/terms/complete` recusa com 409 grupos bloqueados (anteriores na ordem de estudo não concluídos). Testado: 409 para o segundo grupo, 404 para grupo inexistente, sem alterar o banco.
- 2026-11-24: `/api/review/cards/{id}/answer` retorna o próximo vencimento, sem contar para o progresso do curso; a rota `/api/study/cards/{id}/answer` conta para as atividades do curso.
- 2026-11-23: conclusão dos Termos do Grupo substitui o checkbox por palavra. Concluir cria os cards do grupo de uma vez; repetir não muda nada; palavras novas de grupos concluídos entram no Review no próximo start. Coluna `paused` removida.
- 2026-11-09: progresso passa a informar também os cards dominados (intervalo de 21 dias ou mais).
- 2026-11-09: banco resetado (dados de teste zerados e 5 palavras de exemplo recriadas). Cards passam a ser criados também na consulta de progresso (`CardProvisioner`), senão grupos sem sessão aparecem como "Em breve".
- 2026-11-09: submódulos ganharam o campo `slug` (mesmo id do front). Sessão agora é por submódulo. `GET /api/progress` retorna total e respondidos por submódulo, para liberar exercícios em ordem.
- 2026-11-09: SM-2 implementado em `Sm2Scheduler` (5 testes unitários, passando). Entidade `Card`, sessão e resposta via `/api/study`. Testado com curl: sessão, resposta (204), nota inválida (400) e card inexistente (404).
- 2026-11-05: entidades `LearningModule`, `Submodule` e `Word` criadas. A aplicação subiu e o Hibernate criou as tabelas `learning_modules`, `submodules` e `words`.
