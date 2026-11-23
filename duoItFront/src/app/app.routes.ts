import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { StudyHomeComponent } from './features/study/study-home/study-home.component';
import { TrainingComponent } from './features/training/training/training.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'treino', component: TrainingComponent },
      { path: 'estudo', component: StudyHomeComponent },
    ],
  },
];
