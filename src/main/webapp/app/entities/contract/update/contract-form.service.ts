import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IContract, NewContract } from '../contract.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IContract for edit and NewContractFormGroupInput for create.
 */
type ContractFormGroupInput = IContract | PartialWithRequiredKeyOf<NewContract>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IContract | NewContract> = Omit<T, 'createdAt'> & {
  createdAt?: string | null;
};

type ContractFormRawValue = FormValueOf<IContract>;

type NewContractFormRawValue = FormValueOf<NewContract>;

type ContractFormDefaults = Pick<NewContract, 'id' | 'createdAt'>;

type ContractFormGroupContent = {
  id: FormControl<ContractFormRawValue['id'] | NewContract['id']>;
  reference: FormControl<ContractFormRawValue['reference']>;
  contractType: FormControl<ContractFormRawValue['contractType']>;
  status: FormControl<ContractFormRawValue['status']>;
  startDate: FormControl<ContractFormRawValue['startDate']>;
  endDate: FormControl<ContractFormRawValue['endDate']>;
  signedDate: FormControl<ContractFormRawValue['signedDate']>;
  baseSalary: FormControl<ContractFormRawValue['baseSalary']>;
  workingHoursWeek: FormControl<ContractFormRawValue['workingHoursWeek']>;
  workingDaysWeek: FormControl<ContractFormRawValue['workingDaysWeek']>;
  conventionCollective: FormControl<ContractFormRawValue['conventionCollective']>;
  trialPeriodMonths: FormControl<ContractFormRawValue['trialPeriodMonths']>;
  renewalCount: FormControl<ContractFormRawValue['renewalCount']>;
  documentUrl: FormControl<ContractFormRawValue['documentUrl']>;
  notes: FormControl<ContractFormRawValue['notes']>;
  createdAt: FormControl<ContractFormRawValue['createdAt']>;
  employee: FormControl<ContractFormRawValue['employee']>;
  createdBy: FormControl<ContractFormRawValue['createdBy']>;
};

export type ContractFormGroup = FormGroup<ContractFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ContractFormService {
  createContractFormGroup(contract?: ContractFormGroupInput): ContractFormGroup {
    const contractRawValue = this.convertContractToContractRawValue({
      ...this.getFormDefaults(),
      ...(contract ?? { id: null }),
    });
    return new FormGroup<ContractFormGroupContent>({
      id: new FormControl(
        { value: contractRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      reference: new FormControl(contractRawValue.reference, {
        validators: [Validators.required, Validators.maxLength(50)],
      }),
      contractType: new FormControl(contractRawValue.contractType, {
        validators: [Validators.required],
      }),
      status: new FormControl(contractRawValue.status, {
        validators: [Validators.required],
      }),
      startDate: new FormControl(contractRawValue.startDate, {
        validators: [Validators.required],
      }),
      endDate: new FormControl(contractRawValue.endDate),
      signedDate: new FormControl(contractRawValue.signedDate),
      baseSalary: new FormControl(contractRawValue.baseSalary, {
        validators: [Validators.required],
      }),
      workingHoursWeek: new FormControl(contractRawValue.workingHoursWeek, {
        validators: [Validators.required, Validators.min(1), Validators.max(48)],
      }),
      workingDaysWeek: new FormControl(contractRawValue.workingDaysWeek, {
        validators: [Validators.required, Validators.min(1), Validators.max(7)],
      }),
      conventionCollective: new FormControl(contractRawValue.conventionCollective, {
        validators: [Validators.maxLength(100)],
      }),
      trialPeriodMonths: new FormControl(contractRawValue.trialPeriodMonths, {
        validators: [Validators.min(0), Validators.max(12)],
      }),
      renewalCount: new FormControl(contractRawValue.renewalCount, {
        validators: [Validators.min(0)],
      }),
      documentUrl: new FormControl(contractRawValue.documentUrl, {
        validators: [Validators.maxLength(500)],
      }),
      notes: new FormControl(contractRawValue.notes),
      createdAt: new FormControl(contractRawValue.createdAt, {
        validators: [Validators.required],
      }),
      employee: new FormControl(contractRawValue.employee, {
        validators: [Validators.required],
      }),
      createdBy: new FormControl(contractRawValue.createdBy),
    });
  }

  getContract(form: ContractFormGroup): IContract | NewContract {
    return this.convertContractRawValueToContract(form.getRawValue() as ContractFormRawValue | NewContractFormRawValue);
  }

  resetForm(form: ContractFormGroup, contract: ContractFormGroupInput): void {
    const contractRawValue = this.convertContractToContractRawValue({ ...this.getFormDefaults(), ...contract });
    form.reset({
      ...contractRawValue,
      id: { value: contractRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): ContractFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
    };
  }

  private convertContractRawValueToContract(rawContract: ContractFormRawValue | NewContractFormRawValue): IContract | NewContract {
    return {
      ...rawContract,
      createdAt: dayjs(rawContract.createdAt, DATE_TIME_FORMAT),
    };
  }

  private convertContractToContractRawValue(
    contract: IContract | (Partial<NewContract> & ContractFormDefaults),
  ): ContractFormRawValue | PartialWithRequiredKeyOf<NewContractFormRawValue> {
    return {
      ...contract,
      createdAt: contract.createdAt ? contract.createdAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
