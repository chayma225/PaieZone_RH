import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { CompanySubscriptionStatus } from 'app/entities/enumerations/company-subscription-status.model';
import { PlanType } from 'app/entities/enumerations/plan-type.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { ICompanySubscription } from '../company-subscription.model';
import { CompanySubscriptionService } from '../service/company-subscription.service';

import { CompanySubscriptionFormGroup, CompanySubscriptionFormService } from './company-subscription-form.service';

@Component({
  selector: 'pz-company-subscription-update',
  templateUrl: './company-subscription-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule, NgbInputDatepicker],
})
export class CompanySubscriptionUpdate implements OnInit {
  readonly isSaving = signal(false);
  companySubscription: ICompanySubscription | null = null;
  planTypeValues = Object.keys(PlanType);
  companySubscriptionStatusValues = Object.keys(CompanySubscriptionStatus);

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
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const companySubscription = this.companySubscriptionFormService.getCompanySubscription(this.editForm);
    if (companySubscription.id === null) {
      this.subscribeToSaveResponse(this.companySubscriptionService.create(companySubscription));
    } else {
      this.subscribeToSaveResponse(this.companySubscriptionService.update(companySubscription));
    }
  }

  protected subscribeToSaveResponse(result: Observable<ICompanySubscription | null>): void {
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

  protected updateForm(companySubscription: ICompanySubscription): void {
    this.companySubscription = companySubscription;
    this.companySubscriptionFormService.resetForm(this.editForm, companySubscription);
  }
}
