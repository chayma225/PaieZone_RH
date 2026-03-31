import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ICompanySubscription } from 'app/entities/company-subscription/company-subscription.model';
import { CompanySubscriptionService } from 'app/entities/company-subscription/service/company-subscription.service';
import { ICompany } from '../company.model';
import { CompanyService } from '../service/company.service';
import { CompanyFormGroup, CompanyFormService } from './company-form.service';

@Component({
  selector: 'pz-company-update',
  templateUrl: './company-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class CompanyUpdateComponent implements OnInit {
  isSaving = false;
  company: ICompany | null = null;

  subscriptionsCollection: ICompanySubscription[] = [];

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
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const company = this.companyFormService.getCompany(this.editForm);
    if (company.id !== null) {
      this.subscribeToSaveResponse(this.companyService.update(company));
    } else {
      this.subscribeToSaveResponse(this.companyService.create(company));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ICompany>>): void {
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

  protected updateForm(company: ICompany): void {
    this.company = company;
    this.companyFormService.resetForm(this.editForm, company);

    this.subscriptionsCollection = this.companySubscriptionService.addCompanySubscriptionToCollectionIfMissing<ICompanySubscription>(
      this.subscriptionsCollection,
      company.subscription,
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
            this.company?.subscription,
          ),
        ),
      )
      .subscribe((companySubscriptions: ICompanySubscription[]) => (this.subscriptionsCollection = companySubscriptions));
  }
}
