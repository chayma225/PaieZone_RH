import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IAdvance, NewAdvance } from '../advance.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IAdvance for edit and NewAdvanceFormGroupInput for create.
 */
type AdvanceFormGroupInput = IAdvance | PartialWithRequiredKeyOf<NewAdvance>;

type AdvanceFormDefaults = Pick<NewAdvance, 'id'>;

type AdvanceFormGroupContent = {
  id: FormControl<IAdvance['id'] | NewAdvance['id']>;
  requestDate: FormControl<IAdvance['requestDate']>;
  amount: FormControl<IAdvance['amount']>;
  deductionMonth: FormControl<IAdvance['deductionMonth']>;
  deductionYear: FormControl<IAdvance['deductionYear']>;
  status: FormControl<IAdvance['status']>;
  approvedBy: FormControl<IAdvance['approvedBy']>;
  notes: FormControl<IAdvance['notes']>;
  employee: FormControl<IAdvance['employee']>;
  paySlip: FormControl<IAdvance['paySlip']>;
  approvedByUser: FormControl<IAdvance['approvedByUser']>;
};

export type AdvanceFormGroup = FormGroup<AdvanceFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class AdvanceFormService {
  createAdvanceFormGroup(advance?: AdvanceFormGroupInput): AdvanceFormGroup {
    const advanceRawValue = {
      ...this.getFormDefaults(),
      ...(advance ?? { id: null }),
    };
    return new FormGroup<AdvanceFormGroupContent>({
      id: new FormControl(
        { value: advanceRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      requestDate: new FormControl(advanceRawValue.requestDate, {
        validators: [Validators.required],
      }),
      amount: new FormControl(advanceRawValue.amount, {
        validators: [Validators.required],
      }),
      deductionMonth: new FormControl(advanceRawValue.deductionMonth, {
        validators: [Validators.min(1), Validators.max(12)],
      }),
      deductionYear: new FormControl(advanceRawValue.deductionYear),
      status: new FormControl(advanceRawValue.status, {
        validators: [Validators.required],
      }),
      approvedBy: new FormControl(advanceRawValue.approvedBy, {
        validators: [Validators.maxLength(100)],
      }),
      notes: new FormControl(advanceRawValue.notes, {
        validators: [Validators.maxLength(500)],
      }),
      employee: new FormControl(advanceRawValue.employee, {
        validators: [Validators.required],
      }),
      paySlip: new FormControl(advanceRawValue.paySlip),
      approvedByUser: new FormControl(advanceRawValue.approvedByUser),
    });
  }

  getAdvance(form: AdvanceFormGroup): IAdvance | NewAdvance {
    return form.getRawValue() as IAdvance | NewAdvance;
  }

  resetForm(form: AdvanceFormGroup, advance: AdvanceFormGroupInput): void {
    const advanceRawValue = { ...this.getFormDefaults(), ...advance };
    form.reset({
      ...advanceRawValue,
      id: { value: advanceRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): AdvanceFormDefaults {
    return {
      id: null,
    };
  }
}
