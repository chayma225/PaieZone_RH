import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ILeaveBalance, NewLeaveBalance } from '../leave-balance.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ILeaveBalance for edit and NewLeaveBalanceFormGroupInput for create.
 */
type LeaveBalanceFormGroupInput = ILeaveBalance | PartialWithRequiredKeyOf<NewLeaveBalance>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends ILeaveBalance | NewLeaveBalance> = Omit<T, 'lastUpdatedAt'> & {
  lastUpdatedAt?: string | null;
};

type LeaveBalanceFormRawValue = FormValueOf<ILeaveBalance>;

type NewLeaveBalanceFormRawValue = FormValueOf<NewLeaveBalance>;

type LeaveBalanceFormDefaults = Pick<NewLeaveBalance, 'id' | 'lastUpdatedAt'>;

type LeaveBalanceFormGroupContent = {
  id: FormControl<LeaveBalanceFormRawValue['id'] | NewLeaveBalance['id']>;
  year: FormControl<LeaveBalanceFormRawValue['year']>;
  entitled: FormControl<LeaveBalanceFormRawValue['entitled']>;
  taken: FormControl<LeaveBalanceFormRawValue['taken']>;
  pending: FormControl<LeaveBalanceFormRawValue['pending']>;
  carryOver: FormControl<LeaveBalanceFormRawValue['carryOver']>;
  remaining: FormControl<LeaveBalanceFormRawValue['remaining']>;
  lastUpdatedAt: FormControl<LeaveBalanceFormRawValue['lastUpdatedAt']>;
  employee: FormControl<LeaveBalanceFormRawValue['employee']>;
  leaveType: FormControl<LeaveBalanceFormRawValue['leaveType']>;
};

export type LeaveBalanceFormGroup = FormGroup<LeaveBalanceFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class LeaveBalanceFormService {
  createLeaveBalanceFormGroup(leaveBalance: LeaveBalanceFormGroupInput = { id: null }): LeaveBalanceFormGroup {
    const leaveBalanceRawValue = this.convertLeaveBalanceToLeaveBalanceRawValue({
      ...this.getFormDefaults(),
      ...leaveBalance,
    });
    return new FormGroup<LeaveBalanceFormGroupContent>({
      id: new FormControl(
        { value: leaveBalanceRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      year: new FormControl(leaveBalanceRawValue.year, {
        validators: [Validators.required],
      }),
      entitled: new FormControl(leaveBalanceRawValue.entitled, {
        validators: [Validators.required],
      }),
      taken: new FormControl(leaveBalanceRawValue.taken, {
        validators: [Validators.required],
      }),
      pending: new FormControl(leaveBalanceRawValue.pending, {
        validators: [Validators.required],
      }),
      carryOver: new FormControl(leaveBalanceRawValue.carryOver, {
        validators: [Validators.required],
      }),
      remaining: new FormControl(leaveBalanceRawValue.remaining, {
        validators: [Validators.required],
      }),
      lastUpdatedAt: new FormControl(leaveBalanceRawValue.lastUpdatedAt, {
        validators: [Validators.required],
      }),
      employee: new FormControl(leaveBalanceRawValue.employee, {
        validators: [Validators.required],
      }),
      leaveType: new FormControl(leaveBalanceRawValue.leaveType, {
        validators: [Validators.required],
      }),
    });
  }

  getLeaveBalance(form: LeaveBalanceFormGroup): ILeaveBalance | NewLeaveBalance {
    return this.convertLeaveBalanceRawValueToLeaveBalance(form.getRawValue() as LeaveBalanceFormRawValue | NewLeaveBalanceFormRawValue);
  }

  resetForm(form: LeaveBalanceFormGroup, leaveBalance: LeaveBalanceFormGroupInput): void {
    const leaveBalanceRawValue = this.convertLeaveBalanceToLeaveBalanceRawValue({ ...this.getFormDefaults(), ...leaveBalance });
    form.reset(
      {
        ...leaveBalanceRawValue,
        id: { value: leaveBalanceRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): LeaveBalanceFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      lastUpdatedAt: currentTime,
    };
  }

  private convertLeaveBalanceRawValueToLeaveBalance(
    rawLeaveBalance: LeaveBalanceFormRawValue | NewLeaveBalanceFormRawValue,
  ): ILeaveBalance | NewLeaveBalance {
    return {
      ...rawLeaveBalance,
      lastUpdatedAt: dayjs(rawLeaveBalance.lastUpdatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertLeaveBalanceToLeaveBalanceRawValue(
    leaveBalance: ILeaveBalance | (Partial<NewLeaveBalance> & LeaveBalanceFormDefaults),
  ): LeaveBalanceFormRawValue | PartialWithRequiredKeyOf<NewLeaveBalanceFormRawValue> {
    return {
      ...leaveBalance,
      lastUpdatedAt: leaveBalance.lastUpdatedAt ? leaveBalance.lastUpdatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
