import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { IAccountPlan } from '../account-plan.model';
import { AccountPlanService } from '../service/account-plan.service';

import { AccountPlanFormService } from './account-plan-form.service';
import { AccountPlanUpdate } from './account-plan-update';

describe('AccountPlan Management Update Component', () => {
  let comp: AccountPlanUpdate;
  let fixture: ComponentFixture<AccountPlanUpdate>;
  let activatedRoute: ActivatedRoute;
  let accountPlanFormService: AccountPlanFormService;
  let accountPlanService: AccountPlanService;
  let companyService: CompanyService;

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

    fixture = TestBed.createComponent(AccountPlanUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    accountPlanFormService = TestBed.inject(AccountPlanFormService);
    accountPlanService = TestBed.inject(AccountPlanService);
    companyService = TestBed.inject(CompanyService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Company query and add missing value', () => {
      const accountPlan: IAccountPlan = { id: 6442 };
      const company: ICompany = { id: 29751 };
      accountPlan.company = company;

      const companyCollection: ICompany[] = [{ id: 29751 }];
      vitest.spyOn(companyService, 'query').mockReturnValue(of(new HttpResponse({ body: companyCollection })));
      const additionalCompanies = [company];
      const expectedCollection: ICompany[] = [...additionalCompanies, ...companyCollection];
      vitest.spyOn(companyService, 'addCompanyToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ accountPlan });
      comp.ngOnInit();

      expect(companyService.query).toHaveBeenCalled();
      expect(companyService.addCompanyToCollectionIfMissing).toHaveBeenCalledWith(
        companyCollection,
        ...additionalCompanies.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.companiesSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const accountPlan: IAccountPlan = { id: 6442 };
      const company: ICompany = { id: 29751 };
      accountPlan.company = company;

      activatedRoute.data = of({ accountPlan });
      comp.ngOnInit();

      expect(comp.companiesSharedCollection()).toContainEqual(company);
      expect(comp.accountPlan).toEqual(accountPlan);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IAccountPlan>();
      const accountPlan = { id: 7481 };
      vitest.spyOn(accountPlanFormService, 'getAccountPlan').mockReturnValue(accountPlan);
      vitest.spyOn(accountPlanService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ accountPlan });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(accountPlan);
      saveSubject.complete();

      // THEN
      expect(accountPlanFormService.getAccountPlan).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(accountPlanService.update).toHaveBeenCalledWith(expect.objectContaining(accountPlan));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IAccountPlan>();
      const accountPlan = { id: 7481 };
      vitest.spyOn(accountPlanFormService, 'getAccountPlan').mockReturnValue({ id: null });
      vitest.spyOn(accountPlanService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ accountPlan: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(accountPlan);
      saveSubject.complete();

      // THEN
      expect(accountPlanFormService.getAccountPlan).toHaveBeenCalled();
      expect(accountPlanService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IAccountPlan>();
      const accountPlan = { id: 7481 };
      vitest.spyOn(accountPlanService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ accountPlan });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(accountPlanService.update).toHaveBeenCalled();
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
  });
});
