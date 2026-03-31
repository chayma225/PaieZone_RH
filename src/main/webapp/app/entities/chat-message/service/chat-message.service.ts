import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IChatMessage, NewChatMessage } from '../chat-message.model';

export type PartialUpdateChatMessage = Partial<IChatMessage> & Pick<IChatMessage, 'id'>;

type RestOf<T extends IChatMessage | NewChatMessage> = Omit<T, 'sentAt'> & {
  sentAt?: string | null;
};

export type RestChatMessage = RestOf<IChatMessage>;

export type NewRestChatMessage = RestOf<NewChatMessage>;

export type PartialUpdateRestChatMessage = RestOf<PartialUpdateChatMessage>;

export type EntityResponseType = HttpResponse<IChatMessage>;
export type EntityArrayResponseType = HttpResponse<IChatMessage[]>;

@Injectable({ providedIn: 'root' })
export class ChatMessageService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/chat-messages');

  create(chatMessage: NewChatMessage): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(chatMessage);
    return this.http
      .post<RestChatMessage>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(chatMessage: IChatMessage): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(chatMessage);
    return this.http
      .put<RestChatMessage>(`${this.resourceUrl}/${this.getChatMessageIdentifier(chatMessage)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(chatMessage: PartialUpdateChatMessage): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(chatMessage);
    return this.http
      .patch<RestChatMessage>(`${this.resourceUrl}/${this.getChatMessageIdentifier(chatMessage)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestChatMessage>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestChatMessage[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
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

  protected convertDateFromClient<T extends IChatMessage | NewChatMessage | PartialUpdateChatMessage>(chatMessage: T): RestOf<T> {
    return {
      ...chatMessage,
      sentAt: chatMessage.sentAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restChatMessage: RestChatMessage): IChatMessage {
    return {
      ...restChatMessage,
      sentAt: restChatMessage.sentAt ? dayjs(restChatMessage.sentAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestChatMessage>): HttpResponse<IChatMessage> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestChatMessage[]>): HttpResponse<IChatMessage[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
