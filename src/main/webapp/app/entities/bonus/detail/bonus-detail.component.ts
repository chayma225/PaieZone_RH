import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IBonus } from '../bonus.model';

@Component({
  selector: 'pz-bonus-detail',
  templateUrl: './bonus-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class BonusDetailComponent {
  bonus = input<IBonus | null>(null);

  previousState(): void {
    window.history.back();
  }
}
