import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IAccountingEntry } from '../accounting-entry.model';
import { AccountingEntryService } from '../service/accounting-entry.service';

@Component({
  templateUrl: './accounting-entry-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class AccountingEntryDeleteDialogComponent {
  accountingEntry?: IAccountingEntry;

  protected accountingEntryService = inject(AccountingEntryService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.accountingEntryService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
