import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { UserProfileService } from 'app/entities/user-profile/service/user-profile.service';
import { DocumentType } from 'app/entities/enumerations/document-type.model';
import { HrDocumentService } from '../service/hr-document.service';
import { IHrDocument } from '../hr-document.model';
import { HrDocumentFormGroup, HrDocumentFormService } from './hr-document-form.service';

@Component({
  selector: 'pz-hr-document-update',
  templateUrl: './hr-document-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class HrDocumentUpdateComponent implements OnInit {
  isSaving = false;
  hrDocument: IHrDocument | null = null;
  documentTypeValues = Object.keys(DocumentType);

  employeesSharedCollection: IEmployee[] = [];
  userProfilesSharedCollection: IUserProfile[] = [];

  protected hrDocumentService = inject(HrDocumentService);
  protected hrDocumentFormService = inject(HrDocumentFormService);
  protected employeeService = inject(EmployeeService);
  protected userProfileService = inject(UserProfileService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: HrDocumentFormGroup = this.hrDocumentFormService.createHrDocumentFormGroup();

  compareEmployee = (o1: IEmployee | null, o2: IEmployee | null): boolean => this.employeeService.compareEmployee(o1, o2);

  compareUserProfile = (o1: IUserProfile | null, o2: IUserProfile | null): boolean => this.userProfileService.compareUserProfile(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ hrDocument }) => {
      this.hrDocument = hrDocument;
      if (hrDocument) {
        this.updateForm(hrDocument);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const hrDocument = this.hrDocumentFormService.getHrDocument(this.editForm);
    if (hrDocument.id !== null) {
      this.subscribeToSaveResponse(this.hrDocumentService.update(hrDocument));
    } else {
      this.subscribeToSaveResponse(this.hrDocumentService.create(hrDocument));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IHrDocument>>): void {
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

  protected updateForm(hrDocument: IHrDocument): void {
    this.hrDocument = hrDocument;
    this.hrDocumentFormService.resetForm(this.editForm, hrDocument);

    this.employeesSharedCollection = this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(
      this.employeesSharedCollection,
      hrDocument.employee,
    );
    this.userProfilesSharedCollection = this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(
      this.userProfilesSharedCollection,
      hrDocument.uploadedBy,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.employeeService
      .query()
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .pipe(
        map((employees: IEmployee[]) =>
          this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, this.hrDocument?.employee),
        ),
      )
      .subscribe((employees: IEmployee[]) => (this.employeesSharedCollection = employees));

    this.userProfileService
      .query()
      .pipe(map((res: HttpResponse<IUserProfile[]>) => res.body ?? []))
      .pipe(
        map((userProfiles: IUserProfile[]) =>
          this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(userProfiles, this.hrDocument?.uploadedBy),
        ),
      )
      .subscribe((userProfiles: IUserProfile[]) => (this.userProfilesSharedCollection = userProfiles));
  }
}
