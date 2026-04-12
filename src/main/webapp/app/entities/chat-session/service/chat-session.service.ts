import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IChatSession, NewChatSession } from '../chat-session.model';

export type PartialUpdateChatSession = Partial<IChatSession> & Pick<IChatSession, 'id'>;

type RestOf<T extends IChatSession | NewChatSession> = Omit<T, 'startedAt' | 'endedAt' | 'escalatedAt'> & {
  startedAt?: string | null;
  endedAt?: string | null;
  escalatedAt?: string | null;
};

export type RestChatSession = RestOf<IChatSession>;

export type NewRestChatSession = RestOf<NewChatSession>;

export type PartialUpdateRestChatSession = RestOf<PartialUpdateChatSession>;

@Injectable()
export class ChatSessionsService {
  readonly chatSessionsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly chatSessionsResource = httpResource<RestChatSession[]>(() => {
    const params = this.chatSessionsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of chatSession that have been fetched. It is updated when the chatSessionsResource emits a new value.
   * In case of error while fetching the chatSessions, the signal is set to an empty array.
   */
  readonly chatSessions = computed(() =>
    (this.chatSessionsResource.hasValue() ? this.chatSessionsResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/chat-sessions');

  protected convertValueFromServer(restChatSession: RestChatSession): IChatSession {
    return {
      ...restChatSession,
      startedAt: restChatSession.startedAt ? dayjs(restChatSession.startedAt) : undefined,
      endedAt: restChatSession.endedAt ? dayjs(restChatSession.endedAt) : undefined,
      escalatedAt: restChatSession.escalatedAt ? dayjs(restChatSession.escalatedAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class ChatSessionService extends ChatSessionsService {
  protected readonly http = inject(HttpClient);

  create(chatSession: NewChatSession): Observable<IChatSession> {
    const copy = this.convertValueFromClient(chatSession);
    return this.http.post<RestChatSession>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(chatSession: IChatSession): Observable<IChatSession> {
    const copy = this.convertValueFromClient(chatSession);
    return this.http
      .put<RestChatSession>(`${this.resourceUrl}/${encodeURIComponent(this.getChatSessionIdentifier(chatSession))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(chatSession: PartialUpdateChatSession): Observable<IChatSession> {
    const copy = this.convertValueFromClient(chatSession);
    return this.http
      .patch<RestChatSession>(`${this.resourceUrl}/${encodeURIComponent(this.getChatSessionIdentifier(chatSession))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IChatSession> {
    return this.http
      .get<RestChatSession>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IChatSession[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestChatSession[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getChatSessionIdentifier(chatSession: Pick<IChatSession, 'id'>): number {
    return chatSession.id;
  }

  compareChatSession(o1: Pick<IChatSession, 'id'> | null, o2: Pick<IChatSession, 'id'> | null): boolean {
    return o1 && o2 ? this.getChatSessionIdentifier(o1) === this.getChatSessionIdentifier(o2) : o1 === o2;
  }

  addChatSessionToCollectionIfMissing<Type extends Pick<IChatSession, 'id'>>(
    chatSessionCollection: Type[],
    ...chatSessionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const chatSessions: Type[] = chatSessionsToCheck.filter(isPresent);
    if (chatSessions.length > 0) {
      const chatSessionCollectionIdentifiers = chatSessionCollection.map(chatSessionItem => this.getChatSessionIdentifier(chatSessionItem));
      const chatSessionsToAdd = chatSessions.filter(chatSessionItem => {
        const chatSessionIdentifier = this.getChatSessionIdentifier(chatSessionItem);
        if (chatSessionCollectionIdentifiers.includes(chatSessionIdentifier)) {
          return false;
        }
        chatSessionCollectionIdentifiers.push(chatSessionIdentifier);
        return true;
      });
      return [...chatSessionsToAdd, ...chatSessionCollection];
    }
    return chatSessionCollection;
  }

  protected convertValueFromClient<T extends IChatSession | NewChatSession | PartialUpdateChatSession>(chatSession: T): RestOf<T> {
    return {
      ...chatSession,
      startedAt: chatSession.startedAt?.toJSON() ?? null,
      endedAt: chatSession.endedAt?.toJSON() ?? null,
      escalatedAt: chatSession.escalatedAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestChatSession): IChatSession {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestChatSession[]): IChatSession[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
