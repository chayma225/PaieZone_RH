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
import { RubriqueBase } from 'app/entities/enumerations/rubrique-base.model';
import { RubriqueType } from 'app/entities/enumerations/rubrique-type.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IRubrique } from '../rubrique.model';
import { RubriqueService } from '../service/rubrique.service';

import { RubriqueFormGroup, RubriqueFormService } from './rubrique-form.service';

@Component({
  selector: 'pz-rubrique-update',
  templateUrl: './rubrique-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class RubriqueUpdate implements OnInit {
  readonly isSaving = signal(false);
  rubrique: IRubrique | null = null;
  rubriqueTypeValues = Object.keys(RubriqueType);
  rubriqueBaseValues = Object.keys(RubriqueBase);

  companiesSharedCollection = signal<ICompany[]>([]);

  protected rubriqueService = inject(RubriqueService);
  protected rubriqueFormService = inject(RubriqueFormService);
  protected companyService = inject(CompanyService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: RubriqueFormGroup = this.rubriqueFormService.createRubriqueFormGroup();

  compareCompany = (o1: ICompany | null, o2: ICompany | null): boolean => this.companyService.compareCompany(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ rubrique }) => {
      this.rubrique = rubrique;
      if (rubrique) {
        this.updateForm(rubrique);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const rubrique = this.rubriqueFormService.getRubrique(this.editForm);
    if (rubrique.id === null) {
      this.subscribeToSaveResponse(this.rubriqueService.create(rubrique));
    } else {
      this.subscribeToSaveResponse(this.rubriqueService.update(rubrique));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IRubrique | null>): void {
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

  protected updateForm(rubrique: IRubrique): void {
    this.rubrique = rubrique;
    this.rubriqueFormService.resetForm(this.editForm, rubrique);

    this.companiesSharedCollection.update(companies =>
      this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, rubrique.company),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.companyService
      .query()
      .pipe(map((res: HttpResponse<ICompany[]>) => res.body ?? []))
      .pipe(
        map((companies: ICompany[]) => this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, this.rubrique?.company)),
      )
      .subscribe((companies: ICompany[]) => this.companiesSharedCollection.set(companies));
  }
}
