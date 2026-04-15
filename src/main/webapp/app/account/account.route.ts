import { Routes } from '@angular/router';

import activateRoute from './activate/activate.route';
import passwordRoute from './password/password.route';
import passwordResetFinishRoute from './password-reset/finish/password-reset-finish.route';
import passwordResetInitRoute from './password-reset/init/password-reset-init.route';
import registerRoute from './register/register.route';
import settingsRoute from './settings/settings.route';

const accountRoutes: Routes = [
  activateRoute,
  passwordRoute,
  passwordResetFinishRoute,
  passwordResetInitRoute,
  registerRoute,
  settingsRoute,
  {
    path: '2fa',
    loadComponent: () => import('./two-factor/two-factor-auth.component').then(m => m.TwoFactorAuthComponent),
    title: 'Activation 2FA',
  },
  {
    path: '2fa-login',
    loadComponent: () => import('./two-factor/two-factor-login.component').then(m => m.TwoFactorLoginComponent),
    title: 'Vérification 2FA',
  },
];

export default accountRoutes;
