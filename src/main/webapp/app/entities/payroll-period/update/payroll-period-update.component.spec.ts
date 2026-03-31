import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { UserProfileService } from 'app/entities/user-profile/service/user-profile.service';
import { IPayrollPeriod } from '../payroll-period.model';
import { PayrollPeriodService } from '../service/payroll-period.service';
import { PayrollPeriodFormService } from './payroll-period-form.service';

import { PayrollPeriodUpdateComponent } from './payroll-period-update.component';

describe('PayrollPeriod Management Update Component', () => {
  let comp: PayrollPeriodUpdateComponent;
  let fixture: ComponentFixture<PayrollPeriodUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let payrollPeriodFormService: PayrollPeriodFormService;
  let payrollPeriodService: PayrollPeriodService;
  let companyService: CompanyService;
  let userProfileService: UserProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PayrollPeriodUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(PayrollPeriodUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PayrollPeriodUpdateComponent);
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
      jest.spyOn(companyService, 'query').mockReturnValue(of(new HttpResponse({ body: companyCollection })));
      const additionalCompanies = [company];
      const expectedCollection: ICompany[] = [...additionalCompanies, ...companyCollection];
      jest.spyOn(companyService, 'addCompanyToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ payrollPeriod });
      comp.ngOnInit();

      expect(companyService.query).toHaveBeenCalled();
      expect(companyService.addCompanyToCollectionIfMissing).toHaveBeenCalledWith(
        companyCollection,
        ...additionalCompanies.map(expect.objectContaining),
      );
      expect(comp.companiesSharedCollection).toEqual(expectedCollection);
    });

    it('should call UserProfile query and add missing value', () => {
      const payrollPeriod: IPayrollPeriod = { id: 9891 };
      const createdBy: IUserProfile = { id: 22058 };
      payrollPeriod.createdBy = createdBy;

      const userProfileCollection: IUserProfile[] = [{ id: 22058 }];
      jest.spyOn(userProfileService, 'query').mockReturnValue(of(new HttpResponse({ body: userProfileCollection })));
      const additionalUserProfiles = [createdBy];
      const expectedCollection: IUserProfile[] = [...additionalUserProfiles, ...userProfileCollection];
      jest.spyOn(userProfileService, 'addUserProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ payrollPeriod });
      comp.ngOnInit();

      expect(userProfileService.query).toHaveBeenCalled();
      expect(userProfileService.addUserProfileToCollectionIfMissing).toHaveBeenCalledWith(
        userProfileCollection,
        ...additionalUserProfiles.map(expect.objectContaining),
      );
      expect(comp.userProfilesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const payrollPeriod: IPayrollPeriod = { id: 9891 };
      const company: ICompany = { id: 29751 };
      payrollPeriod.company = company;
      const createdBy: IUserProfile = { id: 22058 };
      payrollPeriod.createdBy = createdBy;

      activatedRoute.data = of({ payrollPeriod });
      comp.ngOnInit();

      expect(comp.companiesSharedCollection).toContainEqual(company);
      expect(comp.userProfilesSharedCollection).toContainEqual(createdBy);
      expect(comp.payrollPeriod).toEqual(payrollPeriod);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPayrollPeriod>>();
      const payrollPeriod = { id: 28456 };
      jest.spyOn(payrollPeriodFormService, 'getPayrollPeriod').mockReturnValue(payrollPeriod);
      jest.spyOn(payrollPeriodService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ payrollPeriod });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: payrollPeriod }));
      saveSubject.complete();

      // THEN
      expect(payrollPeriodFormService.getPayrollPeriod).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(payrollPeriodService.update).toHaveBeenCalledWith(expect.objectContaining(payrollPeriod));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPayrollPeriod>>();
      const payrollPeriod = { id: 28456 };
      jest.spyOn(payrollPeriodFormService, 'getPayrollPeriod').mockReturnValue({ id: null });
      jest.spyOn(payrollPeriodService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ payrollPeriod: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: payrollPeriod }));
      saveSubject.complete();

      // THEN
      expect(payrollPeriodFormService.getPayrollPeriod).toHaveBeenCalled();
      expect(payrollPeriodService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPayrollPeriod>>();
      const payrollPeriod = { id: 28456 };
      jest.spyOn(payrollPeriodService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ payrollPeriod });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(payrollPeriodService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareCompany', () => {
      it('should forward to companyService', () => {
        const entity = { id: 29751 };
        const entity2 = { id: 7586 };
        jest.spyOn(companyService, 'compareCompany');
        comp.compareCompany(entity, entity2);
        expect(companyService.compareCompany).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareUserProfile', () => {
      it('should forward to userProfileService', () => {
        const entity = { id: 22058 };
        const entity2 = { id: 9009 };
        jest.spyOn(userProfileService, 'compareUserProfile');
        comp.compareUserProfile(entity, entity2);
        expect(userProfileService.compareUserProfile).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
