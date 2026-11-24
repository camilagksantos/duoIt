import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Exercise, LearningModule, Submodule } from '../../../core/models/learning.model';
import { ExerciseStatus, ProgressService } from '../../../core/services/progress.service';
import { StudyService } from '../../../core/services/study.service';
import { NavItemComponent } from '../../../share/components/nav-item/nav-item.component';

const HINTS: Record<ExerciseStatus, string> = {
  done: 'Concluído',
  open: '',
  locked: 'Bloqueado',
  soon: 'Em breve',
  unavailable: 'Sem API',
};

@Component({
  selector: 'app-exercise-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavItemComponent],
  template: `
    <app-nav-item
      label="Termos"
      [disabled]="!termsUnlocked()"
      [hint]="termsHint()"
      [hintTone]="termsDone() ? 'success' : 'default'"
      (activate)="openTerms()"
    />
    @for (exercise of submodule().exercises; track exercise.id) {
      <app-nav-item
        [label]="exercise.title"
        [disabled]="!isPlayable()"
        [selected]="isSelected(exercise)"
        [hint]="hintFor(exercise)"
        [hintTone]="isDone() ? 'success' : 'default'"
        (activate)="select(exercise)"
      />
    }
  `,
})
export class ExerciseMenuComponent {
  readonly module = input.required<LearningModule>();
  readonly submodule = input.required<Submodule>();

  private readonly study = inject(StudyService);
  private readonly progress = inject(ProgressService);
  private readonly router = inject(Router);

  // Hoje cada submódulo tem um exercício (Cards), então o status é o do submódulo.
  protected isPlayable(): boolean {
    const status = this.progress.status(this.submodule().id);
    return status === 'open' || status === 'done';
  }

  protected isDone(): boolean {
    return this.progress.status(this.submodule().id) === 'done';
  }

  protected hintFor(_exercise: Exercise): string {
    return HINTS[this.progress.status(this.submodule().id)];
  }

  protected termsDone(): boolean {
    return this.progress.isCompleted(this.submodule().id);
  }

  protected termsUnlocked(): boolean {
    return this.progress.isTermsUnlocked(this.submodule().id);
  }

  protected termsHint(): string {
    if (this.termsDone()) {
      return 'Concluído';
    }
    return this.termsUnlocked() ? '' : 'Bloqueado';
  }

  /** Termos do Grupo: sempre disponível, não depende da liberação. */
  protected openTerms(): void {
    this.router.navigate(['/termos', this.submodule().id]);
  }

  protected isSelected(exercise: Exercise): boolean {
    return this.study.current()?.exercise.id === exercise.id;
  }

  select(exercise: Exercise): void {
    if (!this.isPlayable()) {
      return;
    }
    this.study.select({ module: this.module(), submodule: this.submodule(), exercise });
    this.router.navigate(['/estudo']);
  }
}
