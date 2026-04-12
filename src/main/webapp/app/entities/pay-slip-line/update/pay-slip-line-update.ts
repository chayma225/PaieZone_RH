import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { RubriqueType } from 'app/entities/enumerations/rubrique-type.model';
import { IPaySlip } from 'app/entities/pay-slip/pay-slip.model';
import { PaySlipService } from 'app/entities/pay-slip/service/pay-slip.service';
import { IRubrique } from 'app/entities/rubrique/rubrique.model';
import { RubriqueService } from 'app/entities/rubrique/service/rubrique.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IPaySlipLine } from '../pay-slip-line.model';
import { PaySlipLineService } from '../service/pay-slip-line.service';

import { PaySlipLineFormGroup, PaySlipLineFormService } from './pay-slip-line-form.service';

@Component({
  selector: 'pz-pay-slip-line-update',
  templateUrl: './pay-slip-line-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class PaySlipLineUpdate implements OnInit {
  readonly isSaving = signal(false);
  paySlipLine: IPaySlipLine | null = null;
  rubriqueTypeValues = Object.keys(RubriqueType);

  paySlipsSharedCollection = signal<IPaySlip[]>([]);
  rubriquesSharedCollection = signal<IRubrique[]>([]);

  protected paySlipLineService = inject(PaySlipLineService);
  protected paySlipLineFormService = inject(PaySlipLineFormService);
  protected paySlipService = inject(PaySlipService);
  protected rubriqueService = inject(RubriqueService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: PaySlipLineFormGroup = this.paySlipLineFormService.createPaySlipLineFormGroup();

  comparePaySlip = (o1: IPaySlip | null, o2: IPaySlip | null): boolean => this.paySlipService.comparePaySlip(o1, o2);

  compareRubrique = (o1: IRubrique | null, o2: IRubrique | null): boolean => this.rubriqueService.compareRubrique(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ paySlipLine }) => {
      this.paySlipLine = paySlipLine;
      if (paySlipLine) {
        this.updateForm(paySlipLine);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const paySlipLine = this.paySlipLineFormService.getPaySlipLine(this.editForm);
    if (paySlipLine.id === null) {
      this.subscribeToSaveResponse(this.paySlipLineService.create(paySlipLine));
    } else {
      this.subscribeToSaveResponse(this.paySlipLineService.update(paySlipLine));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IPaySlipLine | null>): void {
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

  protected updateForm(paySlipLine: IPaySlipLine): void {
    this.paySlipLine = paySlipLine;
    this.paySlipLineFormService.resetForm(this.editForm, paySlipLine);

    this.paySlipsSharedCollection.update(paySlips =>
      this.paySlipService.addPaySlipToCollectionIfMissing<IPaySlip>(paySlips, paySlipLine.paySlip),
    );
    this.rubriquesSharedCollection.update(rubriques =>
      this.rubriqueService.addRubriqueToCollectionIfMissing<IRubrique>(rubriques, paySlipLine.rubrique),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.paySlipService
      .query()
      .pipe(map((res: HttpResponse<IPaySlip[]>) => res.body ?? []))
      .pipe(
        map((paySlips: IPaySlip[]) => this.paySlipService.addPaySlipToCollectionIfMissing<IPaySlip>(paySlips, this.paySlipLine?.paySlip)),
      )
      .subscribe((paySlips: IPaySlip[]) => this.paySlipsSharedCollection.set(paySlips));

    this.rubriqueService
      .query()
      .pipe(map((res: HttpResponse<IRubrique[]>) => res.body ?? []))
      .pipe(
        map((rubriques: IRubrique[]) =>
          this.rubriqueService.addRubriqueToCollectionIfMissing<IRubrique>(rubriques, this.paySlipLine?.rubrique),
        ),
      )
      .subscribe((rubriques: IRubrique[]) => this.rubriquesSharedCollection.set(rubriques));
  }
}
