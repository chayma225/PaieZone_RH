// src/main/webapp/app/entities/bonus/delete/bonus-delete-dialog.component.ts
import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IBonus } from '../bonus.model';
import { BonusService } from '../service/bonus.service';
import {FormsModule} from "@angular/forms";
import SharedModule from 'app/shared/shared.module';
import {DecimalPipe} from "@angular/common";

@Component({ standalone: true, templateUrl: './bonus-delete-dialog.html', imports: [
    FormsModule,
    SharedModule,
    DecimalPipe
  ]
})
export class BonusDeleteDialog {
  bonus?: IBonus;
  protected service     = inject(BonusService);
  protected activeModal = inject(NgbActiveModal);
  cancel(): void { this.activeModal.dismiss(); }
  confirmDelete(id: number): void {
    this.service.delete(id).subscribe(() => this.activeModal.close(ITEM_DELETED_EVENT));
  }
}
