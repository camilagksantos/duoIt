export interface Exercise {
  id: string;
  title: string;
}

export interface Submodule {
  id: string;
  title: string;
  exercises: Exercise[];
}

export interface LearningModule {
  id: string;
  title: string;
  submodules: Submodule[];
}

export interface ExerciseSelection {
  module: LearningModule;
  submodule: Submodule;
  exercise: Exercise;
}
