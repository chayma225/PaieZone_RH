import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { ITaxBracket, NewTaxBracket } from '../tax-bracket.model';

export type PartialUpdateTaxBracket = Partial<ITaxBracket> & Pick<ITaxBracket, 'id'>;

@Injectable()
export class TaxBracketsService {
  readonly taxBracketsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly taxBracketsResource = httpResource<ITaxBracket[]>(() => {
    const params = this.taxBracketsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of taxBracket that have been fetched. It is updated when the taxBracketsResource emits a new value.
   * In case of error while fetching the taxBrackets, the signal is set to an empty array.
   */
  readonly taxBrackets = computed(() => (this.taxBracketsResource.hasValue() ? this.taxBracketsResource.value() : []));
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/tax-brackets');
}

@Injectable({ providedIn: 'root' })
export class TaxBracketService extends TaxBracketsService {
  protected readonly http = inject(HttpClient);

  create(taxBracket: NewTaxBracket): Observable<ITaxBracket> {
    return this.http.post<ITaxBracket>(this.resourceUrl, taxBracket);
  }

  update(taxBracket: ITaxBracket): Observable<ITaxBracket> {
    return this.http.put<ITaxBracket>(`${this.resourceUrl}/${encodeURIComponent(this.getTaxBracketIdentifier(taxBracket))}`, taxBracket);
  }

  partialUpdate(taxBracket: PartialUpdateTaxBracket): Observable<ITaxBracket> {
    return this.http.patch<ITaxBracket>(`${this.resourceUrl}/${encodeURIComponent(this.getTaxBracketIdentifier(taxBracket))}`, taxBracket);
  }

  find(id: number): Observable<ITaxBracket> {
    return this.http.get<ITaxBracket>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  query(req?: any): Observable<HttpResponse<ITaxBracket[]>> {
    const options = createRequestOption(req);
    return this.http.get<ITaxBracket[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getTaxBracketIdentifier(taxBracket: Pick<ITaxBracket, 'id'>): number {
    return taxBracket.id;
  }

  compareTaxBracket(o1: Pick<ITaxBracket, 'id'> | null, o2: Pick<ITaxBracket, 'id'> | null): boolean {
    return o1 && o2 ? this.getTaxBracketIdentifier(o1) === this.getTaxBracketIdentifier(o2) : o1 === o2;
  }

  addTaxBracketToCollectionIfMissing<Type extends Pick<ITaxBracket, 'id'>>(
    taxBracketCollection: Type[],
    ...taxBracketsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const taxBrackets: Type[] = taxBracketsToCheck.filter(isPresent);
    if (taxBrackets.length > 0) {
      const taxBracketCollectionIdentifiers = taxBracketCollection.map(taxBracketItem => this.getTaxBracketIdentifier(taxBracketItem));
      const taxBracketsToAdd = taxBrackets.filter(taxBracketItem => {
        const taxBracketIdentifier = this.getTaxBracketIdentifier(taxBracketItem);
        if (taxBracketCollectionIdentifiers.includes(taxBracketIdentifier)) {
          return false;
        }
        taxBracketCollectionIdentifiers.push(taxBracketIdentifier);
        return true;
      });
      return [...taxBracketsToAdd, ...taxBracketCollection];
    }
    return taxBracketCollection;
  }
}
