import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { ITaxBracket } from '../tax-bracket.model';

@Component({
  selector: 'pz-tax-bracket-detail',
  templateUrl: './tax-bracket-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class TaxBracketDetailComponent {
  taxBracket = input<ITaxBracket | null>(null);

  previousState(): void {
    window.history.back();
  }
}
