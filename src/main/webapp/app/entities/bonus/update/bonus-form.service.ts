import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IBonus, NewBonus } from '../bonus.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IBonus for edit and NewBonusFormGroupInput for create.
 */
type BonusFormGroupInput = IBonus | PartialWithRequiredKeyOf<NewBonus>;

type BonusFormDefaults = Pick<NewBonus, 'id' | 'taxable'>;

type BonusFormGroupContent = {
  id: FormControl<IBonus['id'] | NewBonus['id']>;
  bonusType: FormControl<IBonus['bonusType']>;
  label: FormControl<IBonus['label']>;
  amount: FormControl<IBonus['amount']>;
  taxable: FormControl<IBonus['taxable']>;
  month: FormControl<IBonus['month']>;
  year: FormControl<IBonus['year']>;
  notes: FormControl<IBonus['notes']>;
  employee: FormControl<IBonus['employee']>;
  paySlip: FormControl<IBonus['paySlip']>;
};

export type BonusFormGroup = FormGroup<BonusFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class BonusFormService {
  createBonusFormGroup(bonus?: BonusFormGroupInput): BonusFormGroup {
    const bonusRawValue = {
      ...this.getFormDefaults(),
      ...(bonus ?? { id: null }),
    };
    return new FormGroup<BonusFormGroupContent>({
      id: new FormControl(
        { value: bonusRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      bonusType: new FormControl(bonusRawValue.bonusType, {
        validators: [Validators.required],
      }),
      label: new FormControl(bonusRawValue.label, {
        validators: [Validators.required, Validators.maxLength(150)],
      }),
      amount: new FormControl(bonusRawValue.amount, {
        validators: [Validators.required],
      }),
      taxable: new FormControl(bonusRawValue.taxable, {
        validators: [Validators.required],
      }),
      month: new FormControl(bonusRawValue.month, {
        validators: [Validators.required, Validators.min(1), Validators.max(12)],
      }),
      year: new FormControl(bonusRawValue.year, {
        validators: [Validators.required],
      }),
      notes: new FormControl(bonusRawValue.notes, {
        validators: [Validators.maxLength(500)],
      }),
      employee: new FormControl(bonusRawValue.employee, {
        validators: [Validators.required],
      }),
      paySlip: new FormControl(bonusRawValue.paySlip),
    });
  }

  getBonus(form: BonusFormGroup): IBonus | NewBonus {
    return form.getRawValue() as IBonus | NewBonus;
  }

  resetForm(form: BonusFormGroup, bonus: BonusFormGroupInput): void {
    const bonusRawValue = { ...this.getFormDefaults(), ...bonus };
    form.reset({
      ...bonusRawValue,
      id: { value: bonusRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): BonusFormDefaults {
    return {
      id: null,
      taxable: false,
    };
  }
}
