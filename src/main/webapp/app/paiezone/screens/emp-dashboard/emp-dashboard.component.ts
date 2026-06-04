import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { PaySlip, LeaveBalance } from '../../core/types';

const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const LEAVE_COLORS: Record<string, string> = {
  ANNUEL: '#4f46e5',
  MALADIE: '#f59e0b',
  RTT: '#0ea5e9',
  MATERNITE: '#ec4899',
  PATERNITE: '#14b8a6',
  SANS_SOLDE: '#6b7280',
};

const LEAVE_LABELS: Record<string, string> = {
  ANNUEL: 'Congés payés',
  MALADIE: 'Congé maladie',
  RTT: 'RTT',
  MATERNITE: 'Maternité',
  PATERNITE: 'Paternité',
  SANS_SOLDE: 'Sans solde',
};

@Component({
  selector: 'pz-emp-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="pz-page">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>Mon espace</strong> <span class="sep">/</span> Tableau de bord</div>
          <h1>Bonjour {{ data.myEmployee()?.first || 'collaborateur' }} 👋</h1>
          <div class="pz-muted">
            {{ today }}
            @if (data.myEmployee(); as emp) {
              @if (emp.role) {
                · {{ emp.role }}
              }
              · matricule <span class="pz-mono">{{ emp.matricule }}</span>
            }
          </div>
        </div>
        <div class="pz-page-actions">
          <button class="pz-btn" routerLink="/paiezone/emp-leaves"><pz-icon name="Calendar" /> Demander un congé</button>
          <button class="pz-btn pz-primary" routerLink="/paiezone/emp-requests"><pz-icon name="Cash" /> Demander une avance</button>
        </div>
      </div>

      <div class="grid-21">
        <!-- Dernier bulletin de paie -->
        <div class="pz-card hero">
          @if (lastSlip(); as slip) {
            <div class="hero-head">
              <div>
                <div class="hero-title">Dernier bulletin de paie</div>
                <div class="hero-sub">{{ slipLabel() }}</div>
              </div>
              <span class="pz-pill" [ngClass]="slipPillClass(slip.status)">
                <span class="dot"></span>{{ slipStatusLabel(slip.status) }}
              </span>
            </div>
            <div class="hero-body">
              <div>
                <div class="amount-label">Net à payer</div>
                <div class="amount">{{ data.fmtTNDdec(slip.netSalary) }}</div>
                <div class="amount-detail pz-muted">
                  Brut <span class="pz-mono">{{ data.fmtTNDdec(slip.grossSalary) }}</span> · Cotisations
                  <span class="pz-mono">−{{ data.fmtTNDdec(deductions()) }}</span>
                </div>
              </div>
              <div class="hero-actions">
                <button class="pz-btn" (click)="openBulletin(slip.id)">
                  <pz-icon name="Eye" [size]="14" [strokeWidth]="1.4" /> Voir détail
                </button>
                <button class="pz-btn pz-primary" (click)="downloadBulletin(slip.id)">
                  <pz-icon name="Download" [size]="14" [strokeWidth]="1.5" /> Télécharger PDF
                </button>
              </div>
            </div>
          } @else {
            <div class="hero-head">
              <div>
                <div class="hero-title">Dernier bulletin de paie</div>
                <div class="hero-sub pz-muted">Aucun bulletin disponible</div>
              </div>
            </div>
            <div class="hero-body">
              <div class="pz-muted" style="font-size:13px">Votre premier bulletin apparaîtra ici après la clôture de paie.</div>
            </div>
          }
        </div>

        <!-- Notifications -->
        <div class="pz-card">
          <div class="card-head"><div class="card-title">Notifications</div></div>
          <div class="card-body">
            @for (n of notifications(); track n.title) {
              <div class="notif">
                <div class="notif-ico" [class]="n.tone"><pz-icon [name]="n.icon" /></div>
                <div class="grow">
                  <div class="strong">{{ n.title }}</div>
                  <div class="pz-muted small">{{ n.sub }}</div>
                </div>
                <div class="pz-mono pz-muted small">{{ n.time }}</div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Soldes de congés -->
      <div class="pz-card">
        <div class="card-head">
          <div class="card-title">Mes soldes de congés — {{ currentYear }}</div>
        </div>
        <div class="card-body">
          @if (leaveBalances().length) {
            @for (b of leaveBalances(); track b.id) {
              <div class="bal">
                <div class="bal-head">
                  <span class="strong">{{ leaveLabel(b.leaveTypeName) }}</span>
                  <span>
                    <strong class="pz-mono">{{ b.remaining | number: '1.0-1' }}</strong>
                    <span class="pz-muted small"> / {{ b.entitled | number: '1.0-1' }}j restants</span>
                  </span>
                </div>
                <div class="progress">
                  <i [style.width.%]="usedPct(b)" [style.background]="leaveColor(b.leaveTypeName)"></i>
                </div>
              </div>
            }
          } @else {
            <div class="pz-muted" style="font-size:13px;padding:16px 0;text-align:center">
              Aucun solde de congés disponible pour cette année.
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .pz-page-actions {
        display: flex;
        gap: 8px;
      }
      .grid-21 {
        display: grid;
        gap: var(--pz-gap);
        grid-template-columns: 2fr 1fr;
      }

      .hero {
        background: linear-gradient(135deg, #ffffff 0%, var(--pz-primary-soft) 100%);
        border-color: var(--pz-primary-soft);
      }
      .hero-head {
        padding: 16px 20px 12px;
        display: flex;
        align-items: center;
      }
      .hero-head > div:first-child {
        flex: 1;
      }
      .hero-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--pz-primary-ink);
      }
      .hero-sub {
        font-size: 12px;
        color: var(--pz-muted);
        margin-top: 2px;
      }
      .hero-body {
        padding: 4px 20px 20px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 20px;
        flex-wrap: wrap;
      }
      .amount-label {
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--pz-muted);
      }
      .amount {
        font-size: 36px;
        font-weight: 600;
        letter-spacing: -0.025em;
        font-family: 'JetBrains Mono', monospace;
        color: var(--pz-ink);
        margin-top: 4px;
      }
      .amount-detail {
        font-size: 12px;
        margin-top: 6px;
      }
      .hero-actions {
        display: flex;
        gap: 8px;
      }

      .card-head {
        padding: 16px 20px 12px;
      }
      .card-title {
        font-size: 14px;
        font-weight: 600;
      }
      .card-body {
        padding: 0 20px 14px;
      }

      .notif {
        padding: 10px 0;
        border-top: 1px solid var(--pz-line);
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }
      .notif:first-child {
        border-top: 0;
      }
      .notif-ico {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: grid;
        place-items: center;
        background: var(--pz-primary-soft);
        color: var(--pz-primary-ink);
        flex-shrink: 0;
      }
      .notif-ico.pos {
        background: var(--pz-pos-soft);
        color: var(--pz-pos-ink);
      }
      .notif-ico.warn {
        background: var(--pz-warn-soft);
        color: var(--pz-warn-ink);
      }
      .notif-ico.info {
        background: var(--pz-info-soft);
        color: var(--pz-info-ink);
      }
      .grow {
        flex: 1;
        min-width: 0;
      }
      .strong {
        font-weight: 500;
        font-size: 13px;
      }
      .small {
        font-size: 11.5px;
      }

      .bal {
        margin-bottom: 14px;
      }
      .bal-head {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
      }
      .progress {
        height: 4px;
        background: var(--pz-surface-3);
        border-radius: 999px;
        overflow: hidden;
      }
      .progress i {
        display: block;
        height: 100%;
        border-radius: 999px;
        transition: width 0.3s;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EmpDashboardComponent implements OnInit {
  protected readonly data = inject(DataService);
  private readonly api = inject(ApiService);

  protected readonly paySlips = signal<PaySlip[]>([]);
  protected readonly leaveBalances = signal<LeaveBalance[]>([]);

  protected readonly currentYear = new Date().getFullYear();

  protected readonly today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  protected readonly lastSlip = computed(() => {
    const slips = this.paySlips();
    if (!slips.length) return null;
    return [...slips].sort((a, b) => (b.year !== a.year ? b.year - a.year : b.month - a.month))[0];
  });

  protected readonly slipLabel = computed(() => {
    const s = this.lastSlip();
    return s ? `${MONTHS_FR[s.month - 1]} ${s.year}` : '';
  });

  protected readonly deductions = computed(() => {
    const s = this.lastSlip();
    if (!s) return 0;
    return s.cnssSalaryAmount + (s.cavisAmount ?? 0) + (s.cssAmount ?? 0) + s.irppAmount;
  });

  protected readonly notifications = computed(() => {
    const notifs: { icon: string; tone: string; title: string; sub: string; time: string }[] = [];
    const slip = this.lastSlip();
    if (slip) {
      notifs.push({
        icon: 'Cash',
        tone: 'primary',
        title: `Bulletin de ${MONTHS_FR[slip.month - 1]} disponible`,
        sub: 'Téléchargeable depuis Mes documents',
        time: 'Ce mois',
      });
    }
    const balances = this.leaveBalances();
    const annual = balances.find(b => b.leaveTypeName === 'ANNUEL');
    if (annual && annual.entitled > 0 && annual.remaining < 5) {
      notifs.push({
        icon: 'Calendar',
        tone: 'warn',
        title: `Solde CP : ${annual.remaining.toFixed(0)} jours restants`,
        sub: `À utiliser avant le 31/12/${annual.year}`,
        time: "Aujourd'hui",
      });
    }
    if (!notifs.length) {
      notifs.push({
        icon: 'Check',
        tone: 'pos',
        title: 'Tout est à jour',
        sub: 'Aucune notification pour le moment',
        time: "Aujourd'hui",
      });
    }
    return notifs;
  });

  ngOnInit(): void {
    this.api.myPaySlips().subscribe({
      next: slips => this.paySlips.set(slips),
      error: () => {},
    });
    this.api.myLeaveBalances().subscribe({
      next: bal => this.leaveBalances.set(bal),
      error: () => {},
    });
  }

  protected slipPillClass(status: string): string {
    const map: Record<string, string> = {
      VALIDATED: 'pos',
      LOCKED: 'pos',
      EXPORTED: 'pos',
      CALCULATED: 'info',
      DRAFT: 'warn',
    };
    return `pz-pill ${map[status] ?? 'info'}`;
  }

  protected slipStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      VALIDATED: 'Validé',
      LOCKED: 'Clôturé',
      EXPORTED: 'Exporté',
      CALCULATED: 'Calculé',
      DRAFT: 'Brouillon',
    };
    return labels[status] ?? status;
  }

  protected leaveColor(typeName: string): string {
    return LEAVE_COLORS[typeName] ?? '#6b7280';
  }

  protected leaveLabel(typeName: string): string {
    return LEAVE_LABELS[typeName] ?? typeName;
  }

  protected openBulletin(id: number): void {
    this.api.downloadBulletinBlob(id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
    });
  }

  protected downloadBulletin(id: number): void {
    const slip = this.lastSlip();
    const name = slip ? `bulletin-${slip.month}-${slip.year}.pdf` : `bulletin-${id}.pdf`;
    this.api.downloadBulletinBlob(id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      },
    });
  }

  protected usedPct(b: LeaveBalance): number {
    if (!b.entitled) return 0;
    return Math.min(100, ((b.entitled - b.remaining) / b.entitled) * 100);
  }
}
