# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Preferências do usuário

- Use somente o modelo Haiku (`claude-haiku-5-5`) para agentes e subagentes. Não use Opus, Sonnet nem Fable.
- Responda sempre em português, de forma direta e clara, sem rodeios.
- Se precisar de alguma especificação para executar a tarefa, pergunte antes de seguir.
- O plano de ensino (`docsProject/learning-plan.md`) está fechado. Não altere esse arquivo sem pedir autorização antes.
- Documentos de contexto: `docsProject/context-backend.md` e `docsProject/context-frontend.md`.
- Documentos de progresso: `docsProject/progress-backend.md` e `docsProject/progress-frontend.md`.
- Stack: Java com Spring Boot e PostgreSQL no back-end; Angular standalone com Angular Material e Signals (sempre que possível) no front-end.

## Estrutura

Não é um repositório git. Três pastas na raiz:

- `duoItFront/`: Angular 22, standalone, Angular Material. Porta 4200.
- `duoItAPI/`: Spring Boot 4.1.2, Java 26, Maven, PostgreSQL. Porta 8080.
- `docsProject/`: plano de ensino, contexto e progresso de cada lado.

O conteúdo é um plano de estudo de inglês técnico. A hierarquia é módulo → grupo de palavras (submódulo) → exercícios. Os detalhes estão na seção 8 de `docsProject/learning-plan.md`.

## Organização do código

- Front: `features/study/study-home` apresenta o exercício selecionado e encaminha para o componente do tipo. Não escolhe o exercício; isso já é feito no menu.
- Regras de um tipo de exercício ficam na pasta desse tipo. Não criar serviços ou interfaces genéricos antes de existir um segundo tipo.
- Back: `study/` tem a sessão e a resposta de cards. Não adicionar lógica específica de cards em `study/`; ela deve ir para um pacote próprio do tipo quando a separação for feita.

## Comandos

Back-end (dentro de `duoItAPI/`):

- `docker compose up -d`: sobe o PostgreSQL 16 (porta 5432, banco `duoit`). Precisa estar rodando antes da API.
- `./mvnw spring-boot:run`: sobe a API na porta 8080.
- `./mvnw test`: roda os testes. O teste de contexto precisa do PostgreSQL ligado.
- `./mvnw -q -DskipTests package`: gera o jar em `target/`.

Front-end (dentro de `duoItFront/`):

- `npx ng serve`: sobe em http://localhost:4200, com live reload.
- `npx ng build`: build de produção.
- `npx ng test --watch=false`: roda os testes.

## Arquitetura que cruza as duas pastas

- O front chama a API direto em `http://localhost:8080/api`. A URL está fixa nos serviços em `core/services/`.
- A API libera CORS só para `http://localhost:4200` (`config/WebConfig.java`).
- O id do submódulo no front é o mesmo `slug` do submódulo no banco. Se um for alterado, o outro também precisa.
- O agendamento SM-2 fica em `scheduling/Sm2Scheduler.java`, uma função pura, sem acesso ao banco.
- A liberação dos exercícios é calculada no front (`core/services/progress.service.ts`), com base em `GET /api/progress`.
- O conteúdo das palavras fica em `duoItAPI/src/main/resources/content/*.json` (um arquivo por módulo, 18 no total, 1.370 palavras). `config/ContentSeeder.java` sincroniza esses arquivos com o banco a cada início da API. Cria o que é novo e atualiza significado, exemplo e título quando mudam. Não apaga palavras nem cards, então o progresso fica preservado. Os rascunhos para revisão ficam em `docsProject/content-*.md`, e a conversão para JSON é feita a partir deles.
- A estrutura de módulos, grupos e exercícios para o menu fica em `core/data/learning-plan.data.ts` (front). Precisa bater com os slugs do back.

## Pendências conhecidas

- Os outros 3 tipos de exercício ainda não existem. Hoje cada grupo tem só o Cards.
- Os nomes de exibição dos grupos ainda não foram decididos.
