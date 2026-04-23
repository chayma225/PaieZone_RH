import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IHrDocument, NewHrDocument } from '../hr-document.model';

type HrDocumentFormGroupContent = {
  id: FormControl<IHrDocument['id'] | NewHrDocument['id']>;
  documentType: FormControl<IHrDocument['documentType']>;
  title: FormControl<IHrDocument['title']>;
  description: FormControl<IHrDocument['description']>;
  fileData: FormControl<IHrDocument['fileData']>;
  fileDataContentType: FormControl<IHrDocument['fileDataContentType']>;
  fileUrl: FormControl<IHrDocument['fileUrl']>;
  fileSize: FormControl<IHrDocument['fileSize']>;
  mimeType: FormControl<IHrDocument['mimeType']>;
  uploadedAt: FormControl<IHrDocument['uploadedAt']>;
  expiryDate: FormControl<IHrDocument['expiryDate']>;
  active: FormControl<IHrDocument['active']>;
  employee: FormControl<IHrDocument['employee']>;
  uploadedBy: FormControl<IHrDocument['uploadedBy']>;
};

export type HrDocumentFormGroup = FormGroup<HrDocumentFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class HrDocumentFormService {
  createHrDocumentFormGroup(hrDocument: IHrDocument | null = null): HrDocumentFormGroup {
    const hrDocumentRawValue = hrDocument ?? {
      id: null,
      documentType: null,
      title: null,
      description: null,
      fileData: null, // ← pas required ici
      fileDataContentType: null,
      fileUrl: null,
      fileSize: null,
      mimeType: null,
      uploadedAt: null,
      expiryDate: null,
      active: true,
      employee: null,
      uploadedBy: null,
    };

    return new FormGroup<HrDocumentFormGroupContent>({
      id: new FormControl({ value: hrDocumentRawValue.id, disabled: true }),
      documentType: new FormControl(hrDocumentRawValue.documentType, {
        validators: [Validators.required],
      }),
      title: new FormControl(hrDocumentRawValue.title, {
        validators: [Validators.required, Validators.maxLength(200)],
      }),
      description: new FormControl(hrDocumentRawValue.description, {
        validators: [Validators.maxLength(500)],
      }),
      // ← fileData NON required dans le form (validé manuellement dans le composant)
      fileData: new FormControl(hrDocumentRawValue.fileData),
      fileDataContentType: new FormControl(hrDocumentRawValue.fileDataContentType),
      fileUrl: new FormControl(hrDocumentRawValue.fileUrl),
      fileSize: new FormControl(hrDocumentRawValue.fileSize),
      mimeType: new FormControl(hrDocumentRawValue.mimeType),
      uploadedAt: new FormControl(hrDocumentRawValue.uploadedAt),
      expiryDate: new FormControl(hrDocumentRawValue.expiryDate),
      active: new FormControl(hrDocumentRawValue.active ?? true, {
        validators: [Validators.required],
      }),
      employee: new FormControl(hrDocumentRawValue.employee, {
        validators: [Validators.required],
      }),
      uploadedBy: new FormControl(hrDocumentRawValue.uploadedBy),
    });
  }

  getHrDocument(form: HrDocumentFormGroup): IHrDocument | NewHrDocument {
    return form.getRawValue() as IHrDocument | NewHrDocument;
  }

  resetForm(form: HrDocumentFormGroup, hrDocument: IHrDocument): void {
    const hrDocumentRawValue = { ...hrDocument };
    form.reset({ ...hrDocumentRawValue, id: { value: hrDocumentRawValue.id, disabled: true } } as any);
  }
}
