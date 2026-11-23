import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar class="header">
      <button mat-icon-button type="button" aria-label="Alternar barra lateral" (click)="menuClick.emit()">
        <span class="material-symbols-outlined">menu</span>
      </button>

      <span class="logo">
        <span class="chevrons">»</span>Duo<span class="it">IT</span>
      </span>

      <span class="user">
        <span class="avatar">{{ initial() }}</span>
        {{ user.name() }}
      </span>
    </mat-toolbar>
  `,
  styles: `
    :host {
      display: block;
    }

    .header {
      background: rgba(11, 15, 22, 0.72);
      backdrop-filter: blur(6px);
      border-bottom: 2px solid var(--accent-red);
      height: 64px;
    }

    .logo {
      flex: 1;
      text-align: center;
      font: var(--mat-sys-title-large);
      font-weight: 700;
      font-style: italic;
      letter-spacing: 0.5px;
    }

    .chevrons {
      color: var(--accent-red);
      margin-right: 6px;
    }

    .it {
      color: var(--accent-yellow);
    }

    .user {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 140px;
      justify-content: flex-end;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--accent-blue);
      color: #fff;
      font-weight: 700;
    }
  `,
})
export class ToolbarComponent {
  protected readonly user = inject(UserService);
  protected initial(): string {
    return this.user.name().charAt(0).toUpperCase();
  }
  readonly menuClick = output<void>();
}
