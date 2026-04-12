import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IAuditLog, NewAuditLog } from '../audit-log.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IAuditLog for edit and NewAuditLogFormGroupInput for create.
 */
type AuditLogFormGroupInput = IAuditLog | PartialWithRequiredKeyOf<NewAuditLog>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IAuditLog | NewAuditLog> = Omit<T, 'occurredAt'> & {
  occurredAt?: string | null;
};

type AuditLogFormRawValue = FormValueOf<IAuditLog>;

type NewAuditLogFormRawValue = FormValueOf<NewAuditLog>;

type AuditLogFormDefaults = Pick<NewAuditLog, 'id' | 'occurredAt'>;

type AuditLogFormGroupContent = {
  id: FormControl<AuditLogFormRawValue['id'] | NewAuditLog['id']>;
  action: FormControl<AuditLogFormRawValue['action']>;
  entityType: FormControl<AuditLogFormRawValue['entityType']>;
  entityId: FormControl<AuditLogFormRawValue['entityId']>;
  oldValue: FormControl<AuditLogFormRawValue['oldValue']>;
  newValue: FormControl<AuditLogFormRawValue['newValue']>;
  ipAddress: FormControl<AuditLogFormRawValue['ipAddress']>;
  userAgent: FormControl<AuditLogFormRawValue['userAgent']>;
  occurredAt: FormControl<AuditLogFormRawValue['occurredAt']>;
  user: FormControl<AuditLogFormRawValue['user']>;
  company: FormControl<AuditLogFormRawValue['company']>;
};

export type AuditLogFormGroup = FormGroup<AuditLogFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class AuditLogFormService {
  createAuditLogFormGroup(auditLog?: AuditLogFormGroupInput): AuditLogFormGroup {
    const auditLogRawValue = this.convertAuditLogToAuditLogRawValue({
      ...this.getFormDefaults(),
      ...(auditLog ?? { id: null }),
    });
    return new FormGroup<AuditLogFormGroupContent>({
      id: new FormControl(
        { value: auditLogRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      action: new FormControl(auditLogRawValue.action, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      entityType: new FormControl(auditLogRawValue.entityType, {
        validators: [Validators.maxLength(100)],
      }),
      entityId: new FormControl(auditLogRawValue.entityId),
      oldValue: new FormControl(auditLogRawValue.oldValue),
      newValue: new FormControl(auditLogRawValue.newValue),
      ipAddress: new FormControl(auditLogRawValue.ipAddress, {
        validators: [Validators.maxLength(45)],
      }),
      userAgent: new FormControl(auditLogRawValue.userAgent, {
        validators: [Validators.maxLength(255)],
      }),
      occurredAt: new FormControl(auditLogRawValue.occurredAt, {
        validators: [Validators.required],
      }),
      user: new FormControl(auditLogRawValue.user),
      company: new FormControl(auditLogRawValue.company, {
        validators: [Validators.required],
      }),
    });
  }

  getAuditLog(form: AuditLogFormGroup): IAuditLog | NewAuditLog {
    return this.convertAuditLogRawValueToAuditLog(form.getRawValue() as AuditLogFormRawValue | NewAuditLogFormRawValue);
  }

  resetForm(form: AuditLogFormGroup, auditLog: AuditLogFormGroupInput): void {
    const auditLogRawValue = this.convertAuditLogToAuditLogRawValue({ ...this.getFormDefaults(), ...auditLog });
    form.reset({
      ...auditLogRawValue,
      id: { value: auditLogRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): AuditLogFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      occurredAt: currentTime,
    };
  }

  private convertAuditLogRawValueToAuditLog(rawAuditLog: AuditLogFormRawValue | NewAuditLogFormRawValue): IAuditLog | NewAuditLog {
    return {
      ...rawAuditLog,
      occurredAt: dayjs(rawAuditLog.occurredAt, DATE_TIME_FORMAT),
    };
  }

  private convertAuditLogToAuditLogRawValue(
    auditLog: IAuditLog | (Partial<NewAuditLog> & AuditLogFormDefaults),
  ): AuditLogFormRawValue | PartialWithRequiredKeyOf<NewAuditLogFormRawValue> {
    return {
      ...auditLog,
      occurredAt: auditLog.occurredAt ? auditLog.occurredAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
