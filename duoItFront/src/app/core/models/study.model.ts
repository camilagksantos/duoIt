export type Rating = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

/** Card vindo da API. `intervals` traz o intervalo em dias para cada avaliação. */
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
