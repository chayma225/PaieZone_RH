import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IContract, NewContract } from '../contract.model';

export type PartialUpdateContract = Partial<IContract> & Pick<IContract, 'id'>;

type RestOf<T extends IContract | NewContract> = Omit<T, 'startDate' | 'endDate' | 'signedDate' | 'createdAt'> & {
  startDate?: string | null;
  endDate?: string | null;
  signedDate?: string | null;
  createdAt?: string | null;
};

export type RestContract = RestOf<IContract>;

export type NewRestContract = RestOf<NewContract>;

export type PartialUpdateRestContract = RestOf<PartialUpdateContract>;

@Injectable()
export class ContractsService {
  readonly contractsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly contractsResource = httpResource<RestContract[]>(() => {
    const params = this.contractsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of contract that have been fetched. It is updated when the contractsResource emits a new value.
   * In case of error while fetching the contracts, the signal is set to an empty array.
   */
  readonly contracts = computed(() =>
    (this.contractsResource.hasValue() ? this.contractsResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/contracts');

  protected convertValueFromServer(restContract: RestContract): IContract {
    return {
      ...restContract,
      startDate: restContract.startDate ? dayjs(restContract.startDate) : undefined,
      endDate: restContract.endDate ? dayjs(restContract.endDate) : undefined,
      signedDate: restContract.signedDate ? dayjs(restContract.signedDate) : undefined,
      createdAt: restContract.createdAt ? dayjs(restContract.createdAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class ContractService extends ContractsService {
  protected readonly http = inject(HttpClient);

  create(contract: NewContract): Observable<IContract> {
    const copy = this.convertValueFromClient(contract);
    return this.http.post<RestContract>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(contract: IContract): Observable<IContract> {
    const copy = this.convertValueFromClient(contract);
    return this.http
      .put<RestContract>(`${this.resourceUrl}/${encodeURIComponent(this.getContractIdentifier(contract))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(contract: PartialUpdateContract): Observable<IContract> {
    const copy = this.convertValueFromClient(contract);
    return this.http
      .patch<RestContract>(`${this.resourceUrl}/${encodeURIComponent(this.getContractIdentifier(contract))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IContract> {
    return this.http
      .get<RestContract>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IContract[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestContract[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getContractIdentifier(contract: Pick<IContract, 'id'>): number {
    return contract.id;
  }

  compareContract(o1: Pick<IContract, 'id'> | null, o2: Pick<IContract, 'id'> | null): boolean {
    return o1 && o2 ? this.getContractIdentifier(o1) === this.getContractIdentifier(o2) : o1 === o2;
  }

  addContractToCollectionIfMissing<Type extends Pick<IContract, 'id'>>(
    contractCollection: Type[],
    ...contractsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const contracts: Type[] = contractsToCheck.filter(isPresent);
    if (contracts.length > 0) {
      const contractCollectionIdentifiers = contractCollection.map(contractItem => this.getContractIdentifier(contractItem));
      const contractsToAdd = contracts.filter(contractItem => {
        const contractIdentifier = this.getContractIdentifier(contractItem);
        if (contractCollectionIdentifiers.includes(contractIdentifier)) {
          return false;
        }
        contractCollectionIdentifiers.push(contractIdentifier);
        return true;
      });
      return [...contractsToAdd, ...contractCollection];
    }
    return contractCollection;
  }

  protected convertValueFromClient<T extends IContract | NewContract | PartialUpdateContract>(contract: T): RestOf<T> {
    return {
      ...contract,
      startDate: contract.startDate?.format(DATE_FORMAT) ?? null,
      endDate: contract.endDate?.format(DATE_FORMAT) ?? null,
      signedDate: contract.signedDate?.format(DATE_FORMAT) ?? null,
      createdAt: contract.createdAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestContract): IContract {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestContract[]): IContract[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
