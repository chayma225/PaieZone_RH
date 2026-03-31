import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IDepartment, NewDepartment } from '../department.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IDepartment for edit and NewDepartmentFormGroupInput for create.
 */
type DepartmentFormGroupInput = IDepartment | PartialWithRequiredKeyOf<NewDepartment>;

type DepartmentFormDefaults = Pick<NewDepartment, 'id' | 'active'>;

type DepartmentFormGroupContent = {
  id: FormControl<IDepartment['id'] | NewDepartment['id']>;
  code: FormControl<IDepartment['code']>;
  name: FormControl<IDepartment['name']>;
  description: FormControl<IDepartment['description']>;
  active: FormControl<IDepartment['active']>;
  company: FormControl<IDepartment['company']>;
  manager: FormControl<IDepartment['manager']>;
};

export type DepartmentFormGroup = FormGroup<DepartmentFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class DepartmentFormService {
  createDepartmentFormGroup(department: DepartmentFormGroupInput = { id: null }): DepartmentFormGroup {
    const departmentRawValue = {
      ...this.getFormDefaults(),
      ...department,
    };
    return new FormGroup<DepartmentFormGroupContent>({
      id: new FormControl(
        { value: departmentRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(departmentRawValue.code, {
        validators: [Validators.required, Validators.maxLength(20)],
      }),
      name: new FormControl(departmentRawValue.name, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      description: new FormControl(departmentRawValue.description, {
        validators: [Validators.maxLength(255)],
      }),
      active: new FormControl(departmentRawValue.active, {
        validators: [Validators.required],
      }),
      company: new FormControl(departmentRawValue.company, {
        validators: [Validators.required],
      }),
      manager: new FormControl(departmentRawValue.manager),
    });
  }

  getDepartment(form: DepartmentFormGroup): IDepartment | NewDepartment {
    return form.getRawValue() as IDepartment | NewDepartment;
  }

  resetForm(form: DepartmentFormGroup, department: DepartmentFormGroupInput): void {
    const departmentRawValue = { ...this.getFormDefaults(), ...department };
    form.reset(
      {
        ...departmentRawValue,
        id: { value: departmentRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): DepartmentFormDefaults {
    return {
      id: null,
      active: false,
    };
  }
}
