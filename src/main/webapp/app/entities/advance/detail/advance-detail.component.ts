import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { IAdvance } from '../advance.model';

@Component({
  selector: 'pz-advance-detail',
  templateUrl: './advance-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatePipe],
})
export class AdvanceDetailComponent {
  advance = input<IAdvance | null>(null);

  previousState(): void {
    window.history.back();
  }
}
