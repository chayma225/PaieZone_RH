import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { EmployeeHistoryService } from '../service/employee-history.service';
import { IEmployeeHistory } from '../employee-history.model';
import { EmployeeHistoryFormService } from './employee-history-form.service';

import { EmployeeHistoryUpdateComponent } from './employee-history-update.component';

describe('EmployeeHistory Management Update Component', () => {
  let comp: EmployeeHistoryUpdateComponent;
  let fixture: ComponentFixture<EmployeeHistoryUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let employeeHistoryFormService: EmployeeHistoryFormService;
  let employeeHistoryService: EmployeeHistoryService;
  let employeeService: EmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmployeeHistoryUpdateComponent],
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
      .overrideTemplate(EmployeeHistoryUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(EmployeeHistoryUpdateComponent);
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
      jest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      jest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ employeeHistory });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(expect.objectContaining),
      );
      expect(comp.employeesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const employeeHistory: IEmployeeHistory = { id: 19187 };
      const employee: IEmployee = { id: 1749 };
      employeeHistory.employee = employee;

      activatedRoute.data = of({ employeeHistory });
      comp.ngOnInit();

      expect(comp.employeesSharedCollection).toContainEqual(employee);
      expect(comp.employeeHistory).toEqual(employeeHistory);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IEmployeeHistory>>();
      const employeeHistory = { id: 27008 };
      jest.spyOn(employeeHistoryFormService, 'getEmployeeHistory').mockReturnValue(employeeHistory);
      jest.spyOn(employeeHistoryService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ employeeHistory });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: employeeHistory }));
      saveSubject.complete();

      // THEN
      expect(employeeHistoryFormService.getEmployeeHistory).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(employeeHistoryService.update).toHaveBeenCalledWith(expect.objectContaining(employeeHistory));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IEmployeeHistory>>();
      const employeeHistory = { id: 27008 };
      jest.spyOn(employeeHistoryFormService, 'getEmployeeHistory').mockReturnValue({ id: null });
      jest.spyOn(employeeHistoryService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ employeeHistory: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: employeeHistory }));
      saveSubject.complete();

      // THEN
      expect(employeeHistoryFormService.getEmployeeHistory).toHaveBeenCalled();
      expect(employeeHistoryService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IEmployeeHistory>>();
      const employeeHistory = { id: 27008 };
      jest.spyOn(employeeHistoryService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ employeeHistory });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(employeeHistoryService.update).toHaveBeenCalled();
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
  });
});
