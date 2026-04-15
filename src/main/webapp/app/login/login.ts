import { AfterViewInit, Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { TranslateModule } from '@ngx-translate/core';

import { AccountService } from 'app/core/auth/account.service';
import { LoginService } from 'app/login/login.service';
import { TranslateDirective } from 'app/shared/language';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';

@Component({
  selector: 'pz-login',
  standalone: true,
  imports: [TranslateDirective, TranslateModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export default class Login implements OnInit, AfterViewInit {
  username = viewChild.required<ElementRef>('username');

  readonly authenticationError = signal(false);

  loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    rememberMe: new FormControl(false, { nonNullable: true, validators: [Validators.required] }),
  });

  private readonly accountService = inject(AccountService);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly sessionStorageService = inject(SessionStorageService);
  private readonly localStorageService = inject(LocalStorageService);

  ngOnInit(): void {
    this.accountService.identity().subscribe(() => {
      if (this.accountService.isAuthenticated()) {
        this.router.navigate(['']);
      }
    });
  }

  ngAfterViewInit(): void {
    this.username().nativeElement.focus();
  }

  login(): void {
    this.loginService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        // Vérifier si le 2FA est requis pour cet utilisateur
        this.http
          .post<any>(this.applicationConfigService.getEndpointFor('api/2fa/check'), { login: this.loginForm.getRawValue().username })
          .subscribe({
            next: res => {
              if (res.requires2fa) {
                // Redirection vers la page de saisie du code Email
                this.router.navigate(['/account/2fa-login']);
              } else {
                // Pas de 2FA : Connexion normale
                this.finalizeLogin();
              }
            },
            error: () => this.finalizeLogin(),
          });
      },
      error: () => this.authenticationError.set(true),
    });
  }

  private finalizeLogin(): void {
    const token = this.sessionStorageService.retrieve('tempToken');
    const rememberMe = this.loginForm.getRawValue().rememberMe;

    if (rememberMe) {
      this.localStorageService.store('authenticationToken', token);
    } else {
      this.sessionStorageService.store('authenticationToken', token);
    }

    this.accountService.identity(true).subscribe(() => {
      this.router.navigate(['']);
    });
  }
}
