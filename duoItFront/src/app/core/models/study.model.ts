export type Rating = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

/** Card vindo da API. `intervals` traz os minutos até a próxima revisão para cada avaliação. */
export interface CardView {
  id: number;
  term: string;
  meaning: string;
  example: string;
  moduleTitle: string;
  submoduleTitle: string;
  isNew: boolean;
  intervals: Record<Rating, number>;
}

/** Resposta da avaliação: quando o card vence de novo. */
export interface AnswerResponse {
  nextDueAt: string;
}

/** Termo de um grupo. Os termos são para estudo até o grupo ser concluído. */
export interface TermView {
  id: number;
  term: string;
  meaning: string;
  example: string;
}

/** Termos do grupo e se o aluno já concluiu o grupo (o que inclui as palavras no Review). */
export interface TermsResponse {
  completed: boolean;
  terms: TermView[];
}

/** Formata minutos para o texto dos botões: "1 min", "2 h", "3 dias". */
export function formatInterval(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  if (minutes < 1440) {
    return `${Math.round(minutes / 60)} h`;
  }
  const days = Math.round(minutes / 1440);
  return days === 1 ? '1 dia' : `${days} dias`;
}
