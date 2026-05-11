// src/main/webapp/app/entities/bonus/service/bonus.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IBonus, NewBonus } from '../bonus.model';

export type EntityResponseType      = HttpResponse<IBonus>;
export type EntityArrayResponseType = HttpResponse<IBonus[]>;

@Injectable({ providedIn: 'root' })
export class BonusService {
  protected http      = inject(HttpClient);
  protected appConfig = inject(ApplicationConfigService);
  protected url       = this.appConfig.getEndpointFor('api/bonuses');

  create(b: NewBonus): Observable<EntityResponseType> {
    return this.http.post<IBonus>(this.url, b, { observe: 'response' });
  }
  update(b: IBonus): Observable<EntityResponseType> {
    return this.http.put<IBonus>(`${this.url}/${b.id}`, b, { observe: 'response' });
  }
  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IBonus>(`${this.url}/${id}`, { observe: 'response' });
  }
  query(req?: any): Observable<EntityArrayResponseType> {
    return this.http.get<IBonus[]>(this.url, { params: createRequestOption(req), observe: 'response' });
  }
  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.url}/${id}`, { observe: 'response' });
  }
}
