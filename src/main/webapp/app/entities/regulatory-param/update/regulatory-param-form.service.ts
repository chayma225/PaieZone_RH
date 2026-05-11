
import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import dayjs from 'dayjs/esm';
import { IRegulatoryParam, NewRegulatoryParam } from '../regulatory-param.model';

type RegulatoryParamFormGroupContent = {
  id:             FormControl<IRegulatoryParam['id'] | NewRegulatoryParam['id']>;
  paramKey:       FormControl<IRegulatoryParam['paramKey']>;
  paramLabel:     FormControl<IRegulatoryParam['paramLabel']>;
  category:       FormControl<IRegulatoryParam['category']>;
  numericValue:   FormControl<IRegulatoryParam['numericValue']>;
  stringValue:    FormControl<IRegulatoryParam['stringValue']>;
  effectiveFrom:  FormControl<IRegulatoryParam['effectiveFrom']>;
  effectiveTo:    FormControl<IRegulatoryParam['effectiveTo']>;
  legalReference: FormControl<IRegulatoryParam['legalReference']>;
  description:    FormControl<IRegulatoryParam['description']>;
  active:         FormControl<IRegulatoryParam['active']>;
};

export type RegulatoryParamFormGroup = FormGroup<RegulatoryParamFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class RegulatoryParamFormService {

  createRegulatoryParamFormGroup(p: IRegulatoryParam | null = null): RegulatoryParamFormGroup {
    const raw = { ...this.getFormDefaults(), ...p };
    return new FormGroup<RegulatoryParamFormGroupContent>({
      id: new FormControl(
        { value: raw.id ?? null, disabled: true },
        { nonNullable: true, validators: [Validators.required] },
      ),
      paramKey: new FormControl(raw.paramKey, {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
      }),
      paramLabel: new FormControl(raw.paramLabel, {
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
      }),
      category: new FormControl(raw.category, {
        validators: [Validators.maxLength(50)],
      }),
      numericValue:   new FormControl(raw.numericValue),
      stringValue:    new FormControl(raw.stringValue, { validators: [Validators.maxLength(500)] }),
      effectiveFrom:  new FormControl(raw.effectiveFrom, { validators: [Validators.required] }),
      effectiveTo:    new FormControl(raw.effectiveTo),
      legalReference: new FormControl(raw.legalReference, { validators: [Validators.maxLength(200)] }),
      description:    new FormControl(raw.description,    { validators: [Validators.maxLength(1000)] }),
      active:         new FormControl(raw.active,         { validators: [Validators.required] }),
    });
  }

  getRegulatoryParam(form: RegulatoryParamFormGroup): IRegulatoryParam | NewRegulatoryParam {
    return form.getRawValue() as IRegulatoryParam | NewRegulatoryParam;
  }

  resetForm(form: RegulatoryParamFormGroup, p: IRegulatoryParam | null): void {
    const raw = { ...this.getFormDefaults(), ...p };
    form.reset({ ...raw, id: { value: raw.id, disabled: true } } as any);
  }

  private getFormDefaults(): Partial<IRegulatoryParam> {
    return {
      active:        true,
      effectiveFrom: dayjs(),
    };
  }
}
