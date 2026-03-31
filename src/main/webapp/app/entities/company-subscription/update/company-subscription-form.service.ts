import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ICompanySubscription, NewCompanySubscription } from '../company-subscription.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ICompanySubscription for edit and NewCompanySubscriptionFormGroupInput for create.
 */
type CompanySubscriptionFormGroupInput = ICompanySubscription | PartialWithRequiredKeyOf<NewCompanySubscription>;

type CompanySubscriptionFormDefaults = Pick<NewCompanySubscription, 'id'>;

type CompanySubscriptionFormGroupContent = {
  id: FormControl<ICompanySubscription['id'] | NewCompanySubscription['id']>;
  plan: FormControl<ICompanySubscription['plan']>;
  status: FormControl<ICompanySubscription['status']>;
  maxEmployees: FormControl<ICompanySubscription['maxEmployees']>;
  priceHT: FormControl<ICompanySubscription['priceHT']>;
  billingDay: FormControl<ICompanySubscription['billingDay']>;
  startDate: FormControl<ICompanySubscription['startDate']>;
  endDate: FormControl<ICompanySubscription['endDate']>;
  renewalDate: FormControl<ICompanySubscription['renewalDate']>;
  notes: FormControl<ICompanySubscription['notes']>;
};

export type CompanySubscriptionFormGroup = FormGroup<CompanySubscriptionFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class CompanySubscriptionFormService {
  createCompanySubscriptionFormGroup(companySubscription: CompanySubscriptionFormGroupInput = { id: null }): CompanySubscriptionFormGroup {
    const companySubscriptionRawValue = {
      ...this.getFormDefaults(),
      ...companySubscription,
    };
    return new FormGroup<CompanySubscriptionFormGroupContent>({
      id: new FormControl(
        { value: companySubscriptionRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      plan: new FormControl(companySubscriptionRawValue.plan, {
        validators: [Validators.required],
      }),
      status: new FormControl(companySubscriptionRawValue.status, {
        validators: [Validators.required],
      }),
      maxEmployees: new FormControl(companySubscriptionRawValue.maxEmployees, {
        validators: [Validators.required],
      }),
      priceHT: new FormControl(companySubscriptionRawValue.priceHT, {
        validators: [Validators.required],
      }),
      billingDay: new FormControl(companySubscriptionRawValue.billingDay, {
        validators: [Validators.required],
      }),
      startDate: new FormControl(companySubscriptionRawValue.startDate, {
        validators: [Validators.required],
      }),
      endDate: new FormControl(companySubscriptionRawValue.endDate),
      renewalDate: new FormControl(companySubscriptionRawValue.renewalDate),
      notes: new FormControl(companySubscriptionRawValue.notes, {
        validators: [Validators.maxLength(500)],
      }),
    });
  }

  getCompanySubscription(form: CompanySubscriptionFormGroup): ICompanySubscription | NewCompanySubscription {
    return form.getRawValue() as ICompanySubscription | NewCompanySubscription;
  }

  resetForm(form: CompanySubscriptionFormGroup, companySubscription: CompanySubscriptionFormGroupInput): void {
    const companySubscriptionRawValue = { ...this.getFormDefaults(), ...companySubscription };
    form.reset(
      {
        ...companySubscriptionRawValue,
        id: { value: companySubscriptionRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): CompanySubscriptionFormDefaults {
    return {
      id: null,
    };
  }
}
