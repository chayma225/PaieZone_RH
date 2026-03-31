import dayjs from 'dayjs/esm';

export interface IPublicHoliday {
  id: number;
  name?: string | null;
  nameAr?: string | null;
  holidayDate?: dayjs.Dayjs | null;
  year?: number | null;
  isRecurring?: boolean | null;
  active?: boolean | null;
}

export type NewPublicHoliday = Omit<IPublicHoliday, 'id'> & { id: null };
