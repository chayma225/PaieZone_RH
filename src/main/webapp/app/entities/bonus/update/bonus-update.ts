// src/main/webapp/app/entities/bonus/update/bonus-update.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IBonus, BONUS_TYPES } from '../bonus.model';
import { BonusService } from '../service/bonus.service';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import SharedModule from 'app/shared/shared.module';
import { AlertError } from 'app/shared/alert/alert-error';


@Component({
  standalone: true,
  selector: 'jhi-bonus-update',
  templateUrl: './bonus-update.html',
  imports: [SharedModule, AlertError, ReactiveFormsModule,ReactiveFormsModule, FaIconComponent],
})
export class BonusUpdate implements OnInit {
  isSaving = false;
  bonus: IBonus | null = null;
  bonusTypes = BONUS_TYPES;
  months = Array.from({length:12},(_,i)=>i+1);
  years = Array.from({length:6},(_,i)=>2023+i);
  monthLabels = ['','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

  protected service = inject(BonusService);
  protected route   = inject(ActivatedRoute);
  protected fb      = inject(FormBuilder);

  editForm = this.fb.group({
    id:         [null as number|null],
    bonusType:  ['PERFORMANCE'],
    label:      ['', [Validators.required, Validators.maxLength(150)]],
    amount:     [null as number|null, [Validators.required, Validators.min(0)]],
    taxable:    [true, Validators.required],
    month:      [new Date().getMonth()+1, [Validators.required, Validators.min(1), Validators.max(12)]],
    year:       [new Date().getFullYear(), Validators.required],
    notes:      [''],
    employeeId: [null as number|null, Validators.required],
  });

  ngOnInit(): void {
    this.route.data.subscribe(({ bonus }) => {
      if (bonus) { this.bonus = bonus; this.editForm.patchValue(bonus); }
    });
  }

  previousState(): void { window.history.back(); }

  save(): void {
    this.isSaving = true;
    const val = this.editForm.getRawValue();
    const obs: Observable<HttpResponse<IBonus>> = val.id
      ? this.service.update(val as IBonus)
      : this.service.create(val as any);
    obs.pipe(finalize(() => { this.isSaving = false; }))
      .subscribe({ next: () => this.previousState() });
  }
}
