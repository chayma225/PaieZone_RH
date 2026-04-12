import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IHrDocument, NewHrDocument } from '../hr-document.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IHrDocument for edit and NewHrDocumentFormGroupInput for create.
 */
type HrDocumentFormGroupInput = IHrDocument | PartialWithRequiredKeyOf<NewHrDocument>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IHrDocument | NewHrDocument> = Omit<T, 'uploadedAt'> & {
  uploadedAt?: string | null;
};

type HrDocumentFormRawValue = FormValueOf<IHrDocument>;

type NewHrDocumentFormRawValue = FormValueOf<NewHrDocument>;

type HrDocumentFormDefaults = Pick<NewHrDocument, 'id' | 'uploadedAt' | 'active'>;

type HrDocumentFormGroupContent = {
  id: FormControl<HrDocumentFormRawValue['id'] | NewHrDocument['id']>;
  documentType: FormControl<HrDocumentFormRawValue['documentType']>;
  title: FormControl<HrDocumentFormRawValue['title']>;
  description: FormControl<HrDocumentFormRawValue['description']>;
  fileUrl: FormControl<HrDocumentFormRawValue['fileUrl']>;
  fileSize: FormControl<HrDocumentFormRawValue['fileSize']>;
  mimeType: FormControl<HrDocumentFormRawValue['mimeType']>;
  uploadedAt: FormControl<HrDocumentFormRawValue['uploadedAt']>;
  expiryDate: FormControl<HrDocumentFormRawValue['expiryDate']>;
  active: FormControl<HrDocumentFormRawValue['active']>;
  employee: FormControl<HrDocumentFormRawValue['employee']>;
  uploadedBy: FormControl<HrDocumentFormRawValue['uploadedBy']>;
};

export type HrDocumentFormGroup = FormGroup<HrDocumentFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class HrDocumentFormService {
  createHrDocumentFormGroup(hrDocument?: HrDocumentFormGroupInput): HrDocumentFormGroup {
    const hrDocumentRawValue = this.convertHrDocumentToHrDocumentRawValue({
      ...this.getFormDefaults(),
      ...(hrDocument ?? { id: null }),
    });
    return new FormGroup<HrDocumentFormGroupContent>({
      id: new FormControl(
        { value: hrDocumentRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      documentType: new FormControl(hrDocumentRawValue.documentType, {
        validators: [Validators.required],
      }),
      title: new FormControl(hrDocumentRawValue.title, {
        validators: [Validators.required, Validators.maxLength(200)],
      }),
      description: new FormControl(hrDocumentRawValue.description, {
        validators: [Validators.maxLength(500)],
      }),
      fileUrl: new FormControl(hrDocumentRawValue.fileUrl, {
        validators: [Validators.required, Validators.maxLength(500)],
      }),
      fileSize: new FormControl(hrDocumentRawValue.fileSize),
      mimeType: new FormControl(hrDocumentRawValue.mimeType, {
        validators: [Validators.maxLength(100)],
      }),
      uploadedAt: new FormControl(hrDocumentRawValue.uploadedAt, {
        validators: [Validators.required],
      }),
      expiryDate: new FormControl(hrDocumentRawValue.expiryDate),
      active: new FormControl(hrDocumentRawValue.active, {
        validators: [Validators.required],
      }),
      employee: new FormControl(hrDocumentRawValue.employee, {
        validators: [Validators.required],
      }),
      uploadedBy: new FormControl(hrDocumentRawValue.uploadedBy),
    });
  }

  getHrDocument(form: HrDocumentFormGroup): IHrDocument | NewHrDocument {
    return this.convertHrDocumentRawValueToHrDocument(form.getRawValue() as HrDocumentFormRawValue | NewHrDocumentFormRawValue);
  }

  resetForm(form: HrDocumentFormGroup, hrDocument: HrDocumentFormGroupInput): void {
    const hrDocumentRawValue = this.convertHrDocumentToHrDocumentRawValue({ ...this.getFormDefaults(), ...hrDocument });
    form.reset({
      ...hrDocumentRawValue,
      id: { value: hrDocumentRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): HrDocumentFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      uploadedAt: currentTime,
      active: false,
    };
  }

  private convertHrDocumentRawValueToHrDocument(
    rawHrDocument: HrDocumentFormRawValue | NewHrDocumentFormRawValue,
  ): IHrDocument | NewHrDocument {
    return {
      ...rawHrDocument,
      uploadedAt: dayjs(rawHrDocument.uploadedAt, DATE_TIME_FORMAT),
    };
  }

  private convertHrDocumentToHrDocumentRawValue(
    hrDocument: IHrDocument | (Partial<NewHrDocument> & HrDocumentFormDefaults),
  ): HrDocumentFormRawValue | PartialWithRequiredKeyOf<NewHrDocumentFormRawValue> {
    return {
      ...hrDocument,
      uploadedAt: hrDocument.uploadedAt ? hrDocument.uploadedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
