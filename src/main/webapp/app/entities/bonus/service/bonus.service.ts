import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IBonus, NewBonus } from '../bonus.model';

export type PartialUpdateBonus = Partial<IBonus> & Pick<IBonus, 'id'>;

export type EntityResponseType = HttpResponse<IBonus>;
export type EntityArrayResponseType = HttpResponse<IBonus[]>;

@Injectable({ providedIn: 'root' })
export class BonusService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/bonuses');

  create(bonus: NewBonus): Observable<EntityResponseType> {
    return this.http.post<IBonus>(this.resourceUrl, bonus, { observe: 'response' });
  }

  update(bonus: IBonus): Observable<EntityResponseType> {
    return this.http.put<IBonus>(`${this.resourceUrl}/${this.getBonusIdentifier(bonus)}`, bonus, { observe: 'response' });
  }

  partialUpdate(bonus: PartialUpdateBonus): Observable<EntityResponseType> {
    return this.http.patch<IBonus>(`${this.resourceUrl}/${this.getBonusIdentifier(bonus)}`, bonus, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IBonus>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IBonus[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getBonusIdentifier(bonus: Pick<IBonus, 'id'>): number {
    return bonus.id;
  }

  compareBonus(o1: Pick<IBonus, 'id'> | null, o2: Pick<IBonus, 'id'> | null): boolean {
    return o1 && o2 ? this.getBonusIdentifier(o1) === this.getBonusIdentifier(o2) : o1 === o2;
  }

  addBonusToCollectionIfMissing<Type extends Pick<IBonus, 'id'>>(
    bonusCollection: Type[],
    ...bonusesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const bonuses: Type[] = bonusesToCheck.filter(isPresent);
    if (bonuses.length > 0) {
      const bonusCollectionIdentifiers = bonusCollection.map(bonusItem => this.getBonusIdentifier(bonusItem));
      const bonusesToAdd = bonuses.filter(bonusItem => {
        const bonusIdentifier = this.getBonusIdentifier(bonusItem);
        if (bonusCollectionIdentifiers.includes(bonusIdentifier)) {
          return false;
        }
        bonusCollectionIdentifiers.push(bonusIdentifier);
        return true;
      });
      return [...bonusesToAdd, ...bonusCollection];
    }
    return bonusCollection;
  }
}
