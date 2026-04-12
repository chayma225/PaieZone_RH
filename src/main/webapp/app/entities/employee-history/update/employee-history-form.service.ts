import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IEmployeeHistory, NewEmployeeHistory } from '../employee-history.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IEmployeeHistory for edit and NewEmployeeHistoryFormGroupInput for create.
 */
type EmployeeHistoryFormGroupInput = IEmployeeHistory | PartialWithRequiredKeyOf<NewEmployeeHistory>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IEmployeeHistory | NewEmployeeHistory> = Omit<T, 'changedAt'> & {
  changedAt?: string | null;
};

type EmployeeHistoryFormRawValue = FormValueOf<IEmployeeHistory>;

type NewEmployeeHistoryFormRawValue = FormValueOf<NewEmployeeHistory>;

type EmployeeHistoryFormDefaults = Pick<NewEmployeeHistory, 'id' | 'changedAt'>;

type EmployeeHistoryFormGroupContent = {
  id: FormControl<EmployeeHistoryFormRawValue['id'] | NewEmployeeHistory['id']>;
  fieldName: FormControl<EmployeeHistoryFormRawValue['fieldName']>;
  oldValue: FormControl<EmployeeHistoryFormRawValue['oldValue']>;
  newValue: FormControl<EmployeeHistoryFormRawValue['newValue']>;
  changedAt: FormControl<EmployeeHistoryFormRawValue['changedAt']>;
  changedBy: FormControl<EmployeeHistoryFormRawValue['changedBy']>;
  reason: FormControl<EmployeeHistoryFormRawValue['reason']>;
  employee: FormControl<EmployeeHistoryFormRawValue['employee']>;
};

export type EmployeeHistoryFormGroup = FormGroup<EmployeeHistoryFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class EmployeeHistoryFormService {
  createEmployeeHistoryFormGroup(employeeHistory?: EmployeeHistoryFormGroupInput): EmployeeHistoryFormGroup {
    const employeeHistoryRawValue = this.convertEmployeeHistoryToEmployeeHistoryRawValue({
      ...this.getFormDefaults(),
      ...(employeeHistory ?? { id: null }),
    });
    return new FormGroup<EmployeeHistoryFormGroupContent>({
      id: new FormControl(
        { value: employeeHistoryRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      fieldName: new FormControl(employeeHistoryRawValue.fieldName, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      oldValue: new FormControl(employeeHistoryRawValue.oldValue, {
        validators: [Validators.maxLength(500)],
      }),
      newValue: new FormControl(employeeHistoryRawValue.newValue, {
        validators: [Validators.maxLength(500)],
      }),
      changedAt: new FormControl(employeeHistoryRawValue.changedAt, {
        validators: [Validators.required],
      }),
      changedBy: new FormControl(employeeHistoryRawValue.changedBy, {
        validators: [Validators.maxLength(100)],
      }),
      reason: new FormControl(employeeHistoryRawValue.reason, {
        validators: [Validators.maxLength(255)],
      }),
      employee: new FormControl(employeeHistoryRawValue.employee, {
        validators: [Validators.required],
      }),
    });
  }

  getEmployeeHistory(form: EmployeeHistoryFormGroup): IEmployeeHistory | NewEmployeeHistory {
    return this.convertEmployeeHistoryRawValueToEmployeeHistory(
      form.getRawValue() as EmployeeHistoryFormRawValue | NewEmployeeHistoryFormRawValue,
    );
  }

  resetForm(form: EmployeeHistoryFormGroup, employeeHistory: EmployeeHistoryFormGroupInput): void {
    const employeeHistoryRawValue = this.convertEmployeeHistoryToEmployeeHistoryRawValue({ ...this.getFormDefaults(), ...employeeHistory });
    form.reset({
      ...employeeHistoryRawValue,
      id: { value: employeeHistoryRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): EmployeeHistoryFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      changedAt: currentTime,
    };
  }

  private convertEmployeeHistoryRawValueToEmployeeHistory(
    rawEmployeeHistory: EmployeeHistoryFormRawValue | NewEmployeeHistoryFormRawValue,
  ): IEmployeeHistory | NewEmployeeHistory {
    return {
      ...rawEmployeeHistory,
      changedAt: dayjs(rawEmployeeHistory.changedAt, DATE_TIME_FORMAT),
    };
  }

  private convertEmployeeHistoryToEmployeeHistoryRawValue(
    employeeHistory: IEmployeeHistory | (Partial<NewEmployeeHistory> & EmployeeHistoryFormDefaults),
  ): EmployeeHistoryFormRawValue | PartialWithRequiredKeyOf<NewEmployeeHistoryFormRawValue> {
    return {
      ...employeeHistory,
      changedAt: employeeHistory.changedAt ? employeeHistory.changedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
