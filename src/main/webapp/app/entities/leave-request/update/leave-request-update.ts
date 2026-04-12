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
import { LeaveStatus } from 'app/entities/enumerations/leave-status.model';
import { ILeaveType } from 'app/entities/leave-type/leave-type.model';
import { LeaveTypeService } from 'app/entities/leave-type/service/leave-type.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';

import { ILeaveRequest } from '../leave-request.model';
import { LeaveRequestService } from '../service/leave-request.service';

import { LeaveRequestFormGroup, LeaveRequestFormService } from './leave-request-form.service';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { UserProfileService } from 'app/entities/user-profile/service/user-profile.service';

@Component({
  selector: 'pz-leave-request-update',
  templateUrl: './leave-request-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule, NgbInputDatepicker],
})
export class LeaveRequestUpdate implements OnInit {
  readonly isSaving = signal(false);
  leaveRequest: ILeaveRequest | null = null;
  leaveStatusValues = Object.keys(LeaveStatus);

  employeesSharedCollection = signal<IEmployee[]>([]);
  leaveTypesSharedCollection = signal<ILeaveType[]>([]);
  userProfilesSharedCollection = signal<IUserProfile[]>([]);

  protected leaveRequestService = inject(LeaveRequestService);
  protected leaveRequestFormService = inject(LeaveRequestFormService);
  protected employeeService = inject(EmployeeService);
  protected leaveTypeService = inject(LeaveTypeService);
  protected userProfileService = inject(UserProfileService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: LeaveRequestFormGroup = this.leaveRequestFormService.createLeaveRequestFormGroup();

  compareEmployee = (o1: IEmployee | null, o2: IEmployee | null): boolean => this.employeeService.compareEmployee(o1, o2);

  compareLeaveType = (o1: ILeaveType | null, o2: ILeaveType | null): boolean => this.leaveTypeService.compareLeaveType(o1, o2);

  compareUserProfile = (o1: IUserProfile | null, o2: IUserProfile | null): boolean => this.userProfileService.compareUserProfile(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ leaveRequest }) => {
      this.leaveRequest = leaveRequest;
      if (leaveRequest) {
        this.updateForm(leaveRequest);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const leaveRequest = this.leaveRequestFormService.getLeaveRequest(this.editForm);
    if (leaveRequest.id === null) {
      this.subscribeToSaveResponse(this.leaveRequestService.create(leaveRequest));
    } else {
      this.subscribeToSaveResponse(this.leaveRequestService.update(leaveRequest));
    }
  }

  protected subscribeToSaveResponse(result: Observable<ILeaveRequest | null>): void {
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

  protected updateForm(leaveRequest: ILeaveRequest): void {
    this.leaveRequest = leaveRequest;
    this.leaveRequestFormService.resetForm(this.editForm, leaveRequest);

    this.employeesSharedCollection.update(employees =>
      this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, leaveRequest.employee),
    );
    this.leaveTypesSharedCollection.update(leaveTypes =>
      this.leaveTypeService.addLeaveTypeToCollectionIfMissing<ILeaveType>(leaveTypes, leaveRequest.leaveType),
    );
    this.userProfilesSharedCollection.update(userProfiles =>
      this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(userProfiles, leaveRequest.approvedBy),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.employeeService
      .query()
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .pipe(
        map((employees: IEmployee[]) =>
          this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, this.leaveRequest?.employee),
        ),
      )
      .subscribe((employees: IEmployee[]) => this.employeesSharedCollection.set(employees));

    this.leaveTypeService
      .query()
      .pipe(map((res: HttpResponse<ILeaveType[]>) => res.body ?? []))
      .pipe(
        map((leaveTypes: ILeaveType[]) =>
          this.leaveTypeService.addLeaveTypeToCollectionIfMissing<ILeaveType>(leaveTypes, this.leaveRequest?.leaveType),
        ),
      )
      .subscribe((leaveTypes: ILeaveType[]) => this.leaveTypesSharedCollection.set(leaveTypes));

    this.userProfileService
      .query()
      .pipe(map((res: HttpResponse<IUserProfile[]>) => res.body ?? []))
      .pipe(
        map((userProfiles: IUserProfile[]) =>
          this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(userProfiles, this.leaveRequest?.approvedBy),
        ),
      )
      .subscribe((userProfiles: IUserProfile[]) => this.userProfilesSharedCollection.set(userProfiles));
  }
}
