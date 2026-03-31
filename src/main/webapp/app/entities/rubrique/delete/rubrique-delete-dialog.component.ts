import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IRubrique } from '../rubrique.model';
import { RubriqueService } from '../service/rubrique.service';

@Component({
  templateUrl: './rubrique-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class RubriqueDeleteDialogComponent {
  rubrique?: IRubrique;

  protected rubriqueService = inject(RubriqueService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.rubriqueService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
