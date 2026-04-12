import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { ICompany, NewCompany } from '../company.model';

export type PartialUpdateCompany = Partial<ICompany> & Pick<ICompany, 'id'>;

type RestOf<T extends ICompany | NewCompany> = Omit<T, 'trialEnd' | 'createdAt'> & {
  trialEnd?: string | null;
  createdAt?: string | null;
};

export type RestCompany = RestOf<ICompany>;

export type NewRestCompany = RestOf<NewCompany>;

export type PartialUpdateRestCompany = RestOf<PartialUpdateCompany>;

@Injectable()
export class CompaniesService {
  readonly companiesParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly companiesResource = httpResource<RestCompany[]>(() => {
    const params = this.companiesParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of company that have been fetched. It is updated when the companiesResource emits a new value.
   * In case of error while fetching the companies, the signal is set to an empty array.
   */
  readonly companies = computed(() =>
    (this.companiesResource.hasValue() ? this.companiesResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/companies');

  protected convertValueFromServer(restCompany: RestCompany): ICompany {
    return {
      ...restCompany,
      trialEnd: restCompany.trialEnd ? dayjs(restCompany.trialEnd) : undefined,
      createdAt: restCompany.createdAt ? dayjs(restCompany.createdAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class CompanyService extends CompaniesService {
  protected readonly http = inject(HttpClient);

  create(company: NewCompany): Observable<ICompany> {
    const copy = this.convertValueFromClient(company);
    return this.http.post<RestCompany>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(company: ICompany): Observable<ICompany> {
    const copy = this.convertValueFromClient(company);
    return this.http
      .put<RestCompany>(`${this.resourceUrl}/${encodeURIComponent(this.getCompanyIdentifier(company))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(company: PartialUpdateCompany): Observable<ICompany> {
    const copy = this.convertValueFromClient(company);
    return this.http
      .patch<RestCompany>(`${this.resourceUrl}/${encodeURIComponent(this.getCompanyIdentifier(company))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<ICompany> {
    return this.http
      .get<RestCompany>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<ICompany[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestCompany[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getCompanyIdentifier(company: Pick<ICompany, 'id'>): number {
    return company.id;
  }

  compareCompany(o1: Pick<ICompany, 'id'> | null, o2: Pick<ICompany, 'id'> | null): boolean {
    return o1 && o2 ? this.getCompanyIdentifier(o1) === this.getCompanyIdentifier(o2) : o1 === o2;
  }

  addCompanyToCollectionIfMissing<Type extends Pick<ICompany, 'id'>>(
    companyCollection: Type[],
    ...companiesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const companies: Type[] = companiesToCheck.filter(isPresent);
    if (companies.length > 0) {
      const companyCollectionIdentifiers = companyCollection.map(companyItem => this.getCompanyIdentifier(companyItem));
      const companiesToAdd = companies.filter(companyItem => {
        const companyIdentifier = this.getCompanyIdentifier(companyItem);
        if (companyCollectionIdentifiers.includes(companyIdentifier)) {
          return false;
        }
        companyCollectionIdentifiers.push(companyIdentifier);
        return true;
      });
      return [...companiesToAdd, ...companyCollection];
    }
    return companyCollection;
  }

  protected convertValueFromClient<T extends ICompany | NewCompany | PartialUpdateCompany>(company: T): RestOf<T> {
    return {
      ...company,
      trialEnd: company.trialEnd?.format(DATE_FORMAT) ?? null,
      createdAt: company.createdAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestCompany): ICompany {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestCompany[]): ICompany[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
