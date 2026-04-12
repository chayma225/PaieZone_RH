import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IUserProfile, NewUserProfile } from '../user-profile.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IUserProfile for edit and NewUserProfileFormGroupInput for create.
 */
type UserProfileFormGroupInput = IUserProfile | PartialWithRequiredKeyOf<NewUserProfile>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IUserProfile | NewUserProfile> = Omit<T, 'lastLoginAt'> & {
  lastLoginAt?: string | null;
};

type UserProfileFormRawValue = FormValueOf<IUserProfile>;

type NewUserProfileFormRawValue = FormValueOf<NewUserProfile>;

type UserProfileFormDefaults = Pick<NewUserProfile, 'id' | 'lastLoginAt' | 'twoFactorEnabled' | 'active'>;

type UserProfileFormGroupContent = {
  id: FormControl<UserProfileFormRawValue['id'] | NewUserProfile['id']>;
  jhiUserId: FormControl<UserProfileFormRawValue['jhiUserId']>;
  role: FormControl<UserProfileFormRawValue['role']>;
  phoneNumber: FormControl<UserProfileFormRawValue['phoneNumber']>;
  avatarUrl: FormControl<UserProfileFormRawValue['avatarUrl']>;
  locale: FormControl<UserProfileFormRawValue['locale']>;
  lastLoginAt: FormControl<UserProfileFormRawValue['lastLoginAt']>;
  twoFactorEnabled: FormControl<UserProfileFormRawValue['twoFactorEnabled']>;
  twoFactorSecret: FormControl<UserProfileFormRawValue['twoFactorSecret']>;
  active: FormControl<UserProfileFormRawValue['active']>;
  company: FormControl<UserProfileFormRawValue['company']>;
};

export type UserProfileFormGroup = FormGroup<UserProfileFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class UserProfileFormService {
  createUserProfileFormGroup(userProfile?: UserProfileFormGroupInput): UserProfileFormGroup {
    const userProfileRawValue = this.convertUserProfileToUserProfileRawValue({
      ...this.getFormDefaults(),
      ...(userProfile ?? { id: null }),
    });
    return new FormGroup<UserProfileFormGroupContent>({
      id: new FormControl(
        { value: userProfileRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      jhiUserId: new FormControl(userProfileRawValue.jhiUserId, {
        validators: [Validators.required, Validators.maxLength(50)],
      }),
      role: new FormControl(userProfileRawValue.role, {
        validators: [Validators.required],
      }),
      phoneNumber: new FormControl(userProfileRawValue.phoneNumber, {
        validators: [Validators.maxLength(20)],
      }),
      avatarUrl: new FormControl(userProfileRawValue.avatarUrl, {
        validators: [Validators.maxLength(500)],
      }),
      locale: new FormControl(userProfileRawValue.locale, {
        validators: [Validators.maxLength(10)],
      }),
      lastLoginAt: new FormControl(userProfileRawValue.lastLoginAt),
      twoFactorEnabled: new FormControl(userProfileRawValue.twoFactorEnabled),
      twoFactorSecret: new FormControl(userProfileRawValue.twoFactorSecret, {
        validators: [Validators.maxLength(100)],
      }),
      active: new FormControl(userProfileRawValue.active, {
        validators: [Validators.required],
      }),
      company: new FormControl(userProfileRawValue.company, {
        validators: [Validators.required],
      }),
    });
  }

  getUserProfile(form: UserProfileFormGroup): IUserProfile | NewUserProfile {
    return this.convertUserProfileRawValueToUserProfile(form.getRawValue() as UserProfileFormRawValue | NewUserProfileFormRawValue);
  }

  resetForm(form: UserProfileFormGroup, userProfile: UserProfileFormGroupInput): void {
    const userProfileRawValue = this.convertUserProfileToUserProfileRawValue({ ...this.getFormDefaults(), ...userProfile });
    form.reset({
      ...userProfileRawValue,
      id: { value: userProfileRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): UserProfileFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      lastLoginAt: currentTime,
      twoFactorEnabled: false,
      active: false,
    };
  }

  private convertUserProfileRawValueToUserProfile(
    rawUserProfile: UserProfileFormRawValue | NewUserProfileFormRawValue,
  ): IUserProfile | NewUserProfile {
    return {
      ...rawUserProfile,
      lastLoginAt: dayjs(rawUserProfile.lastLoginAt, DATE_TIME_FORMAT),
    };
  }

  private convertUserProfileToUserProfileRawValue(
    userProfile: IUserProfile | (Partial<NewUserProfile> & UserProfileFormDefaults),
  ): UserProfileFormRawValue | PartialWithRequiredKeyOf<NewUserProfileFormRawValue> {
    return {
      ...userProfile,
      lastLoginAt: userProfile.lastLoginAt ? userProfile.lastLoginAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
