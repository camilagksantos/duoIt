import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CardView, Rating } from '../models/study.model';

@Injectable({ providedIn: 'root' })
export class StudyApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/study';

  getSession(submoduleId: string): Observable<CardView[]> {
    const params = new HttpParams().set('submodule', submoduleId);
    return this.http.get<CardView[]>(`${this.baseUrl}/session`, { params });
  }

  answer(cardId: number, rating: Rating): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/cards/${cardId}/answer`, { rating });
  }
}
