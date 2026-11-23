/** Quantas outras cartas passam antes de um card errado voltar na mesma sessão. */
export const REQUEUE_OFFSET = 3;

/** Depois de tantos erros no mesmo card na sessão, ele deixa de voltar nela. */
export const MAX_MISSES_PER_CARD = 3;

/**
 * Coloca um card errado de volta na fila, algumas posições à frente da atual.
 * Retorna uma nova fila. O FSRS já guardou o passo de aprendizado no servidor.
 */
export function requeueAfter<T>(queue: T[], currentIndex: number, card: T): T[] {
  const copy = [...queue];
  const position = Math.min(currentIndex + REQUEUE_OFFSET, copy.length);
  copy.splice(position, 0, card);
  return copy;
}
