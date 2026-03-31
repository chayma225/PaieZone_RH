import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IOfficialDocument, NewOfficialDocument } from '../official-document.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IOfficialDocument for edit and NewOfficialDocumentFormGroupInput for create.
 */
type OfficialDocumentFormGroupInput = IOfficialDocument | PartialWithRequiredKeyOf<NewOfficialDocument>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IOfficialDocument | NewOfficialDocument> = Omit<T, 'generatedAt' | 'sentAt'> & {
  generatedAt?: string | null;
  sentAt?: string | null;
};

type OfficialDocumentFormRawValue = FormValueOf<IOfficialDocument>;

type NewOfficialDocumentFormRawValue = FormValueOf<NewOfficialDocument>;

type OfficialDocumentFormDefaults = Pick<NewOfficialDocument, 'id' | 'generatedAt' | 'sentAt'>;

type OfficialDocumentFormGroupContent = {
  id: FormControl<OfficialDocumentFormRawValue['id'] | NewOfficialDocument['id']>;
  docType: FormControl<OfficialDocumentFormRawValue['docType']>;
  title: FormControl<OfficialDocumentFormRawValue['title']>;
  month: FormControl<OfficialDocumentFormRawValue['month']>;
  year: FormControl<OfficialDocumentFormRawValue['year']>;
  generatedAt: FormControl<OfficialDocumentFormRawValue['generatedAt']>;
  fileUrl: FormControl<OfficialDocumentFormRawValue['fileUrl']>;
  signedBy: FormControl<OfficialDocumentFormRawValue['signedBy']>;
  sentAt: FormControl<OfficialDocumentFormRawValue['sentAt']>;
  notes: FormControl<OfficialDocumentFormRawValue['notes']>;
  company: FormControl<OfficialDocumentFormRawValue['company']>;
  employee: FormControl<OfficialDocumentFormRawValue['employee']>;
  generatedBy: FormControl<OfficialDocumentFormRawValue['generatedBy']>;
};

export type OfficialDocumentFormGroup = FormGroup<OfficialDocumentFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class OfficialDocumentFormService {
  createOfficialDocumentFormGroup(officialDocument: OfficialDocumentFormGroupInput = { id: null }): OfficialDocumentFormGroup {
    const officialDocumentRawValue = this.convertOfficialDocumentToOfficialDocumentRawValue({
      ...this.getFormDefaults(),
      ...officialDocument,
    });
    return new FormGroup<OfficialDocumentFormGroupContent>({
      id: new FormControl(
        { value: officialDocumentRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      docType: new FormControl(officialDocumentRawValue.docType, {
        validators: [Validators.required],
      }),
      title: new FormControl(officialDocumentRawValue.title, {
        validators: [Validators.required, Validators.maxLength(200)],
      }),
      month: new FormControl(officialDocumentRawValue.month, {
        validators: [Validators.min(1), Validators.max(12)],
      }),
      year: new FormControl(officialDocumentRawValue.year, {
        validators: [Validators.required],
      }),
      generatedAt: new FormControl(officialDocumentRawValue.generatedAt, {
        validators: [Validators.required],
      }),
      fileUrl: new FormControl(officialDocumentRawValue.fileUrl, {
        validators: [Validators.maxLength(500)],
      }),
      signedBy: new FormControl(officialDocumentRawValue.signedBy, {
        validators: [Validators.maxLength(100)],
      }),
      sentAt: new FormControl(officialDocumentRawValue.sentAt),
      notes: new FormControl(officialDocumentRawValue.notes, {
        validators: [Validators.maxLength(500)],
      }),
      company: new FormControl(officialDocumentRawValue.company, {
        validators: [Validators.required],
      }),
      employee: new FormControl(officialDocumentRawValue.employee),
      generatedBy: new FormControl(officialDocumentRawValue.generatedBy),
    });
  }

  getOfficialDocument(form: OfficialDocumentFormGroup): IOfficialDocument | NewOfficialDocument {
    return this.convertOfficialDocumentRawValueToOfficialDocument(
      form.getRawValue() as OfficialDocumentFormRawValue | NewOfficialDocumentFormRawValue,
    );
  }

  resetForm(form: OfficialDocumentFormGroup, officialDocument: OfficialDocumentFormGroupInput): void {
    const officialDocumentRawValue = this.convertOfficialDocumentToOfficialDocumentRawValue({
      ...this.getFormDefaults(),
      ...officialDocument,
    });
    form.reset(
      {
        ...officialDocumentRawValue,
        id: { value: officialDocumentRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): OfficialDocumentFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      generatedAt: currentTime,
      sentAt: currentTime,
    };
  }

  private convertOfficialDocumentRawValueToOfficialDocument(
    rawOfficialDocument: OfficialDocumentFormRawValue | NewOfficialDocumentFormRawValue,
  ): IOfficialDocument | NewOfficialDocument {
    return {
      ...rawOfficialDocument,
      generatedAt: dayjs(rawOfficialDocument.generatedAt, DATE_TIME_FORMAT),
      sentAt: dayjs(rawOfficialDocument.sentAt, DATE_TIME_FORMAT),
    };
  }

  private convertOfficialDocumentToOfficialDocumentRawValue(
    officialDocument: IOfficialDocument | (Partial<NewOfficialDocument> & OfficialDocumentFormDefaults),
  ): OfficialDocumentFormRawValue | PartialWithRequiredKeyOf<NewOfficialDocumentFormRawValue> {
    return {
      ...officialDocument,
      generatedAt: officialDocument.generatedAt ? officialDocument.generatedAt.format(DATE_TIME_FORMAT) : undefined,
      sentAt: officialDocument.sentAt ? officialDocument.sentAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
