import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { ITaxBracket } from '../tax-bracket.model';
import { TaxBracketService } from '../service/tax-bracket.service';
import { TaxBracketFormGroup, TaxBracketFormService } from './tax-bracket-form.service';

@Component({
  selector: 'pz-tax-bracket-update',
  templateUrl: './tax-bracket-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class TaxBracketUpdateComponent implements OnInit {
  isSaving = false;
  taxBracket: ITaxBracket | null = null;

  companiesSharedCollection: ICompany[] = [];

  protected taxBracketService = inject(TaxBracketService);
  protected taxBracketFormService = inject(TaxBracketFormService);
  protected companyService = inject(CompanyService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: TaxBracketFormGroup = this.taxBracketFormService.createTaxBracketFormGroup();

  compareCompany = (o1: ICompany | null, o2: ICompany | null): boolean => this.companyService.compareCompany(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ taxBracket }) => {
      this.taxBracket = taxBracket;
      if (taxBracket) {
        this.updateForm(taxBracket);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const taxBracket = this.taxBracketFormService.getTaxBracket(this.editForm);
    if (taxBracket.id !== null) {
      this.subscribeToSaveResponse(this.taxBracketService.update(taxBracket));
    } else {
      this.subscribeToSaveResponse(this.taxBracketService.create(taxBracket));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITaxBracket>>): void {
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

  protected updateForm(taxBracket: ITaxBracket): void {
    this.taxBracket = taxBracket;
    this.taxBracketFormService.resetForm(this.editForm, taxBracket);

    this.companiesSharedCollection = this.companyService.addCompanyToCollectionIfMissing<ICompany>(
      this.companiesSharedCollection,
      taxBracket.company,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.companyService
      .query()
      .pipe(map((res: HttpResponse<ICompany[]>) => res.body ?? []))
      .pipe(
        map((companies: ICompany[]) => this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, this.taxBracket?.company)),
      )
      .subscribe((companies: ICompany[]) => (this.companiesSharedCollection = companies));
  }
}
