import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { IAccountingEntry } from '../accounting-entry.model';

@Component({
  selector: 'pz-accounting-entry-detail',
  templateUrl: './accounting-entry-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class AccountingEntryDetailComponent {
  accountingEntry = input<IAccountingEntry | null>(null);

  previousState(): void {
    window.history.back();
  }
}
