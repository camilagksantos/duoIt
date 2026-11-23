import { Injectable, computed, signal } from '@angular/core';
import { LEARNING_PLAN } from '../data/learning-plan.data';
import { ExerciseSelection, LearningModule } from '../models/learning.model';

@Injectable({ providedIn: 'root' })
export class StudyService {
  readonly modules = signal<LearningModule[]>(LEARNING_PLAN).asReadonly();

  private readonly selection = signal<ExerciseSelection | null>(null);
  readonly current = this.selection.asReadonly();
  readonly hasSelection = computed(() => this.selection() !== null);

  select(selection: ExerciseSelection): void {
    this.selection.set(selection);
  }
}
