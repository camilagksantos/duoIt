import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ExerciseStatus } from '../../../core/services/progress.service';

/** Barra de progresso segmentada: um segmento por item (ex.: por grupo de palavras). */
@Component({
  selector: 'app-segmented-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar" role="img" [attr.aria-label]="'Progresso em ' + statuses().length + ' itens'">
      @for (status of statuses(); track $index) {
        <span class="segment" [class]="'segment is-' + status"></span>
      }
    </div>
  `,
  styles: `
    .bar {
      display: flex;
      gap: 3px;
      width: 100%;
    }

    .segment {
      flex: 1;
      height: 10px;
      border-radius: 2px;
      background: var(--border-color);
    }

    .segment.is-done {
      background: var(--accent-yellow);
    }

    .segment.is-open {
      background: var(--accent-red);
    }
  `,
})
export class SegmentedBarComponent {
  readonly statuses = input.required<ExerciseStatus[]>();
}
