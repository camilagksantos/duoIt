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
- Infraestrutura local: `duoItAPI/docker-compose.yml` sobe o PostgreSQL na porta 5432. Banco `duoit`, usuário `duoit`. A senha fica no arquivo `duoItAPI/.env` (variável `DB_PASSWORD`), que não vai para o git. Sem esse arquivo, o Docker e a API não sobem.

## 3. Pasta

`duoItAPI/`

## 4. Escopo

- Expor a estrutura do plano de ensino: módulo (estrutura gramatical) → grupo de palavras (submódulo) → palavras.
- Guardar as palavras de cada grupo, com significado em português e frase de exemplo.
- Agendar os cards (FSRS) e informar o progresso por grupo: quantos cards marcados já foram avaliados pelo menos uma vez.
- Os exercícios de cada grupo são do front. Os outros 3 tipos de exercício entram depois, sobre o mesmo grupo de palavras.

Fora de escopo por enquanto: autenticação, multiusuário, deploy.

## 5. Modelagem

Modelo mínimo do MVP, com 3 entidades (tabelas em snake_case, com IDs gerados pelo banco):

- `LearningModule` (`learning_modules`): título e posição na ordem de estudo.
- `Submodule` (`submodules`): grupo de palavras. Tem título, posição, `slug` (identificador estável, igual ao id no front) e o módulo ao qual pertence.
- `Word` (`words`): termo, significado em português, frase de exemplo e submódulo.

- `Card` (`cards`): uma palavra marcada como aprendida (`Word`, única), com o estado FSRS: estado (NEW, LEARNING, REVIEW ou RELEARNING), passo de aprendizado, estabilidade, dificuldade, revisões, erros, data da última revisão, data do próximo vencimento, data da primeira avaliação e se está pausado.

Agendamento: FSRS-5 com os pesos padrão e retenção de 90%, em `scheduling/Fsrs.java` (fórmulas) e `scheduling/FsrsScheduler.java` (estados e passos: aprendizado em 1 min e 10 min, reaprendizado em 10 min). Função pura, coberta por testes. Todas as avaliações passam por `study/CardService`, então nenhum fluxo recalcula o agendamento.

Entrada no Review: checkbox "aprendi" na tela de Termos do Grupo. Marcar cria o card em estado NEW; desmarcar pausa (mantém o histórico).

Sessões: vencidos até o momento da sessão, mais até 10 novos por dia. Sem teto total. Cards não respondidos continuam na fila.

Endpoints:
- `GET /api/study/session?submodule={slug}`: sessão de um grupo, com os minutos até a próxima revisão para cada avaliação. O parâmetro `submodule` é obrigatório.
- `GET /api/review/session`: sessão do Cards Review, de todos os grupos.
- `GET /api/terms?submodule={slug}`: termos do grupo com o estado do checkbox.
- `PUT /api/terms/{wordId}/learned`: body `{"learned": true|false}`.
- `GET /api/progress`: por grupo, o total de cards marcados e quantos já foram avaliados pelo menos uma vez. Grupos sem cards não aparecem.
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

- Agendamento (`scheduling/`) é uma função pura, independente do banco. Sessões de grupo ficam em `study/`; sessão do Review, em `review/`; termos, em `terms/`.
- Essa separação completa fica adiada até existir um segundo tipo de exercício. Criar pacotes ou serviços genéricos antes disso seria abstração sem uso.
- Regra: regras novas de um tipo de exercício vão para o pacote desse tipo. Nada novo com lógica específica de cards entra em `study/`.
- Pacotes `stories` e `exercises/*` não são criados agora.

## 6. Pendências

- Modelagem de dados: entidades do MVP criadas (módulo, grupo, palavra, card). Revisão de tabelas futuras, como `review_log`, fica para depois.
- Formato da API: já definido e em uso (ver seção 5).
- Palavra removida do JSON continua no banco (com seu progresso). Remover de verdade exigiria um passo manual, que ainda não existe.
