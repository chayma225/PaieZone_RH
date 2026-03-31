import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { IPaySlip } from '../pay-slip.model';

@Component({
  selector: 'pz-pay-slip-detail',
  templateUrl: './pay-slip-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe],
})
export class PaySlipDetailComponent {
  paySlip = input<IPaySlip | null>(null);

  previousState(): void {
    window.history.back();
  }
}
