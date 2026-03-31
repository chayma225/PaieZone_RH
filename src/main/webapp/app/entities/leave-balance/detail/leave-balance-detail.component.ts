import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { ILeaveBalance } from '../leave-balance.model';

@Component({
  selector: 'pz-leave-balance-detail',
  templateUrl: './leave-balance-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe],
})
export class LeaveBalanceDetailComponent {
  leaveBalance = input<ILeaveBalance | null>(null);

  previousState(): void {
    window.history.back();
  }
}
