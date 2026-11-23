import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgressService } from '../../../core/services/progress.service';
import { SidebarService } from '../../../core/services/sidebar.service';
import { SegmentedBarComponent } from '../../../share/components/segmented-bar/segmented-bar.component';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SegmentedBarComponent],
  template: `
    <h1 class="title"><span class="chevrons">»</span> Dashboard</h1>
    <p class="intro">Bem-vindo ao Duo IT. Abra o menu lateral para escolher um módulo e um grupo de palavras.</p>

    <section class="actions">
      <button type="button" class="dashboard-card action study" (click)="sidebar.show()">
        <span class="material-symbols-outlined action-icon">menu_book</span>
        <h2>Estudar</h2>
        <p>Abra o menu lateral e escolha um exercício liberado.</p>
        <span class="material-symbols-outlined arrow">chevron_right</span>
      </button>

      <a class="dashboard-card action review" routerLink="/treino">
        <span class="material-symbols-outlined action-icon">style</span>
        <h2>Cards Review</h2>
        <p>Revise os cards de forma prática.</p>
        <span class="material-symbols-outlined arrow">chevron_right</span>
      </a>

      <div class="dashboard-card action progress">
        <span class="material-symbols-outlined action-icon">bar_chart</span>
        <h2>Meu Progresso</h2>
        @if (progress.failed()) {
          <p class="error">Não foi possível carregar o progresso.</p>
          <button mat-stroked-button type="button" (click)="progress.load()">Tentar de novo</button>
        } @else {
          <app-segmented-bar [statuses]="segments()" />
        }
        <p class="numbers">
          <strong>{{ progress.totals().answered }}</strong> de {{ progress.totals().total }} cards avaliados
        </p>
      </div>
    </section>
  `,
  styles: `
    .title {
      font-style: italic;
      font-weight: 700;
      margin: 0 0 8px;
    }

    .chevrons {
      color: var(--accent-red);
    }

    .intro {
      color: var(--text-secondary);
      margin: 0 0 24px;
    }

    .actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }

    button.action {
      font: inherit;
      text-align: left;
      cursor: pointer;
      background: var(--bg-card);
    }

    .action {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 20px;
      color: var(--text-primary);
      text-decoration: none;
      border-top: 3px solid;
    }

    .action h2 {
      margin: 8px 0 0;
      font-size: 20px;
    }

    .action p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 14px;
    }

    .action-icon {
      font-size: 28px;
    }

    .arrow {
      position: absolute;
      right: 16px;
      bottom: 16px;
      color: var(--text-secondary);
    }

    .study {
      border-top-color: var(--accent-red);
      .action-icon {
        color: var(--accent-red);
      }
    }

    .review {
      border-top-color: var(--accent-blue);
      .action-icon {
        color: var(--accent-blue);
      }
    }

    .progress {
      border-top-color: var(--accent-yellow);
      .action-icon {
        color: var(--accent-yellow);
      }
    }

    .numbers {
      margin-top: 4px;
    }

    .error {
      color: var(--accent-red);
    }

    .numbers strong {
      color: var(--accent-yellow);
    }
  `,
})
export class DashboardComponent {
  protected readonly progress = inject(ProgressService);
  protected readonly sidebar = inject(SidebarService);

  constructor() {
    // Tenta de novo sempre que o dashboard abre, caso a API tenha falhado antes.
    this.progress.load();
  }

  protected segments() {
    return this.progress.studyOrder.map((id) => this.progress.status(id));
  }
}
