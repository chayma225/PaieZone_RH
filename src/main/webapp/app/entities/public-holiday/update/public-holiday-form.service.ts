import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IPublicHoliday, NewPublicHoliday } from '../public-holiday.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPublicHoliday for edit and NewPublicHolidayFormGroupInput for create.
 */
type PublicHolidayFormGroupInput = IPublicHoliday | PartialWithRequiredKeyOf<NewPublicHoliday>;

type PublicHolidayFormDefaults = Pick<NewPublicHoliday, 'id' | 'isRecurring' | 'active'>;

type PublicHolidayFormGroupContent = {
  id: FormControl<IPublicHoliday['id'] | NewPublicHoliday['id']>;
  name: FormControl<IPublicHoliday['name']>;
  nameAr: FormControl<IPublicHoliday['nameAr']>;
  holidayDate: FormControl<IPublicHoliday['holidayDate']>;
  year: FormControl<IPublicHoliday['year']>;
  isRecurring: FormControl<IPublicHoliday['isRecurring']>;
  active: FormControl<IPublicHoliday['active']>;
};

export type PublicHolidayFormGroup = FormGroup<PublicHolidayFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PublicHolidayFormService {
  createPublicHolidayFormGroup(publicHoliday: PublicHolidayFormGroupInput = { id: null }): PublicHolidayFormGroup {
    const publicHolidayRawValue = {
      ...this.getFormDefaults(),
      ...publicHoliday,
    };
    return new FormGroup<PublicHolidayFormGroupContent>({
      id: new FormControl(
        { value: publicHolidayRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(publicHolidayRawValue.name, {
        validators: [Validators.required, Validators.maxLength(150)],
      }),
      nameAr: new FormControl(publicHolidayRawValue.nameAr, {
        validators: [Validators.maxLength(150)],
      }),
      holidayDate: new FormControl(publicHolidayRawValue.holidayDate, {
        validators: [Validators.required],
      }),
      year: new FormControl(publicHolidayRawValue.year, {
        validators: [Validators.required],
      }),
      isRecurring: new FormControl(publicHolidayRawValue.isRecurring, {
        validators: [Validators.required],
      }),
      active: new FormControl(publicHolidayRawValue.active, {
        validators: [Validators.required],
      }),
    });
  }

  getPublicHoliday(form: PublicHolidayFormGroup): IPublicHoliday | NewPublicHoliday {
    return form.getRawValue() as IPublicHoliday | NewPublicHoliday;
  }

  resetForm(form: PublicHolidayFormGroup, publicHoliday: PublicHolidayFormGroupInput): void {
    const publicHolidayRawValue = { ...this.getFormDefaults(), ...publicHoliday };
    form.reset(
      {
        ...publicHolidayRawValue,
        id: { value: publicHolidayRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): PublicHolidayFormDefaults {
    return {
      id: null,
      isRecurring: false,
      active: false,
    };
  }
}
