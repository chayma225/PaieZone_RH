import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { AccountingEntryType } from 'app/entities/enumerations/accounting-entry-type.model';
import { IPayrollPeriod } from 'app/entities/payroll-period/payroll-period.model';
import { PayrollPeriodService } from 'app/entities/payroll-period/service/payroll-period.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';

import { IAccountingEntry } from '../accounting-entry.model';
import { AccountingEntryService } from '../service/accounting-entry.service';

import { AccountingEntryFormGroup, AccountingEntryFormService } from './accounting-entry-form.service';

@Component({
  selector: 'pz-accounting-entry-update',
  templateUrl: './accounting-entry-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule, NgbInputDatepicker],
})
export class AccountingEntryUpdate implements OnInit {
  readonly isSaving = signal(false);
  accountingEntry: IAccountingEntry | null = null;
  accountingEntryTypeValues = Object.keys(AccountingEntryType);

  companiesSharedCollection = signal<ICompany[]>([]);
  payrollPeriodsSharedCollection = signal<IPayrollPeriod[]>([]);

  protected accountingEntryService = inject(AccountingEntryService);
  protected accountingEntryFormService = inject(AccountingEntryFormService);
  protected companyService = inject(CompanyService);
  protected payrollPeriodService = inject(PayrollPeriodService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: AccountingEntryFormGroup = this.accountingEntryFormService.createAccountingEntryFormGroup();

  compareCompany = (o1: ICompany | null, o2: ICompany | null): boolean => this.companyService.compareCompany(o1, o2);

  comparePayrollPeriod = (o1: IPayrollPeriod | null, o2: IPayrollPeriod | null): boolean =>
    this.payrollPeriodService.comparePayrollPeriod(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ accountingEntry }) => {
      this.accountingEntry = accountingEntry;
      if (accountingEntry) {
        this.updateForm(accountingEntry);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const accountingEntry = this.accountingEntryFormService.getAccountingEntry(this.editForm);
    if (accountingEntry.id === null) {
      this.subscribeToSaveResponse(this.accountingEntryService.create(accountingEntry));
    } else {
      this.subscribeToSaveResponse(this.accountingEntryService.update(accountingEntry));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IAccountingEntry | null>): void {
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

  protected updateForm(accountingEntry: IAccountingEntry): void {
    this.accountingEntry = accountingEntry;
    this.accountingEntryFormService.resetForm(this.editForm, accountingEntry);

    this.companiesSharedCollection.update(companies =>
      this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, accountingEntry.company),
    );
    this.payrollPeriodsSharedCollection.update(payrollPeriods =>
      this.payrollPeriodService.addPayrollPeriodToCollectionIfMissing<IPayrollPeriod>(payrollPeriods, accountingEntry.payrollPeriod),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.companyService
      .query()
      .pipe(map((res: HttpResponse<ICompany[]>) => res.body ?? []))
      .pipe(
        map((companies: ICompany[]) =>
          this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, this.accountingEntry?.company),
        ),
      )
      .subscribe((companies: ICompany[]) => this.companiesSharedCollection.set(companies));

    this.payrollPeriodService
      .query()
      .pipe(map((res: HttpResponse<IPayrollPeriod[]>) => res.body ?? []))
      .pipe(
        map((payrollPeriods: IPayrollPeriod[]) =>
          this.payrollPeriodService.addPayrollPeriodToCollectionIfMissing<IPayrollPeriod>(
            payrollPeriods,
            this.accountingEntry?.payrollPeriod,
          ),
        ),
      )
      .subscribe((payrollPeriods: IPayrollPeriod[]) => this.payrollPeriodsSharedCollection.set(payrollPeriods));
  }
}
