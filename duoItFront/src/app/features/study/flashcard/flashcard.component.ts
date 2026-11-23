import { ChangeDetectionStrategy, Component, effect, input, output, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CardView, Rating, formatInterval } from '../../../core/models/study.model';

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

/**
 * Apresenta um card: termo na frente, resposta depois de "Mostrar resposta",
 * e as quatro avaliações. Não sabe nada de sessão; avisa a escolha pelo output `rated`.
 */
@Component({
  selector: 'app-flashcard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatCardModule],
  template: `
    <mat-card class="flashcard" [class.is-back]="showAnswer()">
      <p class="meta">{{ card().moduleTitle }} › {{ card().submoduleTitle }}</p>
      <h1 class="term">{{ card().term }}</h1>

      @if (showAnswer()) {
        <p class="meaning">{{ card().meaning }}</p>
        <p class="example">{{ card().example }}</p>
      }
    </mat-card>

    @if (!showAnswer()) {
      <button mat-flat-button type="button" class="btn-primary reveal" (click)="showAnswer.set(true)">
        Mostrar resposta
      </button>
    } @else {
      <div class="ratings">
        @for (option of ratingOptions; track option.rating) {
          <button mat-stroked-button type="button" class="rating" (click)="rated.emit(option.rating)">
            <span class="rating-box">
              <span class="rating-label">{{ option.label }}</span>
              <span class="rating-interval">{{ interval(option.rating) }}</span>
            </span>
          </button>
        }
      </div>
    }
  `,
  styles: `
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
export class FlashcardComponent {
  readonly card = input.required<CardView>();
  readonly rated = output<Rating>();

  protected readonly ratingOptions = RATING_OPTIONS;
  protected readonly showAnswer = signal(false);

  constructor() {
    // Cada card começa com a resposta escondida.
    effect(() => {
      this.card();
      untracked(() => this.showAnswer.set(false));
    });
  }

  protected interval(rating: Rating): string {
    return formatInterval(this.card().intervals[rating]);
  }
}
