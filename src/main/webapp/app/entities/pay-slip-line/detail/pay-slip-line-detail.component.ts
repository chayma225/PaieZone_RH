import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IPaySlipLine } from '../pay-slip-line.model';

@Component({
  selector: 'pz-pay-slip-line-detail',
  templateUrl: './pay-slip-line-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class PaySlipLineDetailComponent {
  paySlipLine = input<IPaySlipLine | null>(null);

  previousState(): void {
    window.history.back();
  }
}
