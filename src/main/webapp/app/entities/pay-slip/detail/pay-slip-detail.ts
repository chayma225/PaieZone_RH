// src/main/webapp/app/entities/pay-slip/detail/pay-slip-detail.component.ts
import { Component, inject } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { IPaySlip } from '../pay-slip.model';
import { PaySlipService } from '../service/pay-slip.service';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {DecimalPipe} from "@angular/common";

@Component({
  standalone: true,
  selector: 'jhi-pay-slip-detail',
  templateUrl: './pay-slip-detail.html',
  imports: [RouterModule, FaIconComponent, DecimalPipe],
})
export class PaySlipDetail {
  paySlip!: IPaySlip;
  isRecalculating = false;
  protected service = inject(PaySlipService);
  protected route   = inject(ActivatedRoute);

  constructor() {
    this.route.data.subscribe(({ paySlip }) => {
      this.paySlip = paySlip;  // Le resolve redirige vers 404 si null
    });
  }

  previousState(): void { window.history.back(); }

  recalculate(): void {
    if (!this.paySlip || !confirm('Recalculer ce bulletin ?')) return;
    this.isRecalculating = true;
    this.service.recalculate(this.paySlip.id).subscribe({
      next: () => { window.location.reload(); },
      error: () => { this.isRecalculating = false; },
    });
  }
}
