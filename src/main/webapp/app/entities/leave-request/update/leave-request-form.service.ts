import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ILeaveRequest, NewLeaveRequest } from '../leave-request.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ILeaveRequest for edit and NewLeaveRequestFormGroupInput for create.
 */
type LeaveRequestFormGroupInput = ILeaveRequest | PartialWithRequiredKeyOf<NewLeaveRequest>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends ILeaveRequest | NewLeaveRequest> = Omit<T, 'requestedAt' | 'processedAt'> & {
  requestedAt?: string | null;
  processedAt?: string | null;
};

type LeaveRequestFormRawValue = FormValueOf<ILeaveRequest>;

type NewLeaveRequestFormRawValue = FormValueOf<NewLeaveRequest>;

type LeaveRequestFormDefaults = Pick<NewLeaveRequest, 'id' | 'requestedAt' | 'processedAt'>;

type LeaveRequestFormGroupContent = {
  id: FormControl<LeaveRequestFormRawValue['id'] | NewLeaveRequest['id']>;
  startDate: FormControl<LeaveRequestFormRawValue['startDate']>;
  endDate: FormControl<LeaveRequestFormRawValue['endDate']>;
  numberOfDays: FormControl<LeaveRequestFormRawValue['numberOfDays']>;
  status: FormControl<LeaveRequestFormRawValue['status']>;
  requestedAt: FormControl<LeaveRequestFormRawValue['requestedAt']>;
  processedAt: FormControl<LeaveRequestFormRawValue['processedAt']>;
  managerComment: FormControl<LeaveRequestFormRawValue['managerComment']>;
  employeeComment: FormControl<LeaveRequestFormRawValue['employeeComment']>;
  documentUrl: FormControl<LeaveRequestFormRawValue['documentUrl']>;
  employee: FormControl<LeaveRequestFormRawValue['employee']>;
  leaveType: FormControl<LeaveRequestFormRawValue['leaveType']>;
  approvedBy: FormControl<LeaveRequestFormRawValue['approvedBy']>;
};

export type LeaveRequestFormGroup = FormGroup<LeaveRequestFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class LeaveRequestFormService {
  createLeaveRequestFormGroup(leaveRequest: LeaveRequestFormGroupInput = { id: null }): LeaveRequestFormGroup {
    const leaveRequestRawValue = this.convertLeaveRequestToLeaveRequestRawValue({
      ...this.getFormDefaults(),
      ...leaveRequest,
    });
    return new FormGroup<LeaveRequestFormGroupContent>({
      id: new FormControl(
        { value: leaveRequestRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      startDate: new FormControl(leaveRequestRawValue.startDate, {
        validators: [Validators.required],
      }),
      endDate: new FormControl(leaveRequestRawValue.endDate, {
        validators: [Validators.required],
      }),
      numberOfDays: new FormControl(leaveRequestRawValue.numberOfDays, {
        validators: [Validators.required, Validators.min(1)],
      }),
      status: new FormControl(leaveRequestRawValue.status, {
        validators: [Validators.required],
      }),
      requestedAt: new FormControl(leaveRequestRawValue.requestedAt, {
        validators: [Validators.required],
      }),
      processedAt: new FormControl(leaveRequestRawValue.processedAt),
      managerComment: new FormControl(leaveRequestRawValue.managerComment, {
        validators: [Validators.maxLength(500)],
      }),
      employeeComment: new FormControl(leaveRequestRawValue.employeeComment, {
        validators: [Validators.maxLength(500)],
      }),
      documentUrl: new FormControl(leaveRequestRawValue.documentUrl, {
        validators: [Validators.maxLength(500)],
      }),
      employee: new FormControl(leaveRequestRawValue.employee, {
        validators: [Validators.required],
      }),
      leaveType: new FormControl(leaveRequestRawValue.leaveType, {
        validators: [Validators.required],
      }),
      approvedBy: new FormControl(leaveRequestRawValue.approvedBy),
    });
  }

  getLeaveRequest(form: LeaveRequestFormGroup): ILeaveRequest | NewLeaveRequest {
    return this.convertLeaveRequestRawValueToLeaveRequest(form.getRawValue() as LeaveRequestFormRawValue | NewLeaveRequestFormRawValue);
  }

  resetForm(form: LeaveRequestFormGroup, leaveRequest: LeaveRequestFormGroupInput): void {
    const leaveRequestRawValue = this.convertLeaveRequestToLeaveRequestRawValue({ ...this.getFormDefaults(), ...leaveRequest });
    form.reset(
      {
        ...leaveRequestRawValue,
        id: { value: leaveRequestRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): LeaveRequestFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      requestedAt: currentTime,
      processedAt: currentTime,
    };
  }

  private convertLeaveRequestRawValueToLeaveRequest(
    rawLeaveRequest: LeaveRequestFormRawValue | NewLeaveRequestFormRawValue,
  ): ILeaveRequest | NewLeaveRequest {
    return {
      ...rawLeaveRequest,
      requestedAt: dayjs(rawLeaveRequest.requestedAt, DATE_TIME_FORMAT),
      processedAt: dayjs(rawLeaveRequest.processedAt, DATE_TIME_FORMAT),
    };
  }

  private convertLeaveRequestToLeaveRequestRawValue(
    leaveRequest: ILeaveRequest | (Partial<NewLeaveRequest> & LeaveRequestFormDefaults),
  ): LeaveRequestFormRawValue | PartialWithRequiredKeyOf<NewLeaveRequestFormRawValue> {
    return {
      ...leaveRequest,
      requestedAt: leaveRequest.requestedAt ? leaveRequest.requestedAt.format(DATE_TIME_FORMAT) : undefined,
      processedAt: leaveRequest.processedAt ? leaveRequest.processedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
