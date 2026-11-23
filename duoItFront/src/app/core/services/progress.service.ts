import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { LEARNING_PLAN } from '../data/learning-plan.data';

export interface SubmoduleProgress {
  slug: string;
  total: number;
  /** Avaliados pelo menos uma vez. */
  answered: number;
}

export type ExerciseStatus = 'done' | 'open' | 'locked' | 'soon' | 'unavailable';

/**
 * Libera os exercícios em ordem de estudo. O primeiro submódulo com conteúdo começa aberto.
 * O próximo só abre quando todos os cards do atual forem respondidos pelo menos uma vez.
 * Submódulos sem cards não têm conteúdo ainda e não bloqueiam a sequência.
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/progress';
  /** Ids dos submódulos na ordem de estudo. */
  readonly studyOrder = LEARNING_PLAN.flatMap((m) => m.submodules.map((s) => s.id));

  private readonly bySlug = signal<Map<string, SubmoduleProgress>>(new Map());
  readonly loaded = signal(false);
  readonly failed = signal(false);

  private readonly unlocked = computed(() => {
    const map = this.bySlug();
    const open = new Set<string>();
    let blocked = false;
    for (const id of this.studyOrder) {
      const p = map.get(id);
      if (!p || p.total === 0) {
        continue;
      }
      if (!blocked) {
        open.add(id);
      }
      if (p.answered < p.total) {
        blocked = true;
      }
    }
    return open;
  });

  /** Totais de cards de todos os grupos com palavras. */
  readonly totals = computed(() => {
    let total = 0;
    let answered = 0;
    for (const p of this.bySlug().values()) {
      total += p.total;
      answered += p.answered;
    }
    return { total, answered };
  });

  constructor() {
    this.load();
  }

  /** Carrega (ou recarrega) o progresso. Em caso de falha, `failed` fica true e a tela oferece nova tentativa. */
  load(): void {
    this.http.get<SubmoduleProgress[]>(this.baseUrl).subscribe({
      next: (rows) => {
        this.bySlug.set(new Map(rows.map((r) => [r.slug, r])));
        this.loaded.set(true);
        this.failed.set(false);
      },
      error: () => {
        this.loaded.set(false);
        this.failed.set(true);
      },
    });
  }

  status(submoduleId: string): ExerciseStatus {
    if (!this.loaded()) {
      return 'unavailable';
    }
    const p = this.bySlug().get(submoduleId);
    if (!p || p.total === 0) {
      return 'soon';
    }
    if (!this.unlocked().has(submoduleId)) {
      return 'locked';
    }
    return p.answered >= p.total ? 'done' : 'open';
  }
}
