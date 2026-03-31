import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ICompany, NewCompany } from '../company.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ICompany for edit and NewCompanyFormGroupInput for create.
 */
type CompanyFormGroupInput = ICompany | PartialWithRequiredKeyOf<NewCompany>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends ICompany | NewCompany> = Omit<T, 'createdAt'> & {
  createdAt?: string | null;
};

type CompanyFormRawValue = FormValueOf<ICompany>;

type NewCompanyFormRawValue = FormValueOf<NewCompany>;

type CompanyFormDefaults = Pick<NewCompany, 'id' | 'active' | 'createdAt'>;

type CompanyFormGroupContent = {
  id: FormControl<CompanyFormRawValue['id'] | NewCompany['id']>;
  name: FormControl<CompanyFormRawValue['name']>;
  tradeName: FormControl<CompanyFormRawValue['tradeName']>;
  taxId: FormControl<CompanyFormRawValue['taxId']>;
  cnssId: FormControl<CompanyFormRawValue['cnssId']>;
  address: FormControl<CompanyFormRawValue['address']>;
  city: FormControl<CompanyFormRawValue['city']>;
  postalCode: FormControl<CompanyFormRawValue['postalCode']>;
  phone: FormControl<CompanyFormRawValue['phone']>;
  email: FormControl<CompanyFormRawValue['email']>;
  logoUrl: FormControl<CompanyFormRawValue['logoUrl']>;
  tenantSchema: FormControl<CompanyFormRawValue['tenantSchema']>;
  active: FormControl<CompanyFormRawValue['active']>;
  trialEnd: FormControl<CompanyFormRawValue['trialEnd']>;
  createdAt: FormControl<CompanyFormRawValue['createdAt']>;
  subscription: FormControl<CompanyFormRawValue['subscription']>;
};

export type CompanyFormGroup = FormGroup<CompanyFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class CompanyFormService {
  createCompanyFormGroup(company: CompanyFormGroupInput = { id: null }): CompanyFormGroup {
    const companyRawValue = this.convertCompanyToCompanyRawValue({
      ...this.getFormDefaults(),
      ...company,
    });
    return new FormGroup<CompanyFormGroupContent>({
      id: new FormControl(
        { value: companyRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(companyRawValue.name, {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(150)],
      }),
      tradeName: new FormControl(companyRawValue.tradeName, {
        validators: [Validators.maxLength(150)],
      }),
      taxId: new FormControl(companyRawValue.taxId, {
        validators: [Validators.required, Validators.maxLength(20)],
      }),
      cnssId: new FormControl(companyRawValue.cnssId, {
        validators: [Validators.maxLength(20)],
      }),
      address: new FormControl(companyRawValue.address, {
        validators: [Validators.maxLength(255)],
      }),
      city: new FormControl(companyRawValue.city, {
        validators: [Validators.maxLength(100)],
      }),
      postalCode: new FormControl(companyRawValue.postalCode, {
        validators: [Validators.maxLength(10)],
      }),
      phone: new FormControl(companyRawValue.phone, {
        validators: [Validators.maxLength(20)],
      }),
      email: new FormControl(companyRawValue.email, {
        validators: [Validators.maxLength(100)],
      }),
      logoUrl: new FormControl(companyRawValue.logoUrl, {
        validators: [Validators.maxLength(500)],
      }),
      tenantSchema: new FormControl(companyRawValue.tenantSchema, {
        validators: [Validators.required, Validators.maxLength(63)],
      }),
      active: new FormControl(companyRawValue.active, {
        validators: [Validators.required],
      }),
      trialEnd: new FormControl(companyRawValue.trialEnd),
      createdAt: new FormControl(companyRawValue.createdAt, {
        validators: [Validators.required],
      }),
      subscription: new FormControl(companyRawValue.subscription),
    });
  }

  getCompany(form: CompanyFormGroup): ICompany | NewCompany {
    return this.convertCompanyRawValueToCompany(form.getRawValue() as CompanyFormRawValue | NewCompanyFormRawValue);
  }

  resetForm(form: CompanyFormGroup, company: CompanyFormGroupInput): void {
    const companyRawValue = this.convertCompanyToCompanyRawValue({ ...this.getFormDefaults(), ...company });
    form.reset(
      {
        ...companyRawValue,
        id: { value: companyRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): CompanyFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      active: false,
      createdAt: currentTime,
    };
  }

  private convertCompanyRawValueToCompany(rawCompany: CompanyFormRawValue | NewCompanyFormRawValue): ICompany | NewCompany {
    return {
      ...rawCompany,
      createdAt: dayjs(rawCompany.createdAt, DATE_TIME_FORMAT),
    };
  }

  private convertCompanyToCompanyRawValue(
    company: ICompany | (Partial<NewCompany> & CompanyFormDefaults),
  ): CompanyFormRawValue | PartialWithRequiredKeyOf<NewCompanyFormRawValue> {
    return {
      ...company,
      createdAt: company.createdAt ? company.createdAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
