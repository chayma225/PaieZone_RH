import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ICnssRate, NewCnssRate } from '../cnss-rate.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ICnssRate for edit and NewCnssRateFormGroupInput for create.
 */
type CnssRateFormGroupInput = ICnssRate | PartialWithRequiredKeyOf<NewCnssRate>;

type CnssRateFormDefaults = Pick<NewCnssRate, 'id'>;

type CnssRateFormGroupContent = {
  id: FormControl<ICnssRate['id'] | NewCnssRate['id']>;
  year: FormControl<ICnssRate['year']>;
  salaryCeiling: FormControl<ICnssRate['salaryCeiling']>;
  employeeRate: FormControl<ICnssRate['employeeRate']>;
  employerRate: FormControl<ICnssRate['employerRate']>;
  cavisEmployee: FormControl<ICnssRate['cavisEmployee']>;
  cavisEmployer: FormControl<ICnssRate['cavisEmployer']>;
  smig: FormControl<ICnssRate['smig']>;
  effectiveFrom: FormControl<ICnssRate['effectiveFrom']>;
  company: FormControl<ICnssRate['company']>;
};

export type CnssRateFormGroup = FormGroup<CnssRateFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class CnssRateFormService {
  createCnssRateFormGroup(cnssRate?: CnssRateFormGroupInput): CnssRateFormGroup {
    const cnssRateRawValue = {
      ...this.getFormDefaults(),
      ...(cnssRate ?? { id: null }),
    };
    return new FormGroup<CnssRateFormGroupContent>({
      id: new FormControl(
        { value: cnssRateRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      year: new FormControl(cnssRateRawValue.year, {
        validators: [Validators.required],
      }),
      salaryCeiling: new FormControl(cnssRateRawValue.salaryCeiling),
      employeeRate: new FormControl(cnssRateRawValue.employeeRate, {
        validators: [Validators.required],
      }),
      employerRate: new FormControl(cnssRateRawValue.employerRate, {
        validators: [Validators.required],
      }),
      cavisEmployee: new FormControl(cnssRateRawValue.cavisEmployee),
      cavisEmployer: new FormControl(cnssRateRawValue.cavisEmployer),
      smig: new FormControl(cnssRateRawValue.smig, {
        validators: [Validators.required],
      }),
      effectiveFrom: new FormControl(cnssRateRawValue.effectiveFrom, {
        validators: [Validators.required],
      }),
      company: new FormControl(cnssRateRawValue.company),
    });
  }

  getCnssRate(form: CnssRateFormGroup): ICnssRate | NewCnssRate {
    return form.getRawValue() as ICnssRate | NewCnssRate;
  }

  resetForm(form: CnssRateFormGroup, cnssRate: CnssRateFormGroupInput): void {
    const cnssRateRawValue = { ...this.getFormDefaults(), ...cnssRate };
    form.reset({
      ...cnssRateRawValue,
      id: { value: cnssRateRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): CnssRateFormDefaults {
    return {
      id: null,
    };
  }
}
