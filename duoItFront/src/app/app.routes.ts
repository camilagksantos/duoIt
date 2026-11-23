import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { ReviewComponent } from './features/review/review/review.component';
import { StudyHomeComponent } from './features/study/study-home/study-home.component';
import { TermsComponent } from './features/terms/terms/terms.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'treino', component: ReviewComponent },
      { path: 'termos/:slug', component: TermsComponent },
      { path: 'estudo', component: StudyHomeComponent },
    ],
  },
];
