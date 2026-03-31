import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ITaxBracket, NewTaxBracket } from '../tax-bracket.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ITaxBracket for edit and NewTaxBracketFormGroupInput for create.
 */
type TaxBracketFormGroupInput = ITaxBracket | PartialWithRequiredKeyOf<NewTaxBracket>;

type TaxBracketFormDefaults = Pick<NewTaxBracket, 'id'>;

type TaxBracketFormGroupContent = {
  id: FormControl<ITaxBracket['id'] | NewTaxBracket['id']>;
  year: FormControl<ITaxBracket['year']>;
  minIncome: FormControl<ITaxBracket['minIncome']>;
  maxIncome: FormControl<ITaxBracket['maxIncome']>;
  rate: FormControl<ITaxBracket['rate']>;
  fixedDeduction: FormControl<ITaxBracket['fixedDeduction']>;
  sortOrder: FormControl<ITaxBracket['sortOrder']>;
  company: FormControl<ITaxBracket['company']>;
};

export type TaxBracketFormGroup = FormGroup<TaxBracketFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class TaxBracketFormService {
  createTaxBracketFormGroup(taxBracket: TaxBracketFormGroupInput = { id: null }): TaxBracketFormGroup {
    const taxBracketRawValue = {
      ...this.getFormDefaults(),
      ...taxBracket,
    };
    return new FormGroup<TaxBracketFormGroupContent>({
      id: new FormControl(
        { value: taxBracketRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      year: new FormControl(taxBracketRawValue.year, {
        validators: [Validators.required],
      }),
      minIncome: new FormControl(taxBracketRawValue.minIncome, {
        validators: [Validators.required],
      }),
      maxIncome: new FormControl(taxBracketRawValue.maxIncome),
      rate: new FormControl(taxBracketRawValue.rate, {
        validators: [Validators.required],
      }),
      fixedDeduction: new FormControl(taxBracketRawValue.fixedDeduction, {
        validators: [Validators.required],
      }),
      sortOrder: new FormControl(taxBracketRawValue.sortOrder, {
        validators: [Validators.required],
      }),
      company: new FormControl(taxBracketRawValue.company),
    });
  }

  getTaxBracket(form: TaxBracketFormGroup): ITaxBracket | NewTaxBracket {
    return form.getRawValue() as ITaxBracket | NewTaxBracket;
  }

  resetForm(form: TaxBracketFormGroup, taxBracket: TaxBracketFormGroupInput): void {
    const taxBracketRawValue = { ...this.getFormDefaults(), ...taxBracket };
    form.reset(
      {
        ...taxBracketRawValue,
        id: { value: taxBracketRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): TaxBracketFormDefaults {
    return {
      id: null,
    };
  }
}
