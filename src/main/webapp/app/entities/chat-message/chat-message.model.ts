import dayjs from 'dayjs/esm';
import { IChatSession } from 'app/entities/chat-session/chat-session.model';
import { MessageRole } from 'app/entities/enumerations/message-role.model';
import { MessageIntent } from 'app/entities/enumerations/message-intent.model';

export interface IChatMessage {
  id: number;
  role?: keyof typeof MessageRole | null;
  content?: string | null;
  intent?: keyof typeof MessageIntent | null;
  actionTaken?: string | null;
  tokenUsed?: number | null;
  sentAt?: dayjs.Dayjs | null;
  errorOccurred?: boolean | null;
  session?: Pick<IChatSession, 'id'> | null;
}

export type NewChatMessage = Omit<IChatMessage, 'id'> & { id: null };
