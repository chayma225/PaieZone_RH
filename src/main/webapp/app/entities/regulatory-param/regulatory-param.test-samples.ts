
import { IRegulatoryParam, NewRegulatoryParam } from './regulatory-param.model';

export const sampleWithRequiredData: IRegulatoryParam = {
  id: 1,
  paramKey: 'FRAIS_PRO_TAUX',
  paramLabel: 'Taux frais professionnels',
  effectiveFrom: null,
  active: true,
};

export const sampleWithPartialData: IRegulatoryParam = {
  id: 2,
  paramKey: 'DEDUCTION_CHEF_FAMILLE',
  paramLabel: 'Déduction chef de famille',
  category: 'FAMILLE',
  numericValue: 300.0,
  effectiveFrom: null,
  active: true,
};

export const sampleWithFullData: IRegulatoryParam = {
  id: 3,
  paramKey: 'FRAIS_PRO_PLAFOND',
  paramLabel: 'Plafond frais professionnels annuel (DT)',
  category: 'FISCAL',
  numericValue: 2000.0,
  stringValue: null,
  effectiveFrom: null,
  effectiveTo: null,
  legalReference: 'Art. 26 CIRPP',
  description: 'Plafond annuel de déduction des frais professionnels',
  active: true,
  updatedAt: null,
  updatedBy: 'admin',
};

export const sampleWithNewData: NewRegulatoryParam = {
  id: null,
  paramKey: 'NOUVEAU_PARAM',
  paramLabel: 'Nouveau paramètre test',
  category: 'FISCAL',
  numericValue: 0.15,
  effectiveFrom: null,
  active: true,
};

export function getRegulatoryParamIdentifier(regulatoryParam: Pick<IRegulatoryParam, 'id'>): number {
  return regulatoryParam.id;
}

