import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Treino das palavras aprendidas. Estrutura apenas, sem conteúdo por enquanto. */
@Component({
  selector: 'app-training',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Cards Review</h1>
    <p>Em construção.</p>
  `,
})
export class TrainingComponent {}
