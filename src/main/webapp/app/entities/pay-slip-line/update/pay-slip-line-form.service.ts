import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IPaySlipLine, NewPaySlipLine } from '../pay-slip-line.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPaySlipLine for edit and NewPaySlipLineFormGroupInput for create.
 */
type PaySlipLineFormGroupInput = IPaySlipLine | PartialWithRequiredKeyOf<NewPaySlipLine>;

type PaySlipLineFormDefaults = Pick<NewPaySlipLine, 'id' | 'taxable'>;

type PaySlipLineFormGroupContent = {
  id: FormControl<IPaySlipLine['id'] | NewPaySlipLine['id']>;
  sortOrder: FormControl<IPaySlipLine['sortOrder']>;
  rubriqueCode: FormControl<IPaySlipLine['rubriqueCode']>;
  rubriqueLabel: FormControl<IPaySlipLine['rubriqueLabel']>;
  rubriqueType: FormControl<IPaySlipLine['rubriqueType']>;
  base: FormControl<IPaySlipLine['base']>;
  rate: FormControl<IPaySlipLine['rate']>;
  amount: FormControl<IPaySlipLine['amount']>;
  taxable: FormControl<IPaySlipLine['taxable']>;
  paySlip: FormControl<IPaySlipLine['paySlip']>;
  rubrique: FormControl<IPaySlipLine['rubrique']>;
};

export type PaySlipLineFormGroup = FormGroup<PaySlipLineFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PaySlipLineFormService {
  createPaySlipLineFormGroup(paySlipLine?: PaySlipLineFormGroupInput): PaySlipLineFormGroup {
    const paySlipLineRawValue = {
      ...this.getFormDefaults(),
      ...(paySlipLine ?? { id: null }),
    };
    return new FormGroup<PaySlipLineFormGroupContent>({
      id: new FormControl(
        { value: paySlipLineRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      sortOrder: new FormControl(paySlipLineRawValue.sortOrder, {
        validators: [Validators.required],
      }),
      rubriqueCode: new FormControl(paySlipLineRawValue.rubriqueCode, {
        validators: [Validators.required, Validators.maxLength(20)],
      }),
      rubriqueLabel: new FormControl(paySlipLineRawValue.rubriqueLabel, {
        validators: [Validators.required, Validators.maxLength(150)],
      }),
      rubriqueType: new FormControl(paySlipLineRawValue.rubriqueType, {
        validators: [Validators.required],
      }),
      base: new FormControl(paySlipLineRawValue.base),
      rate: new FormControl(paySlipLineRawValue.rate),
      amount: new FormControl(paySlipLineRawValue.amount, {
        validators: [Validators.required],
      }),
      taxable: new FormControl(paySlipLineRawValue.taxable, {
        validators: [Validators.required],
      }),
      paySlip: new FormControl(paySlipLineRawValue.paySlip, {
        validators: [Validators.required],
      }),
      rubrique: new FormControl(paySlipLineRawValue.rubrique),
    });
  }

  getPaySlipLine(form: PaySlipLineFormGroup): IPaySlipLine | NewPaySlipLine {
    return form.getRawValue() as IPaySlipLine | NewPaySlipLine;
  }

  resetForm(form: PaySlipLineFormGroup, paySlipLine: PaySlipLineFormGroupInput): void {
    const paySlipLineRawValue = { ...this.getFormDefaults(), ...paySlipLine };
    form.reset({
      ...paySlipLineRawValue,
      id: { value: paySlipLineRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): PaySlipLineFormDefaults {
    return {
      id: null,
      taxable: false,
    };
  }
}
