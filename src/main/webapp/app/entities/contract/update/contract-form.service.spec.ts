import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../contract.test-samples';

import { ContractFormService } from './contract-form.service';

describe('Contract Form Service', () => {
  let service: ContractFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContractFormService);
  });

  describe('Service methods', () => {
    describe('createContractFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createContractFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            reference: expect.any(Object),
            contractType: expect.any(Object),
            status: expect.any(Object),
            startDate: expect.any(Object),
            endDate: expect.any(Object),
            signedDate: expect.any(Object),
            baseSalary: expect.any(Object),
            workingHoursWeek: expect.any(Object),
            workingDaysWeek: expect.any(Object),
            conventionCollective: expect.any(Object),
            trialPeriodMonths: expect.any(Object),
            renewalCount: expect.any(Object),
            documentUrl: expect.any(Object),
            notes: expect.any(Object),
            createdAt: expect.any(Object),
            employee: expect.any(Object),
            createdBy: expect.any(Object),
          }),
        );
      });

      it('passing IContract should create a new form with FormGroup', () => {
        const formGroup = service.createContractFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            reference: expect.any(Object),
            contractType: expect.any(Object),
            status: expect.any(Object),
            startDate: expect.any(Object),
            endDate: expect.any(Object),
            signedDate: expect.any(Object),
            baseSalary: expect.any(Object),
            workingHoursWeek: expect.any(Object),
            workingDaysWeek: expect.any(Object),
            conventionCollective: expect.any(Object),
            trialPeriodMonths: expect.any(Object),
            renewalCount: expect.any(Object),
            documentUrl: expect.any(Object),
            notes: expect.any(Object),
            createdAt: expect.any(Object),
            employee: expect.any(Object),
            createdBy: expect.any(Object),
          }),
        );
      });
    });

    describe('getContract', () => {
      it('should return NewContract for default Contract initial value', () => {
        const formGroup = service.createContractFormGroup(sampleWithNewData);

        const contract = service.getContract(formGroup) as any;

        expect(contract).toMatchObject(sampleWithNewData);
      });

      it('should return NewContract for empty Contract initial value', () => {
        const formGroup = service.createContractFormGroup();

        const contract = service.getContract(formGroup) as any;

        expect(contract).toMatchObject({});
      });

      it('should return IContract', () => {
        const formGroup = service.createContractFormGroup(sampleWithRequiredData);

        const contract = service.getContract(formGroup) as any;

        expect(contract).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IContract should not enable id FormControl', () => {
        const formGroup = service.createContractFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewContract should disable id FormControl', () => {
        const formGroup = service.createContractFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
