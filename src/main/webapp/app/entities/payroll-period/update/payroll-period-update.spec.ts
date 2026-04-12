import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { UserProfileService } from 'app/entities/user-profile/service/user-profile.service';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { IPayrollPeriod } from '../payroll-period.model';
import { PayrollPeriodService } from '../service/payroll-period.service';

import { PayrollPeriodFormService } from './payroll-period-form.service';
import { PayrollPeriodUpdate } from './payroll-period-update';

describe('PayrollPeriod Management Update Component', () => {
  let comp: PayrollPeriodUpdate;
  let fixture: ComponentFixture<PayrollPeriodUpdate>;
  let activatedRoute: ActivatedRoute;
  let payrollPeriodFormService: PayrollPeriodFormService;
  let payrollPeriodService: PayrollPeriodService;
  let companyService: CompanyService;
  let userProfileService: UserProfileService;

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

    fixture = TestBed.createComponent(PayrollPeriodUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    payrollPeriodFormService = TestBed.inject(PayrollPeriodFormService);
    payrollPeriodService = TestBed.inject(PayrollPeriodService);
    companyService = TestBed.inject(CompanyService);
    userProfileService = TestBed.inject(UserProfileService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Company query and add missing value', () => {
      const payrollPeriod: IPayrollPeriod = { id: 9891 };
      const company: ICompany = { id: 29751 };
      payrollPeriod.company = company;

      const companyCollection: ICompany[] = [{ id: 29751 }];
      vitest.spyOn(companyService, 'query').mockReturnValue(of(new HttpResponse({ body: companyCollection })));
      const additionalCompanies = [company];
      const expectedCollection: ICompany[] = [...additionalCompanies, ...companyCollection];
      vitest.spyOn(companyService, 'addCompanyToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ payrollPeriod });
      comp.ngOnInit();

      expect(companyService.query).toHaveBeenCalled();
      expect(companyService.addCompanyToCollectionIfMissing).toHaveBeenCalledWith(
        companyCollection,
        ...additionalCompanies.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.companiesSharedCollection()).toEqual(expectedCollection);
    });

    it('should call UserProfile query and add missing value', () => {
      const payrollPeriod: IPayrollPeriod = { id: 9891 };
      const createdBy: IUserProfile = { id: 22058 };
      payrollPeriod.createdBy = createdBy;

      const userProfileCollection: IUserProfile[] = [{ id: 22058 }];
      vitest.spyOn(userProfileService, 'query').mockReturnValue(of(new HttpResponse({ body: userProfileCollection })));
      const additionalUserProfiles = [createdBy];
      const expectedCollection: IUserProfile[] = [...additionalUserProfiles, ...userProfileCollection];
      vitest.spyOn(userProfileService, 'addUserProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ payrollPeriod });
      comp.ngOnInit();

      expect(userProfileService.query).toHaveBeenCalled();
      expect(userProfileService.addUserProfileToCollectionIfMissing).toHaveBeenCalledWith(
        userProfileCollection,
        ...additionalUserProfiles.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.userProfilesSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const payrollPeriod: IPayrollPeriod = { id: 9891 };
      const company: ICompany = { id: 29751 };
      payrollPeriod.company = company;
      const createdBy: IUserProfile = { id: 22058 };
      payrollPeriod.createdBy = createdBy;

      activatedRoute.data = of({ payrollPeriod });
      comp.ngOnInit();

      expect(comp.companiesSharedCollection()).toContainEqual(company);
      expect(comp.userProfilesSharedCollection()).toContainEqual(createdBy);
      expect(comp.payrollPeriod).toEqual(payrollPeriod);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IPayrollPeriod>();
      const payrollPeriod = { id: 28456 };
      vitest.spyOn(payrollPeriodFormService, 'getPayrollPeriod').mockReturnValue(payrollPeriod);
      vitest.spyOn(payrollPeriodService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ payrollPeriod });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(payrollPeriod);
      saveSubject.complete();

      // THEN
      expect(payrollPeriodFormService.getPayrollPeriod).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(payrollPeriodService.update).toHaveBeenCalledWith(expect.objectContaining(payrollPeriod));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IPayrollPeriod>();
      const payrollPeriod = { id: 28456 };
      vitest.spyOn(payrollPeriodFormService, 'getPayrollPeriod').mockReturnValue({ id: null });
      vitest.spyOn(payrollPeriodService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ payrollPeriod: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(payrollPeriod);
      saveSubject.complete();

      // THEN
      expect(payrollPeriodFormService.getPayrollPeriod).toHaveBeenCalled();
      expect(payrollPeriodService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IPayrollPeriod>();
      const payrollPeriod = { id: 28456 };
      vitest.spyOn(payrollPeriodService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ payrollPeriod });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(payrollPeriodService.update).toHaveBeenCalled();
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

    describe('compareUserProfile', () => {
      it('should forward to userProfileService', () => {
        const entity = { id: 22058 };
        const entity2 = { id: 9009 };
        vitest.spyOn(userProfileService, 'compareUserProfile');
        comp.compareUserProfile(entity, entity2);
        expect(userProfileService.compareUserProfile).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
