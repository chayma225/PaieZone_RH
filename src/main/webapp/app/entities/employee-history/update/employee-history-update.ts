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
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IEmployeeHistory } from '../employee-history.model';
import { EmployeeHistoryService } from '../service/employee-history.service';

import { EmployeeHistoryFormGroup, EmployeeHistoryFormService } from './employee-history-form.service';

@Component({
  selector: 'pz-employee-history-update',
  templateUrl: './employee-history-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class EmployeeHistoryUpdate implements OnInit {
  readonly isSaving = signal(false);
  employeeHistory: IEmployeeHistory | null = null;

  employeesSharedCollection = signal<IEmployee[]>([]);

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
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const employeeHistory = this.employeeHistoryFormService.getEmployeeHistory(this.editForm);
    if (employeeHistory.id === null) {
      this.subscribeToSaveResponse(this.employeeHistoryService.create(employeeHistory));
    } else {
      this.subscribeToSaveResponse(this.employeeHistoryService.update(employeeHistory));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IEmployeeHistory | null>): void {
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

  protected updateForm(employeeHistory: IEmployeeHistory): void {
    this.employeeHistory = employeeHistory;
    this.employeeHistoryFormService.resetForm(this.editForm, employeeHistory);

    this.employeesSharedCollection.update(employees =>
      this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, employeeHistory.employee),
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
      .subscribe((employees: IEmployee[]) => this.employeesSharedCollection.set(employees));
  }
}
