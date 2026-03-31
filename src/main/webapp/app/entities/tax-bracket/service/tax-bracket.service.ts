import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ITaxBracket, NewTaxBracket } from '../tax-bracket.model';

export type PartialUpdateTaxBracket = Partial<ITaxBracket> & Pick<ITaxBracket, 'id'>;

export type EntityResponseType = HttpResponse<ITaxBracket>;
export type EntityArrayResponseType = HttpResponse<ITaxBracket[]>;

@Injectable({ providedIn: 'root' })
export class TaxBracketService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/tax-brackets');

  create(taxBracket: NewTaxBracket): Observable<EntityResponseType> {
    return this.http.post<ITaxBracket>(this.resourceUrl, taxBracket, { observe: 'response' });
  }

  update(taxBracket: ITaxBracket): Observable<EntityResponseType> {
    return this.http.put<ITaxBracket>(`${this.resourceUrl}/${this.getTaxBracketIdentifier(taxBracket)}`, taxBracket, {
      observe: 'response',
    });
  }

  partialUpdate(taxBracket: PartialUpdateTaxBracket): Observable<EntityResponseType> {
    return this.http.patch<ITaxBracket>(`${this.resourceUrl}/${this.getTaxBracketIdentifier(taxBracket)}`, taxBracket, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ITaxBracket>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ITaxBracket[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
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
