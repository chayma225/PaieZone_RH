import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { IPaySlip } from 'app/entities/pay-slip/pay-slip.model';
import { PaySlipService } from 'app/entities/pay-slip/service/pay-slip.service';
import { BonusType } from 'app/entities/enumerations/bonus-type.model';
import { BonusService } from '../service/bonus.service';
import { IBonus } from '../bonus.model';
import { BonusFormGroup, BonusFormService } from './bonus-form.service';

@Component({
  selector: 'pz-bonus-update',
  templateUrl: './bonus-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class BonusUpdateComponent implements OnInit {
  isSaving = false;
  bonus: IBonus | null = null;
  bonusTypeValues = Object.keys(BonusType);

  employeesSharedCollection: IEmployee[] = [];
  paySlipsSharedCollection: IPaySlip[] = [];

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
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const bonus = this.bonusFormService.getBonus(this.editForm);
    if (bonus.id !== null) {
      this.subscribeToSaveResponse(this.bonusService.update(bonus));
    } else {
      this.subscribeToSaveResponse(this.bonusService.create(bonus));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IBonus>>): void {
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

  protected updateForm(bonus: IBonus): void {
    this.bonus = bonus;
    this.bonusFormService.resetForm(this.editForm, bonus);

    this.employeesSharedCollection = this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(
      this.employeesSharedCollection,
      bonus.employee,
    );
    this.paySlipsSharedCollection = this.paySlipService.addPaySlipToCollectionIfMissing<IPaySlip>(
      this.paySlipsSharedCollection,
      bonus.paySlip,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.employeeService
      .query()
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .pipe(
        map((employees: IEmployee[]) => this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, this.bonus?.employee)),
      )
      .subscribe((employees: IEmployee[]) => (this.employeesSharedCollection = employees));

    this.paySlipService
      .query()
      .pipe(map((res: HttpResponse<IPaySlip[]>) => res.body ?? []))
      .pipe(map((paySlips: IPaySlip[]) => this.paySlipService.addPaySlipToCollectionIfMissing<IPaySlip>(paySlips, this.bonus?.paySlip)))
      .subscribe((paySlips: IPaySlip[]) => (this.paySlipsSharedCollection = paySlips));
  }
}
