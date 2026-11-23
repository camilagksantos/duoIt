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
import { MatCardModule } from '@angular/material/card';
import { CardView, Rating } from '../../../core/models/study.model';
import { ProgressService } from '../../../core/services/progress.service';
import { StudyApiService } from '../../../core/services/study-api.service';
import { StudyService } from '../../../core/services/study.service';

interface RatingOption {
  rating: Rating;
  label: string;
}

const RATING_OPTIONS: RatingOption[] = [
  { rating: 'AGAIN', label: 'Errei' },
  { rating: 'HARD', label: 'Difícil' },
  { rating: 'GOOD', label: 'Médio' },
  { rating: 'EASY', label: 'Fácil' },
];

@Component({
  selector: 'app-study-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatCardModule],
  template: `
    @if (!submoduleId()) {
      <h1>Escolha um exercício</h1>
      <p>Abra um módulo e um submódulo no menu lateral e clique em "Cards". Só os exercícios liberados podem ser feitos.</p>
    } @else if (loading()) {
      <p>Carregando sessão...</p>
    } @else if (error()) {
      <h1>Não foi possível carregar a sessão</h1>
      <p>Verifique se a API está rodando em localhost:8080.</p>
      <button mat-flat-button type="button" (click)="reload()">Tentar de novo</button>
    } @else if (cards().length === 0) {
      <h1>Nada para estudar agora</h1>
      <p>Este exercício não tem cards pendentes. Pode ser o limite diário de novos cards ou o exercício já foi concluído.</p>
    } @else if (finished()) {
      <h1>Sessão concluída</h1>
      <p>Você revisou {{ cards().length }} cards. O menu lateral atualiza a liberação dos próximos exercícios.</p>
    } @else if (current(); as card) {
      <p class="counter">
        {{ index() + 1 }} de {{ cards().length }} · {{ card.isNew ? 'Novo' : 'Revisão' }}
      </p>

      <mat-card class="flashcard" [class.is-back]="showAnswer()">
        <p class="meta">{{ card.moduleTitle }} › {{ card.submoduleTitle }}</p>
        <h1 class="term">{{ card.term }}</h1>

        @if (showAnswer()) {
          <p class="meaning">{{ card.meaning }}</p>
          <p class="example">{{ card.example }}</p>
        }
      </mat-card>

      @if (!showAnswer()) {
        <button mat-flat-button type="button" class="btn-primary reveal" (click)="reveal()">Mostrar resposta</button>
      } @else {
        <div class="ratings">
          @for (option of ratingOptions; track option.rating) {
            <button mat-stroked-button type="button" class="rating" (click)="rate(option.rating)">
              <span class="rating-box">
                <span class="rating-label">{{ option.label }}</span>
                <span class="rating-interval">{{ intervalLabel(card.intervals[option.rating]) }}</span>
              </span>
            </button>
          }
        </div>
      }
    }
  `,
  styles: `
    .counter {
      color: var(--mat-sys-on-surface-variant);
    }

    // Frente: azul com o termo. Verso: grafite com a resposta em destaque.
    .flashcard {
      max-width: 640px;
      padding: 24px;
      margin-bottom: 24px;
      border-radius: var(--radius-card);
      background: linear-gradient(135deg, var(--accent-blue), #0d4fb3) !important;
      color: #fff;
      box-shadow: var(--shadow-card);
    }

    .flashcard.is-back {
      background: var(--bg-card) !important;
      border: 1px solid var(--border-color);
      color: var(--text-primary);
    }

    .flashcard .meta,
    .flashcard .example {
      color: rgba(255, 255, 255, 0.85);
    }

    .flashcard.is-back .meta,
    .flashcard.is-back .example {
      color: var(--text-secondary);
    }

    .flashcard.is-back .meaning {
      color: var(--accent-yellow);
      font-size: 26px;
    }

    .meta {
      margin: 0 0 8px;
    }

    .term {
      margin: 0 0 16px;
    }

    .meaning {
      font: var(--mat-sys-title-medium);
      margin: 0 0 8px;
    }

    .example {
      font-style: italic;
      margin: 0;
    }

    .ratings {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .rating {
      min-width: 120px;
      height: auto;
      padding: 10px 16px;
    }

    .rating-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .rating-interval {
      font-size: 12px;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class StudyHomeComponent {
  private readonly api = inject(StudyApiService);
  private readonly study = inject(StudyService);
  private readonly progress = inject(ProgressService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly ratingOptions = RATING_OPTIONS;
  protected readonly submoduleId = signal<string | null>(null);
  protected readonly cards = signal<CardView[]>([]);
  protected readonly index = signal(0);
  protected readonly showAnswer = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);

  protected readonly current = computed(() => this.cards()[this.index()] ?? null);
  protected readonly finished = computed(() => this.cards().length > 0 && this.index() >= this.cards().length);

  private busy = false;

  constructor() {
    // Quando o usuário escolhe um exercício no menu, a sessão desse submódulo é carregada.
    effect(() => {
      const selection = this.study.current();
      untracked(() => this.open(selection?.submodule.id ?? null));
    });
  }

  protected reload(): void {
    this.open(this.submoduleId());
  }

  protected reveal(): void {
    this.showAnswer.set(true);
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
          this.showAnswer.set(false);
          this.index.update((i) => i + 1);
          if (this.finished()) {
            this.progress.load();
          }
        },
        error: () => {
          this.busy = false;
          this.error.set(true);
        },
      });
  }

  protected intervalLabel(days: number): string {
    return days === 1 ? '1 dia' : `${days} dias`;
  }

  private open(submoduleId: string | null): void {
    this.submoduleId.set(submoduleId);
    this.cards.set([]);
    this.index.set(0);
    this.showAnswer.set(false);
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
          this.cards.set(cards);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }
}
