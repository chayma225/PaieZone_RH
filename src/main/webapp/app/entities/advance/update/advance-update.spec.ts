import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { IPaySlip } from 'app/entities/pay-slip/pay-slip.model';
import { PaySlipService } from 'app/entities/pay-slip/service/pay-slip.service';
import { UserProfileService } from 'app/entities/user-profile/service/user-profile.service';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { IAdvance } from '../advance.model';
import { AdvanceService } from '../service/advance.service';

import { AdvanceFormService } from './advance-form.service';
import { AdvanceUpdate } from './advance-update';

describe('Advance Management Update Component', () => {
  let comp: AdvanceUpdate;
  let fixture: ComponentFixture<AdvanceUpdate>;
  let activatedRoute: ActivatedRoute;
  let advanceFormService: AdvanceFormService;
  let advanceService: AdvanceService;
  let employeeService: EmployeeService;
  let paySlipService: PaySlipService;
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

    fixture = TestBed.createComponent(AdvanceUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    advanceFormService = TestBed.inject(AdvanceFormService);
    advanceService = TestBed.inject(AdvanceService);
    employeeService = TestBed.inject(EmployeeService);
    paySlipService = TestBed.inject(PaySlipService);
    userProfileService = TestBed.inject(UserProfileService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Employee query and add missing value', () => {
      const advance: IAdvance = { id: 30715 };
      const employee: IEmployee = { id: 1749 };
      advance.employee = employee;

      const employeeCollection: IEmployee[] = [{ id: 1749 }];
      vitest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      vitest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ advance });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.employeesSharedCollection()).toEqual(expectedCollection);
    });

    it('should call PaySlip query and add missing value', () => {
      const advance: IAdvance = { id: 30715 };
      const paySlip: IPaySlip = { id: 6421 };
      advance.paySlip = paySlip;

      const paySlipCollection: IPaySlip[] = [{ id: 6421 }];
      vitest.spyOn(paySlipService, 'query').mockReturnValue(of(new HttpResponse({ body: paySlipCollection })));
      const additionalPaySlips = [paySlip];
      const expectedCollection: IPaySlip[] = [...additionalPaySlips, ...paySlipCollection];
      vitest.spyOn(paySlipService, 'addPaySlipToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ advance });
      comp.ngOnInit();

      expect(paySlipService.query).toHaveBeenCalled();
      expect(paySlipService.addPaySlipToCollectionIfMissing).toHaveBeenCalledWith(
        paySlipCollection,
        ...additionalPaySlips.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.paySlipsSharedCollection()).toEqual(expectedCollection);
    });

    it('should call UserProfile query and add missing value', () => {
      const advance: IAdvance = { id: 30715 };
      const approvedByUser: IUserProfile = { id: 22058 };
      advance.approvedByUser = approvedByUser;

      const userProfileCollection: IUserProfile[] = [{ id: 22058 }];
      vitest.spyOn(userProfileService, 'query').mockReturnValue(of(new HttpResponse({ body: userProfileCollection })));
      const additionalUserProfiles = [approvedByUser];
      const expectedCollection: IUserProfile[] = [...additionalUserProfiles, ...userProfileCollection];
      vitest.spyOn(userProfileService, 'addUserProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ advance });
      comp.ngOnInit();

      expect(userProfileService.query).toHaveBeenCalled();
      expect(userProfileService.addUserProfileToCollectionIfMissing).toHaveBeenCalledWith(
        userProfileCollection,
        ...additionalUserProfiles.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.userProfilesSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const advance: IAdvance = { id: 30715 };
      const employee: IEmployee = { id: 1749 };
      advance.employee = employee;
      const paySlip: IPaySlip = { id: 6421 };
      advance.paySlip = paySlip;
      const approvedByUser: IUserProfile = { id: 22058 };
      advance.approvedByUser = approvedByUser;

      activatedRoute.data = of({ advance });
      comp.ngOnInit();

      expect(comp.employeesSharedCollection()).toContainEqual(employee);
      expect(comp.paySlipsSharedCollection()).toContainEqual(paySlip);
      expect(comp.userProfilesSharedCollection()).toContainEqual(approvedByUser);
      expect(comp.advance).toEqual(advance);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IAdvance>();
      const advance = { id: 10090 };
      vitest.spyOn(advanceFormService, 'getAdvance').mockReturnValue(advance);
      vitest.spyOn(advanceService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ advance });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(advance);
      saveSubject.complete();

      // THEN
      expect(advanceFormService.getAdvance).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(advanceService.update).toHaveBeenCalledWith(expect.objectContaining(advance));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IAdvance>();
      const advance = { id: 10090 };
      vitest.spyOn(advanceFormService, 'getAdvance').mockReturnValue({ id: null });
      vitest.spyOn(advanceService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ advance: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(advance);
      saveSubject.complete();

      // THEN
      expect(advanceFormService.getAdvance).toHaveBeenCalled();
      expect(advanceService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IAdvance>();
      const advance = { id: 10090 };
      vitest.spyOn(advanceService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ advance });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(advanceService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareEmployee', () => {
      it('should forward to employeeService', () => {
        const entity = { id: 1749 };
        const entity2 = { id: 1545 };
        vitest.spyOn(employeeService, 'compareEmployee');
        comp.compareEmployee(entity, entity2);
        expect(employeeService.compareEmployee).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('comparePaySlip', () => {
      it('should forward to paySlipService', () => {
        const entity = { id: 6421 };
        const entity2 = { id: 15030 };
        vitest.spyOn(paySlipService, 'comparePaySlip');
        comp.comparePaySlip(entity, entity2);
        expect(paySlipService.comparePaySlip).toHaveBeenCalledWith(entity, entity2);
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
