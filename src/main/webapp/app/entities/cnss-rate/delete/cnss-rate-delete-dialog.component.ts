import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ICnssRate } from '../cnss-rate.model';
import { CnssRateService } from '../service/cnss-rate.service';

@Component({
  templateUrl: './cnss-rate-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class CnssRateDeleteDialogComponent {
  cnssRate?: ICnssRate;

  protected cnssRateService = inject(CnssRateService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.cnssRateService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
