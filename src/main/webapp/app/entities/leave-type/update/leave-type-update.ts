import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { LeaveTypeName } from 'app/entities/enumerations/leave-type-name.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { ILeaveType } from '../leave-type.model';
import { LeaveTypeService } from '../service/leave-type.service';

import { LeaveTypeFormGroup, LeaveTypeFormService } from './leave-type-form.service';

@Component({
  selector: 'pz-leave-type-update',
  templateUrl: './leave-type-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class LeaveTypeUpdate implements OnInit {
  readonly isSaving = signal(false);
  leaveType: ILeaveType | null = null;
  leaveTypeNameValues = Object.keys(LeaveTypeName);

  companiesSharedCollection = signal<ICompany[]>([]);

  protected leaveTypeService = inject(LeaveTypeService);
  protected leaveTypeFormService = inject(LeaveTypeFormService);
  protected companyService = inject(CompanyService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: LeaveTypeFormGroup = this.leaveTypeFormService.createLeaveTypeFormGroup();

  compareCompany = (o1: ICompany | null, o2: ICompany | null): boolean => this.companyService.compareCompany(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ leaveType }) => {
      this.leaveType = leaveType;
      if (leaveType) {
        this.updateForm(leaveType);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const leaveType = this.leaveTypeFormService.getLeaveType(this.editForm);
    if (leaveType.id === null) {
      this.subscribeToSaveResponse(this.leaveTypeService.create(leaveType));
    } else {
      this.subscribeToSaveResponse(this.leaveTypeService.update(leaveType));
    }
  }

  protected subscribeToSaveResponse(result: Observable<ILeaveType | null>): void {
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

  protected updateForm(leaveType: ILeaveType): void {
    this.leaveType = leaveType;
    this.leaveTypeFormService.resetForm(this.editForm, leaveType);

    this.companiesSharedCollection.update(companies =>
      this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, leaveType.company),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.companyService
      .query()
      .pipe(map((res: HttpResponse<ICompany[]>) => res.body ?? []))
      .pipe(
        map((companies: ICompany[]) => this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, this.leaveType?.company)),
      )
      .subscribe((companies: ICompany[]) => this.companiesSharedCollection.set(companies));
  }
}
