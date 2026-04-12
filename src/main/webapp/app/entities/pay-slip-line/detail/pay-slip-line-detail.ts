import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IPaySlipLine } from '../pay-slip-line.model';

@Component({
  selector: 'pz-pay-slip-line-detail',
  templateUrl: './pay-slip-line-detail.html',
  imports: [FontAwesomeModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink],
})
export class PaySlipLineDetail {
  readonly paySlipLine = input<IPaySlipLine | null>(null);

  previousState(): void {
    globalThis.history.back();
  }
}
