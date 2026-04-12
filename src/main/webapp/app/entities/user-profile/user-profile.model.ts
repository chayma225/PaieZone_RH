import dayjs from 'dayjs/esm';

import { ICompany } from 'app/entities/company/company.model';
import { AppRole } from 'app/entities/enumerations/app-role.model';

export interface IUserProfile {
  id: number;
  jhiUserId?: string | null;
  role?: keyof typeof AppRole | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  locale?: string | null;
  lastLoginAt?: dayjs.Dayjs | null;
  twoFactorEnabled?: boolean | null;
  twoFactorSecret?: string | null;
  active?: boolean | null;
  company?: Pick<ICompany, 'id'> | null;
}

export type NewUserProfile = Omit<IUserProfile, 'id'> & { id: null };
