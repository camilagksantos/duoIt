import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Item de navegação reutilizável.
 * Quando `expandable` é true, mostra a seta e aceita um `app-nav-flyout` projetado.
 * O painel abre somente ao passar o mouse (ver `share/styles/navigation.scss`).
 * Quando `disabled` é true, o item não responde a cliques e mostra `hint` à direita.
 * `icon` é um nome do Material Symbols; `selected` destaca em vermelho.
 */
@Component({
  selector: 'app-nav-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'nav-item',
    '[class.is-disabled]': 'disabled()',
    '[class.is-selected]': 'selected()',
  },
  template: `
    <button type="button" class="nav-item-label" [disabled]="disabled()" (click)="activate.emit()">
      @if (icon()) {
        <span class="material-symbols-outlined nav-item-icon">{{ icon() }}</span>
      }
      <span class="nav-item-text">{{ label() }}</span>
      @if (hint()) {
        <span class="nav-item-hint" [class.is-success]="hintTone() === 'success'">{{ hint() }}</span>
      }
      @if (expandable()) {
        <span class="material-symbols-outlined nav-item-arrow">chevron_right</span>
      }
    </button>
    <ng-content />
  `,
})
export class NavItemComponent {
  readonly label = input.required<string>();
  readonly icon = input('');
  readonly expandable = input(false);
  readonly disabled = input(false);
  readonly selected = input(false);
  readonly hint = input('');
  readonly hintTone = input<'default' | 'success'>('default');
  readonly activate = output<void>();
}
