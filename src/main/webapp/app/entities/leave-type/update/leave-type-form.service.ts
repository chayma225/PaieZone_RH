import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ILeaveType, NewLeaveType } from '../leave-type.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ILeaveType for edit and NewLeaveTypeFormGroupInput for create.
 */
type LeaveTypeFormGroupInput = ILeaveType | PartialWithRequiredKeyOf<NewLeaveType>;

type LeaveTypeFormDefaults = Pick<NewLeaveType, 'id' | 'paid' | 'requiresMedical' | 'active'>;

type LeaveTypeFormGroupContent = {
  id: FormControl<ILeaveType['id'] | NewLeaveType['id']>;
  name: FormControl<ILeaveType['name']>;
  label: FormControl<ILeaveType['label']>;
  maxDaysPerYear: FormControl<ILeaveType['maxDaysPerYear']>;
  carryOverDays: FormControl<ILeaveType['carryOverDays']>;
  paid: FormControl<ILeaveType['paid']>;
  requiresMedical: FormControl<ILeaveType['requiresMedical']>;
  active: FormControl<ILeaveType['active']>;
  company: FormControl<ILeaveType['company']>;
};

export type LeaveTypeFormGroup = FormGroup<LeaveTypeFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class LeaveTypeFormService {
  createLeaveTypeFormGroup(leaveType?: LeaveTypeFormGroupInput): LeaveTypeFormGroup {
    const leaveTypeRawValue = {
      ...this.getFormDefaults(),
      ...(leaveType ?? { id: null }),
    };
    return new FormGroup<LeaveTypeFormGroupContent>({
      id: new FormControl(
        { value: leaveTypeRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(leaveTypeRawValue.name, {
        validators: [Validators.required],
      }),
      label: new FormControl(leaveTypeRawValue.label, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      maxDaysPerYear: new FormControl(leaveTypeRawValue.maxDaysPerYear, {
        validators: [Validators.required],
      }),
      carryOverDays: new FormControl(leaveTypeRawValue.carryOverDays, {
        validators: [Validators.required, Validators.min(0)],
      }),
      paid: new FormControl(leaveTypeRawValue.paid, {
        validators: [Validators.required],
      }),
      requiresMedical: new FormControl(leaveTypeRawValue.requiresMedical, {
        validators: [Validators.required],
      }),
      active: new FormControl(leaveTypeRawValue.active, {
        validators: [Validators.required],
      }),
      company: new FormControl(leaveTypeRawValue.company, {
        validators: [Validators.required],
      }),
    });
  }

  getLeaveType(form: LeaveTypeFormGroup): ILeaveType | NewLeaveType {
    return form.getRawValue() as ILeaveType | NewLeaveType;
  }

  resetForm(form: LeaveTypeFormGroup, leaveType: LeaveTypeFormGroupInput): void {
    const leaveTypeRawValue = { ...this.getFormDefaults(), ...leaveType };
    form.reset({
      ...leaveTypeRawValue,
      id: { value: leaveTypeRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): LeaveTypeFormDefaults {
    return {
      id: null,
      paid: false,
      requiresMedical: false,
      active: false,
    };
  }
}
