import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { IPayrollPeriod } from 'app/entities/payroll-period/payroll-period.model';
import { PayrollPeriodService } from 'app/entities/payroll-period/service/payroll-period.service';
import { AccountingEntryType } from 'app/entities/enumerations/accounting-entry-type.model';
import { AccountingEntryService } from '../service/accounting-entry.service';
import { IAccountingEntry } from '../accounting-entry.model';
import { AccountingEntryFormGroup, AccountingEntryFormService } from './accounting-entry-form.service';

@Component({
  selector: 'pz-accounting-entry-update',
  templateUrl: './accounting-entry-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class AccountingEntryUpdateComponent implements OnInit {
  isSaving = false;
  accountingEntry: IAccountingEntry | null = null;
  accountingEntryTypeValues = Object.keys(AccountingEntryType);

  companiesSharedCollection: ICompany[] = [];
  payrollPeriodsSharedCollection: IPayrollPeriod[] = [];

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
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const accountingEntry = this.accountingEntryFormService.getAccountingEntry(this.editForm);
    if (accountingEntry.id !== null) {
      this.subscribeToSaveResponse(this.accountingEntryService.update(accountingEntry));
    } else {
      this.subscribeToSaveResponse(this.accountingEntryService.create(accountingEntry));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAccountingEntry>>): void {
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

  protected updateForm(accountingEntry: IAccountingEntry): void {
    this.accountingEntry = accountingEntry;
    this.accountingEntryFormService.resetForm(this.editForm, accountingEntry);

    this.companiesSharedCollection = this.companyService.addCompanyToCollectionIfMissing<ICompany>(
      this.companiesSharedCollection,
      accountingEntry.company,
    );
    this.payrollPeriodsSharedCollection = this.payrollPeriodService.addPayrollPeriodToCollectionIfMissing<IPayrollPeriod>(
      this.payrollPeriodsSharedCollection,
      accountingEntry.payrollPeriod,
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
      .subscribe((companies: ICompany[]) => (this.companiesSharedCollection = companies));

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
      .subscribe((payrollPeriods: IPayrollPeriod[]) => (this.payrollPeriodsSharedCollection = payrollPeriods));
  }
}
