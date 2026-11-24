import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { CardView, Rating } from '../../../core/models/study.model';
import { MAX_MISSES_PER_CARD } from '../../../core/models/review-queue';
import { StudyApiService } from '../../../core/services/study-api.service';
import { FlashcardComponent } from '../../study/flashcard/flashcard.component';

/** Item da sessão: um card e quando ele pode voltar a aparecer. */
interface QueueItem {
  card: CardView;
  /** Instante (ms) a partir do qual o card pode ser mostrado. */
  availableAt: number;
  misses: number;
}

/** Diária: vencidos e novos do dia, com repetição de erros. Geral: todas as palavras, uma passada. */
export type ReviewMode = 'daily' | 'all';

/**
 * Cards Review: treino das palavras de grupos concluídos, de todos os grupos.
 * Modo diário segue o agendamento FSRS. Modo geral mostra todas as palavras sem filtrar por data.
 * As avaliações daqui não contam para a progressão do curso.
 */
@Component({
  selector: 'app-review',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, FlashcardComponent],
  template: `
    <section class="review-page">
      <header class="page-heading">
        <div>
          <p class="eyebrow">TREINO DE VOCABULÁRIO</p>
          <h1>Cards Review</h1>
          <p class="intro">Pratique os termos dos grupos que você já concluiu.</p>
        </div>
        <span class="material-symbols-outlined heading-icon" aria-hidden="true">style</span>
      </header>

      <div class="mode-switch" role="group" aria-label="Modo de revisão">
        <button
          mat-stroked-button
          type="button"
          [attr.aria-pressed]="mode() === 'daily'"
          [class.active]="mode() === 'daily'"
          (click)="setMode('daily')"
        >
          <span class="material-symbols-outlined" aria-hidden="true">today</span>
          <span class="mode-copy">
            <strong>Revisão do dia</strong>
            <small>Seguir o FSRS</small>
          </span>
        </button>
        <button
          mat-stroked-button
          type="button"
          [attr.aria-pressed]="mode() === 'all'"
          [class.active]="mode() === 'all'"
          (click)="setMode('all')"
        >
          <span class="material-symbols-outlined" aria-hidden="true">library_books</span>
          <span class="mode-copy">
            <strong>Revisão geral</strong>
            <small>Ver todos os termos</small>
          </span>
        </button>
      </div>

      <main class="review-panel">
        @if (loading()) {
          <div class="state-panel" role="status">
            <span class="material-symbols-outlined state-icon">progress_activity</span>
            <p>Carregando revisão...</p>
          </div>
        } @else if (error()) {
          <div class="state-panel" role="alert">
            <span class="material-symbols-outlined state-icon">wifi_off</span>
            <p>Não foi possível carregar a revisão.</p>
            <button mat-flat-button type="button" class="btn-primary" (click)="load()">Tentar de novo</button>
          </div>
        } @else if (initialCount() === 0) {
          <div class="state-panel">
            <span class="material-symbols-outlined state-icon">{{ mode() === 'daily' ? 'event_available' : 'library_books' }}</span>
            @if (mode() === 'daily') {
              <strong>Nada para revisar agora</strong>
              <p>As próximas revisões aparecem quando vencerem. Você também pode consultar todos os termos na revisão geral.</p>
            } @else {
              <strong>Nenhum termo no Review</strong>
              <p>Conclua os Termos de um grupo para incluir as palavras aqui.</p>
            }
          </div>
        } @else if (items().length === 0) {
          <div class="state-panel success" role="status">
            <span class="material-symbols-outlined state-icon">task_alt</span>
            <strong>Revisão concluída</strong>
            <p>{{ answered() }} respostas registradas nesta sessão.</p>
          </div>
        } @else if (currentItem(); as item) {
          <div class="session-meta">
            <span class="session-label">{{ mode() === 'daily' ? 'SESSÃO DO DIA' : 'REVISÃO GERAL' }}</span>
            <span class="counter">{{ answered() + 1 }}ª resposta <span aria-hidden="true">·</span> {{ items().length }} pendentes</span>
          </div>
          <app-flashcard [card]="item.card" (rated)="rate($event)" />
        } @else {
          <div class="state-panel waiting" role="status" aria-live="polite">
            <span class="material-symbols-outlined state-icon">schedule</span>
            <strong>Próxima revisão em {{ waitingMinutes() }} min</strong>
            <p>O card volta à sessão quando o passo de aprendizagem terminar. Você pode sair e retornar depois.</p>
          </div>
        }
      </main>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .review-page {
      width: min(100%, 900px);
      margin: 0 auto;
    }

    .page-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 24px;
    }

    .eyebrow {
      margin: 0 0 8px;
      color: var(--accent-blue);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.14em;
    }

    h1 {
      margin: 0;
      font-size: clamp(28px, 4vw, 38px);
      line-height: 1.15;
    }

    .intro {
      margin: 10px 0 0;
      color: var(--mat-sys-on-surface-variant);
      line-height: 1.55;
    }

    .heading-icon {
      display: grid;
      width: 52px;
      height: 52px;
      place-items: center;
      border: 1px solid rgba(22, 119, 255, 0.35);
      border-radius: 15px;
      color: #84b6ff;
      background: rgba(22, 119, 255, 0.12);
      font-size: 27px;
    }

    .mode-switch {
      display: flex;
      width: fit-content;
      max-width: 100%;
      gap: 8px;
      padding: 6px;
      margin-bottom: 22px;
      border: 1px solid var(--border-color);
      border-radius: 14px;
      background: rgba(11, 15, 22, 0.72);
    }

    .mode-switch button {
      display: flex;
      min-width: 205px;
      min-height: 58px;
      align-items: center;
      justify-content: flex-start;
      gap: 11px;
      padding: 8px 14px;
      border-color: transparent;
      border-radius: 10px;
      color: var(--text-secondary);
      text-align: left;
      transition: color 150ms ease, background 150ms ease, border-color 150ms ease;
    }

    .mode-switch button > .material-symbols-outlined {
      color: var(--accent-blue);
      font-size: 22px;
    }

    .mode-switch button.active {
      border-color: rgba(22, 119, 255, 0.45);
      color: var(--text-primary);
      background: linear-gradient(110deg, rgba(22, 119, 255, 0.2), rgba(22, 119, 255, 0.08));
      box-shadow: inset 0 0 0 1px rgba(22, 119, 255, 0.08);
    }

    .mode-switch button.active > .material-symbols-outlined {
      color: #9ac4ff;
    }

    .mode-switch button:not(.active):hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.04);
    }

    .mode-copy {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .mode-copy strong {
      font-size: 13px;
      line-height: 1.2;
    }

    .mode-copy small {
      color: var(--text-secondary);
      font-size: 11px;
      line-height: 1.2;
    }

    .review-panel {
      min-height: 260px;
    }

    .session-meta {
      display: flex;
      max-width: 640px;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin: 0 0 12px;
    }

    .session-label {
      color: var(--accent-yellow);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.1em;
    }

    .counter {
      padding: 5px 9px;
      border: 1px solid var(--border-color);
      border-radius: 999px;
      color: var(--mat-sys-on-surface-variant);
      background: rgba(21, 27, 37, 0.8);
      font-size: 11px;
      white-space: nowrap;
    }

    .state-panel {
      display: flex;
      min-height: 230px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 28px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-card);
      color: var(--text-secondary);
      background: linear-gradient(145deg, rgba(32, 36, 44, 0.9), rgba(21, 27, 37, 0.9));
      text-align: center;
    }

    .state-panel strong {
      color: var(--text-primary);
      font-size: 17px;
    }

    .state-panel p {
      max-width: 520px;
      margin: 0;
      line-height: 1.55;
    }

    .state-icon {
      margin-bottom: 4px;
      color: var(--accent-blue);
      font-size: 34px;
    }

    .state-panel.success .state-icon {
      color: var(--accent-yellow);
    }

    .state-panel.waiting .state-icon {
      color: var(--accent-yellow);
    }

    button:focus-visible {
      outline: 2px solid var(--accent-yellow);
      outline-offset: 3px;
    }

    @media (max-width: 560px) {
      .mode-switch {
        display: grid;
        width: 100%;
        grid-template-columns: 1fr 1fr;
      }

      .mode-switch button {
        min-width: 0;
        padding: 8px;
      }

      .mode-copy strong {
        font-size: 12px;
      }

      .mode-copy small {
        font-size: 10px;
      }

      .session-meta {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `,
})
export class ReviewComponent implements OnDestroy {
  private readonly api = inject(StudyApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly mode = signal<ReviewMode>('daily');
  protected readonly items = signal<QueueItem[]>([]);
  protected readonly initialCount = signal(0);
  protected readonly answered = signal(0);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  /** Relógio usado para decidir quais cards já podem aparecer. Atualizado por temporizador. */
  protected readonly now = signal(Date.now());

  protected readonly currentItem = computed(
    () => this.items().find((item) => item.availableAt <= this.now()) ?? null,
  );

  protected readonly waitingMinutes = computed(() => {
    const next = Math.min(...this.items().map((item) => item.availableAt));
    return Math.max(1, Math.ceil((next - this.now()) / 60000));
  });

  private timer: ReturnType<typeof setTimeout> | undefined;
  private busy = false;

  constructor() {
    this.load();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }

  protected setMode(mode: ReviewMode): void {
    if (mode === this.mode()) {
      return;
    }
    this.mode.set(mode);
    this.load();
  }

  protected load(): void {
    clearTimeout(this.timer);
    this.loading.set(true);
    this.error.set(false);
    const source = this.mode() === 'daily' ? this.api.getReviewSession() : this.api.getReviewAll();
    source
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cards) => {
          this.initialCount.set(cards.length);
          this.answered.set(0);
          this.now.set(Date.now());
          this.items.set(cards.map((card) => ({ card, availableAt: 0, misses: 0 })));
          this.loading.set(false);
          this.scheduleWakeUp();
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  protected rate(rating: Rating): void {
    const item = this.currentItem();
    if (!item || this.busy) {
      return;
    }
    this.busy = true;
    this.api
      .answerReview(item.card.id, rating)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.busy = false;
          this.answered.update((n) => n + 1);
          const misses = rating === 'AGAIN' ? item.misses + 1 : item.misses;
          // No modo geral cada palavra passa uma vez. No diário, erro volta na sessão.
          const stays = this.mode() === 'daily' && rating === 'AGAIN' && misses <= MAX_MISSES_PER_CARD;
          this.items.update((list) =>
            stays
              ? list.map((i) =>
                  i === item
                    ? { card: i.card, misses, availableAt: new Date(response.nextDueAt).getTime() }
                    : i,
                )
              : list.filter((i) => i !== item),
          );
          this.now.set(Date.now());
          this.scheduleWakeUp();
        },
        error: () => {
          this.busy = false;
          this.error.set(true);
        },
      });
  }

  /** Quando nenhum card está disponível, acorda no instante em que o próximo fica pronto. */
  private scheduleWakeUp(): void {
    clearTimeout(this.timer);
    if (this.items().length === 0 || this.currentItem()) {
      return;
    }
    const next = Math.min(...this.items().map((item) => item.availableAt));
    this.timer = setTimeout(() => this.now.set(Date.now()), Math.max(200, next - Date.now()));
  }
}
