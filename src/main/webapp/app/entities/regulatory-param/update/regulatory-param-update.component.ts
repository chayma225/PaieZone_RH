import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IRegulatoryParam } from '../regulatory-param.model';
import { RegulatoryParamService } from '../service/regulatory-param.service';
import { RegulatoryParamFormGroup, RegulatoryParamFormService } from './regulatory-param-form.service';

@Component({
  selector: 'pz-regulatory-param-update',
  templateUrl: './regulatory-param-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class RegulatoryParamUpdateComponent implements OnInit {
  isSaving = false;
  regulatoryParam: IRegulatoryParam | null = null;

  protected regulatoryParamService = inject(RegulatoryParamService);
  protected regulatoryParamFormService = inject(RegulatoryParamFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: RegulatoryParamFormGroup = this.regulatoryParamFormService.createRegulatoryParamFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ regulatoryParam }) => {
      this.regulatoryParam = regulatoryParam;
      if (regulatoryParam) {
        this.updateForm(regulatoryParam);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const regulatoryParam = this.regulatoryParamFormService.getRegulatoryParam(this.editForm);
    if (regulatoryParam.id !== null) {
      this.subscribeToSaveResponse(this.regulatoryParamService.update(regulatoryParam));
    } else {
      this.subscribeToSaveResponse(this.regulatoryParamService.create(regulatoryParam));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IRegulatoryParam>>): void {
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

  protected updateForm(regulatoryParam: IRegulatoryParam): void {
    this.regulatoryParam = regulatoryParam;
    this.regulatoryParamFormService.resetForm(this.editForm, regulatoryParam);
  }
}
