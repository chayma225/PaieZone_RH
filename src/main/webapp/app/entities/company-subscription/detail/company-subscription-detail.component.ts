import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { ICompanySubscription } from '../company-subscription.model';

@Component({
  selector: 'pz-company-subscription-detail',
  templateUrl: './company-subscription-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatePipe],
})
export class CompanySubscriptionDetailComponent {
  companySubscription = input<ICompanySubscription | null>(null);

  previousState(): void {
    window.history.back();
  }
}
