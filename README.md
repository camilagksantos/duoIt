# Duo IT

Aplicação pessoal para estudar inglês técnico voltado ao dia a dia de desenvolvimento de software. O projeto combina termos em contexto, progresso por grupos e revisão espaçada. É desenvolvido para uso local por uma única pessoa; não inclui autenticação nem implantação.

## Estado atual

- **Termos do Grupo:** apresenta os termos, significados e exemplos. Concluir um grupo inclui suas palavras no Cards Review.
- **Cards Review:** oferece revisão do dia, guiada pelo FSRS, e revisão geral com todos os termos dos grupos concluídos. As respostas atualizam o agendamento, mas não contam para o progresso do curso.
- **Progresso:** as respostas do Cards Review não contam para o curso. Enquanto os exercícios não existem, concluir os Termos libera o próximo grupo; quando o primeiro exercício for implementado, a regra planejada passa a considerar 80% de acertos.
- **Próximas etapas:** o exercício de cards do grupo está em construção. Os demais exercícios e as histórias também estão planejados, mas ainda não implementados.

O conteúdo atual contém 18 módulos, 59 grupos e cerca de 1.370 termos, mantidos em JSON no back-end e descritos nos documentos de `docsProject/`.

## Tecnologias

| Parte | Tecnologias |
| --- | --- |
| Front-end | Angular 22, TypeScript, Angular Material, Signals |
| Back-end | Java 26, Spring Boot 4.1.2, Spring Data JPA |
| Banco local | PostgreSQL 16 via Docker Compose |

## Estrutura

```text
duoIt/
├── duoItFront/   # Aplicação Angular
├── duoItAPI/     # API Spring Boot e conteúdo JSON
└── docsProject/  # Plano de ensino, contexto e progresso do projeto
```

## Executar localmente

### 1. Pré-requisitos

- Node.js 22.22.3 e npm 10.9.8
- Java 26
- Docker com Docker Compose

### 2. Configurar o banco

Crie `duoItAPI/.env` com uma senha local para o PostgreSQL:

```env
DB_PASSWORD=sua-senha-local
```

Suba o banco:

```bash
cd duoItAPI
docker compose up -d
```

### 3. Iniciar a API

Em `duoItAPI/`:

```bash
./mvnw spring-boot:run
```

A API fica em `http://localhost:8080/api`. O Hibernate atualiza o schema local automaticamente, e o seeder sincroniza o conteúdo de `src/main/resources/content/`.

### 4. Iniciar o front-end

Em outro terminal, na pasta `duoItFront/`:

```bash
npm install
npm start
```

A aplicação fica em `http://localhost:4200`. O front-end chama a API local nessa porta; o back-end permite CORS para essa origem.

## Verificações

Front-end, em `duoItFront/`:

```bash
npm run build
npm test -- --watch=false
```

Back-end, em `duoItAPI/` (com PostgreSQL em execução):

```bash
./mvnw test
```

## Endpoints principais

| Método | Endpoint | Uso |
| --- | --- | --- |
| `GET` | `/api/terms?submodule={slug}` | Lista os termos do grupo e informa se ele foi concluído. |
| `POST` | `/api/terms/complete?submodule={slug}` | Conclui os termos e inclui as palavras no Review; retorna `409` se o grupo estiver bloqueado. |
| `GET` | `/api/review/session` | Busca cards vencidos e novos disponíveis no Cards Review. |
| `GET` | `/api/review/all` | Busca todos os cards incluídos no Review, sem filtro de vencimento. |
| `POST` | `/api/review/cards/{id}/answer` | Avalia um card do Review e atualiza o agendamento sem contar para o progresso do curso. |
| `GET` | `/api/progress` | Consulta conclusão dos grupos e avaliações que contam para o curso. |

## Documentação do projeto

- [Plano de ensino](docsProject/learning-plan.md)
- [Contexto do front-end](docsProject/context-frontend.md)
- [Contexto do back-end](docsProject/context-backend.md)
- [Progresso do front-end](docsProject/progress-frontend.md)
- [Progresso do back-end](docsProject/progress-backend.md)
