import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { ILeaveType } from '../leave-type.model';

@Component({
  selector: 'pz-leave-type-detail',
  templateUrl: './leave-type-detail.html',
  imports: [FontAwesomeModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink],
})
export class LeaveTypeDetail {
  readonly leaveType = input<ILeaveType | null>(null);

  previousState(): void {
    globalThis.history.back();
  }
}
