import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPaySlipLine, NewPaySlipLine } from '../pay-slip-line.model';

export type PartialUpdatePaySlipLine = Partial<IPaySlipLine> & Pick<IPaySlipLine, 'id'>;

export type EntityResponseType = HttpResponse<IPaySlipLine>;
export type EntityArrayResponseType = HttpResponse<IPaySlipLine[]>;

@Injectable({ providedIn: 'root' })
export class PaySlipLineService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/pay-slip-lines');

  create(paySlipLine: NewPaySlipLine): Observable<EntityResponseType> {
    return this.http.post<IPaySlipLine>(this.resourceUrl, paySlipLine, { observe: 'response' });
  }

  update(paySlipLine: IPaySlipLine): Observable<EntityResponseType> {
    return this.http.put<IPaySlipLine>(`${this.resourceUrl}/${this.getPaySlipLineIdentifier(paySlipLine)}`, paySlipLine, {
      observe: 'response',
    });
  }

  partialUpdate(paySlipLine: PartialUpdatePaySlipLine): Observable<EntityResponseType> {
    return this.http.patch<IPaySlipLine>(`${this.resourceUrl}/${this.getPaySlipLineIdentifier(paySlipLine)}`, paySlipLine, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IPaySlipLine>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IPaySlipLine[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getPaySlipLineIdentifier(paySlipLine: Pick<IPaySlipLine, 'id'>): number {
    return paySlipLine.id;
  }

  comparePaySlipLine(o1: Pick<IPaySlipLine, 'id'> | null, o2: Pick<IPaySlipLine, 'id'> | null): boolean {
    return o1 && o2 ? this.getPaySlipLineIdentifier(o1) === this.getPaySlipLineIdentifier(o2) : o1 === o2;
  }

  addPaySlipLineToCollectionIfMissing<Type extends Pick<IPaySlipLine, 'id'>>(
    paySlipLineCollection: Type[],
    ...paySlipLinesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const paySlipLines: Type[] = paySlipLinesToCheck.filter(isPresent);
    if (paySlipLines.length > 0) {
      const paySlipLineCollectionIdentifiers = paySlipLineCollection.map(paySlipLineItem => this.getPaySlipLineIdentifier(paySlipLineItem));
      const paySlipLinesToAdd = paySlipLines.filter(paySlipLineItem => {
        const paySlipLineIdentifier = this.getPaySlipLineIdentifier(paySlipLineItem);
        if (paySlipLineCollectionIdentifiers.includes(paySlipLineIdentifier)) {
          return false;
        }
        paySlipLineCollectionIdentifiers.push(paySlipLineIdentifier);
        return true;
      });
      return [...paySlipLinesToAdd, ...paySlipLineCollection];
    }
    return paySlipLineCollection;
  }
}
