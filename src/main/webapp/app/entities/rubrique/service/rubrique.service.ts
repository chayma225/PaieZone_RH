import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IRubrique, NewRubrique } from '../rubrique.model';

export type PartialUpdateRubrique = Partial<IRubrique> & Pick<IRubrique, 'id'>;

@Injectable()
export class RubriquesService {
  readonly rubriquesParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly rubriquesResource = httpResource<IRubrique[]>(() => {
    const params = this.rubriquesParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of rubrique that have been fetched. It is updated when the rubriquesResource emits a new value.
   * In case of error while fetching the rubriques, the signal is set to an empty array.
   */
  readonly rubriques = computed(() => (this.rubriquesResource.hasValue() ? this.rubriquesResource.value() : []));
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/rubriques');
}

@Injectable({ providedIn: 'root' })
export class RubriqueService extends RubriquesService {
  protected readonly http = inject(HttpClient);

  create(rubrique: NewRubrique): Observable<IRubrique> {
    return this.http.post<IRubrique>(this.resourceUrl, rubrique);
  }

  update(rubrique: IRubrique): Observable<IRubrique> {
    return this.http.put<IRubrique>(`${this.resourceUrl}/${encodeURIComponent(this.getRubriqueIdentifier(rubrique))}`, rubrique);
  }

  partialUpdate(rubrique: PartialUpdateRubrique): Observable<IRubrique> {
    return this.http.patch<IRubrique>(`${this.resourceUrl}/${encodeURIComponent(this.getRubriqueIdentifier(rubrique))}`, rubrique);
  }

  find(id: number): Observable<IRubrique> {
    return this.http.get<IRubrique>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  query(req?: any): Observable<HttpResponse<IRubrique[]>> {
    const options = createRequestOption(req);
    return this.http.get<IRubrique[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getRubriqueIdentifier(rubrique: Pick<IRubrique, 'id'>): number {
    return rubrique.id;
  }

  compareRubrique(o1: Pick<IRubrique, 'id'> | null, o2: Pick<IRubrique, 'id'> | null): boolean {
    return o1 && o2 ? this.getRubriqueIdentifier(o1) === this.getRubriqueIdentifier(o2) : o1 === o2;
  }

  addRubriqueToCollectionIfMissing<Type extends Pick<IRubrique, 'id'>>(
    rubriqueCollection: Type[],
    ...rubriquesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const rubriques: Type[] = rubriquesToCheck.filter(isPresent);
    if (rubriques.length > 0) {
      const rubriqueCollectionIdentifiers = rubriqueCollection.map(rubriqueItem => this.getRubriqueIdentifier(rubriqueItem));
      const rubriquesToAdd = rubriques.filter(rubriqueItem => {
        const rubriqueIdentifier = this.getRubriqueIdentifier(rubriqueItem);
        if (rubriqueCollectionIdentifiers.includes(rubriqueIdentifier)) {
          return false;
        }
        rubriqueCollectionIdentifiers.push(rubriqueIdentifier);
        return true;
      });
      return [...rubriquesToAdd, ...rubriqueCollection];
    }
    return rubriqueCollection;
  }
}
