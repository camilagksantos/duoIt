import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TermView } from '../../../core/models/study.model';
import { TermsApiService } from '../../../core/services/terms-api.service';

/**
 * Termos do Grupo: lista as palavras do grupo sem avaliação. O checkbox "aprendi" marca
 * a palavra para o Cards Review. Desmarcar só pausa a palavra.
 */
@Component({
  selector: 'app-terms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCheckboxModule],
  template: `
    <h1>Termos do Grupo</h1>
    <p class="intro">Marque as palavras que você já aprendeu. Elas entram no Cards Review.</p>

    @if (loading()) {
      <p>Carregando termos...</p>
    } @else if (error()) {
      <p>Não foi possível carregar os termos.</p>
    } @else {
      <ul class="terms">
        @for (term of terms(); track term.id) {
          <li class="term-row">
            <mat-checkbox [checked]="term.learned" (change)="toggle(term, $event.checked)">
              <span class="word">{{ term.term }}</span>
            </mat-checkbox>
            <span class="meaning">{{ term.meaning }}</span>
            <span class="example">{{ term.example }}</span>
          </li>
        }
      </ul>
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
  `,
})
export class TermsComponent {
  private readonly api = inject(TermsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly terms = signal<TermView[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.api
      .getTerms(slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (terms) => {
          this.terms.set(terms);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  protected toggle(term: TermView, learned: boolean): void {
    this.api
      .setLearned(term.id, learned)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.terms.update((list) => list.map((t) => (t.id === term.id ? { ...t, learned } : t))),
        error: () => this.error.set(true),
      });
  }
}
