import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IRegulatoryParam, NewRegulatoryParam } from '../regulatory-param.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IRegulatoryParam for edit and NewRegulatoryParamFormGroupInput for create.
 */
type RegulatoryParamFormGroupInput = IRegulatoryParam | PartialWithRequiredKeyOf<NewRegulatoryParam>;

type RegulatoryParamFormDefaults = Pick<NewRegulatoryParam, 'id' | 'active'>;

type RegulatoryParamFormGroupContent = {
  id: FormControl<IRegulatoryParam['id'] | NewRegulatoryParam['id']>;
  paramKey: FormControl<IRegulatoryParam['paramKey']>;
  paramLabel: FormControl<IRegulatoryParam['paramLabel']>;
  numericValue: FormControl<IRegulatoryParam['numericValue']>;
  textValue: FormControl<IRegulatoryParam['textValue']>;
  effectiveFrom: FormControl<IRegulatoryParam['effectiveFrom']>;
  effectiveTo: FormControl<IRegulatoryParam['effectiveTo']>;
  legalReference: FormControl<IRegulatoryParam['legalReference']>;
  active: FormControl<IRegulatoryParam['active']>;
};

export type RegulatoryParamFormGroup = FormGroup<RegulatoryParamFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class RegulatoryParamFormService {
  createRegulatoryParamFormGroup(regulatoryParam?: RegulatoryParamFormGroupInput): RegulatoryParamFormGroup {
    const regulatoryParamRawValue = {
      ...this.getFormDefaults(),
      ...(regulatoryParam ?? { id: null }),
    };
    return new FormGroup<RegulatoryParamFormGroupContent>({
      id: new FormControl(
        { value: regulatoryParamRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      paramKey: new FormControl(regulatoryParamRawValue.paramKey, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      paramLabel: new FormControl(regulatoryParamRawValue.paramLabel, {
        validators: [Validators.required, Validators.maxLength(200)],
      }),
      numericValue: new FormControl(regulatoryParamRawValue.numericValue),
      textValue: new FormControl(regulatoryParamRawValue.textValue, {
        validators: [Validators.maxLength(500)],
      }),
      effectiveFrom: new FormControl(regulatoryParamRawValue.effectiveFrom, {
        validators: [Validators.required],
      }),
      effectiveTo: new FormControl(regulatoryParamRawValue.effectiveTo),
      legalReference: new FormControl(regulatoryParamRawValue.legalReference, {
        validators: [Validators.maxLength(200)],
      }),
      active: new FormControl(regulatoryParamRawValue.active, {
        validators: [Validators.required],
      }),
    });
  }

  getRegulatoryParam(form: RegulatoryParamFormGroup): IRegulatoryParam | NewRegulatoryParam {
    return form.getRawValue() as IRegulatoryParam | NewRegulatoryParam;
  }

  resetForm(form: RegulatoryParamFormGroup, regulatoryParam: RegulatoryParamFormGroupInput): void {
    const regulatoryParamRawValue = { ...this.getFormDefaults(), ...regulatoryParam };
    form.reset({
      ...regulatoryParamRawValue,
      id: { value: regulatoryParamRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): RegulatoryParamFormDefaults {
    return {
      id: null,
      active: false,
    };
  }
}
