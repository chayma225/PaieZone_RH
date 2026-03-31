import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IAccountPlan } from '../account-plan.model';
import { AccountPlanService } from '../service/account-plan.service';

@Component({
  templateUrl: './account-plan-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class AccountPlanDeleteDialogComponent {
  accountPlan?: IAccountPlan;

  protected accountPlanService = inject(AccountPlanService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.accountPlanService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
