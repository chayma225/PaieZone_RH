import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { ICompanySubscription } from 'app/entities/company-subscription/company-subscription.model';
import { CompanySubscriptionService } from 'app/entities/company-subscription/service/company-subscription.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { ICompany } from '../company.model';
import { CompanyService } from '../service/company.service';

import { CompanyFormGroup, CompanyFormService } from './company-form.service';

@Component({
  selector: 'pz-company-update',
  templateUrl: './company-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule, NgbInputDatepicker],
})
export class CompanyUpdate implements OnInit {
  readonly isSaving = signal(false);
  company: ICompany | null = null;

  companySubscriptionsCollection = signal<ICompanySubscription[]>([]);

  protected companyService = inject(CompanyService);
  protected companyFormService = inject(CompanyFormService);
  protected companySubscriptionService = inject(CompanySubscriptionService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: CompanyFormGroup = this.companyFormService.createCompanyFormGroup();

  compareCompanySubscription = (o1: ICompanySubscription | null, o2: ICompanySubscription | null): boolean =>
    this.companySubscriptionService.compareCompanySubscription(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ company }) => {
      this.company = company;
      if (company) {
        this.updateForm(company);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const company = this.companyFormService.getCompany(this.editForm);
    if (company.id === null) {
      this.subscribeToSaveResponse(this.companyService.create(company));
    } else {
      this.subscribeToSaveResponse(this.companyService.update(company));
    }
  }

  protected subscribeToSaveResponse(result: Observable<ICompany | null>): void {
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

  protected updateForm(company: ICompany): void {
    this.company = company;
    this.companyFormService.resetForm(this.editForm, company);

    this.companySubscriptionsCollection.set(
      this.companySubscriptionService.addCompanySubscriptionToCollectionIfMissing<ICompanySubscription>(
        this.companySubscriptionsCollection(),
        company.companySubscription,
      ),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.companySubscriptionService
      .query({ filter: 'company-is-null' })
      .pipe(map((res: HttpResponse<ICompanySubscription[]>) => res.body ?? []))
      .pipe(
        map((companySubscriptions: ICompanySubscription[]) =>
          this.companySubscriptionService.addCompanySubscriptionToCollectionIfMissing<ICompanySubscription>(
            companySubscriptions,
            this.company?.companySubscription,
          ),
        ),
      )
      .subscribe((companySubscriptions: ICompanySubscription[]) => this.companySubscriptionsCollection.set(companySubscriptions));
  }
}
