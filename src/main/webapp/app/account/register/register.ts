import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { EMAIL_ALREADY_USED_TYPE, LOGIN_ALREADY_USED_TYPE } from 'app/shared/jhipster/error.constants';
import { TranslateDirective } from 'app/shared/language';
import PasswordStrengthBar from '../password/password-strength-bar/password-strength-bar';

import { RegisterService } from './register.service';
import IconComponent from 'app/paiezone/core/icon/icon.component';

@Component({
  selector: 'pz-register',
  imports: [TranslateDirective, TranslateModule, RouterLink, ReactiveFormsModule, PasswordStrengthBar, IconComponent],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export default class Register implements AfterViewInit {
  companyNameInput = viewChild.required<ElementRef>('companyNameInput');

  readonly doNotMatch = signal(false);
  readonly error = signal(false);
  readonly errorEmailExists = signal(false);
  readonly errorUserExists = signal(false);
  readonly errorTaxIdExists = signal(false);
  readonly success = signal(false);

  registerForm = new FormGroup({
    // Entreprise
    companyName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(150)],
    }),
    taxId: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(20)] }),
    companyPhone: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(20)] }),
    companyEmail: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(100)],
    }),
    address: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(255)] }),
    gouvernorat: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    city: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    postalCode: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(10)] }),
    // Admin
    login: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$'),
      ],
    }),
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
  });

  private readonly translateService = inject(TranslateService);
  private readonly registerService = inject(RegisterService);

  ngAfterViewInit(): void {
    this.companyNameInput().nativeElement.focus();
  }

  register(): void {
    this.doNotMatch.set(false);
    this.error.set(false);
    this.errorEmailExists.set(false);
    this.errorUserExists.set(false);
    this.errorTaxIdExists.set(false);

    const { password, confirmPassword } = this.registerForm.getRawValue();
    if (password !== confirmPassword) {
      this.doNotMatch.set(true);
      return;
    }

    const v = this.registerForm.getRawValue();
    this.registerService
      .saveWithCompany({
        // user
        login: v.login,
        email: v.email,
        password: v.password,
        langKey: this.translateService.getCurrentLang(),
        firstName: v.firstName,
        lastName: v.lastName,
        // company
        companyName: v.companyName,
        taxId: v.taxId,
        phone: v.companyPhone,
        companyEmail: v.companyEmail,
        address: v.address,
        gouvernorat: v.gouvernorat,
        city: v.city,
        postalCode: v.postalCode,
      })
      .subscribe({ next: () => this.success.set(true), error: response => this.processError(response) });
  }

  private processError(response: HttpErrorResponse): void {
    if (response.status === 400 && response.error.type === LOGIN_ALREADY_USED_TYPE) {
      this.errorUserExists.set(true);
    } else if (response.status === 400 && response.error.type === EMAIL_ALREADY_USED_TYPE) {
      this.errorEmailExists.set(true);
    } else if (response.status === 400 && (response.error.errorKey === 'taxIdExists' || response.error.message === 'error.taxIdExists')) {
      this.errorTaxIdExists.set(true);
    } else {
      this.error.set(true);
    }
  }
}
