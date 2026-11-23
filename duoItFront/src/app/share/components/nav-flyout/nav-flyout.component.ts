import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Painel que abre ao lado de um `app-nav-item` quando ele recebe o mouse.
 * A visibilidade é controlada pelo CSS global em `share/styles/navigation.scss`.
 */
@Component({
  selector: 'app-nav-flyout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'nav-flyout' },
  template: `<ng-content />`,
})
export class NavFlyoutComponent {}
