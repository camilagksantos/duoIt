import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TermView } from '../../../core/models/study.model';
import { ProgressService } from '../../../core/services/progress.service';
import { TermsApiService } from '../../../core/services/terms-api.service';

/**
 * Termos do Grupo: lista as palavras para estudo, sem avaliação.
 * Concluir inclui todas as palavras do grupo no Cards Review, de uma vez.
 */
@Component({
  selector: 'app-terms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule],
  template: `
    <section class="terms-page">
      <header class="page-heading">
        <div>
          <p class="eyebrow">VOCABULÁRIO DO CURSO</p>
          <h1>Termos do Grupo</h1>
          <p class="intro">Estude cada termo no contexto da frase antes de concluir o grupo.</p>
        </div>
        @if (!loading() && !error() && unlocked()) {
          <div class="term-count" aria-label="Quantidade de termos">
            <strong>{{ terms().length }}</strong>
            <span>{{ terms().length === 1 ? 'termo' : 'termos' }}</span>
          </div>
        }
      </header>

      @if (loading()) {
        <div class="state-panel" role="status">
          <span class="material-symbols-outlined state-icon">progress_activity</span>
          <p>Carregando termos...</p>
        </div>
      } @else if (!unlocked()) {
        <div class="state-panel locked" role="status">
          <span class="material-symbols-outlined state-icon">lock</span>
          <p>Conclua o grupo anterior para liberar estes termos.</p>
        </div>
      } @else if (error()) {
        <div class="state-panel" role="alert">
          <span class="material-symbols-outlined state-icon">wifi_off</span>
          <p>Não foi possível carregar os termos.</p>
          <button mat-flat-button type="button" (click)="load()">Tentar de novo</button>
        </div>
      } @else if (terms().length === 0) {
        <div class="state-panel">
          <span class="material-symbols-outlined state-icon">library_books</span>
          <p>Este grupo ainda não tem termos disponíveis.</p>
        </div>
      } @else {
        <ul class="terms">
          @for (term of terms(); track term.id) {
            <li class="term-card">
              <div class="term-heading">
                <span class="word">{{ term.term }}</span>
                <span class="language-tag">EN</span>
              </div>
              <p class="meaning">{{ term.meaning }}</p>
              <div class="example-block">
                <span class="example-label">NO CONTEXTO</span>
                <p class="example">{{ term.example }}</p>
              </div>
            </li>
          }
        </ul>

        <section class="completion-panel" aria-live="polite">
          @if (completed()) {
            <span class="material-symbols-outlined completion-icon">task_alt</span>
            <div class="completion-copy">
              <strong>Grupo concluído</strong>
              <span>As palavras foram incluídas no Cards Review.</span>
            </div>
            <button mat-flat-button type="button" class="btn-primary" disabled>Concluído</button>
          } @else {
            <span class="material-symbols-outlined completion-icon">checklist</span>
            <div class="completion-copy">
              <strong>Terminou de estudar?</strong>
              <span>Ao concluir, todos os termos passam a fazer parte do Cards Review.</span>
            </div>
            <button
              mat-flat-button
              type="button"
              class="btn-primary"
              [disabled]="concluding()"
              (click)="complete()"
            >
              {{ concluding() ? 'Salvando...' : 'Concluir grupo' }}
            </button>
          }
        </section>
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .terms-page {
      width: min(100%, 1040px);
      margin: 0 auto;
    }

    .page-heading {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 26px;
    }

    .eyebrow {
      margin: 0 0 8px;
      color: var(--accent-red);
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
      line-height: 1.6;
    }

    .terms {
      list-style: none;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr));
      gap: 14px;
      padding: 0;
      margin: 0;
    }

    .term-card {
      min-width: 0;
      padding: 18px 20px;
      border: 1px solid var(--border-color);
      border-left: 3px solid var(--accent-blue);
      border-radius: var(--radius-card);
      background: linear-gradient(145deg, rgba(32, 36, 44, 0.96), rgba(21, 27, 37, 0.94));
      box-shadow: var(--shadow-card);
      transition: border-color 160ms ease, transform 160ms ease;
    }

    .term-card:hover {
      transform: translateY(-2px);
      border-color: rgba(22, 119, 255, 0.65);
    }

    .term-heading {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .word {
      color: var(--text-primary);
      font-size: 21px;
      font-weight: 750;
      line-height: 1.3;
      overflow-wrap: anywhere;
    }

    .language-tag {
      flex: 0 0 auto;
      padding: 4px 7px;
      border: 1px solid rgba(22, 119, 255, 0.35);
      border-radius: 5px;
      color: #8bbcff;
      background: rgba(22, 119, 255, 0.12);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.08em;
    }

    .meaning {
      margin: 7px 0 16px;
      font-size: 15px;
      color: var(--text-secondary);
    }

    .example-block {
      padding: 11px 13px;
      border-radius: 8px;
      background: rgba(11, 15, 22, 0.58);
    }

    .example-label {
      color: var(--accent-yellow);
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.1em;
    }

    .example {
      margin: 5px 0 0;
      color: #dce3ed;
      font-size: 14px;
      font-style: italic;
      line-height: 1.55;
      overflow-wrap: anywhere;
    }

    .term-count {
      display: flex;
      flex: 0 0 auto;
      align-items: baseline;
      gap: 7px;
      padding: 9px 13px;
      border: 1px solid var(--border-color);
      border-radius: 999px;
      color: var(--text-secondary);
      background: rgba(21, 27, 37, 0.8);
      font-size: 13px;
    }

    .term-count strong {
      color: var(--accent-yellow);
      font-size: 17px;
    }

    .completion-panel {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-top: 24px;
      padding: 16px 18px;
      border: 1px solid rgba(229, 34, 50, 0.32);
      border-radius: var(--radius-card);
      background: linear-gradient(110deg, rgba(229, 34, 50, 0.11), rgba(21, 27, 37, 0.94) 42%);
    }

    .completion-icon {
      color: var(--accent-red);
      font-size: 27px;
    }

    .completion-copy {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }

    .completion-copy strong {
      color: var(--text-primary);
      font-size: 14px;
    }

    .completion-copy span {
      color: var(--text-secondary);
      font-size: 12px;
      line-height: 1.45;
    }

    .state-panel {
      display: flex;
      min-height: 180px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 24px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-card);
      color: var(--text-secondary);
      background: rgba(21, 27, 37, 0.84);
      text-align: center;
    }

    .state-panel p {
      margin: 0;
    }

    .state-icon {
      color: var(--accent-blue);
      font-size: 32px;
    }

    .state-panel.locked .state-icon {
      color: var(--accent-yellow);
    }

    .btn-primary:disabled {
      opacity: 0.82;
    }

    @media (max-width: 600px) {
      .page-heading {
        align-items: flex-start;
      }

      .term-count {
        gap: 4px;
        padding: 7px 9px;
        font-size: 11px;
      }

      .term-card {
        padding: 16px;
      }

      .completion-panel {
        align-items: flex-start;
        flex-wrap: wrap;
      }

      .completion-copy {
        flex-basis: calc(100% - 48px);
      }

      .completion-panel button {
        width: 100%;
      }
    }
  `,
})
export class TermsComponent {
  private readonly api = inject(TermsApiService);
  private readonly progress = inject(ProgressService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly slug = this.route.snapshot.paramMap.get('slug') ?? '';

  protected readonly terms = signal<TermView[]>([]);
  protected readonly completed = signal(false);
  protected readonly unlocked = computed(() => this.progress.isTermsUnlocked(this.slug));
  protected readonly loading = signal(true);
  protected readonly concluding = signal(false);
  protected readonly error = signal(false);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.api
      .getTerms(this.slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.terms.set(response.terms);
          this.completed.set(response.completed);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  protected complete(): void {
    this.concluding.set(true);
    this.api
      .complete(this.slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.completed.set(true);
          this.concluding.set(false);
          this.progress.load();
        },
        error: () => {
          this.concluding.set(false);
          this.error.set(true);
        },
      });
  }
}
