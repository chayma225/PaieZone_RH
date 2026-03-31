import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { RubriqueType } from 'app/entities/enumerations/rubrique-type.model';
import { RubriqueBase } from 'app/entities/enumerations/rubrique-base.model';
import { RubriqueService } from '../service/rubrique.service';
import { IRubrique } from '../rubrique.model';
import { RubriqueFormGroup, RubriqueFormService } from './rubrique-form.service';

@Component({
  selector: 'pz-rubrique-update',
  templateUrl: './rubrique-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class RubriqueUpdateComponent implements OnInit {
  isSaving = false;
  rubrique: IRubrique | null = null;
  rubriqueTypeValues = Object.keys(RubriqueType);
  rubriqueBaseValues = Object.keys(RubriqueBase);

  companiesSharedCollection: ICompany[] = [];

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
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const rubrique = this.rubriqueFormService.getRubrique(this.editForm);
    if (rubrique.id !== null) {
      this.subscribeToSaveResponse(this.rubriqueService.update(rubrique));
    } else {
      this.subscribeToSaveResponse(this.rubriqueService.create(rubrique));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IRubrique>>): void {
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

  protected updateForm(rubrique: IRubrique): void {
    this.rubrique = rubrique;
    this.rubriqueFormService.resetForm(this.editForm, rubrique);

    this.companiesSharedCollection = this.companyService.addCompanyToCollectionIfMissing<ICompany>(
      this.companiesSharedCollection,
      rubrique.company,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.companyService
      .query()
      .pipe(map((res: HttpResponse<ICompany[]>) => res.body ?? []))
      .pipe(
        map((companies: ICompany[]) => this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, this.rubrique?.company)),
      )
      .subscribe((companies: ICompany[]) => (this.companiesSharedCollection = companies));
  }
}
