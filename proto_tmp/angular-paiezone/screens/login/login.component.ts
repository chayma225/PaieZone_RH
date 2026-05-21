import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import IconComponent from '../../core/icon/icon.component';

@Component({
  selector: 'pz-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <div class="auth-card">
      <h1>Connexion à PaieZone</h1>
      <p class="sub">Bienvenue 👋 Connectez-vous pour accéder à votre espace.</p>

      @if (error()) {
        <div class="alert">
          <pz-icon name="CircleHelp" [size]="14"/>
          {{ error() }}
        </div>
      }

      <form (submit)="$event.preventDefault(); submit()" class="form">
        <div class="field">
          <label for="email">Email professionnel</label>
          <div class="input-wrap" [class.error]="emailError()">
            <pz-icon name="Mail" [size]="14" [strokeWidth]="1.4"/>
            <input id="email" type="email" placeholder="prenom.nom@entreprise.tn"
                   [ngModel]="email()" (ngModelChange)="email.set($event)"
                   name="email" required autocomplete="email" autofocus/>
          </div>
        </div>

        <div class="field">
          <label for="pwd">Mot de passe</label>
          <div class="input-wrap" [class.error]="pwdError()">
            <pz-icon name="Lock" [size]="14" [strokeWidth]="1.4"/>
            <input id="pwd" [type]="showPwd() ? 'text' : 'password'" placeholder="••••••••••"
                   [ngModel]="password()" (ngModelChange)="password.set($event)"
                   name="password" required autocomplete="current-password"/>
            <button type="button" class="reveal" (click)="showPwd.set(!showPwd())"
                    [attr.aria-label]="showPwd() ? 'Masquer' : 'Afficher'">
              <pz-icon [name]="showPwd() ? 'X' : 'Eye'" [size]="14" [strokeWidth]="1.4"/>
            </button>
          </div>
        </div>

        <div class="row-between">
          <label class="checkbox">
            <input type="checkbox" [ngModel]="remember()" (ngModelChange)="remember.set($event)" name="remember"/>
            <span class="check-box"><pz-icon name="Check" [size]="10" [strokeWidth]="2"/></span>
            <span>Rester connecté</span>
          </label>
          <a class="link" routerLink="/paiezone/forgot">Mot de passe oublié ?</a>
        </div>

        <button type="submit" class="pz-btn pz-primary full lg" [disabled]="busy()">
          @if (busy()) {
            <span class="spinner"></span> Connexion en cours…
          } @else {
            Se connecter <pz-icon name="Arrow" [size]="14" [strokeWidth]="1.6"/>
          }
        </button>
      </form>

      <div class="divider"><span>ou</span></div>

      <button class="pz-btn full">
        <pz-icon name="Shield" [size]="14"/> Continuer avec SSO entreprise
      </button>

      <div class="footer-link">
        Pas encore de compte ?
        <a routerLink="/paiezone/signup">Créez votre entreprise</a>
      </div>
    </div>
  `,
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  private readonly router = inject(Router);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly remember = signal(true);
  protected readonly showPwd = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly emailError = signal(false);
  protected readonly pwdError = signal(false);

  submit(): void {
    this.error.set(null);
    this.emailError.set(false);
    this.pwdError.set(false);

    if (!this.email().includes('@')) {
      this.emailError.set(true);
      this.error.set('Veuillez saisir un email valide.');
      return;
    }
    if (this.password().length < 4) {
      this.pwdError.set(true);
      this.error.set('Mot de passe trop court (4 caractères minimum).');
      return;
    }

    this.busy.set(true);
    // Simulate auth call; en prod : AccountService.login(...)
    setTimeout(() => {
      this.busy.set(false);
      // Always redirect to 2FA in demo (en prod, dépend du flag user.twofa)
      this.router.navigate(['/paiezone/2fa'], { queryParams: { email: this.email() } });
    }, 900);
  }
}
