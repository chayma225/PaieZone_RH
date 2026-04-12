import dayjs from 'dayjs/esm';

import { ICompany } from 'app/entities/company/company.model';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';

export interface IAuditLog {
  id: number;
  action?: string | null;
  entityType?: string | null;
  entityId?: number | null;
  oldValue?: string | null;
  newValue?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  occurredAt?: dayjs.Dayjs | null;
  user?: Pick<IUserProfile, 'id'> | null;
  company?: Pick<ICompany, 'id'> | null;
}

export type NewAuditLog = Omit<IAuditLog, 'id'> & { id: null };
