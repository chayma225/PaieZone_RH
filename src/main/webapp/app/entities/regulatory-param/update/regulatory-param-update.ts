
import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import SharedModule from 'app/shared/shared.module';
import { IRegulatoryParam, REGULATORY_PARAM_CATEGORIES, CATEGORY_LABELS } from '../regulatory-param.model';
import { RegulatoryParamService } from '../service/regulatory-param.service';
import { RegulatoryParamFormGroup, RegulatoryParamFormService } from './regulatory-param-form.service';

@Component({
  standalone: true,
  selector: 'jhi-regulatory-param-update',
  templateUrl: './regulatory-param-update.html',
  imports: [SharedModule, ReactiveFormsModule],
})
export class RegulatoryParamUpdate implements OnInit {
  isSaving           = false;
  saveError          = '';
  regulatoryParam: IRegulatoryParam | null = null;

  categories     = REGULATORY_PARAM_CATEGORIES;
  categoryLabels = CATEGORY_LABELS;

  protected regulatoryParamService     = inject(RegulatoryParamService);
  protected regulatoryParamFormService = inject(RegulatoryParamFormService);
  protected activatedRoute             = inject(ActivatedRoute);

  editForm: RegulatoryParamFormGroup = this.regulatoryParamFormService.createRegulatoryParamFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ regulatoryParam }) => {
      this.regulatoryParam = regulatoryParam;
      if (regulatoryParam) {
        this.regulatoryParamFormService.resetForm(this.editForm, regulatoryParam);
      }
    });
  }

  previousState(): void { window.history.back(); }

  save(): void {
    this.isSaving   = true;
    this.saveError  = '';
    const param = this.regulatoryParamFormService.getRegulatoryParam(this.editForm);
    const obs: Observable<HttpResponse<IRegulatoryParam>> = param.id !== null
      ? this.regulatoryParamService.update(param as IRegulatoryParam)
      : this.regulatoryParamService.create(param as any);

    obs.pipe(finalize(() => { this.isSaving = false; })).subscribe({
      next:  () => this.previousState(),
      error: err => { this.saveError = err?.error?.detail ?? 'Erreur lors de l\'enregistrement.'; },
    });
  }
}

