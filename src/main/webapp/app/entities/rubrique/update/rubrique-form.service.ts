import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IRubrique, NewRubrique } from '../rubrique.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IRubrique for edit and NewRubriqueFormGroupInput for create.
 */
type RubriqueFormGroupInput = IRubrique | PartialWithRequiredKeyOf<NewRubrique>;

type RubriqueFormDefaults = Pick<NewRubrique, 'id' | 'taxable' | 'cnssSalary' | 'cnssEmployer' | 'active'>;

type RubriqueFormGroupContent = {
  id: FormControl<IRubrique['id'] | NewRubrique['id']>;
  code: FormControl<IRubrique['code']>;
  label: FormControl<IRubrique['label']>;
  labelAr: FormControl<IRubrique['labelAr']>;
  rubriqueType: FormControl<IRubrique['rubriqueType']>;
  base: FormControl<IRubrique['base']>;
  rate: FormControl<IRubrique['rate']>;
  fixedAmount: FormControl<IRubrique['fixedAmount']>;
  formula: FormControl<IRubrique['formula']>;
  taxable: FormControl<IRubrique['taxable']>;
  cnssSalary: FormControl<IRubrique['cnssSalary']>;
  cnssEmployer: FormControl<IRubrique['cnssEmployer']>;
  sortOrder: FormControl<IRubrique['sortOrder']>;
  active: FormControl<IRubrique['active']>;
  company: FormControl<IRubrique['company']>;
};

export type RubriqueFormGroup = FormGroup<RubriqueFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class RubriqueFormService {
  createRubriqueFormGroup(rubrique: RubriqueFormGroupInput = { id: null }): RubriqueFormGroup {
    const rubriqueRawValue = {
      ...this.getFormDefaults(),
      ...rubrique,
    };
    return new FormGroup<RubriqueFormGroupContent>({
      id: new FormControl(
        { value: rubriqueRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(rubriqueRawValue.code, {
        validators: [Validators.required, Validators.maxLength(20)],
      }),
      label: new FormControl(rubriqueRawValue.label, {
        validators: [Validators.required, Validators.maxLength(150)],
      }),
      labelAr: new FormControl(rubriqueRawValue.labelAr, {
        validators: [Validators.maxLength(150)],
      }),
      rubriqueType: new FormControl(rubriqueRawValue.rubriqueType, {
        validators: [Validators.required],
      }),
      base: new FormControl(rubriqueRawValue.base, {
        validators: [Validators.required],
      }),
      rate: new FormControl(rubriqueRawValue.rate),
      fixedAmount: new FormControl(rubriqueRawValue.fixedAmount),
      formula: new FormControl(rubriqueRawValue.formula, {
        validators: [Validators.maxLength(500)],
      }),
      taxable: new FormControl(rubriqueRawValue.taxable, {
        validators: [Validators.required],
      }),
      cnssSalary: new FormControl(rubriqueRawValue.cnssSalary, {
        validators: [Validators.required],
      }),
      cnssEmployer: new FormControl(rubriqueRawValue.cnssEmployer, {
        validators: [Validators.required],
      }),
      sortOrder: new FormControl(rubriqueRawValue.sortOrder, {
        validators: [Validators.required],
      }),
      active: new FormControl(rubriqueRawValue.active, {
        validators: [Validators.required],
      }),
      company: new FormControl(rubriqueRawValue.company, {
        validators: [Validators.required],
      }),
    });
  }

  getRubrique(form: RubriqueFormGroup): IRubrique | NewRubrique {
    return form.getRawValue() as IRubrique | NewRubrique;
  }

  resetForm(form: RubriqueFormGroup, rubrique: RubriqueFormGroupInput): void {
    const rubriqueRawValue = { ...this.getFormDefaults(), ...rubrique };
    form.reset(
      {
        ...rubriqueRawValue,
        id: { value: rubriqueRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): RubriqueFormDefaults {
    return {
      id: null,
      taxable: false,
      cnssSalary: false,
      cnssEmployer: false,
      active: false,
    };
  }
}
