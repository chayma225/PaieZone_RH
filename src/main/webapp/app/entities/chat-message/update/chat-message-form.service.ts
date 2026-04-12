import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IChatMessage, NewChatMessage } from '../chat-message.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IChatMessage for edit and NewChatMessageFormGroupInput for create.
 */
type ChatMessageFormGroupInput = IChatMessage | PartialWithRequiredKeyOf<NewChatMessage>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IChatMessage | NewChatMessage> = Omit<T, 'sentAt'> & {
  sentAt?: string | null;
};

type ChatMessageFormRawValue = FormValueOf<IChatMessage>;

type NewChatMessageFormRawValue = FormValueOf<NewChatMessage>;

type ChatMessageFormDefaults = Pick<NewChatMessage, 'id' | 'sentAt' | 'errorOccurred'>;

type ChatMessageFormGroupContent = {
  id: FormControl<ChatMessageFormRawValue['id'] | NewChatMessage['id']>;
  role: FormControl<ChatMessageFormRawValue['role']>;
  content: FormControl<ChatMessageFormRawValue['content']>;
  intent: FormControl<ChatMessageFormRawValue['intent']>;
  actionTaken: FormControl<ChatMessageFormRawValue['actionTaken']>;
  tokenUsed: FormControl<ChatMessageFormRawValue['tokenUsed']>;
  sentAt: FormControl<ChatMessageFormRawValue['sentAt']>;
  errorOccurred: FormControl<ChatMessageFormRawValue['errorOccurred']>;
  session: FormControl<ChatMessageFormRawValue['session']>;
};

export type ChatMessageFormGroup = FormGroup<ChatMessageFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ChatMessageFormService {
  createChatMessageFormGroup(chatMessage?: ChatMessageFormGroupInput): ChatMessageFormGroup {
    const chatMessageRawValue = this.convertChatMessageToChatMessageRawValue({
      ...this.getFormDefaults(),
      ...(chatMessage ?? { id: null }),
    });
    return new FormGroup<ChatMessageFormGroupContent>({
      id: new FormControl(
        { value: chatMessageRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      role: new FormControl(chatMessageRawValue.role, {
        validators: [Validators.required],
      }),
      content: new FormControl(chatMessageRawValue.content, {
        validators: [Validators.required],
      }),
      intent: new FormControl(chatMessageRawValue.intent),
      actionTaken: new FormControl(chatMessageRawValue.actionTaken, {
        validators: [Validators.maxLength(200)],
      }),
      tokenUsed: new FormControl(chatMessageRawValue.tokenUsed),
      sentAt: new FormControl(chatMessageRawValue.sentAt, {
        validators: [Validators.required],
      }),
      errorOccurred: new FormControl(chatMessageRawValue.errorOccurred),
      session: new FormControl(chatMessageRawValue.session, {
        validators: [Validators.required],
      }),
    });
  }

  getChatMessage(form: ChatMessageFormGroup): IChatMessage | NewChatMessage {
    return this.convertChatMessageRawValueToChatMessage(form.getRawValue() as ChatMessageFormRawValue | NewChatMessageFormRawValue);
  }

  resetForm(form: ChatMessageFormGroup, chatMessage: ChatMessageFormGroupInput): void {
    const chatMessageRawValue = this.convertChatMessageToChatMessageRawValue({ ...this.getFormDefaults(), ...chatMessage });
    form.reset({
      ...chatMessageRawValue,
      id: { value: chatMessageRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): ChatMessageFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      sentAt: currentTime,
      errorOccurred: false,
    };
  }

  private convertChatMessageRawValueToChatMessage(
    rawChatMessage: ChatMessageFormRawValue | NewChatMessageFormRawValue,
  ): IChatMessage | NewChatMessage {
    return {
      ...rawChatMessage,
      sentAt: dayjs(rawChatMessage.sentAt, DATE_TIME_FORMAT),
    };
  }

  private convertChatMessageToChatMessageRawValue(
    chatMessage: IChatMessage | (Partial<NewChatMessage> & ChatMessageFormDefaults),
  ): ChatMessageFormRawValue | PartialWithRequiredKeyOf<NewChatMessageFormRawValue> {
    return {
      ...chatMessage,
      sentAt: chatMessage.sentAt ? chatMessage.sentAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
