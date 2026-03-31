import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { IPayrollPeriod } from 'app/entities/payroll-period/payroll-period.model';
import { PayrollPeriodService } from 'app/entities/payroll-period/service/payroll-period.service';
import { IContract } from 'app/entities/contract/contract.model';
import { ContractService } from 'app/entities/contract/service/contract.service';
import { PayrollStatus } from 'app/entities/enumerations/payroll-status.model';
import { PaySlipService } from '../service/pay-slip.service';
import { IPaySlip } from '../pay-slip.model';
import { PaySlipFormGroup, PaySlipFormService } from './pay-slip-form.service';

@Component({
  selector: 'pz-pay-slip-update',
  templateUrl: './pay-slip-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class PaySlipUpdateComponent implements OnInit {
  isSaving = false;
  paySlip: IPaySlip | null = null;
  payrollStatusValues = Object.keys(PayrollStatus);

  employeesSharedCollection: IEmployee[] = [];
  payrollPeriodsSharedCollection: IPayrollPeriod[] = [];
  contractsSharedCollection: IContract[] = [];

  protected paySlipService = inject(PaySlipService);
  protected paySlipFormService = inject(PaySlipFormService);
  protected employeeService = inject(EmployeeService);
  protected payrollPeriodService = inject(PayrollPeriodService);
  protected contractService = inject(ContractService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: PaySlipFormGroup = this.paySlipFormService.createPaySlipFormGroup();

  compareEmployee = (o1: IEmployee | null, o2: IEmployee | null): boolean => this.employeeService.compareEmployee(o1, o2);

  comparePayrollPeriod = (o1: IPayrollPeriod | null, o2: IPayrollPeriod | null): boolean =>
    this.payrollPeriodService.comparePayrollPeriod(o1, o2);

  compareContract = (o1: IContract | null, o2: IContract | null): boolean => this.contractService.compareContract(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ paySlip }) => {
      this.paySlip = paySlip;
      if (paySlip) {
        this.updateForm(paySlip);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const paySlip = this.paySlipFormService.getPaySlip(this.editForm);
    if (paySlip.id !== null) {
      this.subscribeToSaveResponse(this.paySlipService.update(paySlip));
    } else {
      this.subscribeToSaveResponse(this.paySlipService.create(paySlip));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPaySlip>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(paySlip: IPaySlip): void {
    this.paySlip = paySlip;
    this.paySlipFormService.resetForm(this.editForm, paySlip);

    this.employeesSharedCollection = this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(
      this.employeesSharedCollection,
      paySlip.employee,
    );
    this.payrollPeriodsSharedCollection = this.payrollPeriodService.addPayrollPeriodToCollectionIfMissing<IPayrollPeriod>(
      this.payrollPeriodsSharedCollection,
      paySlip.payrollPeriod,
    );
    this.contractsSharedCollection = this.contractService.addContractToCollectionIfMissing<IContract>(
      this.contractsSharedCollection,
      paySlip.contract,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.employeeService
      .query()
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .pipe(
        map((employees: IEmployee[]) =>
          this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, this.paySlip?.employee),
        ),
      )
      .subscribe((employees: IEmployee[]) => (this.employeesSharedCollection = employees));

    this.payrollPeriodService
      .query()
      .pipe(map((res: HttpResponse<IPayrollPeriod[]>) => res.body ?? []))
      .pipe(
        map((payrollPeriods: IPayrollPeriod[]) =>
          this.payrollPeriodService.addPayrollPeriodToCollectionIfMissing<IPayrollPeriod>(payrollPeriods, this.paySlip?.payrollPeriod),
        ),
      )
      .subscribe((payrollPeriods: IPayrollPeriod[]) => (this.payrollPeriodsSharedCollection = payrollPeriods));

    this.contractService
      .query()
      .pipe(map((res: HttpResponse<IContract[]>) => res.body ?? []))
      .pipe(
        map((contracts: IContract[]) =>
          this.contractService.addContractToCollectionIfMissing<IContract>(contracts, this.paySlip?.contract),
        ),
      )
      .subscribe((contracts: IContract[]) => (this.contractsSharedCollection = contracts));
  }
}
