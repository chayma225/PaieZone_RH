import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ITimeEntry, NewTimeEntry } from '../time-entry.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ITimeEntry for edit and NewTimeEntryFormGroupInput for create.
 */
type TimeEntryFormGroupInput = ITimeEntry | PartialWithRequiredKeyOf<NewTimeEntry>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends ITimeEntry | NewTimeEntry> = Omit<T, 'checkIn' | 'checkOut' | 'validatedAt'> & {
  checkIn?: string | null;
  checkOut?: string | null;
  validatedAt?: string | null;
};

type TimeEntryFormRawValue = FormValueOf<ITimeEntry>;

type NewTimeEntryFormRawValue = FormValueOf<NewTimeEntry>;

type TimeEntryFormDefaults = Pick<NewTimeEntry, 'id' | 'checkIn' | 'checkOut' | 'validatedAt'>;

type TimeEntryFormGroupContent = {
  id: FormControl<TimeEntryFormRawValue['id'] | NewTimeEntry['id']>;
  entryDate: FormControl<TimeEntryFormRawValue['entryDate']>;
  checkIn: FormControl<TimeEntryFormRawValue['checkIn']>;
  checkOut: FormControl<TimeEntryFormRawValue['checkOut']>;
  workedHours: FormControl<TimeEntryFormRawValue['workedHours']>;
  overtimeHours: FormControl<TimeEntryFormRawValue['overtimeHours']>;
  lateMinutes: FormControl<TimeEntryFormRawValue['lateMinutes']>;
  source: FormControl<TimeEntryFormRawValue['source']>;
  status: FormControl<TimeEntryFormRawValue['status']>;
  anomalyNote: FormControl<TimeEntryFormRawValue['anomalyNote']>;
  validatedBy: FormControl<TimeEntryFormRawValue['validatedBy']>;
  validatedAt: FormControl<TimeEntryFormRawValue['validatedAt']>;
  employee: FormControl<TimeEntryFormRawValue['employee']>;
  validatedByUser: FormControl<TimeEntryFormRawValue['validatedByUser']>;
};

export type TimeEntryFormGroup = FormGroup<TimeEntryFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class TimeEntryFormService {
  createTimeEntryFormGroup(timeEntry?: TimeEntryFormGroupInput): TimeEntryFormGroup {
    const timeEntryRawValue = this.convertTimeEntryToTimeEntryRawValue({
      ...this.getFormDefaults(),
      ...(timeEntry ?? { id: null }),
    });
    return new FormGroup<TimeEntryFormGroupContent>({
      id: new FormControl(
        { value: timeEntryRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      entryDate: new FormControl(timeEntryRawValue.entryDate, {
        validators: [Validators.required],
      }),
      checkIn: new FormControl(timeEntryRawValue.checkIn),
      checkOut: new FormControl(timeEntryRawValue.checkOut),
      workedHours: new FormControl(timeEntryRawValue.workedHours),
      overtimeHours: new FormControl(timeEntryRawValue.overtimeHours),
      lateMinutes: new FormControl(timeEntryRawValue.lateMinutes),
      source: new FormControl(timeEntryRawValue.source, {
        validators: [Validators.required],
      }),
      status: new FormControl(timeEntryRawValue.status, {
        validators: [Validators.required],
      }),
      anomalyNote: new FormControl(timeEntryRawValue.anomalyNote, {
        validators: [Validators.maxLength(500)],
      }),
      validatedBy: new FormControl(timeEntryRawValue.validatedBy, {
        validators: [Validators.maxLength(100)],
      }),
      validatedAt: new FormControl(timeEntryRawValue.validatedAt),
      employee: new FormControl(timeEntryRawValue.employee, {
        validators: [Validators.required],
      }),
      validatedByUser: new FormControl(timeEntryRawValue.validatedByUser),
    });
  }

  getTimeEntry(form: TimeEntryFormGroup): ITimeEntry | NewTimeEntry {
    return this.convertTimeEntryRawValueToTimeEntry(form.getRawValue() as TimeEntryFormRawValue | NewTimeEntryFormRawValue);
  }

  resetForm(form: TimeEntryFormGroup, timeEntry: TimeEntryFormGroupInput): void {
    const timeEntryRawValue = this.convertTimeEntryToTimeEntryRawValue({ ...this.getFormDefaults(), ...timeEntry });
    form.reset({
      ...timeEntryRawValue,
      id: { value: timeEntryRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): TimeEntryFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      checkIn: currentTime,
      checkOut: currentTime,
      validatedAt: currentTime,
    };
  }

  private convertTimeEntryRawValueToTimeEntry(rawTimeEntry: TimeEntryFormRawValue | NewTimeEntryFormRawValue): ITimeEntry | NewTimeEntry {
    return {
      ...rawTimeEntry,
      checkIn: dayjs(rawTimeEntry.checkIn, DATE_TIME_FORMAT),
      checkOut: dayjs(rawTimeEntry.checkOut, DATE_TIME_FORMAT),
      validatedAt: dayjs(rawTimeEntry.validatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertTimeEntryToTimeEntryRawValue(
    timeEntry: ITimeEntry | (Partial<NewTimeEntry> & TimeEntryFormDefaults),
  ): TimeEntryFormRawValue | PartialWithRequiredKeyOf<NewTimeEntryFormRawValue> {
    return {
      ...timeEntry,
      checkIn: timeEntry.checkIn ? timeEntry.checkIn.format(DATE_TIME_FORMAT) : undefined,
      checkOut: timeEntry.checkOut ? timeEntry.checkOut.format(DATE_TIME_FORMAT) : undefined,
      validatedAt: timeEntry.validatedAt ? timeEntry.validatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
