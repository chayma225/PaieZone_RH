import dayjs from 'dayjs/esm';
import { ICompany } from 'app/entities/company/company.model';
import { IEmployee } from 'app/entities/employee/employee.model';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { OfficialDocType } from 'app/entities/enumerations/official-doc-type.model';

export interface IOfficialDocument {
  id: number;
  docType?: keyof typeof OfficialDocType | null;
  title?: string | null;
  month?: number | null;
  year?: number | null;
  generatedAt?: dayjs.Dayjs | null;
  fileUrl?: string | null;
  signedBy?: string | null;
  sentAt?: dayjs.Dayjs | null;
  notes?: string | null;
  company?: Pick<ICompany, 'id'> | null;
  employee?: Pick<IEmployee, 'id'> | null;
  generatedBy?: Pick<IUserProfile, 'id'> | null;
}

export type NewOfficialDocument = Omit<IOfficialDocument, 'id'> & { id: null };
