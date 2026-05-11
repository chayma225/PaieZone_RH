import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IAdvance, AdvanceStatus } from '../advance.model';
import { AdvanceService } from '../service/advance.service';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import SharedModule from 'app/shared/shared.module';
import { AlertError} from 'app/shared/alert/alert-error';
@Component({
  standalone: true,
  selector: 'jhi-advance-update',
  templateUrl: './advance-update.html',
  imports: [ReactiveFormsModule, FaIconComponent,SharedModule, AlertError],
})
export class AdvanceUpdate implements OnInit {
  isSaving = false;
  advance: IAdvance | null = null;

  // ✅ Statuts corrects
  statuses = Object.values(AdvanceStatus);
  months = Array.from({length: 12}, (_, i) => i + 1);
  years  = Array.from({length: 4},  (_, i) => 2025 + i);
  monthLabels = ['','Janvier','Février','Mars','Avril','Mai','Juin',
    'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  today = new Date().toISOString().split('T')[0];

  protected service = inject(AdvanceService);
  protected route   = inject(ActivatedRoute);
  protected fb      = inject(FormBuilder);

  editForm = this.fb.group({
    id:             [null as number | null],
    employeeId:     [null as number | null, Validators.required],
    requestDate:    [this.today, Validators.required],
    amount:         [null as number | null, [Validators.required, Validators.min(1)]],
    reason:         [''],
    deductionMonth: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
    deductionYear:  [new Date().getFullYear(), Validators.required],
    // ✅ REQUESTED (pas PENDING)
    status:         [AdvanceStatus.REQUESTED, Validators.required],
    approvedBy:     [''],
    notes:          [''],
  });

  ngOnInit(): void {
    this.route.data.subscribe(({ advance }) => {
      if (advance) { this.advance = advance; this.editForm.patchValue(advance); }
    });
  }

  previousState(): void { window.history.back(); }

  save(): void {
    this.isSaving = true;
    const val = this.editForm.getRawValue();
    const obs: Observable<HttpResponse<IAdvance>> = val.id
      ? this.service.update(val as IAdvance)
      : this.service.create(val as any);
    obs.pipe(finalize(() => { this.isSaving = false; }))
      .subscribe({ next: () => this.previousState() });
  }
}
