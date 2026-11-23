# Progresso do Back-end

Status geral: em andamento
Atualizado em: 2026-11-05

## 1. Etapas

| Etapa | Status |
|-------|--------|
| Contexto do back-end | feito |
| Modelagem de dados | pendente (depois do plano de ensino) |
| Projeto Spring Boot criado (Spring Boot 4.1.2, Java 26) | feito |
| Entidades do MVP (`LearningModule`, `Submodule`, `Word`) | feito |
| PostgreSQL no Docker (`duoItAPI/docker-compose.yml`) | feito |
| Conexão com PostgreSQL | feito |
| Entidade `Card` e agendamento SM-2 (`Sm2Scheduler`, com testes) | feito |
| Endpoints de sessão e de resposta (`/api/study`) | feito |
| Carga de dados real (módulos, submódulos e palavras) | pendente (hoje só dados de exemplo) |
| Progresso por submódulo (`GET /api/progress`) | feito |
| Sessão por submódulo (`/api/study/session?submodule=`) | feito |
| `review_log` | pendente |
| Endpoints de módulos e submódulos | pendente |
| Endpoints de palavras | pendente |
| Endpoints de progresso | pendente |

## 2. Histórico

- 2026-11-05: documento criado. Contexto do back-end definido.
- 2026-11-05: PostgreSQL 16.15 no Docker, com `docker compose up -d` em `duoItAPI/`. Container `duoit-postgres` saudável, consulta de versão feita.
- 2026-11-05: projeto Spring Boot 4.1.2 criado em `duoItAPI/` (Java 26, Web MVC, JPA, PostgreSQL, Validation).
- 2026-11-23: todos os 18 módulos carregados no banco: 59 grupos e 1.370 palavras, sem termos repetidos. `ContentSeeder` lê cada `content/*.json` e pula os módulos que já existem. Os identificadores dos grupos batem com o front.
- 2026-11-23: conteúdo de todos os 18 módulos escrito em `docsProject/content-*.md`, para revisão. Nada disso foi carregado no banco ainda. Verificação feita: nenhuma palavra repetida entre módulos.
- 2026-11-23: conteúdo do 5.1 carregado no banco (87 palavras, 2 grupos) a partir de `resources/content/basic-review.json`. O seeder de exemplo foi substituído por `ContentSeeder`. Testado: sessão do grupo A traz 10 cards (limite diário), o card respondido avança e o grupo B aparece como bloqueado.
- 2026-11-09: progresso passa a informar também os cards dominados (intervalo de 21 dias ou mais).
- 2026-11-09: banco resetado (dados de teste zerados e 5 palavras de exemplo recriadas). Cards passam a ser criados também na consulta de progresso (`CardProvisioner`), senão grupos sem sessão aparecem como "Em breve".
- 2026-11-09: submódulos ganharam o campo `slug` (mesmo id do front). Sessão agora é por submódulo. `GET /api/progress` retorna total e respondidos por submódulo, para liberar exercícios em ordem.
- 2026-11-09: SM-2 implementado em `Sm2Scheduler` (5 testes unitários, passando). Entidade `Card`, sessão e resposta via `/api/study`. Testado com curl: sessão, resposta (204), nota inválida (400) e card inexistente (404).
- 2026-11-05: entidades `LearningModule`, `Submodule` e `Word` criadas. A aplicação subiu e o Hibernate criou as tabelas `learning_modules`, `submodules` e `words`.
