import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Tela do exercício selecionado no menu. O conteúdo do exercício será implementado depois
 * da conclusão dos Termos do Grupo e do Cards Review.
 */
@Component({
  selector: 'app-study-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Exercício em construção</h1>
    <p>Este exercício ainda não tem conteúdo. Ele será implementado depois dos Termos do Grupo e do Cards Review.</p>
  `,
})
export class StudyHomeComponent {}
