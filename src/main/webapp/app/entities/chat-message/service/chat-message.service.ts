import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IChatMessage, NewChatMessage } from '../chat-message.model';

export type PartialUpdateChatMessage = Partial<IChatMessage> & Pick<IChatMessage, 'id'>;

type RestOf<T extends IChatMessage | NewChatMessage> = Omit<T, 'sentAt'> & {
  sentAt?: string | null;
};

export type RestChatMessage = RestOf<IChatMessage>;

export type NewRestChatMessage = RestOf<NewChatMessage>;

export type PartialUpdateRestChatMessage = RestOf<PartialUpdateChatMessage>;

@Injectable()
export class ChatMessagesService {
  readonly chatMessagesParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly chatMessagesResource = httpResource<RestChatMessage[]>(() => {
    const params = this.chatMessagesParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of chatMessage that have been fetched. It is updated when the chatMessagesResource emits a new value.
   * In case of error while fetching the chatMessages, the signal is set to an empty array.
   */
  readonly chatMessages = computed(() =>
    (this.chatMessagesResource.hasValue() ? this.chatMessagesResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/chat-messages');

  protected convertValueFromServer(restChatMessage: RestChatMessage): IChatMessage {
    return {
      ...restChatMessage,
      sentAt: restChatMessage.sentAt ? dayjs(restChatMessage.sentAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class ChatMessageService extends ChatMessagesService {
  protected readonly http = inject(HttpClient);

  create(chatMessage: NewChatMessage): Observable<IChatMessage> {
    const copy = this.convertValueFromClient(chatMessage);
    return this.http.post<RestChatMessage>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(chatMessage: IChatMessage): Observable<IChatMessage> {
    const copy = this.convertValueFromClient(chatMessage);
    return this.http
      .put<RestChatMessage>(`${this.resourceUrl}/${encodeURIComponent(this.getChatMessageIdentifier(chatMessage))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(chatMessage: PartialUpdateChatMessage): Observable<IChatMessage> {
    const copy = this.convertValueFromClient(chatMessage);
    return this.http
      .patch<RestChatMessage>(`${this.resourceUrl}/${encodeURIComponent(this.getChatMessageIdentifier(chatMessage))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IChatMessage> {
    return this.http
      .get<RestChatMessage>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IChatMessage[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestChatMessage[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getChatMessageIdentifier(chatMessage: Pick<IChatMessage, 'id'>): number {
    return chatMessage.id;
  }

  compareChatMessage(o1: Pick<IChatMessage, 'id'> | null, o2: Pick<IChatMessage, 'id'> | null): boolean {
    return o1 && o2 ? this.getChatMessageIdentifier(o1) === this.getChatMessageIdentifier(o2) : o1 === o2;
  }

  addChatMessageToCollectionIfMissing<Type extends Pick<IChatMessage, 'id'>>(
    chatMessageCollection: Type[],
    ...chatMessagesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const chatMessages: Type[] = chatMessagesToCheck.filter(isPresent);
    if (chatMessages.length > 0) {
      const chatMessageCollectionIdentifiers = chatMessageCollection.map(chatMessageItem => this.getChatMessageIdentifier(chatMessageItem));
      const chatMessagesToAdd = chatMessages.filter(chatMessageItem => {
        const chatMessageIdentifier = this.getChatMessageIdentifier(chatMessageItem);
        if (chatMessageCollectionIdentifiers.includes(chatMessageIdentifier)) {
          return false;
        }
        chatMessageCollectionIdentifiers.push(chatMessageIdentifier);
        return true;
      });
      return [...chatMessagesToAdd, ...chatMessageCollection];
    }
    return chatMessageCollection;
  }

  protected convertValueFromClient<T extends IChatMessage | NewChatMessage | PartialUpdateChatMessage>(chatMessage: T): RestOf<T> {
    return {
      ...chatMessage,
      sentAt: chatMessage.sentAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestChatMessage): IChatMessage {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestChatMessage[]): IChatMessage[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
