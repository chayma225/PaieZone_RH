import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IHrDocument, NewHrDocument } from '../hr-document.model';

export type PartialUpdateHrDocument = Partial<IHrDocument> & Pick<IHrDocument, 'id'>;

type RestOf<T extends IHrDocument | NewHrDocument> = Omit<T, 'uploadedAt' | 'expiryDate'> & {
  uploadedAt?: string | null;
  expiryDate?: string | null;
};

export type RestHrDocument = RestOf<IHrDocument>;
export type NewRestHrDocument = RestOf<NewHrDocument>;
export type PartialUpdateRestHrDocument = RestOf<PartialUpdateHrDocument>;

@Injectable()
export class HrDocumentsService {
  readonly hrDocumentsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly hrDocumentsResource = httpResource<RestHrDocument[]>(() => {
    const params = this.hrDocumentsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });

  readonly hrDocuments = computed(() =>
    (this.hrDocumentsResource.hasValue() ? this.hrDocumentsResource.value() : []).map(item => this.convertValueFromServer(item)),
  );

  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/hr-documents');

  protected convertValueFromServer(restHrDocument: RestHrDocument): IHrDocument {
    return {
      ...restHrDocument,
      uploadedAt: restHrDocument.uploadedAt ? dayjs(restHrDocument.uploadedAt) : undefined,
      expiryDate: restHrDocument.expiryDate ? dayjs(restHrDocument.expiryDate) : undefined,
    };
  }

  // Ajout de la méthode ici pour qu'elle soit accessible par la classe enfant
  protected convertDateFromClient<T extends IHrDocument | NewHrDocument | PartialUpdateHrDocument>(hrDocument: T): RestOf<T> {
    return {
      ...hrDocument,
      uploadedAt: hrDocument.uploadedAt?.toJSON() ?? null,
      // Correction ici : on s'assure que expiryDate est un objet dayjs avant d'appeler .format()
      expiryDate: hrDocument.expiryDate && dayjs(hrDocument.expiryDate).isValid() ? dayjs(hrDocument.expiryDate).format(DATE_FORMAT) : null,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class HrDocumentService extends HrDocumentsService {
  protected readonly http = inject(HttpClient);

  create(hrDocument: NewHrDocument): Observable<IHrDocument> {
    const copy = this.convertDateFromClient(hrDocument); // Changé en convertDateFromClient
    return this.http.post<RestHrDocument>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(hrDocument: IHrDocument): Observable<IHrDocument> {
    const copy = this.convertDateFromClient(hrDocument); // Changé en convertDateFromClient
    return this.http
      .put<RestHrDocument>(`${this.resourceUrl}/${encodeURIComponent(this.getHrDocumentIdentifier(hrDocument))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(hrDocument: PartialUpdateHrDocument): Observable<IHrDocument> {
    const copy = this.convertDateFromClient(hrDocument); // Changé en convertDateFromClient
    return this.http
      .patch<RestHrDocument>(`${this.resourceUrl}/${encodeURIComponent(this.getHrDocumentIdentifier(hrDocument))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IHrDocument> {
    return this.http
      .get<RestHrDocument>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IHrDocument[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestHrDocument[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getHrDocumentIdentifier(hrDocument: Pick<IHrDocument, 'id'>): number {
    return hrDocument.id;
  }

  compareHrDocument(o1: Pick<IHrDocument, 'id'> | null, o2: Pick<IHrDocument, 'id'> | null): boolean {
    return o1 && o2 ? this.getHrDocumentIdentifier(o1) === this.getHrDocumentIdentifier(o2) : o1 === o2;
  }

  protected convertResponseFromServer(res: RestHrDocument): IHrDocument {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestHrDocument[]): IHrDocument[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
