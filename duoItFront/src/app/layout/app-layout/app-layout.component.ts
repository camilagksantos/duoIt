import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SidebarService } from '../../core/services/sidebar.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatTabsModule, SidebarComponent, ToolbarComponent],
  template: `
    <mat-sidenav-container class="layout" [hasBackdrop]="false">
      <mat-sidenav
        class="sidebar-drawer"
        mode="over"
        [opened]="sidebar.open()"
        (mouseleave)="sidebar.close()"
      >
        <app-sidebar />
      </mat-sidenav>

      <mat-sidenav-content>
        <app-toolbar (menuClick)="sidebar.toggle()" />

        <nav mat-tab-nav-bar class="tabs" [tabPanel]="tabPanel">
          <a mat-tab-link routerLink="/" routerLinkActive #introTab="routerLinkActive"
             [routerLinkActiveOptions]="{ exact: true }" [active]="introTab.isActive">Dashboard</a>
          <a mat-tab-link routerLink="/treino" routerLinkActive #trainTab="routerLinkActive"
             [active]="trainTab.isActive">Cards Review</a>
        </nav>
        <mat-tab-nav-panel #tabPanel />

        <main class="content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .layout {
      height: 100vh;
    }

    .sidebar-drawer {
      width: 300px;
    }

    .tabs {
      padding: 0 16px;
      background: rgba(11, 15, 22, 0.55);
    }

    .content {
      padding: 24px 16px;
    }
  `,
})
export class AppLayoutComponent {
  // Fechada por padrão. Abre sobre o conteúdo (sem empurrar a tela) e fecha quando o mouse sai dela.
  protected readonly sidebar = inject(SidebarService);
}
