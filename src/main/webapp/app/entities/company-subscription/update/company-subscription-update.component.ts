import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PlanType } from 'app/entities/enumerations/plan-type.model';
import { SubscriptionStatus } from 'app/entities/enumerations/subscription-status.model';
import { ICompanySubscription } from '../company-subscription.model';
import { CompanySubscriptionService } from '../service/company-subscription.service';
import { CompanySubscriptionFormGroup, CompanySubscriptionFormService } from './company-subscription-form.service';

@Component({
  selector: 'pz-company-subscription-update',
  templateUrl: './company-subscription-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class CompanySubscriptionUpdateComponent implements OnInit {
  isSaving = false;
  companySubscription: ICompanySubscription | null = null;
  planTypeValues = Object.keys(PlanType);
  subscriptionStatusValues = Object.keys(SubscriptionStatus);

  protected companySubscriptionService = inject(CompanySubscriptionService);
  protected companySubscriptionFormService = inject(CompanySubscriptionFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: CompanySubscriptionFormGroup = this.companySubscriptionFormService.createCompanySubscriptionFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ companySubscription }) => {
      this.companySubscription = companySubscription;
      if (companySubscription) {
        this.updateForm(companySubscription);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const companySubscription = this.companySubscriptionFormService.getCompanySubscription(this.editForm);
    if (companySubscription.id !== null) {
      this.subscribeToSaveResponse(this.companySubscriptionService.update(companySubscription));
    } else {
      this.subscribeToSaveResponse(this.companySubscriptionService.create(companySubscription));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ICompanySubscription>>): void {
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

  protected updateForm(companySubscription: ICompanySubscription): void {
    this.companySubscription = companySubscription;
    this.companySubscriptionFormService.resetForm(this.editForm, companySubscription);
  }
}
