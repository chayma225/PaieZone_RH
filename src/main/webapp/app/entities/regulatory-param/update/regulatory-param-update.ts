import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IRegulatoryParam } from '../regulatory-param.model';
import { RegulatoryParamService } from '../service/regulatory-param.service';

import { RegulatoryParamFormGroup, RegulatoryParamFormService } from './regulatory-param-form.service';

@Component({
  selector: 'pz-regulatory-param-update',
  templateUrl: './regulatory-param-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule, NgbInputDatepicker],
})
export class RegulatoryParamUpdate implements OnInit {
  readonly isSaving = signal(false);
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
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const regulatoryParam = this.regulatoryParamFormService.getRegulatoryParam(this.editForm);
    if (regulatoryParam.id === null) {
      this.subscribeToSaveResponse(this.regulatoryParamService.create(regulatoryParam));
    } else {
      this.subscribeToSaveResponse(this.regulatoryParamService.update(regulatoryParam));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IRegulatoryParam | null>): void {
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

  protected updateForm(regulatoryParam: IRegulatoryParam): void {
    this.regulatoryParam = regulatoryParam;
    this.regulatoryParamFormService.resetForm(this.editForm, regulatoryParam);
  }
}
