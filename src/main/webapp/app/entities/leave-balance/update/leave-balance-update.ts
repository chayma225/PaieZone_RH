import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { ILeaveType } from 'app/entities/leave-type/leave-type.model';
import { LeaveTypeService } from 'app/entities/leave-type/service/leave-type.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { ILeaveBalance } from '../leave-balance.model';
import { LeaveBalanceService } from '../service/leave-balance.service';

import { LeaveBalanceFormGroup, LeaveBalanceFormService } from './leave-balance-form.service';

@Component({
  selector: 'pz-leave-balance-update',
  templateUrl: './leave-balance-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class LeaveBalanceUpdate implements OnInit {
  readonly isSaving = signal(false);
  leaveBalance: ILeaveBalance | null = null;

  employeesSharedCollection = signal<IEmployee[]>([]);
  leaveTypesSharedCollection = signal<ILeaveType[]>([]);

  protected leaveBalanceService = inject(LeaveBalanceService);
  protected leaveBalanceFormService = inject(LeaveBalanceFormService);
  protected employeeService = inject(EmployeeService);
  protected leaveTypeService = inject(LeaveTypeService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: LeaveBalanceFormGroup = this.leaveBalanceFormService.createLeaveBalanceFormGroup();

  compareEmployee = (o1: IEmployee | null, o2: IEmployee | null): boolean => this.employeeService.compareEmployee(o1, o2);

  compareLeaveType = (o1: ILeaveType | null, o2: ILeaveType | null): boolean => this.leaveTypeService.compareLeaveType(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ leaveBalance }) => {
      this.leaveBalance = leaveBalance;
      if (leaveBalance) {
        this.updateForm(leaveBalance);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const leaveBalance = this.leaveBalanceFormService.getLeaveBalance(this.editForm);
    if (leaveBalance.id === null) {
      this.subscribeToSaveResponse(this.leaveBalanceService.create(leaveBalance));
    } else {
      this.subscribeToSaveResponse(this.leaveBalanceService.update(leaveBalance));
    }
  }

  protected subscribeToSaveResponse(result: Observable<ILeaveBalance | null>): void {
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
    this.isSaving.set(false);
  }

  protected updateForm(leaveBalance: ILeaveBalance): void {
    this.leaveBalance = leaveBalance;
    this.leaveBalanceFormService.resetForm(this.editForm, leaveBalance);

    this.employeesSharedCollection.update(employees =>
      this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, leaveBalance.employee),
    );
    this.leaveTypesSharedCollection.update(leaveTypes =>
      this.leaveTypeService.addLeaveTypeToCollectionIfMissing<ILeaveType>(leaveTypes, leaveBalance.leaveType),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.employeeService
      .query()
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .pipe(
        map((employees: IEmployee[]) =>
          this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, this.leaveBalance?.employee),
        ),
      )
      .subscribe((employees: IEmployee[]) => this.employeesSharedCollection.set(employees));

    this.leaveTypeService
      .query()
      .pipe(map((res: HttpResponse<ILeaveType[]>) => res.body ?? []))
      .pipe(
        map((leaveTypes: ILeaveType[]) =>
          this.leaveTypeService.addLeaveTypeToCollectionIfMissing<ILeaveType>(leaveTypes, this.leaveBalance?.leaveType),
        ),
      )
      .subscribe((leaveTypes: ILeaveType[]) => this.leaveTypesSharedCollection.set(leaveTypes));
  }
}
