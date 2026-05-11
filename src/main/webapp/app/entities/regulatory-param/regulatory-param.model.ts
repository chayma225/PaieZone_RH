import dayjs from 'dayjs/esm';

export interface IRegulatoryParam {
  id: number;
  paramKey?: string | null;
  paramLabel?: string | null;
  category?: string | null;
  numericValue?: number | null;
  stringValue?: string | null;
  effectiveFrom?: dayjs.Dayjs | null;
  effectiveTo?: dayjs.Dayjs | null;
  legalReference?: string | null;
  description?: string | null;
  active?: boolean | null;
  updatedAt?: dayjs.Dayjs | null;
  updatedBy?: string | null;
}

export type NewRegulatoryParam = Omit<IRegulatoryParam, 'id'> & { id: null };
export type PartialUpdateRegulatoryParam = Partial<IRegulatoryParam> & Pick<IRegulatoryParam, 'id'>;

export const REGULATORY_PARAM_CATEGORIES = [
  'FISCAL',
  'FAMILLE',
  'WORK_TIME',
  'SOCIAL',
  'LEAVE',
] as const;

export type RegulatoryParamCategory = (typeof REGULATORY_PARAM_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<string, string> = {
  FISCAL:    '📊 Fiscal',
  FAMILLE:   '👨‍👩‍👧 Famille',
  WORK_TIME: '⏱ Temps de travail',
  SOCIAL:    '🏛 Social',
  LEAVE:     '🌴 Congés',
};

export const CATEGORY_COLORS: Record<string, string> = {
  FISCAL:    'bg-primary',
  FAMILLE:   'bg-success',
  WORK_TIME: 'bg-warning text-dark',
  SOCIAL:    'bg-info text-dark',
  LEAVE:     'bg-secondary',
};

export const PARAM_FORMAT: Record<string, { unit: string; isPercent: boolean }> = {
  FRAIS_PRO_TAUX:         { unit: '%',  isPercent: true  },
  FRAIS_PRO_PLAFOND:      { unit: 'DT', isPercent: false },
  DEDUCTION_CHEF_FAMILLE: { unit: 'DT', isPercent: false },
  DEDUCTION_PAR_ENFANT:   { unit: 'DT', isPercent: false },
  HEURES_MENSUELLES_BASE: { unit: 'h',  isPercent: false },
  TAUX_HS_25:             { unit: '×',  isPercent: false },
  TAUX_HS_50:             { unit: '×',  isPercent: false },
  CSS_TAUX_TRANCHE1:      { unit: '%',  isPercent: true  },
  TFP_TAUX:               { unit: '%',  isPercent: true  },
  CONGE_MENSUEL_ACCRU:    { unit: 'j',  isPercent: false },
};

