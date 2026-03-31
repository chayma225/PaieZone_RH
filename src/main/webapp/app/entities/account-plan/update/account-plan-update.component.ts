import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { IAccountPlan } from '../account-plan.model';
import { AccountPlanService } from '../service/account-plan.service';
import { AccountPlanFormGroup, AccountPlanFormService } from './account-plan-form.service';

@Component({
  selector: 'pz-account-plan-update',
  templateUrl: './account-plan-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class AccountPlanUpdateComponent implements OnInit {
  isSaving = false;
  accountPlan: IAccountPlan | null = null;

  companiesSharedCollection: ICompany[] = [];

  protected accountPlanService = inject(AccountPlanService);
  protected accountPlanFormService = inject(AccountPlanFormService);
  protected companyService = inject(CompanyService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: AccountPlanFormGroup = this.accountPlanFormService.createAccountPlanFormGroup();

  compareCompany = (o1: ICompany | null, o2: ICompany | null): boolean => this.companyService.compareCompany(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ accountPlan }) => {
      this.accountPlan = accountPlan;
      if (accountPlan) {
        this.updateForm(accountPlan);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const accountPlan = this.accountPlanFormService.getAccountPlan(this.editForm);
    if (accountPlan.id !== null) {
      this.subscribeToSaveResponse(this.accountPlanService.update(accountPlan));
    } else {
      this.subscribeToSaveResponse(this.accountPlanService.create(accountPlan));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAccountPlan>>): void {
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

  protected updateForm(accountPlan: IAccountPlan): void {
    this.accountPlan = accountPlan;
    this.accountPlanFormService.resetForm(this.editForm, accountPlan);

    this.companiesSharedCollection = this.companyService.addCompanyToCollectionIfMissing<ICompany>(
      this.companiesSharedCollection,
      accountPlan.company,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.companyService
      .query()
      .pipe(map((res: HttpResponse<ICompany[]>) => res.body ?? []))
      .pipe(
        map((companies: ICompany[]) => this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, this.accountPlan?.company)),
      )
      .subscribe((companies: ICompany[]) => (this.companiesSharedCollection = companies));
  }
}
