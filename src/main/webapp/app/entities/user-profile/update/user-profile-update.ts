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
import { AppRole } from 'app/entities/enumerations/app-role.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { UserProfileService } from '../service/user-profile.service';
import { IUserProfile } from '../user-profile.model';
import { UserProfileFormGroup, UserProfileFormService } from './user-profile-form.service';

// ✅ Import du service utilisateur JHipster
import { UserManagementService } from 'app/entities/admin/user-management/service/user-management.service';
import { IUserManagement } from 'app/entities/admin/user-management/user-management.model';

@Component({
  selector: 'pz-user-profile-update',
  templateUrl: './user-profile-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class UserProfileUpdate implements OnInit {
  readonly isSaving = signal(false);
  userProfile: IUserProfile | null = null;
  appRoleValues = Object.keys(AppRole);

  companiesSharedCollection = signal<ICompany[]>([]);

  // ✅ Liste des utilisateurs JHipster
  usersSharedCollection = signal<IUserManagement[]>([]);

  protected userProfileService = inject(UserProfileService);
  protected userProfileFormService = inject(UserProfileFormService);
  protected companyService = inject(CompanyService);
  protected activatedRoute = inject(ActivatedRoute);

  // ✅ Injection du service utilisateur
  protected userManagementService = inject(UserManagementService);

  editForm: UserProfileFormGroup = this.userProfileFormService.createUserProfileFormGroup();

  compareCompany = (o1: ICompany | null, o2: ICompany | null): boolean => this.companyService.compareCompany(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ userProfile }) => {
      this.userProfile = userProfile;
      if (userProfile) {
        this.updateForm(userProfile);
      }
      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const userProfile = this.userProfileFormService.getUserProfile(this.editForm);
    if (userProfile.id === null) {
      this.subscribeToSaveResponse(this.userProfileService.create(userProfile));
    } else {
      this.subscribeToSaveResponse(this.userProfileService.update(userProfile));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IUserProfile | null>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {}

  protected onSaveFinalize(): void {
    this.isSaving.set(false);
  }

  protected updateForm(userProfile: IUserProfile): void {
    this.userProfile = userProfile;
    this.userProfileFormService.resetForm(this.editForm, userProfile);

    this.companiesSharedCollection.update(companies =>
      this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, userProfile.company),
    );
  }

  protected loadRelationshipsOptions(): void {
    // ✅ Charger les entreprises avec nom + matricule fiscal
    this.companyService
      .query()
      .pipe(map((res: HttpResponse<ICompany[]>) => res.body ?? []))
      .pipe(
        map((companies: ICompany[]) => this.companyService.addCompanyToCollectionIfMissing<ICompany>(companies, this.userProfile?.company)),
      )
      .subscribe((companies: ICompany[]) => this.companiesSharedCollection.set(companies));

    // ✅ Charger les utilisateurs JHipster (login + prénom + nom)
    this.userManagementService
      .query({ page: 0, size: 100, sort: ['login,asc'] })
      .pipe(map((res: HttpResponse<IUserManagement[]>) => res.body ?? []))
      .subscribe((users: IUserManagement[]) => this.usersSharedCollection.set(users));
  }
}
