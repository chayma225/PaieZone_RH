import { Component, ChangeDetectionStrategy, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { PayrollPeriod, ActivityItem, PayrollChartPoint } from '../../core/types';

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

// ── Histogramme helpers ─────────────────────────────────────────────────────

function buildChartBarsFromData(series: { label: string; brut: number; charges: number }[]) {
  const W = 600,
    H = 180,
    PAD_T = 10,
    PAD_B = 30,
    PAD_H = 8;
  const chartH = H - PAD_T - PAD_B;
  const chartW = W - PAD_H * 2;
  const n = series.length || 1;
  const groupW = chartW / n;
  const barW = groupW * 0.5;
  const maxTotal = Math.max(...series.map(d => d.brut + d.charges), 1);
  const scale = chartH / maxTotal;
  const baseY = PAD_T + chartH;

  return series.map((d, i) => {
    const totalH = (d.brut + d.charges) * scale;
    const chargesH = d.charges * scale;
    const cx = PAD_H + groupW * i + groupW / 2;
    return {
      m: d.label,
      cx: +cx.toFixed(1),
      x: +(cx - barW / 2).toFixed(1),
      barW: +barW.toFixed(1),
      chargesH: +chargesH.toFixed(1),
      chargesY: +(baseY - chargesH).toFixed(1),
      brutH: +(d.brut * scale).toFixed(1),
      brutY: +(baseY - totalH).toFixed(1),
      labelY: H - PAD_B + 14,
    };
  });
}

function buildGridLines() {
  const PAD_T = 10,
    CHART_H = 140;
  return [100, 75, 50, 25, 0].map(pct => ({
    y: +(PAD_T + CHART_H * (1 - pct / 100)).toFixed(1),
  }));
}

const GRID_LINES = buildGridLines();

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
    <div class="pz-page" style="color:#0f172a;font-weight:400;">
      <!-- ── En-tête ──────────────────────────────────────────────────────── -->
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs" style="color:#64748b;font-size:12px;font-weight:400;">
            <strong style="color:#334155;font-weight:500;">RH</strong>
            <span class="sep" style="color:#94a3b8;margin:0 6px;">/</span> Tableau de bord
          </div>
          <h1 style="font-size:24px;font-weight:600;color:#0f172a;margin:0 0 4px;letter-spacing:-0.02em;">Tableau de bord RH</h1>
          <div style="font-size:13px;color:#64748b;font-weight:400;">
            {{ data.employees().length }} collaborateurs · {{ pendingCount() }} demandes en attente
          </div>
        </div>
        <div class="pz-page-actions">
          <button class="pz-btn"><pz-icon name="Download" [size]="14" /> Exporter</button>
        </div>
      </div>

      <!-- ── Hero paie ─────────────────────────────────────────────────────── -->
      <div
        class="hero"
        style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 100%);color:#fff;border-radius:14px;padding:24px;position:relative;overflow:hidden;border:none;"
      >
        <div
          class="hero-bg"
          style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,0.35),transparent 70%);pointer-events:none;"
        ></div>
        <div class="hero-inner" style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1;">
          <div>
            <div
              class="hero-eyebrow"
              style="color:#fff;opacity:0.7;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-weight:500;margin-bottom:8px;"
            >
              Période de paie en cours
            </div>
            <h2 style="color:#fff;font-size:24px;font-weight:600;margin:0 0 6px;">{{ currentPeriod().label }}</h2>
            <div class="hero-meta" style="color:rgba(255,255,255,0.8);font-size:13.5px;font-weight:400;">
              @if (currentPeriod().employees > 0) {
                {{ currentPeriod().employees }} bulletins · Brut
                <strong style="color:#fff;font-weight:600;">{{ data.fmtTND(currentPeriod().gross) }}</strong> · Net
                <strong style="color:#fff;font-weight:600;">{{ data.fmtTND(currentPeriod().net) }}</strong>
              } @else {
                Statut : <strong style="color:#fff;font-weight:600;">{{ currentPeriod().status }}</strong>
              }
            </div>
          </div>
          <button
            class="pz-btn hero-btn"
            style="background:rgba(255,255,255,0.95);color:#312e81;border-color:transparent;height:42px;padding:0 18px;font-size:14px;font-weight:600;flex-shrink:0;"
          >
            Ouvrir la paie <pz-icon name="Arrow" [size]="12" [strokeWidth]="1.6" />
          </button>
        </div>
        <div class="hero-steps" style="display:flex;gap:8px;margin-top:20px;position:relative;z-index:1;">
          @for (s of payrollSteps; track s.label; let i = $index) {
            <div
              class="hero-step"
              [style.background]="
                i < activeStep() ? 'rgba(255,255,255,0.18)' : i === activeStep() ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)'
              "
              [style.border]="i === activeStep() ? '1px solid rgba(255,255,255,0.45)' : '1px solid transparent'"
              style="flex:1;padding:10px 14px;border-radius:8px;display:flex;gap:10px;align-items:center;"
            >
              <div
                class="step-num"
                style="width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,0.18);display:grid;place-items:center;font-size:12px;font-weight:600;color:#fff;flex-shrink:0;"
              >
                {{ i < activeStep() ? '✓' : i + 1 }}
              </div>
              <div>
                <div class="step-label" style="color:#fff;font-size:13.5px;font-weight:500;">{{ s.label }}</div>
                <small style="color:rgba(255,255,255,0.7);font-size:11px;display:block;">{{ s.sub }}</small>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- ── Déclarations CNSS ────────────────────────────────────────────── -->
      <div class="pz-card" style="padding:18px 20px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
          <div>
            <div style="font-size:14px;font-weight:600;color:#0f172a;margin-bottom:3px;">Déclarations CNSS trimestrielles</div>
            <div style="font-size:12.5px;color:#64748b;font-weight:400;">
              Télécharger le journal de déclaration trimestrielle à déposer sur le portail CNSS.
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            <select
              class="pz-select-inline"
              [(ngModel)]="cnssYear"
              style="height:34px;padding:0 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;background:#fff;color:#0f172a;"
            >
              @for (y of cnssYears; track y) {
                <option [value]="y">{{ y }}</option>
              }
            </select>
            @for (t of [1, 2, 3, 4]; track t) {
              <button
                class="pz-btn pz-sm"
                [disabled]="cnssLoading()"
                (click)="downloadCnss(t)"
                style="font-size:12.5px;font-weight:500;gap:5px;"
              >
                <pz-icon name="Download" [size]="13" /> T{{ t }}
              </button>
            }
          </div>
        </div>
        @if (cnssErr()) {
          <div style="margin-top:8px;font-size:12px;color:#b91c1c;">{{ cnssErr() }}</div>
        }
      </div>

      <!-- ── KPI cards ─────────────────────────────────────────────────────── -->
      <div class="stat-grid">
        <div class="pz-card stat">
          <div class="stat-head" style="color:#334155;font-size:12px;font-weight:600;">
            <span class="ico"><pz-icon name="Users" /></span>Effectifs
          </div>
          <div class="stat-val" style="color:#0f172a;font-size:26px;font-weight:600;letter-spacing:-0.025em;line-height:1.1;">
            {{ data.employees().length }}
          </div>
          <div class="stat-foot" style="color:#64748b;font-size:12px;font-weight:400;margin-top:10px;">collaborateurs actifs</div>
        </div>
        <div class="pz-card stat">
          <div class="stat-head" style="color:#334155;font-size:12px;font-weight:600;">
            <span class="ico info"><pz-icon name="Wallet" /></span>Masse salariale
          </div>
          <div class="stat-val" style="color:#0f172a;font-size:26px;font-weight:600;letter-spacing:-0.025em;line-height:1.1;">
            {{ currentPeriod().gross > 0 ? data.fmtTND(currentPeriod().gross) : '—' }}
          </div>
          <div class="stat-foot" style="color:#64748b;font-size:12px;font-weight:400;margin-top:10px;">brut période en cours</div>
        </div>
        <div class="pz-card stat">
          <div class="stat-head" style="color:#334155;font-size:12px;font-weight:600;">
            <span class="ico warn"><pz-icon name="Calendar" /></span>Congés à valider
          </div>
          <div class="stat-val" style="color:#0f172a;font-size:26px;font-weight:600;letter-spacing:-0.025em;line-height:1.1;">
            {{ pendingLeaves().length }}
          </div>
          <div class="stat-foot" style="color:#64748b;font-size:12px;font-weight:400;margin-top:10px;">
            {{ pendingDays() }} jours au total
          </div>
        </div>
        <div class="pz-card stat">
          <div class="stat-head" style="color:#334155;font-size:12px;font-weight:600;">
            <span class="ico danger"><pz-icon name="Cash" /></span>Avances en attente
          </div>
          <div class="stat-val" style="color:#0f172a;font-size:26px;font-weight:600;letter-spacing:-0.025em;line-height:1.1;">
            {{ pendingAdvances().length }}
          </div>
          <div class="stat-foot" style="color:#64748b;font-size:12px;font-weight:400;margin-top:10px;">
            {{ pendingAdvAmt() > 0 ? data.fmtTND(pendingAdvAmt()) + ' à valider' : '—' }}
          </div>
        </div>
      </div>

      <!-- ── Histogramme + Demandes ─────────────────────────────────────────── -->
      <div class="grid-c2-1">
        <!-- Histogramme -->
        <div class="pz-card">
          <div class="card-head">
            <div>
              <div class="card-title" style="font-size:14px;font-weight:600;color:#0f172a;">Masse salariale — 6 mois</div>
              <div class="card-sub" style="font-size:11.5px;color:#64748b;font-weight:400;margin-top:2px;">
                Salaires bruts + charges patronales
              </div>
            </div>
            <div class="chart-legend">
              <span class="swatch brut"></span><span class="leg-label" style="font-size:11.5px;color:#64748b;font-weight:400;">Brut</span>
              <span class="swatch charges"></span
              ><span class="leg-label" style="font-size:11.5px;color:#64748b;font-weight:400;">Charges</span>
            </div>
          </div>
          @if (chartData().length === 0) {
            <div style="padding:32px;text-align:center;font-size:13px;color:#64748b;font-weight:400;">Aucune donnée de paie disponible</div>
          } @else {
            <div class="chart-wrap">
              <svg viewBox="0 0 600 180" preserveAspectRatio="none" width="100%" height="180">
                <!-- Gridlines -->
                @for (g of GRID_LINES; track g.y) {
                  <line
                    [attr.x1]="8"
                    [attr.y1]="g.y"
                    [attr.x2]="592"
                    [attr.y2]="g.y"
                    style="stroke: var(--pz-line)"
                    stroke-width="1"
                    stroke-dasharray="2 3"
                  />
                }
                <!-- Barres empilées -->
                @for (b of chartBars(); track b.m) {
                  <!-- Charges (bas) — #c7d2fe autorisé dans SVG -->
                  <rect [attr.x]="b.x" [attr.y]="b.chargesY" [attr.width]="b.barW" [attr.height]="b.chargesH" fill="#c7d2fe" rx="3" />
                  <!-- Brut (haut) — #4f46e5 autorisé dans SVG -->
                  <rect [attr.x]="b.x" [attr.y]="b.brutY" [attr.width]="b.barW" [attr.height]="b.brutH" fill="#4f46e5" rx="3" />
                  <!-- Label mois -->
                  <text
                    [attr.x]="b.cx"
                    [attr.y]="b.labelY"
                    text-anchor="middle"
                    style="fill: var(--pz-muted-2); font-family: 'JetBrains Mono', monospace; font-size: 10.5px"
                  >
                    {{ b.m }}
                  </text>
                }
              </svg>
            </div>
          }
        </div>

        <!-- Demandes en attente -->
        <div class="pz-card">
          <div class="card-head">
            <div class="card-title" style="font-size:14px;font-weight:600;color:#0f172a;">Demandes en attente</div>
          </div>
          <div class="card-body">
            @if (pendingLeaves().length === 0 && pendingAdvances().length === 0) {
              <div style="padding:20px 0;text-align:center;font-size:13px;color:#64748b;font-weight:400;">Aucune demande en attente</div>
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
      </div>

      <!-- ── Calendrier + Activité récente ──────────────────────────────────── -->
      <div class="two-col">
        <!-- Calendrier des congés -->
        <div class="pz-card">
          <div class="card-head">
            <div class="card-title" style="font-size:14px;font-weight:600;color:#0f172a;">Calendrier des congés</div>
            <div class="cal-nav">
              <button class="pz-btn pz-sm pz-ghost" (click)="prevMonth()">
                <pz-icon name="Caret" [size]="14" style="transform:rotate(90deg)" />
              </button>
              <span class="cal-label" style="font-size:12px;font-weight:600;color:#334155;">{{ calMonthLabel() }}</span>
              <button class="pz-btn pz-sm pz-ghost" (click)="nextMonth()">
                <pz-icon name="Caret" [size]="14" style="transform:rotate(-90deg)" />
              </button>
            </div>
          </div>
          <div class="card-body cal-body">
            <div class="cal-legend">
              <span class="dot-legend approved"></span><span style="color:#64748b;font-size:11.5px;font-weight:400;">Approuvé</span>
              <span class="dot-legend pending"></span><span style="color:#64748b;font-size:11.5px;font-weight:400;">En attente</span>
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

        <!-- Activité récente -->
        <div class="pz-card">
          <div class="card-head">
            <div class="card-title" style="font-size:14px;font-weight:600;color:#0f172a;">Activité récente</div>
            <span style="margin-left:auto;font-size:11px;color:#94a3b8;font-weight:400;"
              >{{ activity().length }} entrée{{ activity().length > 1 ? 's' : '' }}</span
            >
          </div>
          <div class="card-body tl-body" style="padding-bottom:0;">
            @if (activityLoading()) {
              <div style="padding:20px 0;text-align:center;font-size:13px;color:#64748b;font-weight:400;">Chargement…</div>
            } @else if (activity().length === 0) {
              <div style="padding:20px 0;text-align:center;font-size:13px;color:#64748b;font-weight:400;">Aucune activité récente</div>
            } @else {
              @for (a of visibleActivity(); track $index; let last = $last) {
                <div class="tl-item" [class.last]="last && !canShowMore()">
                  <div class="tl-dot"><pz-icon [name]="a.icon" [size]="13" /></div>
                  <div style="flex:1;min-width:0;">
                    <div class="tl-text" style="font-size:13px;color:#1e293b;font-weight:400;line-height:1.5;">{{ a.message }}</div>
                    <div style="display:flex;align-items:center;gap:10px;margin-top:3px;">
                      <div class="tl-time" style="font-size:11.5px;color:#94a3b8;font-weight:400;">{{ a.dateLabel }} · {{ a.timeHm }}</div>
                      @if (isDownloadable(a)) {
                        <button
                          class="pz-btn pz-sm"
                          style="height:22px;padding:0 8px;font-size:11px;font-weight:500;gap:4px;display:inline-flex;align-items:center;border-radius:5px;"
                          [disabled]="dlLoading()[a.entityType + '_' + a.entityId]"
                          (click)="downloadActivity(a); $event.stopPropagation()"
                          [title]="downloadLabel(a)"
                        >
                          @if (dlLoading()[a.entityType + '_' + a.entityId]) {
                            <span style="font-size:10px;">…</span>
                          } @else {
                            <pz-icon name="Download" [size]="11" />
                          }
                          {{ downloadLabel(a) }}
                        </button>
                      }
                    </div>
                  </div>
                </div>
              }
              <!-- Voir plus / Voir moins -->
              @if (canShowMore() || activityExpanded()) {
                <div style="text-align:center;padding:10px 0 14px;border-top:1px solid #f1f5f9;margin-top:4px;">
                  <button
                    class="pz-btn pz-sm pz-ghost"
                    style="font-size:12px;font-weight:500;color:#4f46e5;"
                    (click)="toggleActivityExpand()"
                  >
                    @if (activityExpanded()) {
                      Réduire ↑
                    } @else {
                      Voir les {{ activity().length - activityLimit }} autres →
                    }
                  </button>
                </div>
              }
            }
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
export default class RhDashboardComponent implements OnInit {
  protected readonly data = inject(DataService);
  protected readonly api = inject(ApiService);
  protected readonly busy = signal(false);
  protected readonly rejectTarget = signal<{ type: 'leave' | 'advance'; id: string } | null>(null);
  protected rejectComment = '';

  // ── Activité récente (dynamique) ─────────────────────────────────────────
  protected readonly activity = signal<ActivityItem[]>([]);
  protected readonly activityLoading = signal(true);
  protected readonly activityLimit = 10;
  protected readonly activityExpanded = signal(false);
  protected readonly dlLoading = signal<Record<string, boolean>>({});

  protected readonly visibleActivity = computed(() =>
    this.activityExpanded() ? this.activity() : this.activity().slice(0, this.activityLimit),
  );

  protected readonly canShowMore = computed(() => !this.activityExpanded() && this.activity().length > this.activityLimit);

  protected toggleActivityExpand(): void {
    this.activityExpanded.update(v => !v);
  }

  protected isDownloadable(a: ActivityItem): boolean {
    return !!a.entityId && ['PAYSLIP', 'PAYROLLPERIOD'].includes(a.entityType);
  }

  protected downloadLabel(a: ActivityItem): string {
    if (a.entityType === 'PAYSLIP') return 'Bulletin';
    if (a.entityType === 'PAYROLLPERIOD') return 'Bulletins';
    return 'Télécharger';
  }

  protected downloadActivity(a: ActivityItem): void {
    if (!a.entityId) return;
    const key = `${a.entityType}_${a.entityId}`;
    this.dlLoading.update(m => ({ ...m, [key]: true }));
    const obs$ = a.entityType === 'PAYSLIP' ? this.api.downloadBulletin(a.entityId) : this.api.downloadBulkBulletin(a.entityId);
    const filename = a.entityType === 'PAYSLIP' ? `bulletin_${a.entityId}.pdf` : `bulletins_periode_${a.entityId}.pdf`;
    obs$.subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        this.dlLoading.update(m => ({ ...m, [key]: false }));
      },
      error: () => this.dlLoading.update(m => ({ ...m, [key]: false })),
    });
  }

  // ── Histogramme masse salariale (dynamique) ──────────────────────────────
  protected readonly chartData = signal<PayrollChartPoint[]>([]);
  protected readonly chartBars = computed(() => buildChartBarsFromData(this.chartData()));

  // ── CNSS export ──────────────────────────────────────────────────────────
  protected readonly cnssLoading = signal(false);
  protected readonly cnssErr = signal('');
  protected cnssYear = new Date().getFullYear();
  protected readonly cnssYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  protected readonly DAYS_FR = DAYS_FR;
  protected readonly GRID_LINES = GRID_LINES;

  ngOnInit(): void {
    this.api.activityFeed().subscribe({
      next: items => {
        this.activity.set(items);
        this.activityLoading.set(false);
      },
      error: () => this.activityLoading.set(false),
    });
    this.api.payrollChart().subscribe({
      next: pts => this.chartData.set(pts),
      error: () => {
        /* garde les barres vides */
      },
    });
  }

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
    const firstDow = (new Date(y, m - 1, 1).getDay() + 6) % 7;
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

  downloadCnss(trimestre: number): void {
    this.cnssLoading.set(true);
    this.cnssErr.set('');
    this.api.downloadCnssTrimestriel(this.cnssYear, trimestre).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CNSS_T${trimestre}_${this.cnssYear}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        this.cnssLoading.set(false);
      },
      error: () => {
        this.cnssErr.set(
          `Impossible de générer la déclaration T${trimestre} ${this.cnssYear}. Vérifiez que la paie du trimestre est validée.`,
        );
        this.cnssLoading.set(false);
      },
    });
  }

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
