import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { ICnssRate } from '../cnss-rate.model';
import { CnssRateService } from '../service/cnss-rate.service';
import { CnssRateFormGroup, CnssRateFormService } from './cnss-rate-form.service';

@Component({
  selector: 'pz-cnss-rate-update',
  templateUrl: './cnss-rate-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class CnssRateUpdateComponent implements OnInit {
  isSaving = false;
  cnssRate: ICnssRate | null = null;

  companiesSharedCollection: ICompany[] = [];

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
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const cnssRate = this.cnssRateFormService.getCnssRate(this.editForm);
    if (cnssRate.id !== null) {
      this.subscribeToSaveResponse(this.cnssRateService.update(cnssRate));
    } else {
      this.subscribeToSaveResponse(this.cnssRateService.create(cnssRate));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ICnssRate>>): void {
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

  protected updateForm(cnssRate: ICnssRate): void {
    this.cnssRate = cnssRate;
    this.cnssRateFormService.resetForm(this.editForm, cnssRate);

    this.companiesSharedCollection = this.companyService.addCompanyToCollectionIfMissing<ICompany>(
      this.companiesSharedCollection,
      cnssRate.company,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.companyService
      .query()
      .pipe(map((res: HttpResponse<ICompany[]>) => res.body ?? []))
      .pipe(
        map((companies: ICompany[]) => this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, this.cnssRate?.company)),
      )
      .subscribe((companies: ICompany[]) => (this.companiesSharedCollection = companies));
  }
}
