import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { LeaveTypeName } from 'app/entities/enumerations/leave-type-name.model';
import { LeaveTypeService } from '../service/leave-type.service';
import { ILeaveType } from '../leave-type.model';
import { LeaveTypeFormGroup, LeaveTypeFormService } from './leave-type-form.service';

@Component({
  selector: 'pz-leave-type-update',
  templateUrl: './leave-type-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class LeaveTypeUpdateComponent implements OnInit {
  isSaving = false;
  leaveType: ILeaveType | null = null;
  leaveTypeNameValues = Object.keys(LeaveTypeName);

  companiesSharedCollection: ICompany[] = [];

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
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const leaveType = this.leaveTypeFormService.getLeaveType(this.editForm);
    if (leaveType.id !== null) {
      this.subscribeToSaveResponse(this.leaveTypeService.update(leaveType));
    } else {
      this.subscribeToSaveResponse(this.leaveTypeService.create(leaveType));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ILeaveType>>): void {
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

  protected updateForm(leaveType: ILeaveType): void {
    this.leaveType = leaveType;
    this.leaveTypeFormService.resetForm(this.editForm, leaveType);

    this.companiesSharedCollection = this.companyService.addCompanyToCollectionIfMissing<ICompany>(
      this.companiesSharedCollection,
      leaveType.company,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.companyService
      .query()
      .pipe(map((res: HttpResponse<ICompany[]>) => res.body ?? []))
      .pipe(
        map((companies: ICompany[]) => this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, this.leaveType?.company)),
      )
      .subscribe((companies: ICompany[]) => (this.companiesSharedCollection = companies));
  }
}
