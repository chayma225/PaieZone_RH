import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { BonusType } from 'app/entities/enumerations/bonus-type.model';
import { IPaySlip } from 'app/entities/pay-slip/pay-slip.model';
import { PaySlipService } from 'app/entities/pay-slip/service/pay-slip.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IBonus } from '../bonus.model';
import { BonusService } from '../service/bonus.service';

import { BonusFormGroup, BonusFormService } from './bonus-form.service';

@Component({
  selector: 'pz-bonus-update',
  templateUrl: './bonus-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class BonusUpdate implements OnInit {
  readonly isSaving = signal(false);
  bonus: IBonus | null = null;
  bonusTypeValues = Object.keys(BonusType);

  employeesSharedCollection = signal<IEmployee[]>([]);
  paySlipsSharedCollection = signal<IPaySlip[]>([]);

  protected bonusService = inject(BonusService);
  protected bonusFormService = inject(BonusFormService);
  protected employeeService = inject(EmployeeService);
  protected paySlipService = inject(PaySlipService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: BonusFormGroup = this.bonusFormService.createBonusFormGroup();

  compareEmployee = (o1: IEmployee | null, o2: IEmployee | null): boolean => this.employeeService.compareEmployee(o1, o2);

  comparePaySlip = (o1: IPaySlip | null, o2: IPaySlip | null): boolean => this.paySlipService.comparePaySlip(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ bonus }) => {
      this.bonus = bonus;
      if (bonus) {
        this.updateForm(bonus);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const bonus = this.bonusFormService.getBonus(this.editForm);
    if (bonus.id === null) {
      this.subscribeToSaveResponse(this.bonusService.create(bonus));
    } else {
      this.subscribeToSaveResponse(this.bonusService.update(bonus));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IBonus | null>): void {
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

  protected updateForm(bonus: IBonus): void {
    this.bonus = bonus;
    this.bonusFormService.resetForm(this.editForm, bonus);

    this.employeesSharedCollection.update(employees =>
      this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, bonus.employee),
    );
    this.paySlipsSharedCollection.update(paySlips =>
      this.paySlipService.addPaySlipToCollectionIfMissing<IPaySlip>(paySlips, bonus.paySlip),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.employeeService
      .query()
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .pipe(
        map((employees: IEmployee[]) => this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, this.bonus?.employee)),
      )
      .subscribe((employees: IEmployee[]) => this.employeesSharedCollection.set(employees));

    this.paySlipService
      .query()
      .pipe(map((res: HttpResponse<IPaySlip[]>) => res.body ?? []))
      .pipe(map((paySlips: IPaySlip[]) => this.paySlipService.addPaySlipToCollectionIfMissing<IPaySlip>(paySlips, this.bonus?.paySlip)))
      .subscribe((paySlips: IPaySlip[]) => this.paySlipsSharedCollection.set(paySlips));
  }
}
