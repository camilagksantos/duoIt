import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CardView, Rating } from '../models/study.model';

@Injectable({ providedIn: 'root' })
export class StudyApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api';

  /** Cards de um grupo: vencidos primeiro, depois novos até o limite diário. */
  getSession(submoduleId: string): Observable<CardView[]> {
    const params = new HttpParams().set('submodule', submoduleId);
    return this.http.get<CardView[]>(`${this.baseUrl}/study/session`, { params });
  }

  /** Cards vencidos de todos os grupos, para o Cards Review. */
  getReviewSession(): Observable<CardView[]> {
    return this.http.get<CardView[]>(`${this.baseUrl}/review/session`);
  }

  answer(cardId: number, rating: Rating): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/study/cards/${cardId}/answer`, { rating });
  }
}
