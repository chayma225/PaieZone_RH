import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IBonus, NewBonus } from '../bonus.model';

export type PartialUpdateBonus = Partial<IBonus> & Pick<IBonus, 'id'>;

@Injectable()
export class BonusesService {
  readonly bonusesParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly bonusesResource = httpResource<IBonus[]>(() => {
    const params = this.bonusesParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of bonus that have been fetched. It is updated when the bonusesResource emits a new value.
   * In case of error while fetching the bonuses, the signal is set to an empty array.
   */
  readonly bonuses = computed(() => (this.bonusesResource.hasValue() ? this.bonusesResource.value() : []));
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/bonuses');
}

@Injectable({ providedIn: 'root' })
export class BonusService extends BonusesService {
  protected readonly http = inject(HttpClient);

  create(bonus: NewBonus): Observable<IBonus> {
    return this.http.post<IBonus>(this.resourceUrl, bonus);
  }

  update(bonus: IBonus): Observable<IBonus> {
    return this.http.put<IBonus>(`${this.resourceUrl}/${encodeURIComponent(this.getBonusIdentifier(bonus))}`, bonus);
  }

  partialUpdate(bonus: PartialUpdateBonus): Observable<IBonus> {
    return this.http.patch<IBonus>(`${this.resourceUrl}/${encodeURIComponent(this.getBonusIdentifier(bonus))}`, bonus);
  }

  find(id: number): Observable<IBonus> {
    return this.http.get<IBonus>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  query(req?: any): Observable<HttpResponse<IBonus[]>> {
    const options = createRequestOption(req);
    return this.http.get<IBonus[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
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
