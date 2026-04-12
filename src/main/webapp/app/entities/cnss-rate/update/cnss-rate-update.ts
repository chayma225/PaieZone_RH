import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { ICnssRate } from '../cnss-rate.model';
import { CnssRateService } from '../service/cnss-rate.service';

import { CnssRateFormGroup, CnssRateFormService } from './cnss-rate-form.service';

@Component({
  selector: 'pz-cnss-rate-update',
  templateUrl: './cnss-rate-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule, NgbInputDatepicker],
})
export class CnssRateUpdate implements OnInit {
  readonly isSaving = signal(false);
  cnssRate: ICnssRate | null = null;

  companiesSharedCollection = signal<ICompany[]>([]);

  protected cnssRateService = inject(CnssRateService);
  protected cnssRateFormService = inject(CnssRateFormService);
  protected companyService = inject(CompanyService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: CnssRateFormGroup = this.cnssRateFormService.createCnssRateFormGroup();

  compareCompany = (o1: ICompany | null, o2: ICompany | null): boolean => this.companyService.compareCompany(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ cnssRate }) => {
      this.cnssRate = cnssRate;
      if (cnssRate) {
        this.updateForm(cnssRate);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const cnssRate = this.cnssRateFormService.getCnssRate(this.editForm);
    if (cnssRate.id === null) {
      this.subscribeToSaveResponse(this.cnssRateService.create(cnssRate));
    } else {
      this.subscribeToSaveResponse(this.cnssRateService.update(cnssRate));
    }
  }

  protected subscribeToSaveResponse(result: Observable<ICnssRate | null>): void {
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

  protected updateForm(cnssRate: ICnssRate): void {
    this.cnssRate = cnssRate;
    this.cnssRateFormService.resetForm(this.editForm, cnssRate);

    this.companiesSharedCollection.update(companies =>
      this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, cnssRate.company),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.companyService
      .query()
      .pipe(map((res: HttpResponse<ICompany[]>) => res.body ?? []))
      .pipe(
        map((companies: ICompany[]) => this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, this.cnssRate?.company)),
      )
      .subscribe((companies: ICompany[]) => this.companiesSharedCollection.set(companies));
  }
}
