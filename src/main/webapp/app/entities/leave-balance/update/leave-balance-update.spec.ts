import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { ILeaveType } from 'app/entities/leave-type/leave-type.model';
import { LeaveTypeService } from 'app/entities/leave-type/service/leave-type.service';
import { ILeaveBalance } from '../leave-balance.model';
import { LeaveBalanceService } from '../service/leave-balance.service';

import { LeaveBalanceFormService } from './leave-balance-form.service';
import { LeaveBalanceUpdate } from './leave-balance-update';

describe('LeaveBalance Management Update Component', () => {
  let comp: LeaveBalanceUpdate;
  let fixture: ComponentFixture<LeaveBalanceUpdate>;
  let activatedRoute: ActivatedRoute;
  let leaveBalanceFormService: LeaveBalanceFormService;
  let leaveBalanceService: LeaveBalanceService;
  let employeeService: EmployeeService;
  let leaveTypeService: LeaveTypeService;

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

    fixture = TestBed.createComponent(LeaveBalanceUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    leaveBalanceFormService = TestBed.inject(LeaveBalanceFormService);
    leaveBalanceService = TestBed.inject(LeaveBalanceService);
    employeeService = TestBed.inject(EmployeeService);
    leaveTypeService = TestBed.inject(LeaveTypeService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Employee query and add missing value', () => {
      const leaveBalance: ILeaveBalance = { id: 6757 };
      const employee: IEmployee = { id: 1749 };
      leaveBalance.employee = employee;

      const employeeCollection: IEmployee[] = [{ id: 1749 }];
      vitest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      vitest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ leaveBalance });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.employeesSharedCollection()).toEqual(expectedCollection);
    });

    it('should call LeaveType query and add missing value', () => {
      const leaveBalance: ILeaveBalance = { id: 6757 };
      const leaveType: ILeaveType = { id: 22862 };
      leaveBalance.leaveType = leaveType;

      const leaveTypeCollection: ILeaveType[] = [{ id: 22862 }];
      vitest.spyOn(leaveTypeService, 'query').mockReturnValue(of(new HttpResponse({ body: leaveTypeCollection })));
      const additionalLeaveTypes = [leaveType];
      const expectedCollection: ILeaveType[] = [...additionalLeaveTypes, ...leaveTypeCollection];
      vitest.spyOn(leaveTypeService, 'addLeaveTypeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ leaveBalance });
      comp.ngOnInit();

      expect(leaveTypeService.query).toHaveBeenCalled();
      expect(leaveTypeService.addLeaveTypeToCollectionIfMissing).toHaveBeenCalledWith(
        leaveTypeCollection,
        ...additionalLeaveTypes.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.leaveTypesSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const leaveBalance: ILeaveBalance = { id: 6757 };
      const employee: IEmployee = { id: 1749 };
      leaveBalance.employee = employee;
      const leaveType: ILeaveType = { id: 22862 };
      leaveBalance.leaveType = leaveType;

      activatedRoute.data = of({ leaveBalance });
      comp.ngOnInit();

      expect(comp.employeesSharedCollection()).toContainEqual(employee);
      expect(comp.leaveTypesSharedCollection()).toContainEqual(leaveType);
      expect(comp.leaveBalance).toEqual(leaveBalance);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<ILeaveBalance>();
      const leaveBalance = { id: 9581 };
      vitest.spyOn(leaveBalanceFormService, 'getLeaveBalance').mockReturnValue(leaveBalance);
      vitest.spyOn(leaveBalanceService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ leaveBalance });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(leaveBalance);
      saveSubject.complete();

      // THEN
      expect(leaveBalanceFormService.getLeaveBalance).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(leaveBalanceService.update).toHaveBeenCalledWith(expect.objectContaining(leaveBalance));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<ILeaveBalance>();
      const leaveBalance = { id: 9581 };
      vitest.spyOn(leaveBalanceFormService, 'getLeaveBalance').mockReturnValue({ id: null });
      vitest.spyOn(leaveBalanceService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ leaveBalance: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(leaveBalance);
      saveSubject.complete();

      // THEN
      expect(leaveBalanceFormService.getLeaveBalance).toHaveBeenCalled();
      expect(leaveBalanceService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<ILeaveBalance>();
      const leaveBalance = { id: 9581 };
      vitest.spyOn(leaveBalanceService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ leaveBalance });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(leaveBalanceService.update).toHaveBeenCalled();
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

    describe('compareLeaveType', () => {
      it('should forward to leaveTypeService', () => {
        const entity = { id: 22862 };
        const entity2 = { id: 27866 };
        vitest.spyOn(leaveTypeService, 'compareLeaveType');
        comp.compareLeaveType(entity, entity2);
        expect(leaveTypeService.compareLeaveType).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
