import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { PayrollPeriod } from '../../core/types';

const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const EMPTY_PERIOD: PayrollPeriod = {
  id: 0,
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  label: '—',
  status: 'DRAFT',
  employees: 0,
  gross: 0,
  net: 0,
  validatedAt: null,
  lockedAt: null,
};

interface CalDay {
  date: number | null;
  approved: number;
  pending: number;
}

@Component({
  selector: 'pz-rh-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="pz-page">
      <!-- ── En-tête ──────────────────────────────────────────────────────── -->
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>RH</strong> <span class="sep">/</span> Tableau de bord</div>
          <h1>Tableau de bord RH</h1>
          <div class="pz-muted">{{ data.employees().length }} collaborateurs · {{ pendingCount() }} demandes en attente</div>
        </div>
        <div class="pz-page-actions">
          <button class="pz-btn"><pz-icon name="Download" [size]="14" /> Exporter</button>
        </div>
      </div>

      <!-- ── Hero paie ─────────────────────────────────────────────────────── -->
      <div class="hero">
        <div class="hero-bg"></div>
        <div class="hero-inner">
          <div>
            <div class="hero-eyebrow">Période de paie en cours</div>
            <h2>{{ currentPeriod().label }}</h2>
            <div class="hero-meta">
              @if (currentPeriod().employees > 0) {
                {{ currentPeriod().employees }} bulletins · Brut <strong>{{ data.fmtTND(currentPeriod().gross) }}</strong> · Net
                <strong>{{ data.fmtTND(currentPeriod().net) }}</strong>
              } @else {
                Statut : <strong>{{ currentPeriod().status }}</strong>
              }
            </div>
          </div>
          <button class="pz-btn hero-btn">Ouvrir la paie <pz-icon name="Arrow" [size]="12" [strokeWidth]="1.6" /></button>
        </div>
        <div class="hero-steps">
          @for (s of payrollSteps; track s.label; let i = $index) {
            <div class="hero-step" [class.active]="i === activeStep()" [class.done]="i < activeStep()">
              <div class="step-num">{{ i < activeStep() ? '✓' : i + 1 }}</div>
              <div>
                <div class="step-label">{{ s.label }}</div>
                <small>{{ s.sub }}</small>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- ── KPI cards ─────────────────────────────────────────────────────── -->
      <div class="stat-grid">
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico"><pz-icon name="Users" /></span>Effectifs
          </div>
          <div class="stat-val">{{ data.employees().length }}</div>
          <div class="stat-foot pz-muted">collaborateurs actifs</div>
        </div>
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico info"><pz-icon name="Wallet" /></span>Masse salariale
          </div>
          <div class="stat-val">{{ currentPeriod().gross > 0 ? data.fmtTND(currentPeriod().gross) : '—' }}</div>
          <div class="stat-foot pz-muted">brut période en cours</div>
        </div>
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico warn"><pz-icon name="Calendar" /></span>Congés à valider
          </div>
          <div class="stat-val">{{ pendingLeaves().length }}</div>
          <div class="stat-foot pz-muted">{{ pendingDays() }} jours au total</div>
        </div>
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico danger"><pz-icon name="Cash" /></span>Avances en attente
          </div>
          <div class="stat-val">{{ pendingAdvances().length }}</div>
          <div class="stat-foot pz-muted">{{ pendingAdvAmt() > 0 ? data.fmtTND(pendingAdvAmt()) + ' à valider' : '—' }}</div>
        </div>
      </div>

      <!-- ── Ligne : demandes + calendrier ─────────────────────────────────── -->
      <div class="two-col">
        <!-- Demandes en attente -->
        <div class="pz-card">
          <div class="card-head"><div class="card-title">Demandes en attente</div></div>
          <div class="card-body">
            @if (pendingLeaves().length === 0 && pendingAdvances().length === 0) {
              <div class="pz-muted" style="padding:20px 0;text-align:center;font-size:13px">Aucune demande en attente</div>
            }
            @for (l of pendingLeaves(); track l.id) {
              @let e = data.empById(l.empId);
              @if (e) {
                <div class="leave-row">
                  <div class="pz-avatar sm" [attr.data-bg]="data.empBgIdx(e.id)">{{ data.initials(e) }}</div>
                  <div class="grow">
                    <div class="strong">{{ data.fullName(e) }}</div>
                    <div class="pz-muted small">Congé · {{ l.type }} · {{ l.days }}j · {{ l.from }}</div>
                  </div>
                  <button class="pz-btn pz-sm pos-btn" [disabled]="busy()" (click)="approveLeave(l.id)">
                    <pz-icon name="Check" [size]="14" [strokeWidth]="1.8" />
                  </button>
                  <button class="pz-btn pz-sm danger-btn" [disabled]="busy()" (click)="openReject('leave', l.id)">
                    <pz-icon name="X" [size]="14" [strokeWidth]="1.6" />
                  </button>
                </div>
              }
            }
            @for (a of pendingAdvances(); track a.id) {
              @let e = data.empById(a.empId);
              @if (e) {
                <div class="leave-row">
                  <div class="pz-avatar sm" [attr.data-bg]="data.empBgIdx(e.id)">{{ data.initials(e) }}</div>
                  <div class="grow">
                    <div class="strong">{{ data.fullName(e) }}</div>
                    <div class="pz-muted small">Avance · {{ data.fmtTND(a.amount) }} · {{ a.reason }}</div>
                  </div>
                  <button class="pz-btn pz-sm pos-btn" [disabled]="busy()" (click)="approveAdvance(a.id)">
                    <pz-icon name="Check" [size]="14" [strokeWidth]="1.8" />
                  </button>
                  <button class="pz-btn pz-sm danger-btn" [disabled]="busy()" (click)="openReject('advance', a.id)">
                    <pz-icon name="X" [size]="14" [strokeWidth]="1.6" />
                  </button>
                </div>
              }
            }
          </div>
        </div>

        <!-- Calendrier des congés -->
        <div class="pz-card">
          <div class="card-head">
            <div class="card-title">Calendrier des congés</div>
            <div class="cal-nav">
              <button class="pz-btn pz-sm pz-ghost" (click)="prevMonth()">
                <pz-icon name="Caret" [size]="14" style="transform:rotate(90deg)" />
              </button>
              <span class="cal-label">{{ calMonthLabel() }}</span>
              <button class="pz-btn pz-sm pz-ghost" (click)="nextMonth()">
                <pz-icon name="Caret" [size]="14" style="transform:rotate(-90deg)" />
              </button>
            </div>
          </div>
          <div class="card-body cal-body">
            <div class="cal-legend">
              <span class="dot-legend approved"></span><span class="pz-muted">Approuvé</span> <span class="dot-legend pending"></span
              ><span class="pz-muted">En attente</span>
            </div>
            <div class="cal-grid">
              @for (d of DAYS_FR; track d) {
                <div class="cal-dow">{{ d }}</div>
              }
              @for (cell of calCells(); track $index) {
                <div class="cal-cell" [class.today]="cell.date === todayDay && calYear() === todayYear && calMonth() === todayMonth">
                  @if (cell.date) {
                    <span class="cal-num">{{ cell.date }}</span>
                    <div class="cal-dots">
                      @if (cell.approved > 0) {
                        <span class="dot approved" [title]="cell.approved + ' approuvé(s)'"></span>
                      }
                      @if (cell.pending > 0) {
                        <span class="dot pending" [title]="cell.pending + ' en attente'"></span>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Rejet -->
    @if (rejectTarget()) {
      <div class="pz-overlay" (click)="closeReject()">
        <div class="pz-modal" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Motif du rejet</span>
            <button class="pz-modal-close" (click)="closeReject()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="pz-field">
              <label>Commentaire (optionnel)</label>
              <textarea [(ngModel)]="rejectComment" rows="3" placeholder="Motif du refus…" class="rej-ta"></textarea>
            </div>
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeReject()">Annuler</button>
            <button class="pz-btn pz-danger" [disabled]="busy()" (click)="doReject()">
              @if (busy()) {
                Rejet…
              } @else {
                Rejeter
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './rh-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RhDashboardComponent {
  protected readonly data = inject(DataService);
  protected readonly api = inject(ApiService);
  protected readonly busy = signal(false);
  protected readonly rejectTarget = signal<{ type: 'leave' | 'advance'; id: string } | null>(null);
  protected rejectComment = '';

  protected readonly DAYS_FR = DAYS_FR;

  private readonly now = new Date();
  protected readonly todayDay = this.now.getDate();
  protected readonly todayMonth = this.now.getMonth() + 1;
  protected readonly todayYear = this.now.getFullYear();

  protected readonly calMonthSig = signal(this.now.getMonth() + 1);
  protected readonly calYearSig = signal(this.now.getFullYear());
  protected readonly calMonth = this.calMonthSig.asReadonly();
  protected readonly calYear = this.calYearSig.asReadonly();

  protected readonly calMonthLabel = computed(() => `${MONTHS_FR[this.calMonthSig() - 1]} ${this.calYearSig()}`);

  protected readonly calCells = computed<CalDay[]>(() => {
    const y = this.calYearSig(),
      m = this.calMonthSig();
    const firstDow = (new Date(y, m - 1, 1).getDay() + 6) % 7; // Monday=0
    const daysInMonth = new Date(y, m, 0).getDate();
    const cells: CalDay[] = [];
    for (let i = 0; i < firstDow; i++) cells.push({ date: null, approved: 0, pending: 0 });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const approvedOnDay = this.data.leaves().filter(l => l.status === 'approved' && l.from <= dateStr && l.to >= dateStr).length;
      const pendingOnDay = this.data.leaves().filter(l => l.status === 'pending' && l.from <= dateStr && l.to >= dateStr).length;
      cells.push({ date: d, approved: approvedOnDay, pending: pendingOnDay });
    }
    return cells;
  });

  prevMonth() {
    if (this.calMonthSig() === 1) {
      this.calMonthSig.set(12);
      this.calYearSig.update(y => y - 1);
    } else {
      this.calMonthSig.update(m => m - 1);
    }
  }

  nextMonth() {
    if (this.calMonthSig() === 12) {
      this.calMonthSig.set(1);
      this.calYearSig.update(y => y + 1);
    } else {
      this.calMonthSig.update(m => m + 1);
    }
  }

  protected readonly currentPeriod = computed(() => this.data.payrollPeriods()[0] ?? EMPTY_PERIOD);

  protected readonly activeStep = computed(() => {
    const s = this.currentPeriod().status;
    if (s === 'DRAFT') return 1;
    if (s === 'CALCULATED') return 2;
    if (s === 'VALIDATED') return 3;
    return 4;
  });

  protected readonly payrollSteps = [
    { label: 'Ouverture', sub: 'Période créée' },
    { label: 'Calcul auto', sub: 'En cours' },
    { label: 'Validation', sub: 'À faire' },
    { label: 'Verrouillage', sub: 'À faire' },
  ];

  protected pendingLeaves() {
    return this.data.leaves().filter(l => l.status === 'pending');
  }
  protected pendingAdvances() {
    return this.data.advances().filter(a => a.status === 'pending');
  }
  protected pendingCount() {
    return this.pendingLeaves().length + this.pendingAdvances().length;
  }
  protected pendingDays() {
    return this.pendingLeaves().reduce((s, l) => s + l.days, 0);
  }
  protected pendingAdvAmt() {
    return this.pendingAdvances().reduce((s, a) => s + a.amount, 0);
  }

  approveLeave(id: string) {
    this.busy.set(true);
    this.api.approveLeave(+id).subscribe({
      next: () => {
        this.data.leaves.update(list => list.map(l => (l.id === id ? { ...l, status: 'approved' as const } : l)));
        this.busy.set(false);
      },
      error: () => this.busy.set(false),
    });
  }

  approveAdvance(id: string) {
    this.busy.set(true);
    this.api.approveAdvance(+id).subscribe({
      next: () => {
        this.data.advances.update(list => list.map(a => (a.id === id ? { ...a, status: 'approved' as const } : a)));
        this.busy.set(false);
      },
      error: () => this.busy.set(false),
    });
  }

  openReject(type: 'leave' | 'advance', id: string) {
    this.rejectComment = '';
    this.rejectTarget.set({ type, id });
  }
  closeReject() {
    this.rejectTarget.set(null);
  }

  doReject() {
    const t = this.rejectTarget();
    if (!t) return;
    this.busy.set(true);
    if (t.type === 'leave') {
      this.api.rejectLeave(+t.id, this.rejectComment).subscribe({
        next: () => {
          this.data.leaves.update(list => list.map(l => (l.id === t.id ? { ...l, status: 'rejected' as const } : l)));
          this.closeReject();
          this.busy.set(false);
        },
        error: () => this.busy.set(false),
      });
    } else {
      this.api.rejectAdvance(+t.id, this.rejectComment).subscribe({
        next: () => {
          this.data.advances.update(list => list.map(a => (a.id === t.id ? { ...a, status: 'rejected' as const } : a)));
          this.closeReject();
          this.busy.set(false);
        },
        error: () => this.busy.set(false),
      });
    }
  }
}
