import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { IEmployeeHistory } from '../employee-history.model';
import { EmployeeHistoryService } from '../service/employee-history.service';

import { EmployeeHistoryFormService } from './employee-history-form.service';
import { EmployeeHistoryUpdate } from './employee-history-update';

describe('EmployeeHistory Management Update Component', () => {
  let comp: EmployeeHistoryUpdate;
  let fixture: ComponentFixture<EmployeeHistoryUpdate>;
  let activatedRoute: ActivatedRoute;
  let employeeHistoryFormService: EmployeeHistoryFormService;
  let employeeHistoryService: EmployeeHistoryService;
  let employeeService: EmployeeService;

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

    fixture = TestBed.createComponent(EmployeeHistoryUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    employeeHistoryFormService = TestBed.inject(EmployeeHistoryFormService);
    employeeHistoryService = TestBed.inject(EmployeeHistoryService);
    employeeService = TestBed.inject(EmployeeService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Employee query and add missing value', () => {
      const employeeHistory: IEmployeeHistory = { id: 19187 };
      const employee: IEmployee = { id: 1749 };
      employeeHistory.employee = employee;

      const employeeCollection: IEmployee[] = [{ id: 1749 }];
      vitest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      vitest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ employeeHistory });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.employeesSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const employeeHistory: IEmployeeHistory = { id: 19187 };
      const employee: IEmployee = { id: 1749 };
      employeeHistory.employee = employee;

      activatedRoute.data = of({ employeeHistory });
      comp.ngOnInit();

      expect(comp.employeesSharedCollection()).toContainEqual(employee);
      expect(comp.employeeHistory).toEqual(employeeHistory);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IEmployeeHistory>();
      const employeeHistory = { id: 27008 };
      vitest.spyOn(employeeHistoryFormService, 'getEmployeeHistory').mockReturnValue(employeeHistory);
      vitest.spyOn(employeeHistoryService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ employeeHistory });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(employeeHistory);
      saveSubject.complete();

      // THEN
      expect(employeeHistoryFormService.getEmployeeHistory).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(employeeHistoryService.update).toHaveBeenCalledWith(expect.objectContaining(employeeHistory));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IEmployeeHistory>();
      const employeeHistory = { id: 27008 };
      vitest.spyOn(employeeHistoryFormService, 'getEmployeeHistory').mockReturnValue({ id: null });
      vitest.spyOn(employeeHistoryService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ employeeHistory: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(employeeHistory);
      saveSubject.complete();

      // THEN
      expect(employeeHistoryFormService.getEmployeeHistory).toHaveBeenCalled();
      expect(employeeHistoryService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IEmployeeHistory>();
      const employeeHistory = { id: 27008 };
      vitest.spyOn(employeeHistoryService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ employeeHistory });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(employeeHistoryService.update).toHaveBeenCalled();
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
  });
});
