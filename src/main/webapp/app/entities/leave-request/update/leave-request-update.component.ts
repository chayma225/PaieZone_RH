import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { ILeaveType } from 'app/entities/leave-type/leave-type.model';
import { LeaveTypeService } from 'app/entities/leave-type/service/leave-type.service';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { UserProfileService } from 'app/entities/user-profile/service/user-profile.service';
import { LeaveStatus } from 'app/entities/enumerations/leave-status.model';
import { LeaveRequestService } from '../service/leave-request.service';
import { ILeaveRequest } from '../leave-request.model';
import { LeaveRequestFormGroup, LeaveRequestFormService } from './leave-request-form.service';

@Component({
  selector: 'pz-leave-request-update',
  templateUrl: './leave-request-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class LeaveRequestUpdateComponent implements OnInit {
  isSaving = false;
  leaveRequest: ILeaveRequest | null = null;
  leaveStatusValues = Object.keys(LeaveStatus);

  employeesSharedCollection: IEmployee[] = [];
  leaveTypesSharedCollection: ILeaveType[] = [];
  userProfilesSharedCollection: IUserProfile[] = [];

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
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const leaveRequest = this.leaveRequestFormService.getLeaveRequest(this.editForm);
    if (leaveRequest.id !== null) {
      this.subscribeToSaveResponse(this.leaveRequestService.update(leaveRequest));
    } else {
      this.subscribeToSaveResponse(this.leaveRequestService.create(leaveRequest));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ILeaveRequest>>): void {
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

  protected updateForm(leaveRequest: ILeaveRequest): void {
    this.leaveRequest = leaveRequest;
    this.leaveRequestFormService.resetForm(this.editForm, leaveRequest);

    this.employeesSharedCollection = this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(
      this.employeesSharedCollection,
      leaveRequest.employee,
    );
    this.leaveTypesSharedCollection = this.leaveTypeService.addLeaveTypeToCollectionIfMissing<ILeaveType>(
      this.leaveTypesSharedCollection,
      leaveRequest.leaveType,
    );
    this.userProfilesSharedCollection = this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(
      this.userProfilesSharedCollection,
      leaveRequest.approvedBy,
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
      .subscribe((employees: IEmployee[]) => (this.employeesSharedCollection = employees));

    this.leaveTypeService
      .query()
      .pipe(map((res: HttpResponse<ILeaveType[]>) => res.body ?? []))
      .pipe(
        map((leaveTypes: ILeaveType[]) =>
          this.leaveTypeService.addLeaveTypeToCollectionIfMissing<ILeaveType>(leaveTypes, this.leaveRequest?.leaveType),
        ),
      )
      .subscribe((leaveTypes: ILeaveType[]) => (this.leaveTypesSharedCollection = leaveTypes));

    this.userProfileService
      .query()
      .pipe(map((res: HttpResponse<IUserProfile[]>) => res.body ?? []))
      .pipe(
        map((userProfiles: IUserProfile[]) =>
          this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(userProfiles, this.leaveRequest?.approvedBy),
        ),
      )
      .subscribe((userProfiles: IUserProfile[]) => (this.userProfilesSharedCollection = userProfiles));
  }
}
