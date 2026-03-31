import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IPaySlipLine } from '../pay-slip-line.model';
import { PaySlipLineService } from '../service/pay-slip-line.service';

@Component({
  templateUrl: './pay-slip-line-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class PaySlipLineDeleteDialogComponent {
  paySlipLine?: IPaySlipLine;

  protected paySlipLineService = inject(PaySlipLineService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.paySlipLineService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
