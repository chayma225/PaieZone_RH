import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IAdvance } from '../advance.model';
import { AdvanceService } from '../service/advance.service';

@Component({
  templateUrl: './advance-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class AdvanceDeleteDialogComponent {
  advance?: IAdvance;

  protected advanceService = inject(AdvanceService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.advanceService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
