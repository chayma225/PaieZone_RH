import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IAccountingEntry, NewAccountingEntry } from '../accounting-entry.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IAccountingEntry for edit and NewAccountingEntryFormGroupInput for create.
 */
type AccountingEntryFormGroupInput = IAccountingEntry | PartialWithRequiredKeyOf<NewAccountingEntry>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IAccountingEntry | NewAccountingEntry> = Omit<T, 'exportedAt'> & {
  exportedAt?: string | null;
};

type AccountingEntryFormRawValue = FormValueOf<IAccountingEntry>;

type NewAccountingEntryFormRawValue = FormValueOf<NewAccountingEntry>;

type AccountingEntryFormDefaults = Pick<NewAccountingEntry, 'id' | 'exportedAt'>;

type AccountingEntryFormGroupContent = {
  id: FormControl<AccountingEntryFormRawValue['id'] | NewAccountingEntry['id']>;
  entryDate: FormControl<AccountingEntryFormRawValue['entryDate']>;
  journalRef: FormControl<AccountingEntryFormRawValue['journalRef']>;
  entryType: FormControl<AccountingEntryFormRawValue['entryType']>;
  description: FormControl<AccountingEntryFormRawValue['description']>;
  debitAccount: FormControl<AccountingEntryFormRawValue['debitAccount']>;
  creditAccount: FormControl<AccountingEntryFormRawValue['creditAccount']>;
  amount: FormControl<AccountingEntryFormRawValue['amount']>;
  exportedAt: FormControl<AccountingEntryFormRawValue['exportedAt']>;
  exportFormat: FormControl<AccountingEntryFormRawValue['exportFormat']>;
  exportRef: FormControl<AccountingEntryFormRawValue['exportRef']>;
  company: FormControl<AccountingEntryFormRawValue['company']>;
  payrollPeriod: FormControl<AccountingEntryFormRawValue['payrollPeriod']>;
};

export type AccountingEntryFormGroup = FormGroup<AccountingEntryFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class AccountingEntryFormService {
  createAccountingEntryFormGroup(accountingEntry?: AccountingEntryFormGroupInput): AccountingEntryFormGroup {
    const accountingEntryRawValue = this.convertAccountingEntryToAccountingEntryRawValue({
      ...this.getFormDefaults(),
      ...(accountingEntry ?? { id: null }),
    });
    return new FormGroup<AccountingEntryFormGroupContent>({
      id: new FormControl(
        { value: accountingEntryRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      entryDate: new FormControl(accountingEntryRawValue.entryDate, {
        validators: [Validators.required],
      }),
      journalRef: new FormControl(accountingEntryRawValue.journalRef, {
        validators: [Validators.required, Validators.maxLength(50)],
      }),
      entryType: new FormControl(accountingEntryRawValue.entryType, {
        validators: [Validators.required],
      }),
      description: new FormControl(accountingEntryRawValue.description, {
        validators: [Validators.required, Validators.maxLength(300)],
      }),
      debitAccount: new FormControl(accountingEntryRawValue.debitAccount, {
        validators: [Validators.required, Validators.maxLength(20)],
      }),
      creditAccount: new FormControl(accountingEntryRawValue.creditAccount, {
        validators: [Validators.required, Validators.maxLength(20)],
      }),
      amount: new FormControl(accountingEntryRawValue.amount, {
        validators: [Validators.required],
      }),
      exportedAt: new FormControl(accountingEntryRawValue.exportedAt),
      exportFormat: new FormControl(accountingEntryRawValue.exportFormat, {
        validators: [Validators.maxLength(50)],
      }),
      exportRef: new FormControl(accountingEntryRawValue.exportRef, {
        validators: [Validators.maxLength(100)],
      }),
      company: new FormControl(accountingEntryRawValue.company, {
        validators: [Validators.required],
      }),
      payrollPeriod: new FormControl(accountingEntryRawValue.payrollPeriod),
    });
  }

  getAccountingEntry(form: AccountingEntryFormGroup): IAccountingEntry | NewAccountingEntry {
    return this.convertAccountingEntryRawValueToAccountingEntry(
      form.getRawValue() as AccountingEntryFormRawValue | NewAccountingEntryFormRawValue,
    );
  }

  resetForm(form: AccountingEntryFormGroup, accountingEntry: AccountingEntryFormGroupInput): void {
    const accountingEntryRawValue = this.convertAccountingEntryToAccountingEntryRawValue({ ...this.getFormDefaults(), ...accountingEntry });
    form.reset({
      ...accountingEntryRawValue,
      id: { value: accountingEntryRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): AccountingEntryFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      exportedAt: currentTime,
    };
  }

  private convertAccountingEntryRawValueToAccountingEntry(
    rawAccountingEntry: AccountingEntryFormRawValue | NewAccountingEntryFormRawValue,
  ): IAccountingEntry | NewAccountingEntry {
    return {
      ...rawAccountingEntry,
      exportedAt: dayjs(rawAccountingEntry.exportedAt, DATE_TIME_FORMAT),
    };
  }

  private convertAccountingEntryToAccountingEntryRawValue(
    accountingEntry: IAccountingEntry | (Partial<NewAccountingEntry> & AccountingEntryFormDefaults),
  ): AccountingEntryFormRawValue | PartialWithRequiredKeyOf<NewAccountingEntryFormRawValue> {
    return {
      ...accountingEntry,
      exportedAt: accountingEntry.exportedAt ? accountingEntry.exportedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
