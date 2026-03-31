import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { IPublicHoliday } from '../public-holiday.model';

@Component({
  selector: 'pz-public-holiday-detail',
  templateUrl: './public-holiday-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatePipe],
})
export class PublicHolidayDetailComponent {
  publicHoliday = input<IPublicHoliday | null>(null);

  previousState(): void {
    window.history.back();
  }
}
