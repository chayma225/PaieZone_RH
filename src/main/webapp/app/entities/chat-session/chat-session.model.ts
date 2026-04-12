import dayjs from 'dayjs/esm';

import { IEmployee } from 'app/entities/employee/employee.model';
import { ChatChannel } from 'app/entities/enumerations/chat-channel.model';
import { ChatSessionStatus } from 'app/entities/enumerations/chat-session-status.model';

export interface IChatSession {
  id: number;
  channel?: keyof typeof ChatChannel | null;
  status?: keyof typeof ChatSessionStatus | null;
  startedAt?: dayjs.Dayjs | null;
  endedAt?: dayjs.Dayjs | null;
  escalatedAt?: dayjs.Dayjs | null;
  escalatedTo?: string | null;
  contextData?: string | null;
  satisfactionScore?: number | null;
  employee?: Pick<IEmployee, 'id'> | null;
}

export type NewChatSession = Omit<IChatSession, 'id'> & { id: null };
