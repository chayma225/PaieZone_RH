import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { UserProfileService } from 'app/entities/user-profile/service/user-profile.service';
import { TimeEntrySource } from 'app/entities/enumerations/time-entry-source.model';
import { TimeEntryStatus } from 'app/entities/enumerations/time-entry-status.model';
import { TimeEntryService } from '../service/time-entry.service';
import { ITimeEntry } from '../time-entry.model';
import { TimeEntryFormGroup, TimeEntryFormService } from './time-entry-form.service';

@Component({
  selector: 'pz-time-entry-update',
  templateUrl: './time-entry-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class TimeEntryUpdateComponent implements OnInit {
  isSaving = false;
  timeEntry: ITimeEntry | null = null;
  timeEntrySourceValues = Object.keys(TimeEntrySource);
  timeEntryStatusValues = Object.keys(TimeEntryStatus);

  employeesSharedCollection: IEmployee[] = [];
  userProfilesSharedCollection: IUserProfile[] = [];

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
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const timeEntry = this.timeEntryFormService.getTimeEntry(this.editForm);
    if (timeEntry.id !== null) {
      this.subscribeToSaveResponse(this.timeEntryService.update(timeEntry));
    } else {
      this.subscribeToSaveResponse(this.timeEntryService.create(timeEntry));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITimeEntry>>): void {
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

  protected updateForm(timeEntry: ITimeEntry): void {
    this.timeEntry = timeEntry;
    this.timeEntryFormService.resetForm(this.editForm, timeEntry);

    this.employeesSharedCollection = this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(
      this.employeesSharedCollection,
      timeEntry.employee,
    );
    this.userProfilesSharedCollection = this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(
      this.userProfilesSharedCollection,
      timeEntry.validatedByUser,
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
      .subscribe((employees: IEmployee[]) => (this.employeesSharedCollection = employees));

    this.userProfileService
      .query()
      .pipe(map((res: HttpResponse<IUserProfile[]>) => res.body ?? []))
      .pipe(
        map((userProfiles: IUserProfile[]) =>
          this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(userProfiles, this.timeEntry?.validatedByUser),
        ),
      )
      .subscribe((userProfiles: IUserProfile[]) => (this.userProfilesSharedCollection = userProfiles));
  }
}
