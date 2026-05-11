// src/main/webapp/app/entities/pay-slip/list/pay-slip.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, NgClass } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import SharedModule from 'app/shared/shared.module';
import { AlertError } from 'app/shared/alert/alert-error';

import { IPaySlip } from '../pay-slip.model';
import { PaySlipService } from '../service/pay-slip.service';

const MONTHS = ['', 'Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

@Component({
  standalone: true,
  selector: 'jhi-pay-slip',
  templateUrl: './pay-slip.html',
  imports: [SharedModule, AlertError, RouterModule, FormsModule, DecimalPipe, NgClass, FaIconComponent],
})
export class PaySlip implements OnInit {

  paySlips: IPaySlip[] = [];
  isLoading = false;

  months = MONTHS;

  private service = inject(PaySlipService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;

    console.log("📡 Chargement de TOUS les bulletins...");

    this.service.query({
      sort: ['year,desc', 'month,desc'],
      size: 200
    }).subscribe({
      next: (res) => {
        this.paySlips = res.body ?? [];
        console.log(`✅ ${this.paySlips.length} bulletins chargés`, this.paySlips);
        this.isLoading = false;
      },
      error: (err) => {
        console.error("❌ Erreur :", err);
        this.isLoading = false;
      }
    });
  }

  refresh(): void {
    this.load();
  }

  statusClass(s?: string | null): string {
    if (s === 'LOCKED') return 'bg-success';
    if (s === 'VALIDATED') return 'bg-warning text-dark';
    if (s === 'CALCULATED') return 'bg-info';
    return 'bg-secondary';
  }

  trackId = (_: number, item: IPaySlip) => item?.id ?? null;
}
