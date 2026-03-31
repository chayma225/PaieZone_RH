import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { ICnssRate } from '../cnss-rate.model';

@Component({
  selector: 'pz-cnss-rate-detail',
  templateUrl: './cnss-rate-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatePipe],
})
export class CnssRateDetailComponent {
  cnssRate = input<ICnssRate | null>(null);

  previousState(): void {
    window.history.back();
  }
}
