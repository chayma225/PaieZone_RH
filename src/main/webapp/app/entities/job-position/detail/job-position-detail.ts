import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IJobPosition } from '../job-position.model';

@Component({
  selector: 'pz-job-position-detail',
  templateUrl: './job-position-detail.html',
  imports: [FontAwesomeModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink],
})
export class JobPositionDetail {
  readonly jobPosition = input<IJobPosition | null>(null);

  previousState(): void {
    globalThis.history.back();
  }
}
