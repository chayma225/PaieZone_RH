import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { DocumentType } from 'app/entities/enumerations/document-type.model';
import { UserProfileService } from 'app/entities/user-profile/service/user-profile.service';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';

import { IHrDocument } from '../hr-document.model';
import { HrDocumentService } from '../service/hr-document.service';

import { HrDocumentFormGroup, HrDocumentFormService } from './hr-document-form.service';

@Component({
  selector: 'pz-hr-document-update',
  templateUrl: './hr-document-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule, NgbInputDatepicker],
})
export class HrDocumentUpdate implements OnInit {
  readonly isSaving = signal(false);
  hrDocument: IHrDocument | null = null;
  documentTypeValues = Object.keys(DocumentType);

  employeesSharedCollection = signal<IEmployee[]>([]);
  userProfilesSharedCollection = signal<IUserProfile[]>([]);

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
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const hrDocument = this.hrDocumentFormService.getHrDocument(this.editForm);
    if (hrDocument.id === null) {
      this.subscribeToSaveResponse(this.hrDocumentService.create(hrDocument));
    } else {
      this.subscribeToSaveResponse(this.hrDocumentService.update(hrDocument));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IHrDocument | null>): void {
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

  protected updateForm(hrDocument: IHrDocument): void {
    this.hrDocument = hrDocument;
    this.hrDocumentFormService.resetForm(this.editForm, hrDocument);

    this.employeesSharedCollection.update(employees =>
      this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, hrDocument.employee),
    );
    this.userProfilesSharedCollection.update(userProfiles =>
      this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(userProfiles, hrDocument.uploadedBy),
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
      .subscribe((employees: IEmployee[]) => this.employeesSharedCollection.set(employees));

    this.userProfileService
      .query()
      .pipe(map((res: HttpResponse<IUserProfile[]>) => res.body ?? []))
      .pipe(
        map((userProfiles: IUserProfile[]) =>
          this.userProfileService.addUserProfileToCollectionIfMissing<IUserProfile>(userProfiles, this.hrDocument?.uploadedBy),
        ),
      )
      .subscribe((userProfiles: IUserProfile[]) => this.userProfilesSharedCollection.set(userProfiles));
  }
}
