import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { UserProfileService } from 'app/entities/user-profile/service/user-profile.service';
import { PayrollStatus } from 'app/entities/enumerations/payroll-status.model';
import { PayrollPeriodService } from '../service/payroll-period.service';
import { IPayrollPeriod } from '../payroll-period.model';
import { PayrollPeriodFormGroup, PayrollPeriodFormService } from './payroll-period-form.service';

@Component({
  selector: 'pz-payroll-period-update',
  templateUrl: './payroll-period-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class PayrollPeriodUpdateComponent implements OnInit {
  isSaving = false;
  payrollPeriod: IPayrollPeriod | null = null;
  payrollStatusValues = Object.keys(PayrollStatus);

  companiesSharedCollection: ICompany[] = [];
  userProfilesSharedCollection: IUserProfile[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected payrollPeriodService = inject(PayrollPeriodService);
  protected payrollPeriodFormService = inject(PayrollPeriodFormService);
  protected companyService = inject(CompanyService);
  protected userProfileService = inject(UserProfileService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: PayrollPeriodFormGroup = this.payrollPeriodFormService.createPayrollPeriodFormGroup();

  compareCompany = (o1: ICompany | null, o2: ICompany | null): boolean => this.companyService.compareCompany(o1, o2);

  compareUserProfile = (o1: IUserProfile | null, o2: IUserProfile | null): boolean => this.userProfileService.compareUserProfile(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ payrollPeriod }) => {
      this.payrollPeriod = payrollPeriod;
      if (payrollPeriod) {
        this.updateForm(payrollPeriod);
      }

      this.loadRelationshipsOptions();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertError>('paieZoneRhApp.error', { ...err, key: `error.file.${err.key}` })),
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const payrollPeriod = this.payrollPeriodFormService.getPayrollPeriod(this.editForm);
    if (payrollPeriod.id !== null) {
      this.subscribeToSaveResponse(this.payrollPeriodService.update(payrollPeriod));
    } else {
      this.subscribeToSaveResponse(this.payrollPeriodService.create(payrollPeriod));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPayrollPeriod>>): void {
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

  protected updateForm(payrollPeriod: IPayrollPeriod): void {
    this.payrollPeriod = payrollPeriod;
    this.payrollPeriodFormService.resetForm(this.editForm, payrollPeriod);

    this.companiesSharedCollection = this.companyService.addCompanyToCollectionIfMissing<ICompany>(
      this.companiesSharedCollection,
      payrollPeriod.company,
    );
    this.userProfilesSharedCollection = this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(
      this.userProfilesSharedCollection,
      payrollPeriod.createdBy,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.companyService
      .query()
      .pipe(map((res: HttpResponse<ICompany[]>) => res.body ?? []))
      .pipe(
        map((companies: ICompany[]) =>
          this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, this.payrollPeriod?.company),
        ),
      )
      .subscribe((companies: ICompany[]) => (this.companiesSharedCollection = companies));

    this.userProfileService
      .query()
      .pipe(map((res: HttpResponse<IUserProfile[]>) => res.body ?? []))
      .pipe(
        map((userProfiles: IUserProfile[]) =>
          this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(userProfiles, this.payrollPeriod?.createdBy),
        ),
      )
      .subscribe((userProfiles: IUserProfile[]) => (this.userProfilesSharedCollection = userProfiles));
  }
}
