// src/main/webapp/app/entities/advance/service/advance.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IAdvance, NewAdvance } from '../advance.model';

export type EntityResponseType      = HttpResponse<IAdvance>;
export type EntityArrayResponseType = HttpResponse<IAdvance[]>;

@Injectable({ providedIn: 'root' })
export class AdvanceService {
  protected http      = inject(HttpClient);
  protected appConfig = inject(ApplicationConfigService);
  protected url       = this.appConfig.getEndpointFor('api/advances');

  create(a: NewAdvance): Observable<EntityResponseType> {
    return this.http.post<IAdvance>(this.url, a, { observe: 'response' });
  }
  update(a: IAdvance): Observable<EntityResponseType> {
    return this.http.put<IAdvance>(`${this.url}/${a.id}`, a, { observe: 'response' });
  }
  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IAdvance>(`${this.url}/${id}`, { observe: 'response' });
  }
  query(req?: any): Observable<EntityArrayResponseType> {
    return this.http.get<IAdvance[]>(this.url, { params: createRequestOption(req), observe: 'response' });
  }
  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.url}/${id}`, { observe: 'response' });
  }
}
