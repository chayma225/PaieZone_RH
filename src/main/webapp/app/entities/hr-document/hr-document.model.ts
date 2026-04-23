import { IEmployee } from 'app/entities/employee/employee.model';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { DocumentType } from 'app/entities/enumerations/document-type.model';
import dayjs from 'dayjs/esm';

export interface IHrDocument {
  id: number;
  documentType?: DocumentType | null;
  title?: string | null;
  description?: string | null;
  fileData?: string | null; // ← Base64 string
  fileDataContentType?: string | null;
  fileUrl?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  uploadedAt?: dayjs.Dayjs | null;
  expiryDate?: dayjs.Dayjs | null;
  active?: boolean | null;
  employee?: Pick<IEmployee, 'id' | 'matricule' | 'firstName' | 'lastName'> | null;
  uploadedBy?: Pick<IUserProfile, 'id'> | null;
}

export type NewHrDocument = Omit<IHrDocument, 'id'> & { id: null };
