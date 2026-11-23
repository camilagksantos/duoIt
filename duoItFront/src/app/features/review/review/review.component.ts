import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { CardView, Rating } from '../../../core/models/study.model';
import { MAX_MISSES_PER_CARD, requeueAfter } from '../../../core/models/review-queue';
import { StudyApiService } from '../../../core/services/study-api.service';
import { FlashcardComponent } from '../../study/flashcard/flashcard.component';

/**
 * Cards Review: treino de palavras aprendidas, de todos os grupos. Não altera a liberação
 * dos grupos; o progresso do curso não depende desta tela.
 */
@Component({
  selector: 'app-review',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, FlashcardComponent],
  template: `
    <h1>Cards Review</h1>

    @if (loading()) {
      <p>Carregando revisão...</p>
    } @else if (error()) {
      <p>Não foi possível carregar a revisão.</p>
      <button mat-flat-button type="button" (click)="load()">Tentar de novo</button>
    } @else if (queue().length === 0) {
      <p>Nada para revisar agora. Marque palavras como aprendidas nos Termos do Grupo.</p>
    } @else if (finished()) {
      <p>Revisão concluída: {{ answered() }} cards avaliados.</p>
    } @else if (current(); as card) {
      <p class="counter">{{ index() + 1 }} de {{ queue().length }}</p>
      <app-flashcard [card]="card" (rated)="rate($event)" />
    }
  `,
  styles: `
    .counter {
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class ReviewComponent {
  private readonly api = inject(StudyApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly queue = signal<CardView[]>([]);
  protected readonly index = signal(0);
  protected readonly answered = signal(0);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  protected readonly current = computed(() => this.queue()[this.index()] ?? null);
  protected readonly finished = computed(() => this.queue().length > 0 && this.index() >= this.queue().length);

  private readonly misses = new Map<number, number>();
  private busy = false;

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.api
      .getReviewSession()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cards) => {
          this.queue.set(cards);
          this.index.set(0);
          this.answered.set(0);
          this.misses.clear();
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  protected rate(rating: Rating): void {
    const card = this.current();
    if (!card || this.busy) {
      return;
    }
    this.busy = true;
    this.api
      .answer(card.id, rating)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busy = false;
          this.answered.update((n) => n + 1);
          if (rating === 'AGAIN') {
            const count = (this.misses.get(card.id) ?? 0) + 1;
            this.misses.set(card.id, count);
            if (count <= MAX_MISSES_PER_CARD) {
              this.queue.update((q) => requeueAfter(q, this.index(), card));
            }
          }
          this.index.update((i) => i + 1);
        },
        error: () => {
          this.busy = false;
          this.error.set(true);
        },
      });
  }
}
