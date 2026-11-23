# Contexto do Back-end

Status: rascunho
Atualizado em: 2026-11-05

## 1. Propósito

API que serve o conteúdo do plano de ensino (ver `learning-plan.md`): módulos, submódulos, palavras e progresso.

Projeto pessoal, de uso exclusivo de um usuário. Sem deploy e sem login.

## 2. Stack

- Linguagem: Java 26 (OpenJDK Temurin 26)
- Build: Maven 3.8.6
- Framework: Spring Boot 4.1.2 (exige Java 17+ e é compatível até Java 27, segundo a documentação oficial)
- Banco de dados: PostgreSQL 16 (imagem `postgres:16`, em Docker)
- Infraestrutura local: `duoItAPI/docker-compose.yml` sobe o PostgreSQL na porta 5432. Banco `duoit`, usuário e senha `duoit` (somente desenvolvimento local).

## 3. Pasta

`duoItAPI/`

## 4. Escopo

- Expor a estrutura do plano de ensino: módulo (estrutura gramatical) → grupo de palavras (submódulo) → palavras.
- Guardar as palavras de cada grupo, com significado em português e frase de exemplo.
- Agendar os cards (SM-2) e informar o progresso por grupo: quantos cards já foram respondidos pelo menos uma vez.
- Os exercícios de cada grupo são do front. Os outros 3 tipos de exercício entram depois, sobre o mesmo grupo de palavras.

Fora de escopo por enquanto: autenticação, multiusuário, deploy.

## 5. Modelagem

Modelo mínimo do MVP, com 3 entidades (tabelas em snake_case, com IDs gerados pelo banco):

- `LearningModule` (`learning_modules`): título e posição na ordem de estudo.
- `Submodule` (`submodules`): grupo de palavras. Tem título, posição, `slug` (identificador estável, igual ao id no front) e o módulo ao qual pertence.
- `Word` (`words`): termo, significado em português, frase de exemplo e submódulo.

- `Card` (`cards`): uma palavra (`Word`, única) com o estado do agendamento: estado (NEW ou REVIEW), repetições, facilidade, intervalo em dias, data de vencimento, erros e data da primeira resposta.

Agendamento: SM-2 com os ajustes do Anki (Errei, Difícil, Bom, Fácil), implementado em `scheduling/Sm2Scheduler` como função pura, coberta por testes. Limite de 10 cards novos por dia. Reviews vencidos entram primeiro na sessão, depois os novos na ordem de estudo.

Endpoints:
- `GET /api/study/session?submodule={slug}`: cards da sessão de hoje de um grupo, com o intervalo em dias de cada avaliação. O parâmetro `submodule` é obrigatório.
- `GET /api/progress`: por grupo, o total de cards, os respondidos pelo menos uma vez (concluídos) e os com intervalo de 21 dias ou mais (dominados). Grupos sem cards não aparecem.
- `POST /api/study/cards/{id}/answer`: body `{"rating": "AGAIN|HARD|GOOD|EASY"}`. Retorna 204, 404 se o card não existir, 400 se a nota for inválida.

Carga de conteúdo: `config/ContentSeeder` lê todos os `resources/content/*.json` (um arquivo por módulo) e cria os módulos que ainda não existem no banco. Estado atual: 18 módulos, 59 grupos e 1.370 palavras.

Sincronização a cada inicialização da API:
- Módulo, grupo e palavra novos no JSON são criados.
- Título, posição, significado e exemplo são atualizados quando mudam no JSON.
- Palavras que saíram do JSON não são apagadas. Os cards e o progresso delas continuam no banco.
- Os cards não são tocados pela sincronização. Eles são criados depois, pelo `CardProvisioner`.

Assim o progresso fica preservado mesmo com edições no conteúdo. O JSON é a fonte do conteúdo; o banco guarda o estado de estudo.

O progresso por módulo e o `review_log` ficam para a próxima iteração. Os outros 3 tipos de exercício usam a mesma tabela de cards.

## 5.1 Organização do código

- Hoje a separação é parcial. `scheduling/Sm2Scheduler` é uma função pura, independente do banco. A sessão e a resposta de cards ainda estão em `study/`, junto do fluxo compartilhado.
- Essa separação completa fica adiada até existir um segundo tipo de exercício. Criar pacotes ou serviços genéricos antes disso seria abstração sem uso.
- Regra: regras novas de um tipo de exercício vão para o pacote desse tipo. Nada novo com lógica específica de cards entra em `study/`.
- Pacotes `stories` e `exercises/*` não são criados agora.

## 6. Pendências

- Modelagem de dados: entidades do MVP criadas (módulo, grupo, palavra, card). Revisão de tabelas futuras, como `review_log`, fica para depois.
- Formato da API: já definido e em uso (ver seção 5).
- Palavra removida do JSON continua no banco (com seu progresso). Remover de verdade exigiria um passo manual, que ainda não existe.
