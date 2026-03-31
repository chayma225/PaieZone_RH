import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { UserProfileService } from 'app/entities/user-profile/service/user-profile.service';
import { OfficialDocType } from 'app/entities/enumerations/official-doc-type.model';
import { OfficialDocumentService } from '../service/official-document.service';
import { IOfficialDocument } from '../official-document.model';
import { OfficialDocumentFormGroup, OfficialDocumentFormService } from './official-document-form.service';

@Component({
  selector: 'pz-official-document-update',
  templateUrl: './official-document-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class OfficialDocumentUpdateComponent implements OnInit {
  isSaving = false;
  officialDocument: IOfficialDocument | null = null;
  officialDocTypeValues = Object.keys(OfficialDocType);

  companiesSharedCollection: ICompany[] = [];
  employeesSharedCollection: IEmployee[] = [];
  userProfilesSharedCollection: IUserProfile[] = [];

  protected officialDocumentService = inject(OfficialDocumentService);
  protected officialDocumentFormService = inject(OfficialDocumentFormService);
  protected companyService = inject(CompanyService);
  protected employeeService = inject(EmployeeService);
  protected userProfileService = inject(UserProfileService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: OfficialDocumentFormGroup = this.officialDocumentFormService.createOfficialDocumentFormGroup();

  compareCompany = (o1: ICompany | null, o2: ICompany | null): boolean => this.companyService.compareCompany(o1, o2);

  compareEmployee = (o1: IEmployee | null, o2: IEmployee | null): boolean => this.employeeService.compareEmployee(o1, o2);

  compareUserProfile = (o1: IUserProfile | null, o2: IUserProfile | null): boolean => this.userProfileService.compareUserProfile(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ officialDocument }) => {
      this.officialDocument = officialDocument;
      if (officialDocument) {
        this.updateForm(officialDocument);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const officialDocument = this.officialDocumentFormService.getOfficialDocument(this.editForm);
    if (officialDocument.id !== null) {
      this.subscribeToSaveResponse(this.officialDocumentService.update(officialDocument));
    } else {
      this.subscribeToSaveResponse(this.officialDocumentService.create(officialDocument));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IOfficialDocument>>): void {
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

  protected updateForm(officialDocument: IOfficialDocument): void {
    this.officialDocument = officialDocument;
    this.officialDocumentFormService.resetForm(this.editForm, officialDocument);

    this.companiesSharedCollection = this.companyService.addCompanyToCollectionIfMissing<ICompany>(
      this.companiesSharedCollection,
      officialDocument.company,
    );
    this.employeesSharedCollection = this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(
      this.employeesSharedCollection,
      officialDocument.employee,
    );
    this.userProfilesSharedCollection = this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(
      this.userProfilesSharedCollection,
      officialDocument.generatedBy,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.companyService
      .query()
      .pipe(map((res: HttpResponse<ICompany[]>) => res.body ?? []))
      .pipe(
        map((companies: ICompany[]) =>
          this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, this.officialDocument?.company),
        ),
      )
      .subscribe((companies: ICompany[]) => (this.companiesSharedCollection = companies));

    this.employeeService
      .query()
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .pipe(
        map((employees: IEmployee[]) =>
          this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, this.officialDocument?.employee),
        ),
      )
      .subscribe((employees: IEmployee[]) => (this.employeesSharedCollection = employees));

    this.userProfileService
      .query()
      .pipe(map((res: HttpResponse<IUserProfile[]>) => res.body ?? []))
      .pipe(
        map((userProfiles: IUserProfile[]) =>
          this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(userProfiles, this.officialDocument?.generatedBy),
        ),
      )
      .subscribe((userProfiles: IUserProfile[]) => (this.userProfilesSharedCollection = userProfiles));
  }
}
