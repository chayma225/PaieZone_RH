import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Ajouté

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { ILeaveType } from '../leave-type.model';

@Component({
  selector: 'pz-leave-type-detail',
  templateUrl: './leave-type-detail.html',
  standalone: true, // Recommandé
  imports: [
    CommonModule, // Pour [ngStyle]
    FontAwesomeModule,
    Alert,
    AlertError,
    TranslateDirective,
    TranslateModule,
    RouterLink
  ],
})
export class LeaveTypeDetail {
  readonly leaveType = input<ILeaveType | null>(null);


  getBadgeStyle(name: string): { color: string, bg: string, border: string } {
    const styles: Record<string, { color: string, bg: string, border: string }> = {
      ANNUAL: { color: '#1d4ed8', bg: '#eff6ff', border: '#dbeafe' },
      SICK: { color: '#dc2626', bg: '#fef2f2', border: '#fee2e2' },
      MATERNITY: { color: '#7c3aed', bg: '#f5f3ff', border: '#ede9fe' },
      PATERNITY: { color: '#2563eb', bg: '#eff6ff', border: '#dbeafe' },
      UNPAID: { color: '#d97706', bg: '#fffbeb', border: '#fef3c7' },
      MARRIAGE: { color: '#db2777', bg: '#fdf2f8', border: '#fce7f3' },
      BEREAVEMENT: { color: '#4b5563', bg: '#f9fafb', border: '#f3f4f6' },
      EXCEPTIONAL: { color: '#059669', bg: '#f0fdf4', border: '#dcfce7' },
    };
    return styles[name] || { color: '#475569', bg: '#f1f5f9', border: '#e2e8f0' };
  }

  previousState(): void {
    globalThis.history.back();
  }
}
