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
          <button
            mat-stroked-button
            type="button"
            class="rating"
            [class.rating-again]="option.rating === 'AGAIN'"
            [class.rating-hard]="option.rating === 'HARD'"
            [class.rating-good]="option.rating === 'GOOD'"
            [class.rating-easy]="option.rating === 'EASY'"
            (click)="rated.emit(option.rating)"
          >
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
      min-height: 260px;
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
      font-size: clamp(30px, 5vw, 42px);
      line-height: 1.15;
      overflow-wrap: anywhere;
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
      max-width: 640px;
      gap: 12px;
      flex-wrap: wrap;
    }

    .rating {
      flex: 1 1 120px;
      min-width: 0;
      height: auto;
      padding: 10px 16px;
      border-width: 1px;
      transition: transform 140ms ease, background 140ms ease, border-color 140ms ease;
    }

    .rating:hover {
      transform: translateY(-2px);
    }

    .rating-again {
      --mdc-outlined-button-outline-color: rgba(229, 34, 50, 0.55);
      --mdc-outlined-button-label-text-color: #ff8b94;
    }

    .rating-again:hover {
      background: rgba(229, 34, 50, 0.12);
    }

    .rating-hard {
      --mdc-outlined-button-outline-color: rgba(255, 210, 46, 0.48);
      --mdc-outlined-button-label-text-color: #ffe17e;
    }

    .rating-hard:hover {
      background: rgba(255, 210, 46, 0.1);
    }

    .rating-good {
      --mdc-outlined-button-outline-color: rgba(22, 119, 255, 0.5);
      --mdc-outlined-button-label-text-color: #92bcff;
    }

    .rating-good:hover {
      background: rgba(22, 119, 255, 0.12);
    }

    .rating-easy {
      --mdc-outlined-button-outline-color: rgba(77, 205, 145, 0.48);
      --mdc-outlined-button-label-text-color: #84e3b1;
    }

    .rating-easy:hover {
      background: rgba(77, 205, 145, 0.1);
    }

    .rating-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .rating-interval {
      font-size: 12px;
      color: inherit;
      opacity: 0.8;
    }

    @media (max-width: 560px) {
      .flashcard {
        min-height: 220px;
        padding: 20px;
      }

      .ratings {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .rating {
        padding: 9px 6px;
      }
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
