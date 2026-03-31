import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { IEmployeeHistory } from '../employee-history.model';
import { EmployeeHistoryService } from '../service/employee-history.service';
import { EmployeeHistoryFormGroup, EmployeeHistoryFormService } from './employee-history-form.service';

@Component({
  selector: 'pz-employee-history-update',
  templateUrl: './employee-history-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class EmployeeHistoryUpdateComponent implements OnInit {
  isSaving = false;
  employeeHistory: IEmployeeHistory | null = null;

  employeesSharedCollection: IEmployee[] = [];

  protected employeeHistoryService = inject(EmployeeHistoryService);
  protected employeeHistoryFormService = inject(EmployeeHistoryFormService);
  protected employeeService = inject(EmployeeService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: EmployeeHistoryFormGroup = this.employeeHistoryFormService.createEmployeeHistoryFormGroup();

  compareEmployee = (o1: IEmployee | null, o2: IEmployee | null): boolean => this.employeeService.compareEmployee(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ employeeHistory }) => {
      this.employeeHistory = employeeHistory;
      if (employeeHistory) {
        this.updateForm(employeeHistory);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const employeeHistory = this.employeeHistoryFormService.getEmployeeHistory(this.editForm);
    if (employeeHistory.id !== null) {
      this.subscribeToSaveResponse(this.employeeHistoryService.update(employeeHistory));
    } else {
      this.subscribeToSaveResponse(this.employeeHistoryService.create(employeeHistory));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IEmployeeHistory>>): void {
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

  protected updateForm(employeeHistory: IEmployeeHistory): void {
    this.employeeHistory = employeeHistory;
    this.employeeHistoryFormService.resetForm(this.editForm, employeeHistory);

    this.employeesSharedCollection = this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(
      this.employeesSharedCollection,
      employeeHistory.employee,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.employeeService
      .query()
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .pipe(
        map((employees: IEmployee[]) =>
          this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, this.employeeHistory?.employee),
        ),
      )
      .subscribe((employees: IEmployee[]) => (this.employeesSharedCollection = employees));
  }
}
