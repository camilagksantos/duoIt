import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TermView } from '../models/study.model';

@Injectable({ providedIn: 'root' })
export class TermsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/terms';

  getTerms(submoduleId: string): Observable<TermView[]> {
    const params = new HttpParams().set('submodule', submoduleId);
    return this.http.get<TermView[]>(this.baseUrl, { params });
  }

  setLearned(wordId: number, learned: boolean): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${wordId}/learned`, { learned });
  }
}
