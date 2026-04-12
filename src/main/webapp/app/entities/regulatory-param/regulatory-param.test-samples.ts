import dayjs from 'dayjs/esm';

import { IRegulatoryParam, NewRegulatoryParam } from './regulatory-param.model';

export const sampleWithRequiredData: IRegulatoryParam = {
  id: 28647,
  paramKey: 'responsable géométrique',
  paramLabel: 'inciter',
  effectiveFrom: dayjs('2026-04-07'),
  active: false,
};

export const sampleWithPartialData: IRegulatoryParam = {
  id: 4046,
  paramKey: 'groin groin afin que',
  paramLabel: 'empêcher',
  effectiveFrom: dayjs('2026-04-07'),
  legalReference: 'expliquer chez',
  active: false,
};

export const sampleWithFullData: IRegulatoryParam = {
  id: 17062,
  paramKey: 'oh ici',
  paramLabel: 'lorsque à demi en bas de',
  numericValue: 18499.56,
  textValue: 'autrement au-dehors broum',
  effectiveFrom: dayjs('2026-04-08'),
  effectiveTo: dayjs('2026-04-07'),
  legalReference: 'comparer trop',
  active: false,
};

export const sampleWithNewData: NewRegulatoryParam = {
  paramKey: 'après-demain à la faveur de',
  paramLabel: 'charger',
  effectiveFrom: dayjs('2026-04-08'),
  active: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
