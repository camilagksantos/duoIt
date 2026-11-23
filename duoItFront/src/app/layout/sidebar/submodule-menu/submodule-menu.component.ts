import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LearningModule } from '../../../core/models/learning.model';
import { NavFlyoutComponent } from '../../../share/components/nav-flyout/nav-flyout.component';
import { NavItemComponent } from '../../../share/components/nav-item/nav-item.component';
import { ExerciseMenuComponent } from '../exercise-menu/exercise-menu.component';

@Component({
  selector: 'app-submodule-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavItemComponent, NavFlyoutComponent, ExerciseMenuComponent],
  template: `
    @for (submodule of module().submodules; track submodule.id) {
      <app-nav-item [label]="submodule.title" [expandable]="true">
        <app-nav-flyout>
          <app-exercise-menu [module]="module()" [submodule]="submodule" />
        </app-nav-flyout>
      </app-nav-item>
    }
  `,
})
export class SubmoduleMenuComponent {
  readonly module = input.required<LearningModule>();
}
