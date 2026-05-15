import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'pz-company-setup',
  imports: [ReactiveFormsModule],
  templateUrl: './company-setup.html',
})
export default class CompanySetup implements AfterViewInit {
  taxIdInput = viewChild.required<ElementRef>('taxIdInput');

  readonly busy = signal(false);
  readonly error = signal('');

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    taxId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    address: new FormControl('', { nonNullable: true }),
    gouvernorat: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    city: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    postalCode: new FormControl('', { nonNullable: true }),
  });

  ngAfterViewInit(): void {
    this.taxIdInput().nativeElement.focus();
  }

  submit(): void {
    if (this.form.invalid) return;
    this.busy.set(true);
    this.error.set('');

    const { name, taxId, email, address, gouvernorat, city, postalCode } = this.form.getRawValue();

    this.http
      .post<any>('/api/companies', {
        name: name.trim(),
        taxId: taxId.trim(),
        email: email.trim(),
        address: address.trim() || null,
        gouvernorat: gouvernorat,
        city: city.trim(),
        postalCode: postalCode.trim() || null,
        active: true,
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.router.navigate(['/paiezone']);
        },
        error: err => {
          this.busy.set(false);
          if (err?.error?.detail) {
            this.error.set(err.error.detail);
          } else if (err?.error?.title) {
            this.error.set(err.error.title);
          } else {
            this.error.set("Erreur lors de la création de l'entreprise. Veuillez réessayer.");
          }
        },
      });
  }
}
