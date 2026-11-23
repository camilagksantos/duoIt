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

/** Termo de um grupo, com o estado do checkbox "aprendi". */
export interface TermView {
  id: number;
  term: string;
  meaning: string;
  example: string;
  learned: boolean;
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
