import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { IPaySlip } from 'app/entities/pay-slip/pay-slip.model';
import { PaySlipService } from 'app/entities/pay-slip/service/pay-slip.service';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { UserProfileService } from 'app/entities/user-profile/service/user-profile.service';
import { AdvanceStatus } from 'app/entities/enumerations/advance-status.model';
import { AdvanceService } from '../service/advance.service';
import { IAdvance } from '../advance.model';
import { AdvanceFormGroup, AdvanceFormService } from './advance-form.service';

@Component({
  selector: 'pz-advance-update',
  templateUrl: './advance-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class AdvanceUpdateComponent implements OnInit {
  isSaving = false;
  advance: IAdvance | null = null;
  advanceStatusValues = Object.keys(AdvanceStatus);

  employeesSharedCollection: IEmployee[] = [];
  paySlipsSharedCollection: IPaySlip[] = [];
  userProfilesSharedCollection: IUserProfile[] = [];

  protected advanceService = inject(AdvanceService);
  protected advanceFormService = inject(AdvanceFormService);
  protected employeeService = inject(EmployeeService);
  protected paySlipService = inject(PaySlipService);
  protected userProfileService = inject(UserProfileService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: AdvanceFormGroup = this.advanceFormService.createAdvanceFormGroup();

  compareEmployee = (o1: IEmployee | null, o2: IEmployee | null): boolean => this.employeeService.compareEmployee(o1, o2);

  comparePaySlip = (o1: IPaySlip | null, o2: IPaySlip | null): boolean => this.paySlipService.comparePaySlip(o1, o2);

  compareUserProfile = (o1: IUserProfile | null, o2: IUserProfile | null): boolean => this.userProfileService.compareUserProfile(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ advance }) => {
      this.advance = advance;
      if (advance) {
        this.updateForm(advance);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const advance = this.advanceFormService.getAdvance(this.editForm);
    if (advance.id !== null) {
      this.subscribeToSaveResponse(this.advanceService.update(advance));
    } else {
      this.subscribeToSaveResponse(this.advanceService.create(advance));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAdvance>>): void {
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

  protected updateForm(advance: IAdvance): void {
    this.advance = advance;
    this.advanceFormService.resetForm(this.editForm, advance);

    this.employeesSharedCollection = this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(
      this.employeesSharedCollection,
      advance.employee,
    );
    this.paySlipsSharedCollection = this.paySlipService.addPaySlipToCollectionIfMissing<IPaySlip>(
      this.paySlipsSharedCollection,
      advance.paySlip,
    );
    this.userProfilesSharedCollection = this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(
      this.userProfilesSharedCollection,
      advance.approvedByUser,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.employeeService
      .query()
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .pipe(
        map((employees: IEmployee[]) =>
          this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, this.advance?.employee),
        ),
      )
      .subscribe((employees: IEmployee[]) => (this.employeesSharedCollection = employees));

    this.paySlipService
      .query()
      .pipe(map((res: HttpResponse<IPaySlip[]>) => res.body ?? []))
      .pipe(map((paySlips: IPaySlip[]) => this.paySlipService.addPaySlipToCollectionIfMissing<IPaySlip>(paySlips, this.advance?.paySlip)))
      .subscribe((paySlips: IPaySlip[]) => (this.paySlipsSharedCollection = paySlips));

    this.userProfileService
      .query()
      .pipe(map((res: HttpResponse<IUserProfile[]>) => res.body ?? []))
      .pipe(
        map((userProfiles: IUserProfile[]) =>
          this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(userProfiles, this.advance?.approvedByUser),
        ),
      )
      .subscribe((userProfiles: IUserProfile[]) => (this.userProfilesSharedCollection = userProfiles));
  }
}
