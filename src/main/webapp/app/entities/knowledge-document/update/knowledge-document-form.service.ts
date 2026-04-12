import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IKnowledgeDocument, NewKnowledgeDocument } from '../knowledge-document.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IKnowledgeDocument for edit and NewKnowledgeDocumentFormGroupInput for create.
 */
type KnowledgeDocumentFormGroupInput = IKnowledgeDocument | PartialWithRequiredKeyOf<NewKnowledgeDocument>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IKnowledgeDocument | NewKnowledgeDocument> = Omit<T, 'indexedAt' | 'createdAt'> & {
  indexedAt?: string | null;
  createdAt?: string | null;
};

type KnowledgeDocumentFormRawValue = FormValueOf<IKnowledgeDocument>;

type NewKnowledgeDocumentFormRawValue = FormValueOf<NewKnowledgeDocument>;

type KnowledgeDocumentFormDefaults = Pick<NewKnowledgeDocument, 'id' | 'vectorIndexed' | 'indexedAt' | 'active' | 'createdAt'>;

type KnowledgeDocumentFormGroupContent = {
  id: FormControl<KnowledgeDocumentFormRawValue['id'] | NewKnowledgeDocument['id']>;
  title: FormControl<KnowledgeDocumentFormRawValue['title']>;
  category: FormControl<KnowledgeDocumentFormRawValue['category']>;
  content: FormControl<KnowledgeDocumentFormRawValue['content']>;
  fileUrl: FormControl<KnowledgeDocumentFormRawValue['fileUrl']>;
  vectorIndexed: FormControl<KnowledgeDocumentFormRawValue['vectorIndexed']>;
  indexedAt: FormControl<KnowledgeDocumentFormRawValue['indexedAt']>;
  active: FormControl<KnowledgeDocumentFormRawValue['active']>;
  createdAt: FormControl<KnowledgeDocumentFormRawValue['createdAt']>;
  company: FormControl<KnowledgeDocumentFormRawValue['company']>;
};

export type KnowledgeDocumentFormGroup = FormGroup<KnowledgeDocumentFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class KnowledgeDocumentFormService {
  createKnowledgeDocumentFormGroup(knowledgeDocument?: KnowledgeDocumentFormGroupInput): KnowledgeDocumentFormGroup {
    const knowledgeDocumentRawValue = this.convertKnowledgeDocumentToKnowledgeDocumentRawValue({
      ...this.getFormDefaults(),
      ...(knowledgeDocument ?? { id: null }),
    });
    return new FormGroup<KnowledgeDocumentFormGroupContent>({
      id: new FormControl(
        { value: knowledgeDocumentRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      title: new FormControl(knowledgeDocumentRawValue.title, {
        validators: [Validators.required, Validators.maxLength(200)],
      }),
      category: new FormControl(knowledgeDocumentRawValue.category, {
        validators: [Validators.maxLength(100)],
      }),
      content: new FormControl(knowledgeDocumentRawValue.content, {
        validators: [Validators.required],
      }),
      fileUrl: new FormControl(knowledgeDocumentRawValue.fileUrl, {
        validators: [Validators.maxLength(500)],
      }),
      vectorIndexed: new FormControl(knowledgeDocumentRawValue.vectorIndexed, {
        validators: [Validators.required],
      }),
      indexedAt: new FormControl(knowledgeDocumentRawValue.indexedAt),
      active: new FormControl(knowledgeDocumentRawValue.active, {
        validators: [Validators.required],
      }),
      createdAt: new FormControl(knowledgeDocumentRawValue.createdAt, {
        validators: [Validators.required],
      }),
      company: new FormControl(knowledgeDocumentRawValue.company, {
        validators: [Validators.required],
      }),
    });
  }

  getKnowledgeDocument(form: KnowledgeDocumentFormGroup): IKnowledgeDocument | NewKnowledgeDocument {
    return this.convertKnowledgeDocumentRawValueToKnowledgeDocument(
      form.getRawValue() as KnowledgeDocumentFormRawValue | NewKnowledgeDocumentFormRawValue,
    );
  }

  resetForm(form: KnowledgeDocumentFormGroup, knowledgeDocument: KnowledgeDocumentFormGroupInput): void {
    const knowledgeDocumentRawValue = this.convertKnowledgeDocumentToKnowledgeDocumentRawValue({
      ...this.getFormDefaults(),
      ...knowledgeDocument,
    });
    form.reset({
      ...knowledgeDocumentRawValue,
      id: { value: knowledgeDocumentRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): KnowledgeDocumentFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      vectorIndexed: false,
      indexedAt: currentTime,
      active: false,
      createdAt: currentTime,
    };
  }

  private convertKnowledgeDocumentRawValueToKnowledgeDocument(
    rawKnowledgeDocument: KnowledgeDocumentFormRawValue | NewKnowledgeDocumentFormRawValue,
  ): IKnowledgeDocument | NewKnowledgeDocument {
    return {
      ...rawKnowledgeDocument,
      indexedAt: dayjs(rawKnowledgeDocument.indexedAt, DATE_TIME_FORMAT),
      createdAt: dayjs(rawKnowledgeDocument.createdAt, DATE_TIME_FORMAT),
    };
  }

  private convertKnowledgeDocumentToKnowledgeDocumentRawValue(
    knowledgeDocument: IKnowledgeDocument | (Partial<NewKnowledgeDocument> & KnowledgeDocumentFormDefaults),
  ): KnowledgeDocumentFormRawValue | PartialWithRequiredKeyOf<NewKnowledgeDocumentFormRawValue> {
    return {
      ...knowledgeDocument,
      indexedAt: knowledgeDocument.indexedAt ? knowledgeDocument.indexedAt.format(DATE_TIME_FORMAT) : undefined,
      createdAt: knowledgeDocument.createdAt ? knowledgeDocument.createdAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
