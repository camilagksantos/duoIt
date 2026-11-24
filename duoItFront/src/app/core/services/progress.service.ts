import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { LEARNING_PLAN } from '../data/learning-plan.data';

export interface SubmoduleProgress {
  slug: string;
  total: number;
  /** Primeira avaliação do exercício feita. */
  answered: number;
  /** Primeira avaliação do exercício foi acerto. */
  correct: number;
  /** Termos do grupo concluídos. */
  completed: boolean;
  /** Pelo menos 80% de acertos. Calculado no back. */
  concluded: boolean;
}

export type ExerciseStatus = 'done' | 'open' | 'locked' | 'soon' | 'unavailable';

/**
 * Libera os grupos em ordem de estudo. O primeiro grupo começa aberto.
 * A conclusão de cada grupo (80% de acertos) é calculada no back e chega em `concluded`.
 * Grupo sem palavras marcadas não está concluído, então bloqueia a sequência.
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

  /** Grupos abertos: todos os anteriores na ordem de estudo estão concluídos. */
  private readonly unlocked = computed(() => {
    const open = new Set<string>();
    for (const id of this.studyOrder) {
      open.add(id);
      if (!this.isGroupConcluded(id)) {
        break;
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

  /** Os Termos do Grupo estão liberados: todos os grupos anteriores na ordem de estudo foram concluídos. */
  isTermsUnlocked(submoduleId: string): boolean {
    if (!this.loaded()) {
      return false;
    }
    const index = this.studyOrder.indexOf(submoduleId);
    if (index < 0) {
      return false;
    }
    return this.studyOrder.slice(0, index).every((id) => this.isGroupConcluded(id));
  }

  /** Grupo concluído: pelo menos 80% de acertos, conforme o back. */
  isGroupConcluded(submoduleId: string): boolean {
    return this.bySlug().get(submoduleId)?.concluded ?? false;
  }

  /** Os Termos do Grupo foram concluídos. */
  isCompleted(submoduleId: string): boolean {
    return this.bySlug().get(submoduleId)?.completed ?? false;
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
    return p.concluded ? 'done' : 'open';
  }
}
