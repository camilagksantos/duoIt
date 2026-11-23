import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MODULE_ICONS } from '../../../core/data/learning-plan.data';
import { LearningModule } from '../../../core/models/learning.model';
import { NavFlyoutComponent } from '../../../share/components/nav-flyout/nav-flyout.component';
import { NavItemComponent } from '../../../share/components/nav-item/nav-item.component';
import { SubmoduleMenuComponent } from '../submodule-menu/submodule-menu.component';

@Component({
  selector: 'app-module-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavItemComponent, NavFlyoutComponent, SubmoduleMenuComponent],
  template: `
    @for (module of modules(); track module.id) {
      <app-nav-item [label]="module.title" [icon]="iconFor(module.id)" [expandable]="true">
        <app-nav-flyout>
          <app-submodule-menu [module]="module" />
        </app-nav-flyout>
      </app-nav-item>
    }
  `,
})
export class ModuleMenuComponent {
  readonly modules = input.required<LearningModule[]>();

  protected iconFor(moduleId: string): string {
    return MODULE_ICONS[moduleId] ?? 'school';
  }
}
