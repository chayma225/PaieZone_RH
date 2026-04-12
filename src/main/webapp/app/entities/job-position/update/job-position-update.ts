import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { IDepartment } from 'app/entities/department/department.model';
import { DepartmentService } from 'app/entities/department/service/department.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IJobPosition } from '../job-position.model';
import { JobPositionService } from '../service/job-position.service';

import { JobPositionFormGroup, JobPositionFormService } from './job-position-form.service';

@Component({
  selector: 'pz-job-position-update',
  templateUrl: './job-position-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class JobPositionUpdate implements OnInit {
  readonly isSaving = signal(false);
  jobPosition: IJobPosition | null = null;

  companiesSharedCollection = signal<ICompany[]>([]);
  departmentsSharedCollection = signal<IDepartment[]>([]);

  protected jobPositionService = inject(JobPositionService);
  protected jobPositionFormService = inject(JobPositionFormService);
  protected companyService = inject(CompanyService);
  protected departmentService = inject(DepartmentService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: JobPositionFormGroup = this.jobPositionFormService.createJobPositionFormGroup();

  compareCompany = (o1: ICompany | null, o2: ICompany | null): boolean => this.companyService.compareCompany(o1, o2);

  compareDepartment = (o1: IDepartment | null, o2: IDepartment | null): boolean => this.departmentService.compareDepartment(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ jobPosition }) => {
      this.jobPosition = jobPosition;
      if (jobPosition) {
        this.updateForm(jobPosition);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const jobPosition = this.jobPositionFormService.getJobPosition(this.editForm);
    if (jobPosition.id === null) {
      this.subscribeToSaveResponse(this.jobPositionService.create(jobPosition));
    } else {
      this.subscribeToSaveResponse(this.jobPositionService.update(jobPosition));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IJobPosition | null>): void {
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

  protected updateForm(jobPosition: IJobPosition): void {
    this.jobPosition = jobPosition;
    this.jobPositionFormService.resetForm(this.editForm, jobPosition);

    this.companiesSharedCollection.update(companies =>
      this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, jobPosition.company),
    );
    this.departmentsSharedCollection.update(departments =>
      this.departmentService.addDepartmentToCollectionIfMissing<IDepartment>(departments, jobPosition.department),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.companyService
      .query()
      .pipe(map((res: HttpResponse<ICompany[]>) => res.body ?? []))
      .pipe(
        map((companies: ICompany[]) => this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, this.jobPosition?.company)),
      )
      .subscribe((companies: ICompany[]) => this.companiesSharedCollection.set(companies));

    this.departmentService
      .query()
      .pipe(map((res: HttpResponse<IDepartment[]>) => res.body ?? []))
      .pipe(
        map((departments: IDepartment[]) =>
          this.departmentService.addDepartmentToCollectionIfMissing<IDepartment>(departments, this.jobPosition?.department),
        ),
      )
      .subscribe((departments: IDepartment[]) => this.departmentsSharedCollection.set(departments));
  }
}
