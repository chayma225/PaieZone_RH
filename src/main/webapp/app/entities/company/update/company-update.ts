import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { ICompany } from '../company.model';
import { CompanyService } from '../service/company.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';

@Component({
  selector: 'pz-company-update',
  templateUrl: './company-update.html',   // ✅ FIX 2 : nom correct du fichier HTML
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FontAwesomeModule,
    TranslateDirective,
    TranslateModule,
    AlertError,
  ],
})
export class CompanyUpdate implements OnInit {  // ✅ FIX 1 : CompanyUpdate (pas CompanyUpdateComponent)

  isSaving = false;
  company: ICompany | null = null;

  protected activatedRoute = inject(ActivatedRoute);
  protected companyService = inject(CompanyService);
  protected fb = inject(FormBuilder);

  editForm: FormGroup = this.fb.group({
    id:         [null],
    name:       [null, [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    tradeName:  [null, [Validators.maxLength(150)]],
    taxId:      [null, [Validators.required, Validators.maxLength(20)]],
    cnssId:     [null, [Validators.maxLength(20)]],
    phone:      [null, [Validators.maxLength(20)]],
    email:      [null, [Validators.maxLength(100), Validators.email]],
    address:    [null, [Validators.maxLength(255)]],
    city:       [null, [Validators.maxLength(100)]],
    postalCode: [null, [Validators.maxLength(10)]],
    logoUrl:    [null, [Validators.maxLength(500)]],
    // ❌ PAS de : tenantSchema, active, trialEnd, createdAt
  });

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ company }) => {
      if (company) {
        this.company = company;
        this.updateForm(company);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    if (this.editForm.invalid) return;

    this.isSaving = true;
    const company = this.editForm.getRawValue();

    if (company.id !== null) {
      this.subscribeToSaveResponse(this.companyService.update(company));
    } else {
      this.subscribeToSaveResponse(this.companyService.create(company));
    }
  }

  // ✅ FIX 3 : Observable<ICompany> au lieu de Observable<HttpResponse<ICompany>>
  protected subscribeToSaveResponse(result: Observable<ICompany>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {}

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(company: ICompany): void {
    this.editForm.patchValue({
      id:         company.id,
      name:       company.name,
      tradeName:  company.tradeName,
      taxId:      company.taxId,
      cnssId:     company.cnssId,
      phone:      company.phone,
      email:      company.email,
      address:    company.address,
      city:       company.city,
      postalCode: company.postalCode,
      logoUrl:    company.logoUrl,
    });
  }
}
