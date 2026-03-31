import dayjs from 'dayjs/esm';

export interface IRegulatoryParam {
  id: number;
  paramKey?: string | null;
  paramLabel?: string | null;
  numericValue?: number | null;
  textValue?: string | null;
  effectiveFrom?: dayjs.Dayjs | null;
  effectiveTo?: dayjs.Dayjs | null;
  legalReference?: string | null;
  active?: boolean | null;
}

export type NewRegulatoryParam = Omit<IRegulatoryParam, 'id'> & { id: null };
