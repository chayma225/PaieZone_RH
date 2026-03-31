import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IJobPosition, NewJobPosition } from '../job-position.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IJobPosition for edit and NewJobPositionFormGroupInput for create.
 */
type JobPositionFormGroupInput = IJobPosition | PartialWithRequiredKeyOf<NewJobPosition>;

type JobPositionFormDefaults = Pick<NewJobPosition, 'id' | 'active'>;

type JobPositionFormGroupContent = {
  id: FormControl<IJobPosition['id'] | NewJobPosition['id']>;
  code: FormControl<IJobPosition['code']>;
  title: FormControl<IJobPosition['title']>;
  description: FormControl<IJobPosition['description']>;
  minSalary: FormControl<IJobPosition['minSalary']>;
  maxSalary: FormControl<IJobPosition['maxSalary']>;
  active: FormControl<IJobPosition['active']>;
  company: FormControl<IJobPosition['company']>;
  department: FormControl<IJobPosition['department']>;
};

export type JobPositionFormGroup = FormGroup<JobPositionFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class JobPositionFormService {
  createJobPositionFormGroup(jobPosition: JobPositionFormGroupInput = { id: null }): JobPositionFormGroup {
    const jobPositionRawValue = {
      ...this.getFormDefaults(),
      ...jobPosition,
    };
    return new FormGroup<JobPositionFormGroupContent>({
      id: new FormControl(
        { value: jobPositionRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(jobPositionRawValue.code, {
        validators: [Validators.required, Validators.maxLength(20)],
      }),
      title: new FormControl(jobPositionRawValue.title, {
        validators: [Validators.required, Validators.maxLength(150)],
      }),
      description: new FormControl(jobPositionRawValue.description, {
        validators: [Validators.maxLength(500)],
      }),
      minSalary: new FormControl(jobPositionRawValue.minSalary),
      maxSalary: new FormControl(jobPositionRawValue.maxSalary),
      active: new FormControl(jobPositionRawValue.active, {
        validators: [Validators.required],
      }),
      company: new FormControl(jobPositionRawValue.company, {
        validators: [Validators.required],
      }),
      department: new FormControl(jobPositionRawValue.department),
    });
  }

  getJobPosition(form: JobPositionFormGroup): IJobPosition | NewJobPosition {
    return form.getRawValue() as IJobPosition | NewJobPosition;
  }

  resetForm(form: JobPositionFormGroup, jobPosition: JobPositionFormGroupInput): void {
    const jobPositionRawValue = { ...this.getFormDefaults(), ...jobPosition };
    form.reset(
      {
        ...jobPositionRawValue,
        id: { value: jobPositionRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): JobPositionFormDefaults {
    return {
      id: null,
      active: false,
    };
  }
}
