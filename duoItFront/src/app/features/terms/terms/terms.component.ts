import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
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
    <h1>Termos do Grupo</h1>
    <p class="intro">
      Estude as palavras abaixo. Ao concluir, todas entram no Cards Review. A conclusão não pode ser desfeita.
    </p>

    @if (loading()) {
      <p>Carregando termos...</p>
    } @else if (error()) {
      <p>Não foi possível carregar os termos.</p>
      <button mat-flat-button type="button" (click)="load()">Tentar de novo</button>
    } @else {
      <ul class="terms">
        @for (term of terms(); track term.id) {
          <li class="term-row">
            <span class="word">{{ term.term }}</span>
            <span class="meaning">{{ term.meaning }}</span>
            <span class="example">{{ term.example }}</span>
          </li>
        }
      </ul>

      <div class="actions">
        @if (completed()) {
          <p class="done">Grupo concluído. As palavras estão no Cards Review.</p>
        } @else {
          <button mat-flat-button type="button" class="btn-primary" [disabled]="concluding()" (click)="complete()">
            Concluir termos
          </button>
        }
      </div>
    }
  `,
  styles: `
    .intro {
      color: var(--mat-sys-on-surface-variant);
    }

    .terms {
      list-style: none;
      padding: 0;
      margin: 0;
      max-width: 820px;
    }

    .term-row {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 4px 16px;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-color);
    }

    .word {
      font-weight: 600;
    }

    .meaning {
      color: var(--text-secondary);
    }

    .example {
      grid-column: 2;
      font-style: italic;
      color: var(--mat-sys-on-surface-variant);
    }

    .actions {
      margin-top: 24px;
    }

    .done {
      color: var(--accent-yellow);
      font-weight: 600;
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
