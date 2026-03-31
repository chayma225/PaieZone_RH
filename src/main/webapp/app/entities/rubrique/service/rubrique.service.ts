import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IRubrique, NewRubrique } from '../rubrique.model';

export type PartialUpdateRubrique = Partial<IRubrique> & Pick<IRubrique, 'id'>;

export type EntityResponseType = HttpResponse<IRubrique>;
export type EntityArrayResponseType = HttpResponse<IRubrique[]>;

@Injectable({ providedIn: 'root' })
export class RubriqueService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/rubriques');

  create(rubrique: NewRubrique): Observable<EntityResponseType> {
    return this.http.post<IRubrique>(this.resourceUrl, rubrique, { observe: 'response' });
  }

  update(rubrique: IRubrique): Observable<EntityResponseType> {
    return this.http.put<IRubrique>(`${this.resourceUrl}/${this.getRubriqueIdentifier(rubrique)}`, rubrique, { observe: 'response' });
  }

  partialUpdate(rubrique: PartialUpdateRubrique): Observable<EntityResponseType> {
    return this.http.patch<IRubrique>(`${this.resourceUrl}/${this.getRubriqueIdentifier(rubrique)}`, rubrique, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IRubrique>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IRubrique[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
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
