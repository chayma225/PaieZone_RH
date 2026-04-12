import dayjs from 'dayjs/esm';

import { IEmployee } from 'app/entities/employee/employee.model';
import { DocumentType } from 'app/entities/enumerations/document-type.model';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';

export interface IHrDocument {
  id: number;
  documentType?: keyof typeof DocumentType | null;
  title?: string | null;
  description?: string | null;
  fileUrl?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  uploadedAt?: dayjs.Dayjs | null;
  expiryDate?: dayjs.Dayjs | null;
  active?: boolean | null;
  employee?: Pick<IEmployee, 'id'> | null;
  uploadedBy?: Pick<IUserProfile, 'id'> | null;
}

export type NewHrDocument = Omit<IHrDocument, 'id'> & { id: null };
