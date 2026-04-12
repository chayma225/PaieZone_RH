import dayjs from 'dayjs/esm';

import { IEmployee } from 'app/entities/employee/employee.model';
import { TimeEntrySource } from 'app/entities/enumerations/time-entry-source.model';
import { TimeEntryStatus } from 'app/entities/enumerations/time-entry-status.model';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';

export interface ITimeEntry {
  id: number;
  entryDate?: dayjs.Dayjs | null;
  checkIn?: dayjs.Dayjs | null;
  checkOut?: dayjs.Dayjs | null;
  workedHours?: number | null;
  overtimeHours?: number | null;
  lateMinutes?: number | null;
  source?: keyof typeof TimeEntrySource | null;
  status?: keyof typeof TimeEntryStatus | null;
  anomalyNote?: string | null;
  validatedBy?: string | null;
  validatedAt?: dayjs.Dayjs | null;
  employee?: Pick<IEmployee, 'id'> | null;
  validatedByUser?: Pick<IUserProfile, 'id'> | null;
}

export type NewTimeEntry = Omit<ITimeEntry, 'id'> & { id: null };
