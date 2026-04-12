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
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IAccountPlan } from '../account-plan.model';
import { AccountPlanService } from '../service/account-plan.service';

import { AccountPlanFormGroup, AccountPlanFormService } from './account-plan-form.service';

@Component({
  selector: 'pz-account-plan-update',
  templateUrl: './account-plan-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class AccountPlanUpdate implements OnInit {
  readonly isSaving = signal(false);
  accountPlan: IAccountPlan | null = null;

  companiesSharedCollection = signal<ICompany[]>([]);

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
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const accountPlan = this.accountPlanFormService.getAccountPlan(this.editForm);
    if (accountPlan.id === null) {
      this.subscribeToSaveResponse(this.accountPlanService.create(accountPlan));
    } else {
      this.subscribeToSaveResponse(this.accountPlanService.update(accountPlan));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IAccountPlan | null>): void {
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

  protected updateForm(accountPlan: IAccountPlan): void {
    this.accountPlan = accountPlan;
    this.accountPlanFormService.resetForm(this.editForm, accountPlan);

    this.companiesSharedCollection.update(companies =>
      this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, accountPlan.company),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.companyService
      .query()
      .pipe(map((res: HttpResponse<ICompany[]>) => res.body ?? []))
      .pipe(
        map((companies: ICompany[]) => this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, this.accountPlan?.company)),
      )
      .subscribe((companies: ICompany[]) => this.companiesSharedCollection.set(companies));
  }
}
