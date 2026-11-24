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

- `Card` (`cards`): uma palavra (`Word`, única) incluída no Review quando o grupo é concluído. Guarda o estado FSRS e, separadamente, a primeira avaliação do exercício do grupo e se ela foi um acerto. Respostas do Review não preenchem os campos do exercício.
- `Submodule` ganha `completed_at`: data em que o aluno concluiu os Termos do Grupo. Nulo enquanto não concluiu.

Agendamento: FSRS-5 com os pesos padrão e retenção de 90%, em `scheduling/Fsrs.java` (fórmulas) e `scheduling/FsrsScheduler.java` (estados e passos: aprendizado em 1 min e 10 min, reaprendizado em 10 min). Função pura, coberta por testes. Todas as avaliações passam por `study/CardService`, então nenhum fluxo recalcula o agendamento. Só a avaliação do exercício do grupo (`/api/study/cards/{id}/answer`) marca `exercise_answered_at` e conta para o progresso. A avaliação do Review (`/api/review/cards/{id}/answer`) só atualiza o agendamento.

Entrada no Review: o aluno estuda os Termos do Grupo e clica em "Concluir". Concluir cria os cards de todas as palavras do grupo em estado NEW e marca o grupo como concluído. Não há como desfazer. Repetir a conclusão não muda nada. Palavras adicionadas ao JSON depois da conclusão entram no Review automaticamente.

Progressão: enquanto nenhum tipo de exercício está implementado, concluir os Termos conclui o grupo e libera o próximo. Ao implementar o primeiro tipo, o critério planejado passa a ser pelo menos 80% de acertos no exercício. O Review permanece fora da progressão.

Sessões: vencidos até o momento da sessão, mais até 10 novos por dia. Sem teto total. Cards não respondidos continuam na fila.

Endpoints:
- `GET /api/study/session?submodule={slug}`: sessão de um grupo para o futuro exercício de cards, com os minutos até a próxima revisão para cada avaliação. O parâmetro `submodule` é obrigatório. A tela ainda está em construção.
- `GET /api/review/session`: revisão do dia, com cards vencidos e até 10 novos por dia.
- `GET /api/review/all`: todos os cards incluídos no Review, sem filtro de vencimento ou limite diário.
- `POST /api/review/cards/{id}/answer`: registra uma avaliação no Review; atualiza o agendamento, mas não conta para o progresso do curso. Retorna `200` com `{"nextDueAt": "..."}` ou `404` se o card não existir.
- `GET /api/terms?submodule={slug}`: termos do grupo e se o grupo está concluído (`{"completed": bool, "terms": [...]}`).
- `POST /api/terms/complete?submodule={slug}`: conclui os Termos do Grupo e inclui as palavras no Review. Retorna `204`, `404` para grupo inexistente ou `409` se ainda estiver bloqueado.
- `GET /api/progress`: por grupo, total de cards incluídos, cards avaliados e acertados no exercício do grupo, conclusão dos Termos e conclusão do grupo para progressão. Grupos sem cards não aparecem.
- `POST /api/study/cards/{id}/answer`: body `{"rating": "AGAIN|HARD|GOOD|EASY"}`. Registra uma avaliação do exercício do grupo e conta para o progresso. Retorna `200` com `{"nextDueAt": "..."}`, `404` se o card não existir ou `400` se a nota for inválida.

Carga de conteúdo: `config/ContentSeeder` lê todos os `resources/content/*.json` (um arquivo por módulo), cria módulos, grupos e palavras novos e atualiza os campos editoriais quando o JSON muda. Estado atual: 18 módulos, 59 grupos e 1.370 palavras.

Sincronização a cada inicialização da API:
- Módulo, grupo e palavra novos no JSON são criados.
- Título, posição, significado e exemplo são atualizados quando mudam no JSON.
- Palavras que saíram do JSON não são apagadas. Os cards e o progresso delas continuam no banco.
- Os cards não são criados pela sincronização, exceto para palavras novas de grupos já concluídos.

Assim o progresso fica preservado mesmo com edições no conteúdo. O JSON é a fonte do conteúdo; o banco guarda o estado de estudo.

O progresso por módulo e o `review_log` ficam para a próxima iteração. Os outros tipos de exercício e a forma de registrar seu progresso serão definidos ao implementá-los.

## 5.1 Organização do código

- Agendamento (`scheduling/`) é uma função pura, independente do banco. Sessões de grupo ficam em `study/`; sessão do Review, em `review/`; termos, em `terms/`.
- Essa separação completa fica adiada até existir um segundo tipo de exercício. Criar pacotes ou serviços genéricos antes disso seria abstração sem uso.
- Regra: regras novas de um tipo de exercício vão para o pacote desse tipo. Nada novo com lógica específica de cards entra em `study/`.
- Pacotes `stories` e `exercises/*` não são criados agora.

## 6. Pendências

- Palavra removida do JSON continua no banco (com seu progresso). Remover de verdade exigiria um passo manual, que ainda não existe.
