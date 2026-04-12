import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IAccountPlan, NewAccountPlan } from '../account-plan.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IAccountPlan for edit and NewAccountPlanFormGroupInput for create.
 */
type AccountPlanFormGroupInput = IAccountPlan | PartialWithRequiredKeyOf<NewAccountPlan>;

type AccountPlanFormDefaults = Pick<NewAccountPlan, 'id' | 'active'>;

type AccountPlanFormGroupContent = {
  id: FormControl<IAccountPlan['id'] | NewAccountPlan['id']>;
  accountCode: FormControl<IAccountPlan['accountCode']>;
  accountLabel: FormControl<IAccountPlan['accountLabel']>;
  accountLabelAr: FormControl<IAccountPlan['accountLabelAr']>;
  accountType: FormControl<IAccountPlan['accountType']>;
  active: FormControl<IAccountPlan['active']>;
  company: FormControl<IAccountPlan['company']>;
};

export type AccountPlanFormGroup = FormGroup<AccountPlanFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class AccountPlanFormService {
  createAccountPlanFormGroup(accountPlan?: AccountPlanFormGroupInput): AccountPlanFormGroup {
    const accountPlanRawValue = {
      ...this.getFormDefaults(),
      ...(accountPlan ?? { id: null }),
    };
    return new FormGroup<AccountPlanFormGroupContent>({
      id: new FormControl(
        { value: accountPlanRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      accountCode: new FormControl(accountPlanRawValue.accountCode, {
        validators: [Validators.required, Validators.maxLength(20)],
      }),
      accountLabel: new FormControl(accountPlanRawValue.accountLabel, {
        validators: [Validators.required, Validators.maxLength(200)],
      }),
      accountLabelAr: new FormControl(accountPlanRawValue.accountLabelAr, {
        validators: [Validators.maxLength(200)],
      }),
      accountType: new FormControl(accountPlanRawValue.accountType, {
        validators: [Validators.maxLength(50)],
      }),
      active: new FormControl(accountPlanRawValue.active, {
        validators: [Validators.required],
      }),
      company: new FormControl(accountPlanRawValue.company, {
        validators: [Validators.required],
      }),
    });
  }

  getAccountPlan(form: AccountPlanFormGroup): IAccountPlan | NewAccountPlan {
    return form.getRawValue() as IAccountPlan | NewAccountPlan;
  }

  resetForm(form: AccountPlanFormGroup, accountPlan: AccountPlanFormGroupInput): void {
    const accountPlanRawValue = { ...this.getFormDefaults(), ...accountPlan };
    form.reset({
      ...accountPlanRawValue,
      id: { value: accountPlanRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): AccountPlanFormDefaults {
    return {
      id: null,
      active: false,
    };
  }
}
