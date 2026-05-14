import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { PayrollPeriod } from '../../core/types';

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

@Component({
  selector: 'pz-rh-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="pz-page">
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

      <div class="stat-grid">
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico"><pz-icon name="Users" /></span>Effectifs
          </div>
          <div class="stat-val">{{ data.stats()['activeEmployees'] ?? data.employees().length }}</div>
          <div class="stat-foot"><span class="pz-muted">collaborateurs actifs</span></div>
        </div>
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico info"><pz-icon name="Wallet" /></span>Masse salariale
          </div>
          <div class="stat-val">{{ currentPeriod().gross > 0 ? data.fmtTND(currentPeriod().gross) : '—' }}</div>
          <div class="stat-foot"><span class="pz-muted">brut période en cours</span></div>
        </div>
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico warn"><pz-icon name="Calendar" /></span>Congés à valider
          </div>
          <div class="stat-val">{{ pendingLeaves().length }}</div>
          <div class="stat-foot">
            <span class="pz-muted">{{ pendingDays() }} jours au total</span>
          </div>
        </div>
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico danger"><pz-icon name="Cash" /></span>Avances en attente
          </div>
          <div class="stat-val">{{ pendingAdvances().length }}</div>
          <div class="stat-foot">
            <span class="pz-muted">{{ pendingAdvAmt() > 0 ? data.fmtTND(pendingAdvAmt()) + ' à valider' : '—' }}</span>
          </div>
        </div>
      </div>

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
                <button
                  class="pz-btn pz-sm"
                  style="background:var(--pz-pos);color:#fff;border-color:var(--pz-pos)"
                  [disabled]="busy()"
                  (click)="approveLeave(l.id)"
                >
                  <pz-icon name="Check" [size]="14" [strokeWidth]="1.8" />
                </button>
                <button class="pz-btn pz-sm" style="color:var(--pz-danger-ink)" [disabled]="busy()" (click)="openReject('leave', l.id)">
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
                <button
                  class="pz-btn pz-sm"
                  style="background:var(--pz-pos);color:#fff;border-color:var(--pz-pos)"
                  [disabled]="busy()"
                  (click)="approveAdvance(a.id)"
                >
                  <pz-icon name="Check" [size]="14" [strokeWidth]="1.8" />
                </button>
                <button class="pz-btn pz-sm" style="color:var(--pz-danger-ink)" [disabled]="busy()" (click)="openReject('advance', a.id)">
                  <pz-icon name="X" [size]="14" [strokeWidth]="1.6" />
                </button>
              </div>
            }
          }
        </div>
      </div>
    </div>

    <!-- Modal Rejet -->
    @if (rejectTarget()) {
      <div class="pz-overlay" (click)="closeReject()">
        <div class="pz-modal pz-modal-sm" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Motif du rejet</span>
            <button class="pz-modal-close" (click)="closeReject()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="pz-field">
              <label>Commentaire (optionnel)</label>
              <textarea
                [(ngModel)]="rejectComment"
                rows="3"
                placeholder="Motif du refus…"
                style="resize:vertical;font:inherit;font-size:13px;border:1px solid var(--pz-line);border-radius:8px;padding:8px 12px;background:var(--pz-surface);color:var(--pz-ink);outline:none;width:100%;box-sizing:border-box"
              ></textarea>
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

  protected readonly currentPeriod = computed(() => this.data.payrollPeriods()[0] ?? EMPTY_PERIOD);

  protected readonly activeStep = computed(() => {
    const status = this.currentPeriod().status;
    if (status === 'DRAFT') return 1;
    if (status === 'CALCULATED') return 2;
    if (status === 'VALIDATED') return 3;
    if (status === 'LOCKED' || status === 'EXPORTED') return 4;
    return 1;
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
      this.rejectLeaveById(t.id);
    } else {
      this.rejectAdvanceById(t.id);
    }
  }

  private rejectLeaveById(id: string): void {
    const comment = this.rejectComment;
    this.api.rejectLeave(+id, comment).subscribe({
      next: () => {
        this.data.leaves.update(list => list.map(l => (l.id === id ? { ...l, status: 'rejected' as const } : l)));
        this.closeReject();
        this.busy.set(false);
      },
      error: () => this.busy.set(false),
    });
  }

  private rejectAdvanceById(id: string): void {
    const comment = this.rejectComment;
    this.api.rejectAdvance(+id, comment).subscribe({
      next: () => {
        this.data.advances.update(list => list.map(a => (a.id === id ? { ...a, status: 'rejected' as const } : a)));
        this.closeReject();
        this.busy.set(false);
      },
      error: () => this.busy.set(false),
    });
  }
}
