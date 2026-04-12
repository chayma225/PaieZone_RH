import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { TimeEntrySource } from 'app/entities/enumerations/time-entry-source.model';
import { UserProfileService } from 'app/entities/user-profile/service/user-profile.service';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';

import { TimeEntryService } from '../service/time-entry.service';
import { ITimeEntry } from '../time-entry.model';

import { TimeEntryFormGroup, TimeEntryFormService } from './time-entry-form.service';
import { TimeEntryStatus } from 'app/entities/enumerations/time-entry-status.model';

@Component({
  selector: 'pz-time-entry-update',
  templateUrl: './time-entry-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule, NgbInputDatepicker],
})
export class TimeEntryUpdate implements OnInit {
  readonly isSaving = signal(false);
  timeEntry: ITimeEntry | null = null;
  timeEntrySourceValues = Object.keys(TimeEntrySource);
  timeEntryStatusValues = Object.keys(TimeEntryStatus);

  employeesSharedCollection = signal<IEmployee[]>([]);
  userProfilesSharedCollection = signal<IUserProfile[]>([]);

  protected timeEntryService = inject(TimeEntryService);
  protected timeEntryFormService = inject(TimeEntryFormService);
  protected employeeService = inject(EmployeeService);
  protected userProfileService = inject(UserProfileService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: TimeEntryFormGroup = this.timeEntryFormService.createTimeEntryFormGroup();

  compareEmployee = (o1: IEmployee | null, o2: IEmployee | null): boolean => this.employeeService.compareEmployee(o1, o2);

  compareUserProfile = (o1: IUserProfile | null, o2: IUserProfile | null): boolean => this.userProfileService.compareUserProfile(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ timeEntry }) => {
      this.timeEntry = timeEntry;
      if (timeEntry) {
        this.updateForm(timeEntry);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const timeEntry = this.timeEntryFormService.getTimeEntry(this.editForm);
    if (timeEntry.id === null) {
      this.subscribeToSaveResponse(this.timeEntryService.create(timeEntry));
    } else {
      this.subscribeToSaveResponse(this.timeEntryService.update(timeEntry));
    }
  }

  protected subscribeToSaveResponse(result: Observable<ITimeEntry | null>): void {
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

  protected updateForm(timeEntry: ITimeEntry): void {
    this.timeEntry = timeEntry;
    this.timeEntryFormService.resetForm(this.editForm, timeEntry);

    this.employeesSharedCollection.update(employees =>
      this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, timeEntry.employee),
    );
    this.userProfilesSharedCollection.update(userProfiles =>
      this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(userProfiles, timeEntry.validatedByUser),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.employeeService
      .query()
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .pipe(
        map((employees: IEmployee[]) =>
          this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, this.timeEntry?.employee),
        ),
      )
      .subscribe((employees: IEmployee[]) => this.employeesSharedCollection.set(employees));

    this.userProfileService
      .query()
      .pipe(map((res: HttpResponse<IUserProfile[]>) => res.body ?? []))
      .pipe(
        map((userProfiles: IUserProfile[]) =>
          this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(userProfiles, this.timeEntry?.validatedByUser),
        ),
      )
      .subscribe((userProfiles: IUserProfile[]) => this.userProfilesSharedCollection.set(userProfiles));
  }
}
