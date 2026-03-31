import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { IPaySlip } from 'app/entities/pay-slip/pay-slip.model';
import { PaySlipService } from 'app/entities/pay-slip/service/pay-slip.service';
import { IBonus } from '../bonus.model';
import { BonusService } from '../service/bonus.service';
import { BonusFormService } from './bonus-form.service';

import { BonusUpdateComponent } from './bonus-update.component';

describe('Bonus Management Update Component', () => {
  let comp: BonusUpdateComponent;
  let fixture: ComponentFixture<BonusUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let bonusFormService: BonusFormService;
  let bonusService: BonusService;
  let employeeService: EmployeeService;
  let paySlipService: PaySlipService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BonusUpdateComponent],
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
      .overrideTemplate(BonusUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(BonusUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    bonusFormService = TestBed.inject(BonusFormService);
    bonusService = TestBed.inject(BonusService);
    employeeService = TestBed.inject(EmployeeService);
    paySlipService = TestBed.inject(PaySlipService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Employee query and add missing value', () => {
      const bonus: IBonus = { id: 7078 };
      const employee: IEmployee = { id: 1749 };
      bonus.employee = employee;

      const employeeCollection: IEmployee[] = [{ id: 1749 }];
      jest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      jest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ bonus });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(expect.objectContaining),
      );
      expect(comp.employeesSharedCollection).toEqual(expectedCollection);
    });

    it('should call PaySlip query and add missing value', () => {
      const bonus: IBonus = { id: 7078 };
      const paySlip: IPaySlip = { id: 6421 };
      bonus.paySlip = paySlip;

      const paySlipCollection: IPaySlip[] = [{ id: 6421 }];
      jest.spyOn(paySlipService, 'query').mockReturnValue(of(new HttpResponse({ body: paySlipCollection })));
      const additionalPaySlips = [paySlip];
      const expectedCollection: IPaySlip[] = [...additionalPaySlips, ...paySlipCollection];
      jest.spyOn(paySlipService, 'addPaySlipToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ bonus });
      comp.ngOnInit();

      expect(paySlipService.query).toHaveBeenCalled();
      expect(paySlipService.addPaySlipToCollectionIfMissing).toHaveBeenCalledWith(
        paySlipCollection,
        ...additionalPaySlips.map(expect.objectContaining),
      );
      expect(comp.paySlipsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const bonus: IBonus = { id: 7078 };
      const employee: IEmployee = { id: 1749 };
      bonus.employee = employee;
      const paySlip: IPaySlip = { id: 6421 };
      bonus.paySlip = paySlip;

      activatedRoute.data = of({ bonus });
      comp.ngOnInit();

      expect(comp.employeesSharedCollection).toContainEqual(employee);
      expect(comp.paySlipsSharedCollection).toContainEqual(paySlip);
      expect(comp.bonus).toEqual(bonus);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IBonus>>();
      const bonus = { id: 9352 };
      jest.spyOn(bonusFormService, 'getBonus').mockReturnValue(bonus);
      jest.spyOn(bonusService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ bonus });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: bonus }));
      saveSubject.complete();

      // THEN
      expect(bonusFormService.getBonus).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(bonusService.update).toHaveBeenCalledWith(expect.objectContaining(bonus));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IBonus>>();
      const bonus = { id: 9352 };
      jest.spyOn(bonusFormService, 'getBonus').mockReturnValue({ id: null });
      jest.spyOn(bonusService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ bonus: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: bonus }));
      saveSubject.complete();

      // THEN
      expect(bonusFormService.getBonus).toHaveBeenCalled();
      expect(bonusService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IBonus>>();
      const bonus = { id: 9352 };
      jest.spyOn(bonusService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ bonus });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(bonusService.update).toHaveBeenCalled();
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

    describe('comparePaySlip', () => {
      it('should forward to paySlipService', () => {
        const entity = { id: 6421 };
        const entity2 = { id: 15030 };
        jest.spyOn(paySlipService, 'comparePaySlip');
        comp.comparePaySlip(entity, entity2);
        expect(paySlipService.comparePaySlip).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
