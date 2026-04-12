import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../accounting-entry.test-samples';

import { AccountingEntryFormService } from './accounting-entry-form.service';

describe('AccountingEntry Form Service', () => {
  let service: AccountingEntryFormService;

  beforeEach(() => {
    service = TestBed.inject(AccountingEntryFormService);
  });

  describe('Service methods', () => {
    describe('createAccountingEntryFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createAccountingEntryFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            entryDate: expect.any(Object),
            journalRef: expect.any(Object),
            entryType: expect.any(Object),
            description: expect.any(Object),
            debitAccount: expect.any(Object),
            creditAccount: expect.any(Object),
            amount: expect.any(Object),
            exportedAt: expect.any(Object),
            exportFormat: expect.any(Object),
            exportRef: expect.any(Object),
            company: expect.any(Object),
            payrollPeriod: expect.any(Object),
          }),
        );
      });

      it('passing IAccountingEntry should create a new form with FormGroup', () => {
        const formGroup = service.createAccountingEntryFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            entryDate: expect.any(Object),
            journalRef: expect.any(Object),
            entryType: expect.any(Object),
            description: expect.any(Object),
            debitAccount: expect.any(Object),
            creditAccount: expect.any(Object),
            amount: expect.any(Object),
            exportedAt: expect.any(Object),
            exportFormat: expect.any(Object),
            exportRef: expect.any(Object),
            company: expect.any(Object),
            payrollPeriod: expect.any(Object),
          }),
        );
      });
    });

    describe('getAccountingEntry', () => {
      it('should return NewAccountingEntry for default AccountingEntry initial value', () => {
        const formGroup = service.createAccountingEntryFormGroup(sampleWithNewData);

        const accountingEntry = service.getAccountingEntry(formGroup);

        expect(accountingEntry).toMatchObject(sampleWithNewData);
      });

      it('should return NewAccountingEntry for empty AccountingEntry initial value', () => {
        const formGroup = service.createAccountingEntryFormGroup();

        const accountingEntry = service.getAccountingEntry(formGroup);

        expect(accountingEntry).toMatchObject({});
      });

      it('should return IAccountingEntry', () => {
        const formGroup = service.createAccountingEntryFormGroup(sampleWithRequiredData);

        const accountingEntry = service.getAccountingEntry(formGroup);

        expect(accountingEntry).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IAccountingEntry should not enable id FormControl', () => {
        const formGroup = service.createAccountingEntryFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewAccountingEntry should disable id FormControl', () => {
        const formGroup = service.createAccountingEntryFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
