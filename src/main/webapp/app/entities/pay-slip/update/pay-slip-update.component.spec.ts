import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { IPayrollPeriod } from 'app/entities/payroll-period/payroll-period.model';
import { PayrollPeriodService } from 'app/entities/payroll-period/service/payroll-period.service';
import { IContract } from 'app/entities/contract/contract.model';
import { ContractService } from 'app/entities/contract/service/contract.service';
import { IPaySlip } from '../pay-slip.model';
import { PaySlipService } from '../service/pay-slip.service';
import { PaySlipFormService } from './pay-slip-form.service';

import { PaySlipUpdateComponent } from './pay-slip-update.component';

describe('PaySlip Management Update Component', () => {
  let comp: PaySlipUpdateComponent;
  let fixture: ComponentFixture<PaySlipUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let paySlipFormService: PaySlipFormService;
  let paySlipService: PaySlipService;
  let employeeService: EmployeeService;
  let payrollPeriodService: PayrollPeriodService;
  let contractService: ContractService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PaySlipUpdateComponent],
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
      .overrideTemplate(PaySlipUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PaySlipUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    paySlipFormService = TestBed.inject(PaySlipFormService);
    paySlipService = TestBed.inject(PaySlipService);
    employeeService = TestBed.inject(EmployeeService);
    payrollPeriodService = TestBed.inject(PayrollPeriodService);
    contractService = TestBed.inject(ContractService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Employee query and add missing value', () => {
      const paySlip: IPaySlip = { id: 15030 };
      const employee: IEmployee = { id: 1749 };
      paySlip.employee = employee;

      const employeeCollection: IEmployee[] = [{ id: 1749 }];
      jest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      jest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ paySlip });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(expect.objectContaining),
      );
      expect(comp.employeesSharedCollection).toEqual(expectedCollection);
    });

    it('should call PayrollPeriod query and add missing value', () => {
      const paySlip: IPaySlip = { id: 15030 };
      const payrollPeriod: IPayrollPeriod = { id: 28456 };
      paySlip.payrollPeriod = payrollPeriod;

      const payrollPeriodCollection: IPayrollPeriod[] = [{ id: 28456 }];
      jest.spyOn(payrollPeriodService, 'query').mockReturnValue(of(new HttpResponse({ body: payrollPeriodCollection })));
      const additionalPayrollPeriods = [payrollPeriod];
      const expectedCollection: IPayrollPeriod[] = [...additionalPayrollPeriods, ...payrollPeriodCollection];
      jest.spyOn(payrollPeriodService, 'addPayrollPeriodToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ paySlip });
      comp.ngOnInit();

      expect(payrollPeriodService.query).toHaveBeenCalled();
      expect(payrollPeriodService.addPayrollPeriodToCollectionIfMissing).toHaveBeenCalledWith(
        payrollPeriodCollection,
        ...additionalPayrollPeriods.map(expect.objectContaining),
      );
      expect(comp.payrollPeriodsSharedCollection).toEqual(expectedCollection);
    });

    it('should call Contract query and add missing value', () => {
      const paySlip: IPaySlip = { id: 15030 };
      const contract: IContract = { id: 26216 };
      paySlip.contract = contract;

      const contractCollection: IContract[] = [{ id: 26216 }];
      jest.spyOn(contractService, 'query').mockReturnValue(of(new HttpResponse({ body: contractCollection })));
      const additionalContracts = [contract];
      const expectedCollection: IContract[] = [...additionalContracts, ...contractCollection];
      jest.spyOn(contractService, 'addContractToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ paySlip });
      comp.ngOnInit();

      expect(contractService.query).toHaveBeenCalled();
      expect(contractService.addContractToCollectionIfMissing).toHaveBeenCalledWith(
        contractCollection,
        ...additionalContracts.map(expect.objectContaining),
      );
      expect(comp.contractsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const paySlip: IPaySlip = { id: 15030 };
      const employee: IEmployee = { id: 1749 };
      paySlip.employee = employee;
      const payrollPeriod: IPayrollPeriod = { id: 28456 };
      paySlip.payrollPeriod = payrollPeriod;
      const contract: IContract = { id: 26216 };
      paySlip.contract = contract;

      activatedRoute.data = of({ paySlip });
      comp.ngOnInit();

      expect(comp.employeesSharedCollection).toContainEqual(employee);
      expect(comp.payrollPeriodsSharedCollection).toContainEqual(payrollPeriod);
      expect(comp.contractsSharedCollection).toContainEqual(contract);
      expect(comp.paySlip).toEqual(paySlip);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPaySlip>>();
      const paySlip = { id: 6421 };
      jest.spyOn(paySlipFormService, 'getPaySlip').mockReturnValue(paySlip);
      jest.spyOn(paySlipService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ paySlip });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: paySlip }));
      saveSubject.complete();

      // THEN
      expect(paySlipFormService.getPaySlip).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(paySlipService.update).toHaveBeenCalledWith(expect.objectContaining(paySlip));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPaySlip>>();
      const paySlip = { id: 6421 };
      jest.spyOn(paySlipFormService, 'getPaySlip').mockReturnValue({ id: null });
      jest.spyOn(paySlipService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ paySlip: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: paySlip }));
      saveSubject.complete();

      // THEN
      expect(paySlipFormService.getPaySlip).toHaveBeenCalled();
      expect(paySlipService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPaySlip>>();
      const paySlip = { id: 6421 };
      jest.spyOn(paySlipService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ paySlip });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(paySlipService.update).toHaveBeenCalled();
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

    describe('comparePayrollPeriod', () => {
      it('should forward to payrollPeriodService', () => {
        const entity = { id: 28456 };
        const entity2 = { id: 9891 };
        jest.spyOn(payrollPeriodService, 'comparePayrollPeriod');
        comp.comparePayrollPeriod(entity, entity2);
        expect(payrollPeriodService.comparePayrollPeriod).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareContract', () => {
      it('should forward to contractService', () => {
        const entity = { id: 26216 };
        const entity2 = { id: 14870 };
        jest.spyOn(contractService, 'compareContract');
        comp.compareContract(entity, entity2);
        expect(contractService.compareContract).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
