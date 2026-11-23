# Progresso do Front-end

Status geral: não iniciado
Atualizado em: 2026-11-05

## 1. Etapas

| Etapa | Status |
|-------|--------|
| Contexto do front-end | feito |
| Projeto Angular standalone criado | feito |
| Angular Material configurado | feito |
| Layout com toolbar e sidebar | feito |
| Menu de módulos, submódulos e exercícios (hover) | feito |
| Tela inicial de estudo | feito (conteúdo do exercício ainda é placeholder) |
| Flashcards (FSRS) ligados à API | feito |
| Termos do Grupo com botão "Concluir termos" | feito |
| Cards Review ligado à API | feito |
| Exercícios do menu ligados às sessões de cards (clique em "Cards") | feito |
| Liberação em ordem de estudo (exercício bloqueado, "Em breve" e concluído) | feito |
| Progressão testada com mais de um submódulo com conteúdo | pendente (hoje só existe um com palavras) |
| Tela de progresso | pendente |
| Integração com a API | pendente |

## 2. Histórico

- 2026-11-05: documento criado. Contexto do front-end definido.
- 2026-11-05: projeto Angular standalone criado em `duoItFront/`, com Angular Material. Build e teste passando.
- 2026-11-23: card "Estudar" do dashboard agora abre o menu lateral. O estado do menu foi para `core/services/sidebar.service.ts`, usado pelo layout e pelo dashboard.
- 2026-11-23: menu com os 59 grupos e todos os exercícios Cards. Testado: só o primeiro está liberado, os outros 58 aparecem como "Bloqueado".
- 2026-11-23: Termos do Grupo passou a ser só leitura, com o botão Concluir, que inclui o grupo inteiro no Review.
- 2026-11-23: implementado o FSRS, os Termos do Grupo com o botão Concluir e o Cards Review com sessão própria. Dominado foi removido do progresso e do menu.
- 2026-11-09: sugestões aplicadas. Grupos com mais de 50 entradas foram divididos (planejamento e agile; comunicação informal). Dominado (intervalo de 21 dias ou mais) separado de concluído. Significados mostram o sentido no contexto. Plano atualizado nas seções 3, 5 e 8.
- 2026-11-09: imagem de fundo em `public/background.png` aplicada ao body, cobrindo a tela inteira. Toolbar, abas, menu e submenus ficaram semitransparentes para a imagem aparecer atrás deles.
- 2026-11-09: layout no padrão de referência. Cabeçalho preto com logo centralizado e detalhes vermelhos, usuário à direita. Menu grafite com ícones por módulo e item "Dashboard". Submenus flutuantes escuros com destaque azul. Dashboard com três cartões (Estudar em vermelho, Cards Review em azul, Meu Progresso em amarelo) e progresso segmentado com número de cards. Cards de vocabulário com frente azul e verso grafite, resposta em amarelo. Conquistas (grupo concluído) em amarelo.
- 2026-11-09: tema escuro com a paleta do Duo IT (preto como base, vermelho para ação, azul e amarelo em proporções menores). Fonte Inter. Exercício selecionado no menu fica destacado em vermelho com borda amarela. Classes globais `.dashboard-card` e `.btn-primary` em `styles.scss`.
- 2026-11-09: barra de abas abaixo da toolbar. "Dashboard" (`/`, conteúdo provisório fixo) e "Cards Review" (`/treino`, só estrutura). Clicar em um exercício do menu abre o Cards em `/estudo`.
- 2026-11-09: menu lateral fechado por padrão. Abre sobre o conteúdo pelo botão de três riscas, sem empurrar a tela, e fecha quando o mouse sai dele.
- 2026-11-09: Cards voltou ao formato original: frente em inglês, "Mostrar resposta" e quatro avaliações (Errei, Difícil, Médio, Fácil). A versão com digitação saiu do Cards. Ela é outro tipo de exercício, para depois. "Médio" substitui "Bom".
- 2026-11-09: menu mostra um exercício "Cards" por submódulo. Bloqueado, "Em breve" e "Concluído" aparecem como dica ao lado do nome. A sessão abre ao clicar em "Cards". Botões de avaliação mostram o intervalo em dias.
- 2026-11-09: flashcards ligados à API: frente com o termo, verso com significado e exemplo, quatro botões com o intervalo de cada um. Testado no navegador: avaliação "Bom" avança para o próximo card.
- 2026-11-05: layout criado: toolbar com título centralizado, sidebar com "Olá, Wesly" e menu de três níveis (módulo, submódulo, exercício) por hover. Componentes reutilizáveis em `src/app/share/`. Dados de exemplo em `core/data/learning-plan.data.ts`.
