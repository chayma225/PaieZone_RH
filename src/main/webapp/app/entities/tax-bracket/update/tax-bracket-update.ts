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
import { TaxBracketService } from '../service/tax-bracket.service';
import { ITaxBracket } from '../tax-bracket.model';

import { TaxBracketFormGroup, TaxBracketFormService } from './tax-bracket-form.service';

@Component({
  selector: 'pz-tax-bracket-update',
  templateUrl: './tax-bracket-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class TaxBracketUpdate implements OnInit {
  readonly isSaving = signal(false);
  taxBracket: ITaxBracket | null = null;

  companiesSharedCollection = signal<ICompany[]>([]);

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
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const taxBracket = this.taxBracketFormService.getTaxBracket(this.editForm);
    if (taxBracket.id === null) {
      this.subscribeToSaveResponse(this.taxBracketService.create(taxBracket));
    } else {
      this.subscribeToSaveResponse(this.taxBracketService.update(taxBracket));
    }
  }

  protected subscribeToSaveResponse(result: Observable<ITaxBracket | null>): void {
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

  protected updateForm(taxBracket: ITaxBracket): void {
    this.taxBracket = taxBracket;
    this.taxBracketFormService.resetForm(this.editForm, taxBracket);

    this.companiesSharedCollection.update(companies =>
      this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, taxBracket.company),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.companyService
      .query()
      .pipe(map((res: HttpResponse<ICompany[]>) => res.body ?? []))
      .pipe(
        map((companies: ICompany[]) => this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, this.taxBracket?.company)),
      )
      .subscribe((companies: ICompany[]) => this.companiesSharedCollection.set(companies));
  }
}
