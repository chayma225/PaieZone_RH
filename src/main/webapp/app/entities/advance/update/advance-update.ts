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
import { AdvanceStatus } from 'app/entities/enumerations/advance-status.model';
import { IPaySlip } from 'app/entities/pay-slip/pay-slip.model';
import { PaySlipService } from 'app/entities/pay-slip/service/pay-slip.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';

import { IAdvance } from '../advance.model';
import { AdvanceService } from '../service/advance.service';

import { AdvanceFormGroup, AdvanceFormService } from './advance-form.service';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { UserProfileService } from 'app/entities/user-profile/service/user-profile.service';

@Component({
  selector: 'pz-advance-update',
  templateUrl: './advance-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule, NgbInputDatepicker],
})
export class AdvanceUpdate implements OnInit {
  readonly isSaving = signal(false);
  advance: IAdvance | null = null;
  advanceStatusValues = Object.keys(AdvanceStatus);

  employeesSharedCollection = signal<IEmployee[]>([]);
  paySlipsSharedCollection = signal<IPaySlip[]>([]);
  userProfilesSharedCollection = signal<IUserProfile[]>([]);

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
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const advance = this.advanceFormService.getAdvance(this.editForm);
    if (advance.id === null) {
      this.subscribeToSaveResponse(this.advanceService.create(advance));
    } else {
      this.subscribeToSaveResponse(this.advanceService.update(advance));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IAdvance | null>): void {
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

  protected updateForm(advance: IAdvance): void {
    this.advance = advance;
    this.advanceFormService.resetForm(this.editForm, advance);

    this.employeesSharedCollection.update(employees =>
      this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, advance.employee),
    );
    this.paySlipsSharedCollection.update(paySlips =>
      this.paySlipService.addPaySlipToCollectionIfMissing<IPaySlip>(paySlips, advance.paySlip),
    );
    this.userProfilesSharedCollection.update(userProfiles =>
      this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(userProfiles, advance.approvedByUser),
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
      .subscribe((employees: IEmployee[]) => this.employeesSharedCollection.set(employees));

    this.paySlipService
      .query()
      .pipe(map((res: HttpResponse<IPaySlip[]>) => res.body ?? []))
      .pipe(map((paySlips: IPaySlip[]) => this.paySlipService.addPaySlipToCollectionIfMissing<IPaySlip>(paySlips, this.advance?.paySlip)))
      .subscribe((paySlips: IPaySlip[]) => this.paySlipsSharedCollection.set(paySlips));

    this.userProfileService
      .query()
      .pipe(map((res: HttpResponse<IUserProfile[]>) => res.body ?? []))
      .pipe(
        map((userProfiles: IUserProfile[]) =>
          this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(userProfiles, this.advance?.approvedByUser),
        ),
      )
      .subscribe((userProfiles: IUserProfile[]) => this.userProfilesSharedCollection.set(userProfiles));
  }
}
