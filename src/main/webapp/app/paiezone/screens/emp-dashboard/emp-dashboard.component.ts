import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { PaySlip, LeaveBalance } from '../../core/types';

const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const CIRC = 2 * Math.PI * 30;

// Ordre d'affichage prioritaire des 3 anneaux
const RING_ORDER = ['ANNUEL', 'SANS_SOLDE', 'MALADIE'];

const LEAVE_META: Record<string, { label: string; color: string; icon: string }> = {
  ANNUEL: { label: 'Congés payés', color: '#5b21b6', icon: 'Beach' }, // violet
  SANS_SOLDE: { label: 'Congé sans solde', color: '#0ea5e9', icon: 'Doc' }, // bleu
  MALADIE: { label: 'Congé maladie', color: '#f59e0b', icon: 'Shield' }, // orange
  MATERNITE: { label: 'Maternité', color: '#ec4899', icon: 'User' },
  PATERNITE: { label: 'Paternité', color: '#14b8a6', icon: 'User' },
  MARIAGE: { label: 'Congé de mariage', color: '#8b5cf6', icon: 'Gift' },
};

@Component({
  selector: 'pz-emp-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <!-- ══ HERO BAND MAUVE (même design que admin-dashboard) ═════════ -->
      <div
        class="hero-band"
        style="background:linear-gradient(135deg,#3b0764 0%,#6d28d9 50%,#8b5cf6 100%);border-radius:var(--pz-radius-lg);padding:36px 44px;display:flex;align-items:center;gap:28px;color:#fff;position:relative;overflow:hidden;"
      >
        <div
          style="position:absolute;width:240px;height:240px;top:-80px;right:120px;border-radius:50%;background:#c026d3;filter:blur(60px);opacity:.4;pointer-events:none"
        ></div>
        <div
          style="position:absolute;width:180px;height:180px;bottom:-60px;right:40px;border-radius:50%;background:#7c3aed;filter:blur(60px);opacity:.4;pointer-events:none"
        ></div>
        <div style="display:flex;align-items:center;gap:20px;flex:1;position:relative">
          <div
            style="width:56px;height:56px;border-radius:14px;background:rgba(255,255,255,.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.25);display:grid;place-items:center;font-weight:800;font-size:18px;color:#fff;flex-shrink:0"
          >
            {{ initials() }}
          </div>
          <div>
            <div
              style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.6);margin-bottom:4px"
            >
              Mon espace &nbsp;·&nbsp; {{ data.myEmployee()?.role || 'Collaborateur' }}
            </div>
            <div style="font-size:20px;font-weight:700;color:#fff;line-height:1.2;margin-bottom:6px">
              Bonjour {{ data.myEmployee()?.first || 'collaborateur' }} 👋
            </div>
            <div style="font-size:13px;color:rgba(255,255,255,.7)">
              {{ today }}
              @if (data.myEmployee(); as emp) {
                &nbsp;·&nbsp; matricule <span style="font-family:'JetBrains Mono',monospace">{{ emp.matricule }}</span>
              }
            </div>
          </div>
        </div>
        <div style="display:flex;gap:10px;flex-shrink:0;position:relative">
          <button
            style="display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:999px;background:rgba(255,255,255,.15);color:#fff;border:1.5px solid rgba(255,255,255,.3);font-size:13px;font-weight:600;cursor:pointer"
            routerLink="/paiezone/emp-leaves"
          >
            <pz-icon name="Calendar" [size]="14" /> Congé
          </button>
          <button
            style="display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:999px;background:#fff;color:#6d28d9;border:none;font-size:13px;font-weight:600;cursor:pointer"
            routerLink="/paiezone/emp-requests"
          >
            <pz-icon name="Cash" [size]="14" /> Avance
          </button>
        </div>
      </div>

      <!-- ══ RANGÉE 1 : Bulletin (lilas) + Notifications ════════════════ -->
      <div class="row-2-1">
        <!-- Bulletin — fond lilas clair -->
        <div
          class="card bulletin-card"
          style="background:linear-gradient(135deg,#fdfcff 0%,#f5f0ff 60%,#ede9fe 100%);border-color:#e9d5ff;"
        >
          @if (lastSlip(); as slip) {
            <div class="card-head-row">
              <div>
                <div class="card-title">Dernier bulletin de paie</div>
                <div class="card-sub">{{ slipLabel() }} &nbsp;·&nbsp; disponible depuis le {{ slipDate() }}</div>
              </div>
              <span class="pill-status" [class]="slipTone(slip.status)"> <span class="dot"></span>{{ slipStatusLabel(slip.status) }} </span>
            </div>
            <div class="bulletin-body">
              <div class="bulletin-left">
                <div class="net-label">NET À PAYER</div>
                <div class="net-amount">{{ data.fmtTNDdec(slip.netSalary) }}</div>
                <div class="bulletin-cols">
                  <div class="bcol">
                    <div class="bcol-label">BRUT</div>
                    <div class="bcol-val">{{ data.fmtTNDdec(slip.grossSalary) }}</div>
                  </div>
                  <div class="bcol">
                    <div class="bcol-label">COTISATIONS</div>
                    <div class="bcol-val red">−{{ data.fmtTNDdec(slip.cnssSalaryAmount + (slip.cavisAmount ?? 0)) }}</div>
                  </div>
                  <div class="bcol">
                    <div class="bcol-label">IRPP</div>
                    <div class="bcol-val">−{{ data.fmtTNDdec(slip.irppAmount) }}</div>
                  </div>
                </div>
              </div>
              <div class="bulletin-actions">
                <button class="btn-black" (click)="downloadSlip(slip.id)">
                  <pz-icon name="Download" [size]="14" [strokeWidth]="1.5" /> Télécharger PDF
                </button>
                <button class="btn-outline" (click)="openSlip(slip.id)">
                  <pz-icon name="Eye" [size]="14" [strokeWidth]="1.4" /> Voir le détail
                </button>
              </div>
            </div>
          } @else {
            <div class="card-head-row">
              <div class="card-title">Dernier bulletin de paie</div>
            </div>
            <div class="pz-muted" style="font-size:13px;padding:8px 0 4px">
              Votre premier bulletin apparaîtra ici après la clôture de paie.
            </div>
          }
        </div>

        <!-- Notifications -->
        <div class="card">
          <div class="card-head-row">
            <div class="card-title">Notifications</div>
            @if (notifications().length) {
              <span class="notif-badge">{{ notifications().length }}</span>
            }
          </div>
          <div class="notif-list">
            @for (n of notifications(); track n.title) {
              <div class="notif-row">
                <div class="notif-ico" [class]="n.tone"><pz-icon [name]="n.icon" [size]="15" /></div>
                <div class="notif-text">
                  <div class="notif-title">{{ n.title }}</div>
                  <div class="notif-sub">{{ n.sub }}</div>
                </div>
                <span class="notif-time">{{ n.time }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- ══ RANGÉE 2 : Anneaux de congés ═══════════════════════════════ -->
      <div class="row-3">
        @for (b of rings(); track b.label) {
          <div class="card ring-card">
            <div class="ring-top">
              <div class="ring-wrap">
                <svg width="80" height="80" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="30" fill="none" stroke="#f1f5f9" stroke-width="7" />
                  <circle
                    cx="36"
                    cy="36"
                    r="30"
                    fill="none"
                    [attr.stroke]="b.color"
                    stroke-width="7"
                    stroke-linecap="round"
                    [attr.stroke-dasharray]="ringDash(b.remaining, b.total)"
                    transform="rotate(-90 36 36)"
                  />
                </svg>
                <div class="ring-icon" [style.color]="b.color">
                  <pz-icon [name]="b.icon" [size]="20" />
                </div>
              </div>
              <div class="ring-info">
                <div class="ring-label">{{ b.label }}</div>
                <div class="ring-val">
                  {{ b.remaining | number: '1.0-0' }}<span class="ring-total">/{{ b.total | number: '1.0-0' }}j</span>
                </div>
                <div class="ring-taken">{{ b.used | number: '1.0-0' }} jours pris</div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- ══ RANGÉE 3 : Équipe + Historique paie ════════════════════════ -->
      <div class="row-2">
        <!-- Mon équipe -->
        <div class="card">
          <div class="card-head-row">
            <div>
              <div class="card-title">
                Mon équipe
                @if (data.myEmployee()?.dept) {
                  — {{ data.myEmployee()!.dept }}
                }
              </div>
            </div>
            <span class="team-count">{{ teamMembers().length }} personne{{ teamMembers().length > 1 ? 's' : '' }}</span>
          </div>
          @if (teamMembers().length) {
            <div class="team-list">
              @for (m of teamMembers(); track m.id) {
                <div class="team-row">
                  <div class="team-avatar" [attr.data-bg]="data.empBgIdx(m.id)">{{ data.initials(m) }}</div>
                  <div class="team-info">
                    <div class="team-name">{{ data.fullName(m) }}</div>
                    <div class="team-role">{{ m.role || m.cat }}</div>
                  </div>
                  <button class="icon-btn" title="Envoyer un message">
                    <pz-icon name="Mail" [size]="15" [strokeWidth]="1.4" />
                  </button>
                </div>
              }
            </div>
          } @else {
            <div class="pz-muted" style="font-size:13px;padding:12px 0;text-align:center">Aucun collègue dans votre département.</div>
          }
        </div>

        <!-- Historique paie -->
        <div class="card">
          <div class="card-head-row">
            <div class="card-title">Historique paie</div>
            <span class="hist-sub">6 derniers mois</span>
          </div>
          @if (recentSlips().length) {
            <table class="hist-table">
              <thead>
                <tr>
                  <th>PÉRIODE</th>
                  <th class="right">NET</th>
                  <th class="right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                @for (s of recentSlips(); track s.id) {
                  <tr>
                    <td>
                      <span class="hist-period">{{ MONTHS_FR[s.month - 1] }} {{ s.year }}</span>
                      <span class="hist-status" [class]="slipTone(s.status)">{{ slipStatusLabel(s.status) }}</span>
                    </td>
                    <td class="right hist-net">{{ data.fmtTNDdec(s.netSalary) }}</td>
                    <td class="right">
                      <button class="pdf-btn" (click)="downloadSlip(s.id)"><pz-icon name="Download" [size]="12" /> PDF</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <div class="pz-muted" style="font-size:13px;padding:20px 0;text-align:center">Aucun bulletin disponible.</div>
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
      .pz-mono {
        font-family: 'JetBrains Mono', monospace;
      }

      /* ── Hero band mauve (identique admin-dashboard) ─────────────── */
      .hero-band {
        position: relative;
        overflow: hidden;
        background: linear-gradient(135deg, #3b0764 0%, #6d28d9 50%, #8b5cf6 100%);
        border-radius: var(--pz-radius-lg);
        padding: 36px 44px;
        display: flex;
        align-items: center;
        gap: 28px;
        color: #fff;
      }
      .hero-glow {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        filter: blur(60px);
        opacity: 0.4;
      }
      .hero-glow-1 {
        width: 240px;
        height: 240px;
        top: -80px;
        right: 120px;
        background: #c026d3;
      }
      .hero-glow-2 {
        width: 180px;
        height: 180px;
        bottom: -60px;
        right: 40px;
        background: #7c3aed;
      }
      .hero-left {
        display: flex;
        align-items: center;
        gap: 20px;
        flex: 1;
        position: relative;
      }
      .hero-logo {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.25);
        display: grid;
        place-items: center;
        font-weight: 800;
        font-size: 18px;
        color: #fff;
        flex-shrink: 0;
      }
      .hero-text {
      }
      .hero-eyebrow {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 4px;
      }
      .hero-title {
        font-size: 20px;
        font-weight: 700;
        color: #fff;
        line-height: 1.2;
        margin-bottom: 6px;
      }
      .hero-sub {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.7);
      }
      .hero-actions {
        display: flex;
        gap: 10px;
        flex-shrink: 0;
        position: relative;
      }
      .hero-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 10px 20px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition:
          opacity 0.15s,
          transform 0.12s;
      }
      .hero-btn:hover {
        opacity: 0.88;
        transform: translateY(-1px);
      }
      .hero-btn.ghost {
        background: rgba(255, 255, 255, 0.15);
        color: #fff;
        border: 1.5px solid rgba(255, 255, 255, 0.3);
      }
      .hero-btn.solid {
        background: #fff;
        color: #6d28d9;
      }

      /* ── Grilles ─────────────────────────────────────────────────── */
      .row-2-1 {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: var(--pz-gap);
      }
      .row-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--pz-gap);
      }
      .row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--pz-gap);
      }

      /* ── Card base ───────────────────────────────────────────────── */
      .card {
        background: #fff;
        border-radius: var(--pz-radius-lg, 14px);
        padding: 20px;
        border: 1px solid var(--pz-line);
        box-shadow: var(--pz-shadow-sm);
      }
      .card-head-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
      }
      .card-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--pz-ink);
      }
      .card-sub {
        font-size: 12px;
        color: var(--pz-muted);
        margin-top: 3px;
      }

      /* ── Bulletin — fond lilas clair ─────────────────────────────── */
      .bulletin-card {
        background: linear-gradient(135deg, #fdfcff 0%, #f5f0ff 60%, #ede9fe 100%);
        border-color: #e9d5ff;
      }
      .pill-status {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 20px;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .pill-status.pos {
        background: #dcfce7;
        color: #15803d;
      }
      .pill-status.info {
        background: #dbeafe;
        color: #1d4ed8;
      }
      .pill-status.locked {
        background: #ede9fe;
        color: #6d28d9;
      }
      .pill-status.warn {
        background: #fef3c7;
        color: #b45309;
      }
      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
      }

      .bulletin-body {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 24px;
        flex-wrap: wrap;
      }
      .net-label {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: #64748b;
      }
      .net-amount {
        font-size: 36px;
        font-weight: 800;
        letter-spacing: -0.03em;
        font-family: 'JetBrains Mono', monospace;
        color: #0f172a;
        margin: 4px 0 12px;
        line-height: 1;
      }
      .bulletin-cols {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
      }
      .bcol-label {
        font-size: 9.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: #94a3b8;
        margin-bottom: 3px;
      }
      .bcol-val {
        font-size: 13px;
        font-weight: 600;
        color: #0f172a;
        font-family: 'JetBrains Mono', monospace;
      }
      .bcol-val.red {
        color: #dc2626;
      }
      .bulletin-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex-shrink: 0;
      }
      .btn-black {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 10px 18px;
        border-radius: 10px;
        background: #0f172a;
        color: #fff;
        border: none;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s;
      }
      .btn-black:hover {
        background: #1e293b;
      }
      .btn-outline {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 10px 18px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.7);
        color: #0f172a;
        border: 1.5px solid #ddd6fe;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: border-color 0.15s;
      }
      .btn-outline:hover {
        border-color: #a78bfa;
      }

      /* ── Notifications ───────────────────────────────────────────── */
      .notif-badge {
        background: var(--pz-primary);
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        flex-shrink: 0;
      }
      .notif-list {
        display: flex;
        flex-direction: column;
      }
      .notif-row {
        display: flex;
        align-items: flex-start;
        gap: 11px;
        padding: 10px 0;
        border-bottom: 1px solid var(--pz-line);
      }
      .notif-row:last-child {
        border-bottom: 0;
      }
      .notif-ico {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: grid;
        place-items: center;
        flex-shrink: 0;
        background: #ede9fe;
        color: #6d28d9;
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
      .notif-text {
        flex: 1;
        min-width: 0;
      }
      .notif-title {
        font-size: 12.5px;
        font-weight: 600;
        color: var(--pz-ink);
      }
      .notif-sub {
        font-size: 11px;
        color: var(--pz-muted);
        margin-top: 1px;
      }
      .notif-time {
        font-size: 11px;
        color: var(--pz-muted);
        white-space: nowrap;
        flex-shrink: 0;
      }

      /* ── Anneaux ─────────────────────────────────────────────────── */
      .ring-card {
        padding: 20px 24px;
      }
      .ring-top {
        display: flex;
        align-items: center;
        gap: 18px;
      }
      .ring-wrap {
        position: relative;
        width: 80px;
        height: 80px;
        flex-shrink: 0;
      }
      .ring-wrap svg {
        display: block;
      }
      .ring-icon {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
      }
      .ring-label {
        font-size: 13px;
        font-weight: 700;
        color: var(--pz-ink);
        margin-bottom: 4px;
      }
      .ring-val {
        font-size: 26px;
        font-weight: 800;
        color: var(--pz-ink);
        letter-spacing: -0.02em;
        line-height: 1.1;
      }
      .ring-total {
        font-size: 13px;
        font-weight: 500;
        color: var(--pz-muted);
        margin-left: 3px;
      }
      .ring-taken {
        font-size: 11.5px;
        color: var(--pz-muted);
        margin-top: 4px;
      }

      /* ── Équipe ──────────────────────────────────────────────────── */
      .team-count {
        font-size: 12px;
        color: var(--pz-muted);
        flex-shrink: 0;
      }
      .team-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .team-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 9px 6px;
        border-radius: 10px;
        transition: background 0.12s;
      }
      .team-row:hover {
        background: var(--pz-surface-2);
      }
      .team-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 12px;
        font-weight: 800;
        color: #fff;
        flex-shrink: 0;
      }
      [data-bg='1'] {
        background: #4f46e5;
      }
      [data-bg='2'] {
        background: #0ea5e9;
      }
      [data-bg='3'] {
        background: #10b981;
      }
      [data-bg='4'] {
        background: #f59e0b;
      }
      [data-bg='5'] {
        background: #ec4899;
      }
      [data-bg='6'] {
        background: #8b5cf6;
      }
      .team-info {
        flex: 1;
        min-width: 0;
      }
      .team-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--pz-ink);
      }
      .team-role {
        font-size: 11.5px;
        color: var(--pz-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .icon-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid var(--pz-line);
        background: #fff;
        display: grid;
        place-items: center;
        cursor: pointer;
        color: var(--pz-muted);
        flex-shrink: 0;
        transition:
          border-color 0.12s,
          color 0.12s;
      }
      .icon-btn:hover {
        border-color: var(--pz-primary);
        color: var(--pz-primary);
      }

      /* ── Historique paie ─────────────────────────────────────────── */
      .hist-sub {
        font-size: 12px;
        color: var(--pz-muted);
        flex-shrink: 0;
      }
      .hist-table {
        width: 100%;
        border-collapse: collapse;
      }
      .hist-table thead th {
        text-align: left;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        color: var(--pz-muted);
        padding: 6px 8px 10px;
        border-bottom: 1px solid var(--pz-line);
      }
      .hist-table thead th.right {
        text-align: right;
      }
      .hist-table tbody td {
        padding: 11px 8px;
        border-bottom: 1px solid var(--pz-line);
        font-size: 13px;
        color: var(--pz-ink-2);
        vertical-align: middle;
      }
      .hist-table tbody tr:last-child td {
        border-bottom: 0;
      }
      .hist-table tbody tr:hover td {
        background: var(--pz-surface-2);
      }
      .hist-period {
        font-weight: 600;
        margin-right: 8px;
      }
      .hist-status {
        font-size: 10.5px;
        font-weight: 600;
        padding: 2px 7px;
        border-radius: 20px;
      }
      .hist-status.pos {
        background: #dcfce7;
        color: #15803d;
      }
      .hist-status.info {
        background: #dbeafe;
        color: #1d4ed8;
      }
      .hist-status.locked {
        background: #ede9fe;
        color: #6d28d9;
      }
      .hist-status.warn {
        background: #fef3c7;
        color: #b45309;
      }
      .hist-net {
        font-family: 'JetBrains Mono', monospace;
        font-weight: 600;
      }
      .right {
        text-align: right;
      }
      .pdf-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 7px;
        border: 1.5px solid var(--pz-line);
        background: #fff;
        color: var(--pz-primary);
        cursor: pointer;
        transition:
          border-color 0.12s,
          background 0.12s;
      }
      .pdf-btn:hover {
        background: var(--pz-primary-soft);
        border-color: var(--pz-primary);
      }
    `,
  ],
})
export default class EmpDashboardComponent implements OnInit {
  protected readonly data = inject(DataService);
  private readonly api = inject(ApiService);
  protected readonly MONTHS_FR = MONTHS_FR;

  protected readonly paySlips = signal<PaySlip[]>([]);
  protected readonly leaveBalances = signal<LeaveBalance[]>([]);

  protected readonly today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  protected readonly initials = computed(() => {
    const e = this.data.myEmployee();
    return e ? ((e.first[0] ?? '') + (e.last[0] ?? '')).toUpperCase() : 'ME';
  });

  // ── Bulletin ─────────────────────────────────────────────────────────────────
  protected readonly lastSlip = computed(() => {
    const s = this.paySlips();
    return s.length ? [...s].sort((a, b) => (b.year !== a.year ? b.year - a.year : b.month - a.month))[0] : null;
  });

  protected readonly recentSlips = computed(() =>
    [...this.paySlips()].sort((a, b) => (b.year !== a.year ? b.year - a.year : b.month - a.month)).slice(0, 6),
  );

  protected readonly slipLabel = computed(() => {
    const s = this.lastSlip();
    return s ? `${MONTHS_FR[s.month - 1]} ${s.year}` : '';
  });

  protected slipDate(): string {
    const s = this.lastSlip();
    if (!s) return '';
    return new Date(s.year, s.month, 3).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // ── Anneaux — affiche ANNUEL, SANS_SOLDE, MALADIE en priorité ───────────────
  protected readonly rings = computed(() => {
    const balances = this.leaveBalances();
    const balMap = new Map(balances.map(b => [b.leaveTypeName, b]));

    return RING_ORDER.map(key => {
      const b = balMap.get(key);
      const meta = LEAVE_META[key];
      return {
        label: meta.label,
        color: meta.color,
        icon: meta.icon,
        used: b ? +(b.taken ?? 0) : 0,
        remaining: b ? +(b.remaining ?? 0) : 0,
        total: b ? +(b.entitled ?? 0) + +(b.carryOver ?? 0) : 0,
      };
    });
  });

  // ── Équipe ────────────────────────────────────────────────────────────────────
  protected readonly teamMembers = computed(() => {
    const me = this.data.myEmployee();
    if (!me?.dept) return [];
    return this.data
      .employees()
      .filter(e => e.id !== me.id && e.dept === me.dept && e.active !== false)
      .slice(0, 5);
  });

  // ── Notifications ─────────────────────────────────────────────────────────────
  protected readonly notifications = computed(() => {
    const list: { icon: string; tone: string; title: string; sub: string; time: string }[] = [];
    const slip = this.lastSlip();
    if (slip) {
      list.push({
        icon: 'Cash',
        tone: 'primary',
        title: `Bulletin de ${MONTHS_FR[slip.month - 1]} disponible`,
        sub: 'Téléchargeable depuis Mes documents',
        time: 'Ce mois',
      });
    }
    const annual = this.leaveBalances().find(b => b.leaveTypeName === 'ANNUEL');
    if (annual && annual.remaining < 5 && annual.entitled > 0) {
      list.push({
        icon: 'Calendar',
        tone: 'warn',
        title: `Solde CP : ${annual.remaining.toFixed(0)} jours restants`,
        sub: `À utiliser avant le 31/12/${annual.year}`,
        time: "Aujourd'hui",
      });
    }
    if (annual?.pending && annual.pending > 0) {
      list.push({
        icon: 'Bell',
        tone: 'info',
        title: `Congé en attente de validation`,
        sub: `${annual.pending} jour(s) soumis`,
        time: 'En cours',
      });
    }
    if (!list.length) {
      list.push({ icon: 'Check', tone: 'pos', title: 'Tout est à jour', sub: 'Aucune notification', time: "Aujourd'hui" });
    }
    return list;
  });

  ngOnInit(): void {
    this.api.myPaySlips().subscribe({ next: s => this.paySlips.set(s), error: () => {} });
    this.api.myLeaveBalances().subscribe({ next: b => this.leaveBalances.set(b), error: () => {} });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  protected ringDash(remaining: number, total: number): string {
    if (!total) return `0 ${CIRC}`;
    return `${((remaining / total) * CIRC).toFixed(2)} ${CIRC.toFixed(2)}`;
  }

  protected slipTone(status: string): string {
    return { VALIDATED: 'pos', LOCKED: 'locked', EXPORTED: 'info', CALCULATED: 'warn', DRAFT: 'warn' }[status] ?? 'info';
  }

  protected slipStatusLabel(status: string): string {
    return { VALIDATED: 'Validé', LOCKED: 'Verrouillé', EXPORTED: 'Exporté', CALCULATED: 'Calculé', DRAFT: 'Brouillon' }[status] ?? status;
  }

  protected openSlip(id: number): void {
    this.api.downloadBulletinBlob(id).subscribe({
      next: blob => {
        const u = URL.createObjectURL(blob);
        window.open(u, '_blank');
        setTimeout(() => URL.revokeObjectURL(u), 60_000);
      },
    });
  }

  protected downloadSlip(id: number): void {
    const s = this.lastSlip();
    const name = s ? `bulletin-${s.month}-${s.year}.pdf` : `bulletin-${id}.pdf`;
    this.api.downloadBulletinBlob(id).subscribe({
      next: blob => {
        const u = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = u;
        a.download = name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(u), 10_000);
      },
    });
  }
}
