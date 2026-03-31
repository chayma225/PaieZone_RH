import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { IDepartment } from 'app/entities/department/department.model';
import { DepartmentService } from 'app/entities/department/service/department.service';
import { JobPositionService } from '../service/job-position.service';
import { IJobPosition } from '../job-position.model';
import { JobPositionFormGroup, JobPositionFormService } from './job-position-form.service';

@Component({
  selector: 'pz-job-position-update',
  templateUrl: './job-position-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class JobPositionUpdateComponent implements OnInit {
  isSaving = false;
  jobPosition: IJobPosition | null = null;

  companiesSharedCollection: ICompany[] = [];
  departmentsSharedCollection: IDepartment[] = [];

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
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const jobPosition = this.jobPositionFormService.getJobPosition(this.editForm);
    if (jobPosition.id !== null) {
      this.subscribeToSaveResponse(this.jobPositionService.update(jobPosition));
    } else {
      this.subscribeToSaveResponse(this.jobPositionService.create(jobPosition));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IJobPosition>>): void {
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

  protected updateForm(jobPosition: IJobPosition): void {
    this.jobPosition = jobPosition;
    this.jobPositionFormService.resetForm(this.editForm, jobPosition);

    this.companiesSharedCollection = this.companyService.addCompanyToCollectionIfMissing<ICompany>(
      this.companiesSharedCollection,
      jobPosition.company,
    );
    this.departmentsSharedCollection = this.departmentService.addDepartmentToCollectionIfMissing<IDepartment>(
      this.departmentsSharedCollection,
      jobPosition.department,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.companyService
      .query()
      .pipe(map((res: HttpResponse<ICompany[]>) => res.body ?? []))
      .pipe(
        map((companies: ICompany[]) => this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, this.jobPosition?.company)),
      )
      .subscribe((companies: ICompany[]) => (this.companiesSharedCollection = companies));

    this.departmentService
      .query()
      .pipe(map((res: HttpResponse<IDepartment[]>) => res.body ?? []))
      .pipe(
        map((departments: IDepartment[]) =>
          this.departmentService.addDepartmentToCollectionIfMissing<IDepartment>(departments, this.jobPosition?.department),
        ),
      )
      .subscribe((departments: IDepartment[]) => (this.departmentsSharedCollection = departments));
  }
}
