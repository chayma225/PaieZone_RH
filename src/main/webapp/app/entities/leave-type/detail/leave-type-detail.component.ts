import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { ILeaveType } from '../leave-type.model';

@Component({
  selector: 'pz-leave-type-detail',
  templateUrl: './leave-type-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class LeaveTypeDetailComponent {
  leaveType = input<ILeaveType | null>(null);

  previousState(): void {
    window.history.back();
  }
}
