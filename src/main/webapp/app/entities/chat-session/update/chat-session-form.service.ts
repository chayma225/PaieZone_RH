import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IChatSession, NewChatSession } from '../chat-session.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IChatSession for edit and NewChatSessionFormGroupInput for create.
 */
type ChatSessionFormGroupInput = IChatSession | PartialWithRequiredKeyOf<NewChatSession>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IChatSession | NewChatSession> = Omit<T, 'startedAt' | 'endedAt' | 'escalatedAt'> & {
  startedAt?: string | null;
  endedAt?: string | null;
  escalatedAt?: string | null;
};

type ChatSessionFormRawValue = FormValueOf<IChatSession>;

type NewChatSessionFormRawValue = FormValueOf<NewChatSession>;

type ChatSessionFormDefaults = Pick<NewChatSession, 'id' | 'startedAt' | 'endedAt' | 'escalatedAt'>;

type ChatSessionFormGroupContent = {
  id: FormControl<ChatSessionFormRawValue['id'] | NewChatSession['id']>;
  channel: FormControl<ChatSessionFormRawValue['channel']>;
  status: FormControl<ChatSessionFormRawValue['status']>;
  startedAt: FormControl<ChatSessionFormRawValue['startedAt']>;
  endedAt: FormControl<ChatSessionFormRawValue['endedAt']>;
  escalatedAt: FormControl<ChatSessionFormRawValue['escalatedAt']>;
  escalatedTo: FormControl<ChatSessionFormRawValue['escalatedTo']>;
  contextData: FormControl<ChatSessionFormRawValue['contextData']>;
  satisfactionScore: FormControl<ChatSessionFormRawValue['satisfactionScore']>;
  employee: FormControl<ChatSessionFormRawValue['employee']>;
};

export type ChatSessionFormGroup = FormGroup<ChatSessionFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ChatSessionFormService {
  createChatSessionFormGroup(chatSession?: ChatSessionFormGroupInput): ChatSessionFormGroup {
    const chatSessionRawValue = this.convertChatSessionToChatSessionRawValue({
      ...this.getFormDefaults(),
      ...(chatSession ?? { id: null }),
    });
    return new FormGroup<ChatSessionFormGroupContent>({
      id: new FormControl(
        { value: chatSessionRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      channel: new FormControl(chatSessionRawValue.channel, {
        validators: [Validators.required],
      }),
      status: new FormControl(chatSessionRawValue.status, {
        validators: [Validators.required],
      }),
      startedAt: new FormControl(chatSessionRawValue.startedAt, {
        validators: [Validators.required],
      }),
      endedAt: new FormControl(chatSessionRawValue.endedAt),
      escalatedAt: new FormControl(chatSessionRawValue.escalatedAt),
      escalatedTo: new FormControl(chatSessionRawValue.escalatedTo, {
        validators: [Validators.maxLength(100)],
      }),
      contextData: new FormControl(chatSessionRawValue.contextData),
      satisfactionScore: new FormControl(chatSessionRawValue.satisfactionScore, {
        validators: [Validators.min(1), Validators.max(5)],
      }),
      employee: new FormControl(chatSessionRawValue.employee, {
        validators: [Validators.required],
      }),
    });
  }

  getChatSession(form: ChatSessionFormGroup): IChatSession | NewChatSession {
    return this.convertChatSessionRawValueToChatSession(form.getRawValue() as ChatSessionFormRawValue | NewChatSessionFormRawValue);
  }

  resetForm(form: ChatSessionFormGroup, chatSession: ChatSessionFormGroupInput): void {
    const chatSessionRawValue = this.convertChatSessionToChatSessionRawValue({ ...this.getFormDefaults(), ...chatSession });
    form.reset({
      ...chatSessionRawValue,
      id: { value: chatSessionRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): ChatSessionFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      startedAt: currentTime,
      endedAt: currentTime,
      escalatedAt: currentTime,
    };
  }

  private convertChatSessionRawValueToChatSession(
    rawChatSession: ChatSessionFormRawValue | NewChatSessionFormRawValue,
  ): IChatSession | NewChatSession {
    return {
      ...rawChatSession,
      startedAt: dayjs(rawChatSession.startedAt, DATE_TIME_FORMAT),
      endedAt: dayjs(rawChatSession.endedAt, DATE_TIME_FORMAT),
      escalatedAt: dayjs(rawChatSession.escalatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertChatSessionToChatSessionRawValue(
    chatSession: IChatSession | (Partial<NewChatSession> & ChatSessionFormDefaults),
  ): ChatSessionFormRawValue | PartialWithRequiredKeyOf<NewChatSessionFormRawValue> {
    return {
      ...chatSession,
      startedAt: chatSession.startedAt ? chatSession.startedAt.format(DATE_TIME_FORMAT) : undefined,
      endedAt: chatSession.endedAt ? chatSession.endedAt.format(DATE_TIME_FORMAT) : undefined,
      escalatedAt: chatSession.escalatedAt ? chatSession.escalatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
