import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { IOfficialDocument } from '../official-document.model';

@Component({
  selector: 'pz-official-document-detail',
  templateUrl: './official-document-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe],
})
export class OfficialDocumentDetailComponent {
  officialDocument = input<IOfficialDocument | null>(null);

  previousState(): void {
    window.history.back();
  }
}
