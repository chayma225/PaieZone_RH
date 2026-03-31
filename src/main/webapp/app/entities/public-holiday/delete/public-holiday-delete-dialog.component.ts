import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IPublicHoliday } from '../public-holiday.model';
import { PublicHolidayService } from '../service/public-holiday.service';

@Component({
  templateUrl: './public-holiday-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class PublicHolidayDeleteDialogComponent {
  publicHoliday?: IPublicHoliday;

  protected publicHolidayService = inject(PublicHolidayService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.publicHolidayService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
