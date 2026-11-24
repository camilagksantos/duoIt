# Contexto do Front-end

Status: rascunho
Atualizado em: 2026-11-05

## 1. Propósito

Interface de estudo do plano de ensino (ver `learning-plan.md`): o aprendiz vê os módulos, estuda as palavras e acompanha o progresso.

Projeto pessoal, de uso exclusivo de um usuário. Sem deploy e sem login.

## 2. Stack

- Framework: Angular, com componentes standalone (sem NgModules)
- Angular CLI: 22.2.0
- Node.js: 22.22.3
- npm: 10.9.8
- UI: Angular Material
- Estado: Signals, sempre que possível

## 3. Pasta

`duoItFront/`

## 4. Escopo

- Navegação: barra de abas abaixo da toolbar com "Dashboard" (`/`, conteúdo provisório) e "Cards Review" (`/treino`). O exercício Cards abre em `/estudo`, pelo menu lateral. Termos do Grupo abre em `/termos/:slug`, também pelo menu lateral.
- Menu em três níveis: módulo (estrutura gramatical) → grupo de palavras (submódulo) → exercícios do grupo. Todos os níveis aparecem; só os exercícios liberados podem ser abertos.
- Liberação em ordem de estudo, conforme a seção 8 do `learning-plan.md`: o primeiro grupo começa liberado. Enquanto os exercícios não existem, concluir Termos conclui o grupo e libera o próximo. Com exercícios implementados, a progressão usa os critérios definidos para eles. O Cards Review não participa dessa progressão.
- Exercício 1 (cards do grupo): tela vazia, em construção. Será implementado depois da conclusão dos Termos do Grupo e do Cards Review.
- Cards Review (`/treino`): tem os modos "Revisão do dia" (vencidos e novos disponíveis segundo o FSRS) e "Revisão geral" (todos os termos marcados, sem filtro de data). Na revisão do dia, um card errado volta quando o passo FSRS vence. As respostas atualizam o agendamento, mas não contam para o progresso do curso.
- Componente `FlashcardComponent`: frente com o termo, "Mostrar resposta" e as quatro avaliações com o tempo até a próxima revisão.
- O exercício de digitação (resposta escrita com validação) é outro tipo, previsto para depois. Não faz parte do Cards.
- Exercício concluído continua disponível para revisão.
- Concluído (todos os cards avaliados pelo menos uma vez) aparece como dica no menu. O dashboard mostra os cards avaliados. Não há mais o conceito de dominado.
- Tipos de exercício ainda não disponíveis não bloqueiam a sequência.
- Termos do Grupo (`/termos/:slug`): lista as palavras para estudo, sem avaliação. O botão "Concluir termos" inclui todas as palavras no Cards Review de uma vez. Depois de concluído, não há como desfazer.
- Estados no menu: liberado, concluído, bloqueado, "Em breve" (grupo sem palavras) e "Sem API".

Fora de escopo por enquanto: autenticação, áudio, pronúncia, deploy.

## 4.1 Organização do código

- `features/study/study-home/` é a tela que apresenta o exercício selecionado no menu. A escolha já é feita no menu, então essa tela não escolhe nada. Ela encaminha a renderização para o componente do tipo do exercício.
- Hoje existe um tipo só (Cards). Por isso o encaminhamento é um `switch` simples, sem serviço ou interface genérica.
- Regra: a lógica de cada tipo de exercício fica na própria pasta do tipo. A pasta `features/study/exercises/cards/` é o destino do Cards quando for movido. Não criar abstrações compartilhadas antes de existir um segundo tipo.
- Pastas para `stories`, `exercise-b`, `exercise-c` e `exercise-d` não são criadas agora. Entram quando o recurso começar a ser implementado.

## 5. Integração

Consome a API em `http://localhost:8080/api`:

- `GET /api/progress`: termos incluídos no Review, avaliações/acertos do exercício do grupo, conclusão dos Termos e conclusão para progressão. Enquanto não há tipos de exercício implementados, a conclusão para progressão acompanha a conclusão dos Termos. As respostas do Review não entram no progresso.
- `GET /api/terms?submodule={slug}` e `POST /api/terms/complete?submodule={slug}`: lista e conclui os termos do grupo; a conclusão inclui as palavras no Review.
- `GET /api/review/session`: sessão diária; `GET /api/review/all`: revisão geral.
- `POST /api/review/cards/{id}/answer`: avalia no Review e atualiza somente o agendamento.
- `GET /api/study/session?submodule={id}` e `POST /api/study/cards/{id}/answer`: sessão e avaliação do futuro exercício de cards do grupo. A tela desse exercício ainda está em construção.

O id do grupo no front é o mesmo `slug` do banco.

## 6. Pendências

- Critérios de aproveitamento e conclusão dos novos exercícios e histórias.
- Exercício de cards do grupo, demais exercícios e histórias.
- Implementar o primeiro exercício e aplicar o critério planejado de 80% de acertos; depois, estender a regra conforme novos exercícios e histórias forem adicionados.
- Navegação por teclado: os submenus abrem com o foco (Tab), além do mouse.
