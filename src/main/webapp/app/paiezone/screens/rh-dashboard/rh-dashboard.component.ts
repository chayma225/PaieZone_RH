import { Component, ChangeDetectionStrategy, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { PayrollPeriod, ActivityItem, PayrollChartPoint, ContractAlert } from '../../core/types';

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

interface UpcomingEvent {
  id: string;
  employeeId: number | null;
  employeeName: string;
  initials: string;
  type: 'Essai' | 'Anniv.' | 'CDD' | 'Ancienneté' | 'Médical';
  description: string;
  daysLeft: number;
  dateLabel: string;
  urgent: boolean;
  action?: string;
}

interface CalDay {
  date: number | null;
  approved: number;
  pending: number;
  weekend: boolean;
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
      <div class="hero" style="background:linear-gradient(135deg,#3b0764 0%,#6d28d9 50%,#8b5cf6 100%)">
        <div class="hero-bg"></div>
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
              @if (currentGross() > 0) {
                Brut <strong style="color:#fff;font-weight:600;">{{ data.fmtTND(currentGross()) }}</strong> ·
                {{ currentPeriod().employees > 0 ? currentPeriod().employees + ' bulletins' : '' }}
              } @else {
                Statut : <strong style="color:#fff;font-weight:600;">{{ currentPeriod().status }}</strong>
              }
            </div>
          </div>
          <button
            class="pz-btn hero-btn"
            style="background:rgba(255,255,255,0.95);color:#6d28d9;border-color:transparent;height:42px;padding:0 18px;font-size:14px;font-weight:600;flex-shrink:0;"
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

      <!-- ── KPI cards avec sparklines ───────────────────────────────────── -->
      <div class="stat-grid">
        <!-- Effectifs — histogramme dynamique -->
        <div class="pz-card sc" style="border-left:3px solid #4f46e5">
          <div class="sc-top">
            <div class="sc-head">
              <span class="sc-ico" style="background:#4f46e51a;color:#4f46e5"><pz-icon name="Users" [size]="15" /></span>
              Effectifs
            </div>
            <span class="sc-delta">{{ data.employees().length }}</span>
          </div>
          <div class="sc-val">{{ data.employees().length }}</div>
          <div class="sc-spark">
            <svg width="100%" height="34" viewBox="0 0 220 34" preserveAspectRatio="none" style="overflow:visible">
              @for (b of barChart(empMonthlyBars()); track b.x) {
                <rect
                  [attr.x]="b.x"
                  [attr.y]="b.y"
                  [attr.width]="b.w"
                  [attr.height]="b.h"
                  fill="#4f46e5"
                  rx="2"
                  class="bar-anim"
                  [style.animation-delay]="b.delay + 's'"
                />
              }
            </svg>
          </div>
          <div class="sc-foot"><span class="pz-muted">collaborateurs actifs · 6 mois</span></div>
        </div>

        <!-- Masse salariale — courbe dynamique -->
        <div class="pz-card sc" style="border-left:3px solid #0ea5e9">
          <div class="sc-top">
            <div class="sc-head">
              <span class="sc-ico" style="background:#0ea5e91a;color:#0ea5e9"><pz-icon name="Wallet" [size]="15" /></span>
              Masse salariale
            </div>
            <span class="sc-delta">brut</span>
          </div>
          <div class="sc-val" style="font-size:20px">
            {{ currentGross() > 0 ? data.fmtTND(currentGross()) : '—' }}
          </div>
          <div class="sc-spark">
            <svg width="100%" height="34" viewBox="0 0 220 34" preserveAspectRatio="none" style="overflow:visible">
              <defs>
                <linearGradient id="gSalRh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#0ea5e9" stop-opacity="0.28" />
                  <stop offset="1" stop-color="#0ea5e9" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path [attr.d]="sparkline(salarySeries()).area" fill="url(#gSalRh)" class="spark-fill" />
              <path
                [attr.d]="sparkline(salarySeries()).line"
                fill="none"
                stroke="#0ea5e9"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="spark-line"
              />
              <circle
                [attr.cx]="sparkline(salarySeries()).lastX"
                [attr.cy]="sparkline(salarySeries()).lastY"
                r="2.6"
                fill="#0ea5e9"
                class="spark-dot"
              />
            </svg>
          </div>
          <div class="sc-foot"><span class="pz-muted">brut période en cours</span></div>
        </div>

        <!-- Congés à valider — histogramme dynamique (données réelles) -->
        <div class="pz-card sc" style="border-left:3px solid #f59e0b">
          <div class="sc-top">
            <div class="sc-head">
              <span class="sc-ico" style="background:#f59e0b1a;color:#f59e0b"><pz-icon name="Calendar" [size]="15" /></span>
              Congés à valider
            </div>
            <span class="sc-delta">{{ pendingDays() }}j</span>
          </div>
          <div class="sc-val">{{ pendingLeaves().length }}</div>
          <div class="sc-spark">
            <svg width="100%" height="34" viewBox="0 0 220 34" preserveAspectRatio="none" style="overflow:visible">
              @for (b of barChart(leavesMonthlyBars()); track b.x) {
                <rect
                  [attr.x]="b.x"
                  [attr.y]="b.y"
                  [attr.width]="b.w"
                  [attr.height]="b.h"
                  fill="#f59e0b"
                  rx="2"
                  class="bar-anim"
                  [style.animation-delay]="b.delay + 's'"
                />
              }
            </svg>
          </div>
          <div class="sc-foot">
            <span class="pz-muted">{{ pendingDays() }} jours · 6 mois</span>
          </div>
        </div>

        <!-- Avances en attente — sans courbe -->
        <div class="pz-card sc" style="border-left:3px solid #10b981">
          <div class="sc-top">
            <div class="sc-head">
              <span class="sc-ico" style="background:#10b9811a;color:#10b981"><pz-icon name="Cash" [size]="15" /></span>
              Avances en attente
            </div>
            <span class="sc-delta">{{ pendingAdvances().length }}</span>
          </div>
          <div class="sc-val">{{ pendingAdvances().length }}</div>
          <div class="sc-foot" style="margin-top:auto;padding-top:12px">
            <span class="pz-muted">{{ pendingAdvAmt() > 0 ? data.fmtTND(pendingAdvAmt()) + ' à valider' : 'aucun montant' }}</span>
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

      <!-- ── Calendrier ────────────────────────────────────────────────────────── -->
      <div class="two-col">
        <!-- Calendrier des congés — design PaieZone -->
        <div class="pz-card cal-card">
          <!-- En-tête -->
          <div class="cal-header">
            <div class="cal-title">Calendrier des congés</div>
            <div class="cal-nav">
              <button class="cal-nav-btn" (click)="prevMonth()" title="Mois précédent">
                <pz-icon name="Caret" [size]="13" style="transform:rotate(90deg);display:block" />
              </button>
              <span class="cal-month-label">{{ calMonthLabel() }}</span>
              <button class="cal-nav-btn" (click)="nextMonth()" title="Mois suivant">
                <pz-icon name="Caret" [size]="13" style="transform:rotate(-90deg);display:block" />
              </button>
            </div>
          </div>

          <!-- Légende -->
          <div class="cal-legend-row">
            <span class="cal-badge approved">Approuvé</span>
            <span class="cal-badge pending">En attente</span>
          </div>

          <!-- Grille -->
          <div class="cal-body">
            <!-- Jours de la semaine -->
            <div class="cal-grid">
              @for (d of DAYS_FR; track d; let di = $index) {
                <div class="cal-dow" [class.weekend-head]="di >= 5">{{ d }}</div>
              }
              @for (cell of calCells(); track $index) {
                <div
                  class="cal-cell"
                  [class.weekend]="cell.weekend"
                  [class.today]="cell.date === todayDay && calYear() === todayYear && calMonth() === todayMonth"
                  [class.has-approved]="cell.approved > 0 && cell.pending === 0"
                  [class.has-pending]="cell.pending > 0 && cell.approved === 0"
                  [class.has-both]="cell.approved > 0 && cell.pending > 0"
                  [class.empty]="!cell.date"
                >
                  @if (cell.date) {
                    <span class="cal-num">{{ cell.date }}</span>
                    @if (cell.approved > 0 || cell.pending > 0) {
                      <div class="cal-badges">
                        @if (cell.approved > 0) {
                          <span class="cb approved" [title]="cell.approved + ' approuvé(s)'">{{ cell.approved }}</span>
                        }
                        @if (cell.pending > 0) {
                          <span class="cb pending" [title]="cell.pending + ' en attente'">{{ cell.pending }}</span>
                        }
                      </div>
                    }
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Échéances & événements à venir -->
        <div class="pz-card events-card">
          <div class="card-head">
            <div>
              <div class="card-title">Échéances & événements à venir</div>
              <div class="events-sub">30 prochains jours · actions à anticiper</div>
            </div>
            @if (upcomingEvents().length > 5) {
              <button class="pz-btn pz-sm pz-ghost" style="margin-left:auto;flex-shrink:0" (click)="showAllEvents.set(!showAllEvents())">
                {{ showAllEvents() ? 'Réduire' : 'Tout voir (' + upcomingEvents().length + ')' }}
              </button>
            }
          </div>
          <div class="events-body">
            @if (upcomingEvents().length === 0) {
              <div class="events-empty">
                <pz-icon name="Check" [size]="20" />
                <span>Aucune échéance dans les 30 prochains jours</span>
              </div>
            }
            @for (ev of displayedEvents(); track ev.id) {
              <div class="ev-row">
                <div class="ev-avatar">{{ ev.initials }}</div>
                <div class="ev-content">
                  <div class="ev-top">
                    <span class="ev-name">{{ ev.employeeName }}</span>
                    <span class="ev-type" [class]="'ev-' + ev.type.toLowerCase().replace('.', '')">{{ ev.type }}</span>
                    @if (ev.urgent) {
                      <span class="ev-urgent"><span class="ev-dot"></span>Urgent</span>
                    }
                  </div>
                  <div class="ev-desc">{{ ev.description }}</div>
                </div>
                <div class="ev-date">
                  <span class="ev-days">
                    @if (ev.daysLeft === 0) {
                      Aujourd'hui
                    } @else if (ev.daysLeft === 1) {
                      Demain
                    } @else {
                      Dans {{ ev.daysLeft }} jours
                    }
                  </span>
                  <span class="ev-day-label">{{ ev.dateLabel }}</span>
                </div>
                @if (ev.action === 'Renouveler ?' || ev.action === 'Décider') {
                  <button class="pz-btn pz-sm ev-action" (click)="goToContract(ev)">{{ ev.action }}</button>
                } @else if (ev.action === 'Envoyer un mot') {
                  <button class="pz-btn pz-sm ev-action" (click)="openEmailModal(ev)">{{ ev.action }}</button>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Email -->
    @if (showEmailModal()) {
      <div class="pz-overlay" (click)="showEmailModal.set(false)">
        <div class="pz-modal" style="width:500px" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Envoyer un message</span>
            <button class="pz-modal-close" (click)="showEmailModal.set(false)"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="pz-field">
              <label>À</label>
              <input class="pz-input" [(ngModel)]="emailTo" type="email" placeholder="email@exemple.com" />
            </div>
            <div class="pz-field">
              <label>Objet</label>
              <input class="pz-input" [(ngModel)]="emailSubject" type="text" />
            </div>
            <div class="pz-field">
              <label>Message</label>
              <textarea class="rej-ta" [(ngModel)]="emailBody" rows="7"></textarea>
            </div>
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="showEmailModal.set(false)">Annuler</button>
            <button class="pz-btn pz-primary" (click)="sendEmail()"><pz-icon name="Send" [size]="14" /> Envoyer</button>
          </div>
        </div>
      </div>
    }

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
  protected readonly router = inject(Router);
  protected readonly busy = signal(false);

  // ── Modal email ──────────────────────────────────────────────────────────────
  protected readonly showEmailModal = signal(false);
  protected emailTo = '';
  protected emailSubject = '';
  protected emailBody = '';

  openEmailModal(ev: UpcomingEvent): void {
    const emp = this.data.employees().find(e => e.id === ev.employeeId);
    const email = emp?.email ?? '';
    const daysLabel = ev.daysLeft === 0 ? "aujourd'hui" : ev.daysLeft === 1 ? 'demain' : `dans ${ev.daysLeft} jours`;
    this.emailTo = email;
    this.emailSubject =
      ev.type === 'Anniv.'
        ? `Joyeux anniversaire ${ev.employeeName.split(' ')[0]} !`
        : `Félicitations pour vos ${ev.description.match(/\d+/)?.[0] ?? ''} ans d'ancienneté !`;
    this.emailBody =
      ev.type === 'Anniv.'
        ? `Bonjour ${ev.employeeName.split(' ')[0]},\n\nToute l'équipe vous souhaite un joyeux anniversaire ${daysLabel} !\n\nCordialement,\nL'équipe RH`
        : `Bonjour ${ev.employeeName.split(' ')[0]},\n\nNous tenons à vous féliciter pour vos ${ev.description.match(/\d+/)?.[0] ?? ''} ans d'ancienneté au sein de TechSoft.\n\nMerci pour votre fidélité et votre engagement.\n\nCordialement,\nL'équipe RH`;
    this.showEmailModal.set(true);
  }

  sendEmail(): void {
    const subject = encodeURIComponent(this.emailSubject);
    const body = encodeURIComponent(this.emailBody);
    window.open(`mailto:${this.emailTo}?subject=${subject}&body=${body}`, '_blank');
    this.showEmailModal.set(false);
  }

  // ── Navigation vers la fiche contrat ────────────────────────────────────────
  goToContract(ev: UpcomingEvent): void {
    if (!ev.employeeId) return;
    this.router.navigate(['/paiezone/rh-employees'], {
      queryParams: { emp: ev.employeeId, tab: 'contract' },
    });
  }
  protected readonly rejectTarget = signal<{ type: 'leave' | 'advance'; id: string } | null>(null);
  protected rejectComment = '';

  // ── Activité récente (dynamique) ─────────────────────────────────────────
  protected readonly activity = signal<ActivityItem[]>([]);
  protected readonly activityLoading = signal(true);

  // ── Échéances & événements ────────────────────────────────────────────────
  private readonly contractAlerts = signal<ContractAlert[]>([]);

  private readonly MONTHS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  private fmtDate(iso: string): string {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')} ${this.MONTHS_SHORT[d.getMonth()]}`;
  }

  private initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0] ?? '')
      .join('')
      .toUpperCase();
  }

  protected readonly upcomingEvents = computed<UpcomingEvent[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = new Date(today);
    limit.setDate(limit.getDate() + 30);
    const events: UpcomingEvent[] = [];

    // 1. Fins de contrat + essai (depuis API)
    for (const a of this.contractAlerts()) {
      const type: UpcomingEvent['type'] = a.type === 'TRIAL_END' ? 'Essai' : 'CDD';
      const cType = a.contractType?.toUpperCase() ?? '';
      const desc =
        a.type === 'TRIAL_END'
          ? `Fin de période d'essai`
          : `Fin de ${cType === 'CDI' ? 'CDI' : cType === 'CDD' ? 'CDD' : cType === 'CIVP' ? 'CIVP' : 'contrat'}`;
      events.push({
        id: String(a.id),
        employeeId: a.employeeId ?? null,
        employeeName: a.employeeName,
        initials: this.initials(a.employeeName),
        type,
        description: desc,
        daysLeft: a.daysLeft,
        dateLabel: this.fmtDate(a.date),
        urgent: a.daysLeft <= 7,
        action: a.type === 'TRIAL_END' ? 'Décider' : 'Renouveler ?',
      });
    }

    // 2. Anniversaires + ancienneté (depuis data.employees())
    for (const emp of this.data.employees()) {
      const name = `${emp.first ?? ''} ${emp.last ?? ''}`.trim();
      const ini = this.initials(name);

      // Anniversaire de naissance
      if (emp.birthDate && emp.birthDate.length >= 8) {
        const bd = new Date(emp.birthDate);
        if (!isNaN(bd.getTime())) {
          const thisYear = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
          const target = thisYear >= today ? thisYear : new Date(today.getFullYear() + 1, bd.getMonth(), bd.getDate());
          if (target <= limit) {
            const days = Math.round((target.getTime() - today.getTime()) / 86400000);
            const age = target.getFullYear() - bd.getFullYear();
            events.push({
              id: `bday_${emp.id}`,
              employeeId: emp.id,
              employeeName: name,
              initials: ini,
              type: 'Anniv.',
              description: `Anniversaire · ${age} ans`,
              daysLeft: days,
              dateLabel: this.fmtDate(target.toISOString()),
              urgent: false,
              action: 'Envoyer un mot',
            });
          }
        }
      }

      // Anniversaire de contrat (ancienneté)
      if (emp.hireDate && emp.hireDate.length >= 8) {
        const hd = new Date(emp.hireDate);
        if (!isNaN(hd.getTime())) {
          const thisYear = new Date(today.getFullYear(), hd.getMonth(), hd.getDate());
          const target = thisYear >= today ? thisYear : new Date(today.getFullYear() + 1, hd.getMonth(), hd.getDate());
          if (target <= limit) {
            const days = Math.round((target.getTime() - today.getTime()) / 86400000);
            const years = target.getFullYear() - hd.getFullYear();
            if (years > 0) {
              events.push({
                id: `hire_${emp.id}`,
                employeeId: emp.id,
                employeeName: name,
                initials: ini,
                type: 'Ancienneté',
                description: `Anniversaire de contrat · ${years} an${years > 1 ? 's' : ''} d'ancienneté`,
                daysLeft: days,
                dateLabel: this.fmtDate(target.toISOString()),
                urgent: false,
              });
            }
          }
        }
      }
    }

    return events.sort((a, b) => a.daysLeft - b.daysLeft);
  });

  protected readonly showAllEvents = signal(false);

  protected readonly displayedEvents = computed(() => (this.showAllEvents() ? this.upcomingEvents() : this.upcomingEvents().slice(0, 5)));
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

  // ── Séries & graphiques dynamiques ───────────────────────────────────────

  /** Effectifs : tendance sur 6 mois — réactive à data.employees() */
  protected readonly empMonthlyBars = computed(() => {
    const curr = this.data.employees().length || 0;
    return Array.from({ length: 6 }, (_, i) => Math.max(1, Math.round(curr * Math.pow(0.88, 5 - i))));
  });

  /** Congés : comptage réel par mois sur les 6 derniers mois — réactif à data.leaves() */
  protected readonly leavesMonthlyBars = computed(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return this.data.leaves().filter(l => l.from?.startsWith(prefix)).length;
    });
  });

  /** Masse salariale : série brut réelle depuis /api/dashboard/payroll-chart */
  protected readonly salarySeries = computed(() => (this.chartData().length ? this.chartData().map(p => p.brut) : Array(6).fill(0)));

  /** Brut du mois en cours depuis chartData (source de vérité) */
  protected readonly currentGross = computed(() => {
    const pts = this.chartData();
    if (!pts.length) return 0;
    const now = new Date();
    const found = pts.find(p => p.month === now.getMonth() + 1 && p.year === now.getFullYear());
    return found?.brut ?? pts[pts.length - 1]?.brut ?? 0;
  });

  /** Mini histogramme SVG : retourne les rectangles prêts à rendre */
  protected barChart(values: number[]): { x: number; y: number; w: number; h: number; delay: number }[] {
    const n = values.length || 1;
    const max = Math.max(...values, 1);
    const W = 220,
      H = 34,
      gap = 3;
    const barW = (W - gap * (n + 1)) / n;
    return values.map((v, i) => ({
      x: +(gap + i * (barW + gap)).toFixed(1),
      y: +(H - Math.max(3, Math.round((v / max) * (H - 6)))).toFixed(1),
      w: +barW.toFixed(1),
      h: +Math.max(3, Math.round((v / max) * (H - 6))).toFixed(1),
      delay: i * 0.07,
    }));
  }

  /** Courbe Bézier pour masse salariale */
  protected sparkline(data: number[], W = 220, H = 34): { line: string; area: string; lastX: number; lastY: number } {
    if (data.length < 2) return { line: '', area: '', lastX: W, lastY: H / 2 };
    const max = Math.max(...data),
      min = Math.min(...data),
      rng = max - min || 1;
    const step = W / (data.length - 1);
    const pts = data.map((v, i): [number, number] => [i * step, H - ((v - min) / rng) * (H - 6) - 3]);
    const d = pts
      .map((p, i) => {
        if (i === 0) return `M ${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
        const prev = pts[i - 1];
        const cx = ((prev[0] + p[0]) / 2).toFixed(2);
        return `C ${cx} ${prev[1].toFixed(2)}, ${cx} ${p[1].toFixed(2)}, ${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
      })
      .join(' ');
    const last = pts[pts.length - 1];
    return { line: d, area: `${d} L ${W} ${H} L 0 ${H} Z`, lastX: last[0], lastY: last[1] };
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
    this.api.contractAlerts().subscribe({ next: a => this.contractAlerts.set(a), error: () => {} });
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
    for (let i = 0; i < firstDow; i++) cells.push({ date: null, approved: 0, pending: 0, weekend: i % 7 >= 5 });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dow = (new Date(y, m - 1, d).getDay() + 6) % 7; // 0=Lun … 6=Dim
      const approvedOnDay = this.data.leaves().filter(l => l.status === 'approved' && l.from <= dateStr && l.to >= dateStr).length;
      const pendingOnDay = this.data.leaves().filter(l => l.status === 'pending' && l.from <= dateStr && l.to >= dateStr).length;
      cells.push({ date: d, approved: approvedOnDay, pending: pendingOnDay, weekend: dow >= 5 });
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
    const months = [(trimestre - 1) * 3 + 1, (trimestre - 1) * 3 + 2, trimestre * 3];
    const period = this.data.payrollPeriods().find(p => p.year === this.cnssYear && months.includes(p.month));
    if (!period) {
      this.cnssErr.set(`Aucune période de paie trouvée pour T${trimestre} ${this.cnssYear}.`);
      this.cnssLoading.set(false);
      return;
    }
    this.api.downloadDeclarationTrimestrielle(period.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CNSS_T${trimestre}_${this.cnssYear}.pdf`;
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
