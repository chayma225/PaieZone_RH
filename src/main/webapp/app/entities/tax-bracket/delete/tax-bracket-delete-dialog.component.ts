import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ITaxBracket } from '../tax-bracket.model';
import { TaxBracketService } from '../service/tax-bracket.service';

@Component({
  templateUrl: './tax-bracket-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class TaxBracketDeleteDialogComponent {
  taxBracket?: ITaxBracket;

  protected taxBracketService = inject(TaxBracketService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.taxBracketService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
