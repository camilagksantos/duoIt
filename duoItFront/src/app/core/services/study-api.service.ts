import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AnswerResponse, CardView, Rating } from '../models/study.model';

@Injectable({ providedIn: 'root' })
export class StudyApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api';

  /** Cards de um grupo: vencidos primeiro, depois novos até o limite diário. */
  getSession(submoduleId: string): Observable<CardView[]> {
    const params = new HttpParams().set('submodule', submoduleId);
    return this.http.get<CardView[]>(`${this.baseUrl}/study/session`, { params });
  }

  /** Revisão diária do Cards Review: vencidos pelo agendamento e novos do dia. */
  getReviewSession(): Observable<CardView[]> {
    return this.http.get<CardView[]>(`${this.baseUrl}/review/session`);
  }

  /** Revisão geral do Cards Review: todas as palavras marcadas, sem filtro de data. */
  getReviewAll(): Observable<CardView[]> {
    return this.http.get<CardView[]>(`${this.baseUrl}/review/all`);
  }

  /** Avaliação do exercício do grupo. Conta para o progresso do curso. */
  answer(cardId: number, rating: Rating): Observable<AnswerResponse> {
    return this.http.post<AnswerResponse>(`${this.baseUrl}/study/cards/${cardId}/answer`, { rating });
  }

  /** Avaliação no Cards Review. Atualiza o agendamento, mas não conta para o progresso do curso. */
  answerReview(cardId: number, rating: Rating): Observable<AnswerResponse> {
    return this.http.post<AnswerResponse>(`${this.baseUrl}/review/cards/${cardId}/answer`, { rating });
  }
}
