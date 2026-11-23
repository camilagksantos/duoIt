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
- Liberação em ordem de estudo, conforme a seção 8 do `learning-plan.md`: o primeiro grupo com palavras começa liberado. Dentro do grupo, o tipo seguinte só abre depois do anterior. O grupo seguinte abre quando todos os exercícios do atual forem concluídos.
- Exercício Cards: a frente mostra o termo em inglês. "Mostrar resposta" revela o significado em português e a frase de exemplo. Depois, o usuário avalia com quatro botões, Errei, Difícil, Médio e Fácil, cada um com o tempo até a próxima revisão (minutos, horas ou dias).
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

- `GET /api/progress`: total de cards e cards respondidos por grupo. Usado para liberar os exercícios.
- `GET /api/study/session?submodule={id}`: cards da sessão do grupo.
- `POST /api/study/cards/{id}/answer`: envia a avaliação do card.

O id do grupo no front é o mesmo `slug` do banco.

## 6. Pendências

- Versão do Angular e do Angular Material no projeto (a definir ao criar o projeto).
- Estrutura de pastas e rotas: definida (ver seção 4, Navegação). Rotas: `/` (Dashboard), `/treino` (Cards Review), `/termos/:slug` (Termos do Grupo) e `/estudo` (Cards).
- Layout: definido no padrão de referência (cabeçalho, menu lateral, dashboard e tema escuro).
- Navegação por teclado: os submenus abrem com o foco (Tab), além do mouse.
