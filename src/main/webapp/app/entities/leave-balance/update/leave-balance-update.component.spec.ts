import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { ILeaveType } from 'app/entities/leave-type/leave-type.model';
import { LeaveTypeService } from 'app/entities/leave-type/service/leave-type.service';
import { ILeaveBalance } from '../leave-balance.model';
import { LeaveBalanceService } from '../service/leave-balance.service';
import { LeaveBalanceFormService } from './leave-balance-form.service';

import { LeaveBalanceUpdateComponent } from './leave-balance-update.component';

describe('LeaveBalance Management Update Component', () => {
  let comp: LeaveBalanceUpdateComponent;
  let fixture: ComponentFixture<LeaveBalanceUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let leaveBalanceFormService: LeaveBalanceFormService;
  let leaveBalanceService: LeaveBalanceService;
  let employeeService: EmployeeService;
  let leaveTypeService: LeaveTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LeaveBalanceUpdateComponent],
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
      .overrideTemplate(LeaveBalanceUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(LeaveBalanceUpdateComponent);
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
      jest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      jest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ leaveBalance });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(expect.objectContaining),
      );
      expect(comp.employeesSharedCollection).toEqual(expectedCollection);
    });

    it('should call LeaveType query and add missing value', () => {
      const leaveBalance: ILeaveBalance = { id: 6757 };
      const leaveType: ILeaveType = { id: 22862 };
      leaveBalance.leaveType = leaveType;

      const leaveTypeCollection: ILeaveType[] = [{ id: 22862 }];
      jest.spyOn(leaveTypeService, 'query').mockReturnValue(of(new HttpResponse({ body: leaveTypeCollection })));
      const additionalLeaveTypes = [leaveType];
      const expectedCollection: ILeaveType[] = [...additionalLeaveTypes, ...leaveTypeCollection];
      jest.spyOn(leaveTypeService, 'addLeaveTypeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ leaveBalance });
      comp.ngOnInit();

      expect(leaveTypeService.query).toHaveBeenCalled();
      expect(leaveTypeService.addLeaveTypeToCollectionIfMissing).toHaveBeenCalledWith(
        leaveTypeCollection,
        ...additionalLeaveTypes.map(expect.objectContaining),
      );
      expect(comp.leaveTypesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const leaveBalance: ILeaveBalance = { id: 6757 };
      const employee: IEmployee = { id: 1749 };
      leaveBalance.employee = employee;
      const leaveType: ILeaveType = { id: 22862 };
      leaveBalance.leaveType = leaveType;

      activatedRoute.data = of({ leaveBalance });
      comp.ngOnInit();

      expect(comp.employeesSharedCollection).toContainEqual(employee);
      expect(comp.leaveTypesSharedCollection).toContainEqual(leaveType);
      expect(comp.leaveBalance).toEqual(leaveBalance);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILeaveBalance>>();
      const leaveBalance = { id: 9581 };
      jest.spyOn(leaveBalanceFormService, 'getLeaveBalance').mockReturnValue(leaveBalance);
      jest.spyOn(leaveBalanceService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ leaveBalance });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: leaveBalance }));
      saveSubject.complete();

      // THEN
      expect(leaveBalanceFormService.getLeaveBalance).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(leaveBalanceService.update).toHaveBeenCalledWith(expect.objectContaining(leaveBalance));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILeaveBalance>>();
      const leaveBalance = { id: 9581 };
      jest.spyOn(leaveBalanceFormService, 'getLeaveBalance').mockReturnValue({ id: null });
      jest.spyOn(leaveBalanceService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ leaveBalance: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: leaveBalance }));
      saveSubject.complete();

      // THEN
      expect(leaveBalanceFormService.getLeaveBalance).toHaveBeenCalled();
      expect(leaveBalanceService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILeaveBalance>>();
      const leaveBalance = { id: 9581 };
      jest.spyOn(leaveBalanceService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ leaveBalance });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(leaveBalanceService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareEmployee', () => {
      it('should forward to employeeService', () => {
        const entity = { id: 1749 };
        const entity2 = { id: 1545 };
        jest.spyOn(employeeService, 'compareEmployee');
        comp.compareEmployee(entity, entity2);
        expect(employeeService.compareEmployee).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareLeaveType', () => {
      it('should forward to leaveTypeService', () => {
        const entity = { id: 22862 };
        const entity2 = { id: 27866 };
        jest.spyOn(leaveTypeService, 'compareLeaveType');
        comp.compareLeaveType(entity, entity2);
        expect(leaveTypeService.compareLeaveType).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
