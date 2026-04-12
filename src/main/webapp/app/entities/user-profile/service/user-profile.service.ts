import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IUserProfile, NewUserProfile } from '../user-profile.model';

export type PartialUpdateUserProfile = Partial<IUserProfile> & Pick<IUserProfile, 'id'>;

type RestOf<T extends IUserProfile | NewUserProfile> = Omit<T, 'lastLoginAt'> & {
  lastLoginAt?: string | null;
};

export type RestUserProfile = RestOf<IUserProfile>;

export type NewRestUserProfile = RestOf<NewUserProfile>;

export type PartialUpdateRestUserProfile = RestOf<PartialUpdateUserProfile>;

@Injectable()
export class UserProfilesService {
  readonly userProfilesParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly userProfilesResource = httpResource<RestUserProfile[]>(() => {
    const params = this.userProfilesParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of userProfile that have been fetched. It is updated when the userProfilesResource emits a new value.
   * In case of error while fetching the userProfiles, the signal is set to an empty array.
   */
  readonly userProfiles = computed(() =>
    (this.userProfilesResource.hasValue() ? this.userProfilesResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/user-profiles');

  protected convertValueFromServer(restUserProfile: RestUserProfile): IUserProfile {
    return {
      ...restUserProfile,
      lastLoginAt: restUserProfile.lastLoginAt ? dayjs(restUserProfile.lastLoginAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class UserProfileService extends UserProfilesService {
  protected readonly http = inject(HttpClient);

  create(userProfile: NewUserProfile): Observable<IUserProfile> {
    const copy = this.convertValueFromClient(userProfile);
    return this.http.post<RestUserProfile>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(userProfile: IUserProfile): Observable<IUserProfile> {
    const copy = this.convertValueFromClient(userProfile);
    return this.http
      .put<RestUserProfile>(`${this.resourceUrl}/${encodeURIComponent(this.getUserProfileIdentifier(userProfile))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(userProfile: PartialUpdateUserProfile): Observable<IUserProfile> {
    const copy = this.convertValueFromClient(userProfile);
    return this.http
      .patch<RestUserProfile>(`${this.resourceUrl}/${encodeURIComponent(this.getUserProfileIdentifier(userProfile))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IUserProfile> {
    return this.http
      .get<RestUserProfile>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IUserProfile[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestUserProfile[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getUserProfileIdentifier(userProfile: Pick<IUserProfile, 'id'>): number {
    return userProfile.id;
  }

  compareUserProfile(o1: Pick<IUserProfile, 'id'> | null, o2: Pick<IUserProfile, 'id'> | null): boolean {
    return o1 && o2 ? this.getUserProfileIdentifier(o1) === this.getUserProfileIdentifier(o2) : o1 === o2;
  }

  addUserProfileToCollectionIfMissing<Type extends Pick<IUserProfile, 'id'>>(
    userProfileCollection: Type[],
    ...userProfilesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const userProfiles: Type[] = userProfilesToCheck.filter(isPresent);
    if (userProfiles.length > 0) {
      const userProfileCollectionIdentifiers = userProfileCollection.map(userProfileItem => this.getUserProfileIdentifier(userProfileItem));
      const userProfilesToAdd = userProfiles.filter(userProfileItem => {
        const userProfileIdentifier = this.getUserProfileIdentifier(userProfileItem);
        if (userProfileCollectionIdentifiers.includes(userProfileIdentifier)) {
          return false;
        }
        userProfileCollectionIdentifiers.push(userProfileIdentifier);
        return true;
      });
      return [...userProfilesToAdd, ...userProfileCollection];
    }
    return userProfileCollection;
  }

  protected convertValueFromClient<T extends IUserProfile | NewUserProfile | PartialUpdateUserProfile>(userProfile: T): RestOf<T> {
    return {
      ...userProfile,
      lastLoginAt: userProfile.lastLoginAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestUserProfile): IUserProfile {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestUserProfile[]): IUserProfile[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
