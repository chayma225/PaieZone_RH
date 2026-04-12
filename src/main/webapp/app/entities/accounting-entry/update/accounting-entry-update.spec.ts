import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { IPayrollPeriod } from 'app/entities/payroll-period/payroll-period.model';
import { PayrollPeriodService } from 'app/entities/payroll-period/service/payroll-period.service';
import { IAccountingEntry } from '../accounting-entry.model';
import { AccountingEntryService } from '../service/accounting-entry.service';

import { AccountingEntryFormService } from './accounting-entry-form.service';
import { AccountingEntryUpdate } from './accounting-entry-update';

describe('AccountingEntry Management Update Component', () => {
  let comp: AccountingEntryUpdate;
  let fixture: ComponentFixture<AccountingEntryUpdate>;
  let activatedRoute: ActivatedRoute;
  let accountingEntryFormService: AccountingEntryFormService;
  let accountingEntryService: AccountingEntryService;
  let companyService: CompanyService;
  let payrollPeriodService: PayrollPeriodService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    });

    fixture = TestBed.createComponent(AccountingEntryUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    accountingEntryFormService = TestBed.inject(AccountingEntryFormService);
    accountingEntryService = TestBed.inject(AccountingEntryService);
    companyService = TestBed.inject(CompanyService);
    payrollPeriodService = TestBed.inject(PayrollPeriodService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Company query and add missing value', () => {
      const accountingEntry: IAccountingEntry = { id: 21196 };
      const company: ICompany = { id: 29751 };
      accountingEntry.company = company;

      const companyCollection: ICompany[] = [{ id: 29751 }];
      vitest.spyOn(companyService, 'query').mockReturnValue(of(new HttpResponse({ body: companyCollection })));
      const additionalCompanies = [company];
      const expectedCollection: ICompany[] = [...additionalCompanies, ...companyCollection];
      vitest.spyOn(companyService, 'addCompanyToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ accountingEntry });
      comp.ngOnInit();

      expect(companyService.query).toHaveBeenCalled();
      expect(companyService.addCompanyToCollectionIfMissing).toHaveBeenCalledWith(
        companyCollection,
        ...additionalCompanies.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.companiesSharedCollection()).toEqual(expectedCollection);
    });

    it('should call PayrollPeriod query and add missing value', () => {
      const accountingEntry: IAccountingEntry = { id: 21196 };
      const payrollPeriod: IPayrollPeriod = { id: 28456 };
      accountingEntry.payrollPeriod = payrollPeriod;

      const payrollPeriodCollection: IPayrollPeriod[] = [{ id: 28456 }];
      vitest.spyOn(payrollPeriodService, 'query').mockReturnValue(of(new HttpResponse({ body: payrollPeriodCollection })));
      const additionalPayrollPeriods = [payrollPeriod];
      const expectedCollection: IPayrollPeriod[] = [...additionalPayrollPeriods, ...payrollPeriodCollection];
      vitest.spyOn(payrollPeriodService, 'addPayrollPeriodToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ accountingEntry });
      comp.ngOnInit();

      expect(payrollPeriodService.query).toHaveBeenCalled();
      expect(payrollPeriodService.addPayrollPeriodToCollectionIfMissing).toHaveBeenCalledWith(
        payrollPeriodCollection,
        ...additionalPayrollPeriods.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.payrollPeriodsSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const accountingEntry: IAccountingEntry = { id: 21196 };
      const company: ICompany = { id: 29751 };
      accountingEntry.company = company;
      const payrollPeriod: IPayrollPeriod = { id: 28456 };
      accountingEntry.payrollPeriod = payrollPeriod;

      activatedRoute.data = of({ accountingEntry });
      comp.ngOnInit();

      expect(comp.companiesSharedCollection()).toContainEqual(company);
      expect(comp.payrollPeriodsSharedCollection()).toContainEqual(payrollPeriod);
      expect(comp.accountingEntry).toEqual(accountingEntry);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IAccountingEntry>();
      const accountingEntry = { id: 1531 };
      vitest.spyOn(accountingEntryFormService, 'getAccountingEntry').mockReturnValue(accountingEntry);
      vitest.spyOn(accountingEntryService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ accountingEntry });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(accountingEntry);
      saveSubject.complete();

      // THEN
      expect(accountingEntryFormService.getAccountingEntry).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(accountingEntryService.update).toHaveBeenCalledWith(expect.objectContaining(accountingEntry));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IAccountingEntry>();
      const accountingEntry = { id: 1531 };
      vitest.spyOn(accountingEntryFormService, 'getAccountingEntry').mockReturnValue({ id: null });
      vitest.spyOn(accountingEntryService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ accountingEntry: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(accountingEntry);
      saveSubject.complete();

      // THEN
      expect(accountingEntryFormService.getAccountingEntry).toHaveBeenCalled();
      expect(accountingEntryService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IAccountingEntry>();
      const accountingEntry = { id: 1531 };
      vitest.spyOn(accountingEntryService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ accountingEntry });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(accountingEntryService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareCompany', () => {
      it('should forward to companyService', () => {
        const entity = { id: 29751 };
        const entity2 = { id: 7586 };
        vitest.spyOn(companyService, 'compareCompany');
        comp.compareCompany(entity, entity2);
        expect(companyService.compareCompany).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('comparePayrollPeriod', () => {
      it('should forward to payrollPeriodService', () => {
        const entity = { id: 28456 };
        const entity2 = { id: 9891 };
        vitest.spyOn(payrollPeriodService, 'comparePayrollPeriod');
        comp.comparePayrollPeriod(entity, entity2);
        expect(payrollPeriodService.comparePayrollPeriod).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
