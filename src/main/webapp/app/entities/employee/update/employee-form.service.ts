import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IEmployee, NewEmployee } from '../employee.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IEmployee for edit and NewEmployeeFormGroupInput for create.
 */
type EmployeeFormGroupInput = IEmployee | PartialWithRequiredKeyOf<NewEmployee>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IEmployee | NewEmployee> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type EmployeeFormRawValue = FormValueOf<IEmployee>;

type NewEmployeeFormRawValue = FormValueOf<NewEmployee>;

type EmployeeFormDefaults = Pick<NewEmployee, 'id' | 'chefDeFamille' | 'active' | 'createdAt' | 'updatedAt'>;

type EmployeeFormGroupContent = {
  id: FormControl<EmployeeFormRawValue['id'] | NewEmployee['id']>;
  matricule: FormControl<EmployeeFormRawValue['matricule']>;
  firstName: FormControl<EmployeeFormRawValue['firstName']>;
  lastName: FormControl<EmployeeFormRawValue['lastName']>;
  firstNameAr: FormControl<EmployeeFormRawValue['firstNameAr']>;
  lastNameAr: FormControl<EmployeeFormRawValue['lastNameAr']>;
  birthDate: FormControl<EmployeeFormRawValue['birthDate']>;
  birthPlace: FormControl<EmployeeFormRawValue['birthPlace']>;
  gender: FormControl<EmployeeFormRawValue['gender']>;
  maritalStatus: FormControl<EmployeeFormRawValue['maritalStatus']>;
  numberOfChildren: FormControl<EmployeeFormRawValue['numberOfChildren']>;
  chefDeFamille: FormControl<EmployeeFormRawValue['chefDeFamille']>;
  nationalId: FormControl<EmployeeFormRawValue['nationalId']>;
  passportNumber: FormControl<EmployeeFormRawValue['passportNumber']>;
  nationality: FormControl<EmployeeFormRawValue['nationality']>;
  address: FormControl<EmployeeFormRawValue['address']>;
  city: FormControl<EmployeeFormRawValue['city']>;
  personalEmail: FormControl<EmployeeFormRawValue['personalEmail']>;
  professionalEmail: FormControl<EmployeeFormRawValue['professionalEmail']>;
  phoneNumber: FormControl<EmployeeFormRawValue['phoneNumber']>;
  cnssNumber: FormControl<EmployeeFormRawValue['cnssNumber']>;
  category: FormControl<EmployeeFormRawValue['category']>;
  photoUrl: FormControl<EmployeeFormRawValue['photoUrl']>;
  hireDate: FormControl<EmployeeFormRawValue['hireDate']>;
  trialEndDate: FormControl<EmployeeFormRawValue['trialEndDate']>;
  active: FormControl<EmployeeFormRawValue['active']>;
  notes: FormControl<EmployeeFormRawValue['notes']>;
  createdAt: FormControl<EmployeeFormRawValue['createdAt']>;
  updatedAt: FormControl<EmployeeFormRawValue['updatedAt']>;
  company: FormControl<EmployeeFormRawValue['company']>;
  department: FormControl<EmployeeFormRawValue['department']>;
  position: FormControl<EmployeeFormRawValue['position']>;
  manager: FormControl<EmployeeFormRawValue['manager']>;
  userProfile: FormControl<EmployeeFormRawValue['userProfile']>;
};

export type EmployeeFormGroup = FormGroup<EmployeeFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class EmployeeFormService {
  createEmployeeFormGroup(employee: EmployeeFormGroupInput = { id: null }): EmployeeFormGroup {
    const employeeRawValue = this.convertEmployeeToEmployeeRawValue({
      ...this.getFormDefaults(),
      ...employee,
    });
    return new FormGroup<EmployeeFormGroupContent>({
      id: new FormControl(
        { value: employeeRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      matricule: new FormControl(employeeRawValue.matricule, {
        validators: [Validators.required, Validators.maxLength(20)],
      }),
      firstName: new FormControl(employeeRawValue.firstName, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      lastName: new FormControl(employeeRawValue.lastName, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      firstNameAr: new FormControl(employeeRawValue.firstNameAr, {
        validators: [Validators.maxLength(100)],
      }),
      lastNameAr: new FormControl(employeeRawValue.lastNameAr, {
        validators: [Validators.maxLength(100)],
      }),
      birthDate: new FormControl(employeeRawValue.birthDate, {
        validators: [Validators.required],
      }),
      birthPlace: new FormControl(employeeRawValue.birthPlace, {
        validators: [Validators.maxLength(100)],
      }),
      gender: new FormControl(employeeRawValue.gender, {
        validators: [Validators.required],
      }),
      maritalStatus: new FormControl(employeeRawValue.maritalStatus, {
        validators: [Validators.required],
      }),
      numberOfChildren: new FormControl(employeeRawValue.numberOfChildren, {
        validators: [Validators.required, Validators.min(0), Validators.max(10)],
      }),
      chefDeFamille: new FormControl(employeeRawValue.chefDeFamille, {
        validators: [Validators.required],
      }),
      nationalId: new FormControl(employeeRawValue.nationalId, {
        validators: [Validators.required, Validators.maxLength(20)],
      }),
      passportNumber: new FormControl(employeeRawValue.passportNumber, {
        validators: [Validators.maxLength(20)],
      }),
      nationality: new FormControl(employeeRawValue.nationality, {
        validators: [Validators.maxLength(50)],
      }),
      address: new FormControl(employeeRawValue.address, {
        validators: [Validators.maxLength(255)],
      }),
      city: new FormControl(employeeRawValue.city, {
        validators: [Validators.maxLength(100)],
      }),
      personalEmail: new FormControl(employeeRawValue.personalEmail, {
        validators: [Validators.maxLength(100)],
      }),
      professionalEmail: new FormControl(employeeRawValue.professionalEmail, {
        validators: [Validators.maxLength(100)],
      }),
      phoneNumber: new FormControl(employeeRawValue.phoneNumber, {
        validators: [Validators.maxLength(20)],
      }),
      cnssNumber: new FormControl(employeeRawValue.cnssNumber, {
        validators: [Validators.maxLength(20)],
      }),
      category: new FormControl(employeeRawValue.category, {
        validators: [Validators.required],
      }),
      photoUrl: new FormControl(employeeRawValue.photoUrl, {
        validators: [Validators.maxLength(500)],
      }),
      hireDate: new FormControl(employeeRawValue.hireDate, {
        validators: [Validators.required],
      }),
      trialEndDate: new FormControl(employeeRawValue.trialEndDate),
      active: new FormControl(employeeRawValue.active, {
        validators: [Validators.required],
      }),
      notes: new FormControl(employeeRawValue.notes),
      createdAt: new FormControl(employeeRawValue.createdAt, {
        validators: [Validators.required],
      }),
      updatedAt: new FormControl(employeeRawValue.updatedAt),
      company: new FormControl(employeeRawValue.company, {
        validators: [Validators.required],
      }),
      department: new FormControl(employeeRawValue.department, {
        validators: [Validators.required],
      }),
      position: new FormControl(employeeRawValue.position, {
        validators: [Validators.required],
      }),
      manager: new FormControl(employeeRawValue.manager),
      userProfile: new FormControl(employeeRawValue.userProfile),
    });
  }

  getEmployee(form: EmployeeFormGroup): IEmployee | NewEmployee {
    return this.convertEmployeeRawValueToEmployee(form.getRawValue() as EmployeeFormRawValue | NewEmployeeFormRawValue);
  }

  resetForm(form: EmployeeFormGroup, employee: EmployeeFormGroupInput): void {
    const employeeRawValue = this.convertEmployeeToEmployeeRawValue({ ...this.getFormDefaults(), ...employee });
    form.reset(
      {
        ...employeeRawValue,
        id: { value: employeeRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): EmployeeFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      chefDeFamille: false,
      active: false,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertEmployeeRawValueToEmployee(rawEmployee: EmployeeFormRawValue | NewEmployeeFormRawValue): IEmployee | NewEmployee {
    return {
      ...rawEmployee,
      createdAt: dayjs(rawEmployee.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawEmployee.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertEmployeeToEmployeeRawValue(
    employee: IEmployee | (Partial<NewEmployee> & EmployeeFormDefaults),
  ): EmployeeFormRawValue | PartialWithRequiredKeyOf<NewEmployeeFormRawValue> {
    return {
      ...employee,
      createdAt: employee.createdAt ? employee.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: employee.updatedAt ? employee.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
