import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { ITaxBracket } from '../tax-bracket.model';

@Component({
  selector: 'pz-tax-bracket-detail',
  templateUrl: './tax-bracket-detail.html',
  imports: [FontAwesomeModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink],
})
export class TaxBracketDetail {
  readonly taxBracket = input<ITaxBracket | null>(null);

  previousState(): void {
    globalThis.history.back();
  }
}
