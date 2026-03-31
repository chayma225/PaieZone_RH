import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IAccountPlan } from '../account-plan.model';

@Component({
  selector: 'pz-account-plan-detail',
  templateUrl: './account-plan-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class AccountPlanDetailComponent {
  accountPlan = input<IAccountPlan | null>(null);

  previousState(): void {
    window.history.back();
  }
}
