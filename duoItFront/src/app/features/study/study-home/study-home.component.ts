import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { CardView, Rating } from '../../../core/models/study.model';
import { MAX_MISSES_PER_CARD, requeueAfter } from '../../../core/models/review-queue';
import { ProgressService } from '../../../core/services/progress.service';
import { StudyApiService } from '../../../core/services/study-api.service';
import { StudyService } from '../../../core/services/study.service';
import { FlashcardComponent } from '../flashcard/flashcard.component';

/**
 * Tela do exercício Cards de um grupo. Apresenta o exercício selecionado no menu
 * e usa o FlashcardComponent para cada card.
 */
@Component({
  selector: 'app-study-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, FlashcardComponent],
  template: `
    @if (!submoduleId()) {
      <h1>Escolha um exercício</h1>
      <p>Abra um módulo e um submódulo no menu lateral e clique em "Cards".</p>
    } @else if (loading()) {
      <p>Carregando sessão...</p>
    } @else if (error()) {
      <h1>Não foi possível carregar a sessão</h1>
      <p>Verifique se a API está rodando em localhost:8080.</p>
      <button mat-flat-button type="button" (click)="reload()">Tentar de novo</button>
    } @else if (queue().length === 0) {
      <h1>Nada para estudar agora</h1>
      <p>Marque palavras como aprendidas na tela de Termos do Grupo, ou volte mais tarde.</p>
    } @else if (finished()) {
      <h1>Sessão concluída</h1>
      <p>Você avaliou {{ answered() }} cards.</p>
    } @else if (current(); as card) {
      <p class="counter">{{ index() + 1 }} de {{ queue().length }} · {{ card.isNew ? 'Novo' : 'Revisão' }}</p>
      <app-flashcard [card]="card" (rated)="rate($event)" />
    }
  `,
  styles: `
    .counter {
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class StudyHomeComponent {
  private readonly api = inject(StudyApiService);
  private readonly study = inject(StudyService);
  private readonly progress = inject(ProgressService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly submoduleId = signal<string | null>(null);
  protected readonly queue = signal<CardView[]>([]);
  protected readonly index = signal(0);
  protected readonly answered = signal(0);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);

  protected readonly current = computed(() => this.queue()[this.index()] ?? null);
  protected readonly finished = computed(() => this.queue().length > 0 && this.index() >= this.queue().length);

  /** Quantas vezes cada card foi errado nesta sessão. */
  private readonly misses = new Map<number, number>();
  private busy = false;

  constructor() {
    // Quando o usuário escolhe um exercício no menu, a sessão desse grupo é carregada.
    effect(() => {
      const selection = this.study.current();
      untracked(() => this.open(selection?.submodule.id ?? null));
    });
  }

  protected reload(): void {
    this.open(this.submoduleId());
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
          this.advance(card, rating);
        },
        error: () => {
          this.busy = false;
          this.error.set(true);
        },
      });
  }

  /** Erro volta na mesma sessão, até o limite de repetições. Acerto segue a fila. */
  private advance(card: CardView, rating: Rating): void {
    if (rating === 'AGAIN') {
      const count = (this.misses.get(card.id) ?? 0) + 1;
      this.misses.set(card.id, count);
      if (count <= MAX_MISSES_PER_CARD) {
        this.queue.update((q) => requeueAfter(q, this.index(), card));
      }
    }
    this.index.update((i) => i + 1);
    if (this.finished()) {
      this.progress.load();
    }
  }

  private open(submoduleId: string | null): void {
    this.submoduleId.set(submoduleId);
    this.queue.set([]);
    this.index.set(0);
    this.answered.set(0);
    this.misses.clear();
    this.error.set(false);
    if (!submoduleId) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.api
      .getSession(submoduleId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cards) => {
          this.queue.set(cards);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }
}
