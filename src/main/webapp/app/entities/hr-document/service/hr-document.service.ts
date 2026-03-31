import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IHrDocument, NewHrDocument } from '../hr-document.model';

export type PartialUpdateHrDocument = Partial<IHrDocument> & Pick<IHrDocument, 'id'>;

type RestOf<T extends IHrDocument | NewHrDocument> = Omit<T, 'uploadedAt' | 'expiryDate'> & {
  uploadedAt?: string | null;
  expiryDate?: string | null;
};

export type RestHrDocument = RestOf<IHrDocument>;

export type NewRestHrDocument = RestOf<NewHrDocument>;

export type PartialUpdateRestHrDocument = RestOf<PartialUpdateHrDocument>;

export type EntityResponseType = HttpResponse<IHrDocument>;
export type EntityArrayResponseType = HttpResponse<IHrDocument[]>;

@Injectable({ providedIn: 'root' })
export class HrDocumentService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/hr-documents');

  create(hrDocument: NewHrDocument): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(hrDocument);
    return this.http
      .post<RestHrDocument>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(hrDocument: IHrDocument): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(hrDocument);
    return this.http
      .put<RestHrDocument>(`${this.resourceUrl}/${this.getHrDocumentIdentifier(hrDocument)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(hrDocument: PartialUpdateHrDocument): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(hrDocument);
    return this.http
      .patch<RestHrDocument>(`${this.resourceUrl}/${this.getHrDocumentIdentifier(hrDocument)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestHrDocument>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestHrDocument[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getHrDocumentIdentifier(hrDocument: Pick<IHrDocument, 'id'>): number {
    return hrDocument.id;
  }

  compareHrDocument(o1: Pick<IHrDocument, 'id'> | null, o2: Pick<IHrDocument, 'id'> | null): boolean {
    return o1 && o2 ? this.getHrDocumentIdentifier(o1) === this.getHrDocumentIdentifier(o2) : o1 === o2;
  }

  addHrDocumentToCollectionIfMissing<Type extends Pick<IHrDocument, 'id'>>(
    hrDocumentCollection: Type[],
    ...hrDocumentsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const hrDocuments: Type[] = hrDocumentsToCheck.filter(isPresent);
    if (hrDocuments.length > 0) {
      const hrDocumentCollectionIdentifiers = hrDocumentCollection.map(hrDocumentItem => this.getHrDocumentIdentifier(hrDocumentItem));
      const hrDocumentsToAdd = hrDocuments.filter(hrDocumentItem => {
        const hrDocumentIdentifier = this.getHrDocumentIdentifier(hrDocumentItem);
        if (hrDocumentCollectionIdentifiers.includes(hrDocumentIdentifier)) {
          return false;
        }
        hrDocumentCollectionIdentifiers.push(hrDocumentIdentifier);
        return true;
      });
      return [...hrDocumentsToAdd, ...hrDocumentCollection];
    }
    return hrDocumentCollection;
  }

  protected convertDateFromClient<T extends IHrDocument | NewHrDocument | PartialUpdateHrDocument>(hrDocument: T): RestOf<T> {
    return {
      ...hrDocument,
      uploadedAt: hrDocument.uploadedAt?.toJSON() ?? null,
      expiryDate: hrDocument.expiryDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restHrDocument: RestHrDocument): IHrDocument {
    return {
      ...restHrDocument,
      uploadedAt: restHrDocument.uploadedAt ? dayjs(restHrDocument.uploadedAt) : undefined,
      expiryDate: restHrDocument.expiryDate ? dayjs(restHrDocument.expiryDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestHrDocument>): HttpResponse<IHrDocument> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestHrDocument[]>): HttpResponse<IHrDocument[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
