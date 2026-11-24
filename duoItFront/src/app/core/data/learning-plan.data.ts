import { Exercise, LearningModule, Submodule } from '../models/learning.model';

// Ícone (Material Symbols) de cada módulo, usado no menu lateral.
export const MODULE_ICONS: Record<string, string> = {
  'basic-review': 'layers',
  'questions-negatives': 'chat_bubble',
  'articles-uncountable': 'menu_book',
  modals: 'gavel',
  'future-plans': 'calendar_month',
  'hedging-politeness': 'handshake',
  'present-perfect-past-simple': 'history',
  'present-perfect-continuous': 'autorenew',
  'process-meetings-vocab': 'groups',
  'gerund-infinitive': 'all_inclusive',
  'phrasal-verbs': 'record_voice_over',
  'passive-voice': 'swap_horiz',
  'code-prs-vocab': 'code',
  collocations: 'join_inner',
  'relative-clauses': 'link',
  conditionals: 'call_split',
  'documentation-communication-vocab': 'description',
  'reported-speech': 'format_quote',
};

// Dados baseados em docsProject/learning-plan.md, na ordem de estudo da seção 7.
// Cada submódulo tem um único exercício por enquanto (Cards). Os outros 3 tipos entram depois.
// O id do submódulo é o mesmo slug usado pela API.

const cardsExercise = (submoduleId: string): Exercise[] => [
  { id: `${submoduleId}-cards`, title: 'Exercício 1' },
];

const submodule = (id: string, title: string): Submodule => ({
  id,
  title,
  exercises: cardsExercise(id),
});

export const LEARNING_PLAN: LearningModule[] = [
  {
    id: 'basic-review',
    title: 'Revisão das estruturas básicas',
    submodules: [
      submodule('basic-work-routine', 'Rotina de trabalho'),
      submodule('basic-time-deadlines', 'Tempo e prazos'),
    ],
  },
  {
    id: 'questions-negatives',
    title: 'Perguntas, negativas e auxiliares',
    submodules: [
      submodule('q-clarification', 'Perguntas de esclarecimento'),
      submodule('q-status-negatives', 'Negativas de status'),
      submodule('q-verification', 'Verificação'),
    ],
  },
  {
    id: 'articles-uncountable',
    title: 'Artigos e substantivos incontáveis',
    submodules: [
      submodule('art-it-terms', 'Artigos com termos de TI'),
      submodule('art-uncountable-it', 'Substantivos incontáveis de TI'),
    ],
  },
  {
    id: 'modals',
    title: 'Modais de sugestão e obrigação',
    submodules: [
      submodule('modal-suggestions', 'Sugestões'),
      submodule('modal-obligation', 'Obrigação e necessidade'),
      submodule('modal-possibility', 'Possibilidade'),
    ],
  },
  {
    id: 'future-plans',
    title: 'Futuro para planos',
    submodules: [
      submodule('future-decisions', 'Decisões na hora e promessas'),
      submodule('future-plans-intentions', 'Planos e intenções'),
      submodule('future-agenda', 'Agenda com present continuous'),
    ],
  },
  {
    id: 'hedging-politeness',
    title: 'Hedging e polidez',
    submodules: [
      submodule('hedge-soften-opinion', 'Suavizar uma opinião'),
      submodule('hedge-polite-requests', 'Pedir com educação'),
      submodule('hedge-polite-disagreement', 'Discordar com educação'),
    ],
  },
  {
    id: 'present-perfect-past-simple',
    title: 'Present perfect e past simple',
    submodules: [
      submodule('pp-completed-deliveries', 'Entregas concluídas'),
      submodule('pp-code-verbs', 'Verbos de código'),
      submodule('pp-meeting-verbs', 'Verbos de reunião'),
      submodule('pp-bugs-incidents', 'Bugs e incidentes'),
      submodule('pp-irregular-work-verbs', 'Verbos irregulares de trabalho'),
    ],
  },
  {
    id: 'present-perfect-continuous',
    title: 'Present perfect continuous',
    submodules: [
      submodule('ppc-duration', 'Duração de trabalho'),
      submodule('ppc-continuous-activities', 'Atividades contínuas'),
    ],
  },
  {
    id: 'process-meetings-vocab',
    title: 'Vocabulário de processo e reuniões',
    submodules: [
      submodule('proc-daily-routine', 'Rotina de daily'),
      submodule('proc-planning', 'Planejamento'),
      submodule('proc-agile-ceremonies', 'Agile e cerimônias'),
      submodule('proc-meetings-follow-up', 'Reuniões e acompanhamento'),
    ],
  },
  {
    id: 'gerund-infinitive',
    title: 'Gerúndio e infinitivo',
    submodules: [
      submodule('gi-gerund-verbs', 'Verbos seguidos de gerúndio'),
      submodule('gi-infinitive-verbs', 'Verbos seguidos de infinitivo'),
      submodule('gi-both-forms', 'Verbos com as duas formas'),
      submodule('gi-responsibility', 'Expressões de responsabilidade'),
    ],
  },
  {
    id: 'phrasal-verbs',
    title: 'Phrasal verbs de TI',
    submodules: [
      submodule('pv-set-up-running', 'Colocar algo em funcionamento'),
      submodule('pv-wrap-up-delivery', 'Concluir e entregar'),
      submodule('pv-investigate', 'Investigar e entender'),
      submodule('pv-coordinate', 'Coordenar e acompanhar'),
    ],
  },
  {
    id: 'passive-voice',
    title: 'Voz passiva',
    submodules: [
      submodule('pass-code-tests', 'Particípios de código e testes'),
      submodule('pass-bugs', 'Particípios de bugs'),
      submodule('pass-process', 'Particípios de processo'),
      submodule('pass-documentation', 'Particípios de documentação'),
    ],
  },
  {
    id: 'code-prs-vocab',
    title: 'Vocabulário de código e PRs',
    submodules: [
      submodule('code-nouns', 'Substantivos de código'),
      submodule('code-pr-issue-nouns', 'Substantivos de PR e issues'),
      submodule('code-review-terms', 'Termos de revisão'),
    ],
  },
  {
    id: 'collocations',
    title: 'Collocações de TI',
    submodules: [
      submodule('coll-prs-branches', 'Verbos com PR e branches'),
      submodule('coll-bugs-tickets', 'Verbos com bugs e tickets'),
      submodule('coll-review-decision', 'Verbos com revisão e decisão'),
      submodule('coll-deliveries', 'Verbos com entregas'),
    ],
  },
  {
    id: 'relative-clauses',
    title: 'Orações relativas',
    submodules: [
      submodule('rel-pronouns-people', 'Pronomes relativos de pessoa'),
      submodule('rel-defining-things', 'Relativas que definem coisas'),
      submodule('rel-place-time', 'Relativas de lugar e tempo'),
    ],
  },
  {
    id: 'conditionals',
    title: 'Condicionais',
    submodules: [
      submodule('cond-zero', 'Condicional zero, fatos e processos'),
      submodule('cond-first', 'Condicional primeiro, riscos e planos'),
      submodule('cond-second', 'Condicional segundo, hipóteses'),
    ],
  },
  {
    id: 'documentation-communication-vocab',
    title: 'Vocabulário de documentação e comunicação',
    submodules: [
      submodule('doc-documentation', 'Documentação'),
      submodule('doc-requests-notices', 'Pedidos e avisos'),
      submodule('doc-channels-calls', 'Canais e chamadas'),
    ],
  },
  {
    id: 'reported-speech',
    title: 'Discurso indireto e conectores',
    submodules: [
      submodule('rs-reporting-verbs', 'Verbos de relato'),
      submodule('rs-cause-connectors', 'Conectores e expressões de causa'),
      submodule('rs-contrast-connectors', 'Conectores de contraste'),
      submodule('rs-sequence-connectors', 'Conectores de sequência'),
    ],
  },
];
