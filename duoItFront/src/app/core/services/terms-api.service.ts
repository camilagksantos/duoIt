import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TermsResponse } from '../models/study.model';

@Injectable({ providedIn: 'root' })
export class TermsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/terms';

  getTerms(submoduleId: string): Observable<TermsResponse> {
    const params = new HttpParams().set('submodule', submoduleId);
    return this.http.get<TermsResponse>(this.baseUrl, { params });
  }

  /** Conclui o grupo e inclui todas as palavras dele no Cards Review. Não pode ser desfeito. */
  complete(submoduleId: string): Observable<void> {
    const params = new HttpParams().set('submodule', submoduleId);
    return this.http.post<void>(`${this.baseUrl}/complete`, null, { params });
  }
}
