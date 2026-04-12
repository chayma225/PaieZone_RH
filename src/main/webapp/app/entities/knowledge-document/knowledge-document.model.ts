import dayjs from 'dayjs/esm';

import { ICompany } from 'app/entities/company/company.model';

export interface IKnowledgeDocument {
  id: number;
  title?: string | null;
  category?: string | null;
  content?: string | null;
  fileUrl?: string | null;
  vectorIndexed?: boolean | null;
  indexedAt?: dayjs.Dayjs | null;
  active?: boolean | null;
  createdAt?: dayjs.Dayjs | null;
  company?: Pick<ICompany, 'id'> | null;
}

export type NewKnowledgeDocument = Omit<IKnowledgeDocument, 'id'> & { id: null };
