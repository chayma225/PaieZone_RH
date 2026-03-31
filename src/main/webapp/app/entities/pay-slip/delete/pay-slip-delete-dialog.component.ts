import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IPaySlip } from '../pay-slip.model';
import { PaySlipService } from '../service/pay-slip.service';

@Component({
  templateUrl: './pay-slip-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class PaySlipDeleteDialogComponent {
  paySlip?: IPaySlip;

  protected paySlipService = inject(PaySlipService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.paySlipService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
