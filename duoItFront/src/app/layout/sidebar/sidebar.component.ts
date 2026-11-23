import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { StudyService } from '../../core/services/study.service';
import { UserService } from '../../core/services/user.service';
import { ModuleMenuComponent } from './module-menu/module-menu.component';

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModuleMenuComponent, RouterLink, RouterLinkActive],
  template: `
    <div class="greeting">
      <span class="material-symbols-outlined">account_circle</span>
      Olá, {{ user.name() }}
    </div>

    <div class="nav-item dashboard-link">
      <a class="nav-item-label" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
        <span class="material-symbols-outlined nav-item-icon">home</span>
        <span class="nav-item-text">Dashboard</span>
      </a>
    </div>

    <app-module-menu [modules]="study.modules()" />
  `,
  styles: `
    :host {
      display: block;
      padding: 16px 12px;
    }

    .greeting {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px 20px;
      font: var(--mat-sys-title-large);
      color: var(--mat-sys-on-surface);
    }

    .dashboard-link {
      margin-bottom: 8px;
    }
  `,
})
export class SidebarComponent {
  protected readonly user = inject(UserService);
  protected readonly study = inject(StudyService);
}
