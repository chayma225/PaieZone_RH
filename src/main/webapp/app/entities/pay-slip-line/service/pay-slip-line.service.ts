import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IPaySlipLine, NewPaySlipLine } from '../pay-slip-line.model';

export type PartialUpdatePaySlipLine = Partial<IPaySlipLine> & Pick<IPaySlipLine, 'id'>;

@Injectable()
export class PaySlipLinesService {
  readonly paySlipLinesParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly paySlipLinesResource = httpResource<IPaySlipLine[]>(() => {
    const params = this.paySlipLinesParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of paySlipLine that have been fetched. It is updated when the paySlipLinesResource emits a new value.
   * In case of error while fetching the paySlipLines, the signal is set to an empty array.
   */
  readonly paySlipLines = computed(() => (this.paySlipLinesResource.hasValue() ? this.paySlipLinesResource.value() : []));
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/pay-slip-lines');
}

@Injectable({ providedIn: 'root' })
export class PaySlipLineService extends PaySlipLinesService {
  protected readonly http = inject(HttpClient);

  create(paySlipLine: NewPaySlipLine): Observable<IPaySlipLine> {
    return this.http.post<IPaySlipLine>(this.resourceUrl, paySlipLine);
  }

  update(paySlipLine: IPaySlipLine): Observable<IPaySlipLine> {
    return this.http.put<IPaySlipLine>(
      `${this.resourceUrl}/${encodeURIComponent(this.getPaySlipLineIdentifier(paySlipLine))}`,
      paySlipLine,
    );
  }

  partialUpdate(paySlipLine: PartialUpdatePaySlipLine): Observable<IPaySlipLine> {
    return this.http.patch<IPaySlipLine>(
      `${this.resourceUrl}/${encodeURIComponent(this.getPaySlipLineIdentifier(paySlipLine))}`,
      paySlipLine,
    );
  }

  find(id: number): Observable<IPaySlipLine> {
    return this.http.get<IPaySlipLine>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  query(req?: any): Observable<HttpResponse<IPaySlipLine[]>> {
    const options = createRequestOption(req);
    return this.http.get<IPaySlipLine[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
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
