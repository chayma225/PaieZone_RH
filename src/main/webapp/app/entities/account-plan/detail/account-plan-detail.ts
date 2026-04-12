import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IAccountPlan } from '../account-plan.model';

@Component({
  selector: 'pz-account-plan-detail',
  templateUrl: './account-plan-detail.html',
  imports: [FontAwesomeModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink],
})
export class AccountPlanDetail {
  readonly accountPlan = input<IAccountPlan | null>(null);

  previousState(): void {
    globalThis.history.back();
  }
}
