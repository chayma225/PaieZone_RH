import { Component, ChangeDetectionStrategy, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import IconComponent from '../../core/icon/icon.component';
import RolesDonutComponent from './roles-donut.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'pz-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent, RolesDonutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <!-- ── En-tête ──────────────────────────────────────────────────────── -->
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>Administration</strong> <span class="sep">/</span> Tableau de bord</div>
          <h1>{{ company()?.name ?? 'Mon entreprise' }}</h1>
          <div class="pz-muted">Vue administrateur · {{ today }}</div>
        </div>
        <div class="pz-page-actions">
          <a class="pz-btn" routerLink="/paiezone/admin-company"> <pz-icon name="Building" [size]="14" /> Mon entreprise </a>
          <a class="pz-btn pz-primary" routerLink="/paiezone/admin-users">
            <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Inviter un utilisateur
          </a>
        </div>
      </div>

      <!-- ── Bannière no-company ──────────────────────────────────────────── -->
      @if (data.companiesLoaded() && !company()) {
        <div class="no-company-banner">
          <pz-icon name="Building" [size]="20" />
          <div>
            <strong>Aucune entreprise configurée.</strong>
            Créez votre entreprise pour commencer à utiliser PaieZone RH.
          </div>
          <button class="pz-btn pz-primary" (click)="openSetup()">Configurer mon entreprise</button>
        </div>
      }

      <!-- ── Modal création entreprise ─────────────────────────────────────── -->
      @if (showSetup()) {
        <div class="pz-overlay" (click)="closeSetup()">
          <div class="pz-modal" (click)="$event.stopPropagation()">
            <div class="pz-modal-head">
              <span>Configurer mon entreprise</span>
              <button class="pz-modal-close" (click)="closeSetup()"><pz-icon name="X" [size]="16" /></button>
            </div>
            <div class="pz-modal-body">
              <div class="pz-field">
                <label>Raison sociale *</label>
                <input type="text" [(ngModel)]="setupForm.name" placeholder="ex: Ma Société SARL" />
              </div>
              <div class="pz-field">
                <label>Matricule fiscal *</label>
                <input type="text" [(ngModel)]="setupForm.taxId" placeholder="ex: 1234567A/P/M/000" />
              </div>
              <div class="pz-field-row">
                <div class="pz-field">
                  <label>Téléphone</label>
                  <input type="text" [(ngModel)]="setupForm.phone" placeholder="+216 XX XXX XXX" />
                </div>
                <div class="pz-field">
                  <label>Email</label>
                  <input type="email" [(ngModel)]="setupForm.email" placeholder="contact@entreprise.tn" />
                </div>
              </div>
              <div class="pz-field-row">
                <div class="pz-field">
                  <label>Ville</label>
                  <input type="text" [(ngModel)]="setupForm.city" placeholder="ex: Tunis" />
                </div>
                <div class="pz-field">
                  <label>Gouvernorat</label>
                  <input type="text" [(ngModel)]="setupForm.gouvernorat" placeholder="ex: Tunis" />
                </div>
              </div>
              @if (setupErr()) {
                <div class="pz-err">{{ setupErr() }}</div>
              }
            </div>
            <div class="pz-modal-foot">
              <button class="pz-btn" (click)="closeSetup()">Annuler</button>
              <button class="pz-btn pz-primary" [disabled]="setupBusy()" (click)="submitSetup()">
                {{ setupBusy() ? 'Enregistrement…' : 'Créer mon entreprise' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ── Hero violet ────────────────────────────────────────────────────── -->
      @if (company()) {
        <div class="hero-band" style="background:linear-gradient(135deg,#3b0764 0%,#6d28d9 50%,#8b5cf6 100%)">
          <div class="hero-glow hero-glow-1"></div>
          <div class="hero-glow hero-glow-2"></div>
          <div class="hero-left">
            <div class="hero-logo">{{ companyInitials() }}</div>
            <div class="hero-text">
              <div class="hero-eyebrow">Espace administrateur</div>
              <div class="hero-title">Bonjour {{ firstName() }} 👋</div>
              <div class="hero-sub">
                Tout va bien chez {{ company()!.name }}. {{ activeCount() }} utilisateurs actifs,
                {{ data.employees().length }} collaborateurs.
              </div>
            </div>
          </div>
          <div class="hero-chips">
            <div class="hero-chip">
              <div class="chip-val">{{ twofaPct() }}%</div>
              <div class="chip-lbl">2FA active</div>
            </div>
            <div class="hero-chip">
              <div class="chip-val">{{ data.employees().length }}/{{ company()!.maxEmployees ?? '∞' }}</div>
              <div class="chip-lbl">Plan {{ company()!.plan }}</div>
            </div>
          </div>
        </div>
      }

      <!-- ── KPI cards avec border-left ────────────────────────────────────── -->
      <div class="stat-grid">
        <!-- Utilisateurs actifs + sparkline -->
        <div class="pz-card sc" style="border-left:3px solid #4f46e5">
          <div class="sc-top">
            <div class="sc-head">
              <span class="sc-ico" style="background:#4f46e51a;color:#4f46e5"><pz-icon name="Users" [size]="15" /></span>
              Utilisateurs actifs
            </div>
            @if (jhUsers().length > 0) {
              <span class="sc-delta">{{ activeCount() }}/{{ jhUsers().length }}</span>
            }
          </div>
          <div class="sc-val">
            {{ activeCount()
            }}<small style="font-size:14px;font-weight:500;color:var(--pz-muted);margin-left:4px">/ {{ jhUsers().length }}</small>
          </div>
          <div class="sc-spark">
            <svg width="100%" height="34" viewBox="0 0 220 34" preserveAspectRatio="none" style="overflow:visible">
              <defs>
                <linearGradient id="gUsr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#4f46e5" stop-opacity="0.28" />
                  <stop offset="1" stop-color="#4f46e5" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path [attr.d]="sparkline(userSeries()).area" fill="url(#gUsr)" class="spark-fill" />
              <path
                [attr.d]="sparkline(userSeries()).line"
                fill="none"
                stroke="#4f46e5"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="spark-line"
              />
              <circle
                [attr.cx]="sparkline(userSeries()).lastX"
                [attr.cy]="sparkline(userSeries()).lastY"
                r="2.6"
                fill="#4f46e5"
                class="spark-dot"
              />
            </svg>
          </div>
          <div class="sc-foot">
            <span class="pz-muted">{{ jhUsers().length - activeCount() }} désactivé(s) · {{ neverLoggedIn() }} jamais connecté</span>
          </div>
        </div>

        <!-- Effectif total + sparkline -->
        <div class="pz-card sc" style="border-left:3px solid #0ea5e9">
          <div class="sc-top">
            <div class="sc-head">
              <span class="sc-ico" style="background:#0ea5e91a;color:#0ea5e9"><pz-icon name="Briefcase" [size]="15" /></span>
              Effectif total
            </div>
            <span class="sc-delta"><pz-icon name="Up" [size]="10" [strokeWidth]="2.5" /> +2</span>
          </div>
          <div class="sc-val">{{ data.employees().length }}</div>
          <div class="sc-spark">
            <svg width="100%" height="34" viewBox="0 0 220 34" preserveAspectRatio="none" style="overflow:visible">
              <defs>
                <linearGradient id="gEmp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#0ea5e9" stop-opacity="0.28" />
                  <stop offset="1" stop-color="#0ea5e9" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path [attr.d]="sparkline(empSeries()).area" fill="url(#gEmp)" class="spark-fill" />
              <path
                [attr.d]="sparkline(empSeries()).line"
                fill="none"
                stroke="#0ea5e9"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="spark-line"
              />
              <circle
                [attr.cx]="sparkline(empSeries()).lastX"
                [attr.cy]="sparkline(empSeries()).lastY"
                r="2.6"
                fill="#0ea5e9"
                class="spark-dot"
              />
            </svg>
          </div>
          <div class="sc-foot"><span class="pz-muted">collaborateurs actifs · ce mois</span></div>
        </div>

        <!-- Plan d'abonnement -->
        <div class="pz-card sc" style="border-left:3px solid #10b981">
          <div class="sc-top">
            <div class="sc-head">
              <span class="sc-ico" style="background:#10b9811a;color:#10b981"><pz-icon name="Wallet" [size]="15" /></span>
              Plan d'abonnement
            </div>
            <span class="pz-pill primary" style="font-size:11px">{{ company()?.plan ?? '—' }}</span>
          </div>
          <div class="sc-val" style="font-size:20px;font-weight:700">{{ company()?.plan ?? '—' }}</div>
          <!-- Barre d'usage employés -->
          <div class="twofa-bar" style="--bar-color:#10b981">
            <div class="twofa-fill" [style.width.%]="employeeUsagePct()"></div>
          </div>
          <div class="sc-foot">
            <span class="pz-muted"
              >{{ data.employees().length }}/{{ company()?.maxEmployees ?? '∞' }} employés · {{ company()?.priceHT ?? 0 }} TND/mois</span
            >
          </div>
        </div>

        <!-- 2FA — Cercle progression % adoption -->
        <div class="pz-card sc" style="border-left:3px solid #f59e0b; align-items:center">
          <div class="sc-top" style="width:100%">
            <div class="sc-head">
              <span class="sc-ico" style="background:#f59e0b1a;color:#f59e0b"><pz-icon name="Shield" [size]="15" /></span>
              2FA activée
            </div>
            <span class="sc-delta">{{ twofaPct() }}% activé</span>
          </div>
          <!-- Cercle : arc = % adoption, centre = twofaPct() -->
          <div class="totp-wrap">
            <svg viewBox="0 0 100 100" class="totp-svg">
              <defs>
                <linearGradient id="totpGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#ef4444" />
                  <stop offset="50%" stop-color="#f97316" />
                  <stop offset="100%" stop-color="#eab308" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="38" fill="none" stroke="var(--pz-surface-3)" stroke-width="8" />
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="url(#totpGrad)"
                stroke-width="8"
                stroke-linecap="round"
                [attr.stroke-dasharray]="twofaDash()"
                transform="rotate(-90 50 50)"
                class="totp-arc"
              />
              <text
                x="50"
                y="47"
                text-anchor="middle"
                font-size="21"
                font-weight="700"
                fill="#0f172a"
                font-family="'JetBrains Mono',monospace"
              >
                {{ twofaPct() }}%
              </text>
              <text x="50" y="60" text-anchor="middle" font-size="8" font-weight="600" fill="#94a3b8" letter-spacing="0.06em">
                2FA activée
              </text>
            </svg>
          </div>
        </div>
      </div>

      <!-- ── Grille principale ─────────────────────────────────────────────── -->
      <div class="main-grid">
        <!-- Répartition des rôles — Donut animé -->
        <div class="pz-card">
          <div class="card-head">
            <div class="card-title">Répartition des rôles</div>
            <a class="pz-btn pz-sm pz-ghost" routerLink="/paiezone/admin-users">
              Gérer <pz-icon name="Arrow" [size]="12" [strokeWidth]="1.6" />
            </a>
          </div>
          <div class="card-body" style="padding:8px 20px 20px">
            <pz-roles-donut />
          </div>
        </div>

        <!-- Fiche entreprise -->
        <div class="pz-card">
          <div class="card-head"><div class="card-title">Mon entreprise</div></div>
          <div class="card-body">
            <div class="company-head">
              <div class="logo">{{ companyInitials() }}</div>
              <div>
                <div class="strong">{{ company()?.name ?? '—' }}</div>
                <div class="pz-muted small">{{ company()?.city ?? '—' }}</div>
              </div>
            </div>
            <div class="info-rows">
              <div class="info-row">
                <span class="pz-muted small">Matricule fiscal</span>
                <span class="pz-mono small">{{ company()?.taxId ?? '—' }}</span>
              </div>
              <div class="info-row">
                <span class="pz-muted small">Email</span>
                <span class="small">{{ company()?.email ?? '—' }}</span>
              </div>
              <div class="info-row">
                <span class="pz-muted small">Effectif</span>
                <span class="strong">{{ data.employees().length }} collaborateurs</span>
              </div>
              <div class="info-row">
                <span class="pz-muted small">Plan</span>
                <span class="pz-pill primary">{{ company()?.plan ?? '—' }}</span>
              </div>
              <div class="info-row">
                <span class="pz-muted small">Statut</span>
                <span
                  class="pz-pill"
                  [class.pos]="company()?.status === 'ACTIVE'"
                  [class.warn]="company()?.status === 'TRIAL'"
                  [class.danger]="company()?.status === 'SUSPENDED'"
                  >{{ company()?.status ?? '—' }}</span
                >
              </div>
            </div>
            <a class="pz-btn" style="width:100%;justify-content:center;margin-top:4px" routerLink="/paiezone/admin-company">
              <pz-icon name="Edit" [size]="14" [strokeWidth]="1.4" /> Modifier
            </a>
          </div>
        </div>
      </div>

      <!-- ── Activité récente ────────────────────────────────────────────────── -->
      <div class="pz-card">
        <div class="card-head"><div class="card-title">Utilisateurs récents</div></div>
        <table class="pz-tbl">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle principal</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            @if (jhUsers().length === 0) {
              <tr>
                <td colspan="4" style="text-align:center;padding:32px;color:var(--pz-muted)">Chargement…</td>
              </tr>
            }
            @for (u of jhUsers().slice(0, 8); track u.id) {
              <tr>
                <td>
                  <div class="u-cell">
                    <div class="pz-avatar sm" [attr.data-bg]="(u.id % 6) + 1">
                      {{ (u.firstName?.[0] ?? u.login?.[0] ?? '?').toUpperCase() }}{{ (u.lastName?.[0] ?? '').toUpperCase() }}
                    </div>
                    <div>
                      <div class="strong">{{ u.firstName ?? '' }} {{ u.lastName ?? '' }}</div>
                      <div class="pz-muted small">{{ u.login }}</div>
                    </div>
                  </div>
                </td>
                <td class="pz-muted small">{{ u.email }}</td>
                <td>
                  @if (u.authorities?.includes('ROLE_ADMIN')) {
                    <span class="pz-pill primary">Admin</span>
                  } @else if (u.authorities?.includes('ROLE_RH_COMPTABLE')) {
                    <span class="pz-pill info">RH</span>
                  } @else {
                    <span class="pz-pill">Employé</span>
                  }
                </td>
                <td>
                  <span class="pz-pill" [class.pos]="u.activated" [class.danger]="!u.activated">
                    <span class="dot"></span>{{ u.activated ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
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
      /* ── Hero band mauve ─────────────────────────────────────────────── */
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
        width: 64px;
        height: 64px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.25);
        display: grid;
        place-items: center;
        font-weight: 800;
        font-size: 22px;
        color: #fff;
        flex-shrink: 0;
        letter-spacing: -0.02em;
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
        line-height: 1.5;
        max-width: 480px;
      }
      .hero-chips {
        display: flex;
        gap: 12px;
        flex-shrink: 0;
        position: relative;
      }
      .hero-chip {
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(6px);
        border-radius: 12px;
        padding: 12px 18px;
        text-align: center;
        min-width: 90px;
      }
      .chip-val {
        font-family: 'JetBrains Mono', monospace;
        font-size: 22px;
        font-weight: 700;
        color: #fff;
        line-height: 1;
        margin-bottom: 4px;
      }
      .chip-lbl {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.65);
        font-weight: 500;
        white-space: nowrap;
      }

      /* ── Stat grid (cartes KPI) ──────────────────────────────────────── */
      .stat-grid {
        display: grid;
        gap: var(--pz-gap);
        grid-template-columns: repeat(4, 1fr);
      }
      /* StatCard identique au design saas-dashboard */
      .sc {
        padding: 18px 20px;
      }
      .sc-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
      }
      .sc-head {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--pz-muted);
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.01em;
        margin-bottom: 8px;
      }
      .sc-ico {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        display: grid;
        place-items: center;
        flex-shrink: 0;
      }
      .sc-delta {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 11px;
        font-weight: 500;
        padding: 2px 6px;
        border-radius: 4px;
        background: var(--pz-pos-soft);
        color: var(--pz-pos-ink);
        white-space: nowrap;
      }
      .sc-val {
        font-size: 26px;
        font-weight: 600;
        letter-spacing: -0.025em;
        color: var(--pz-ink);
        font-variant-numeric: tabular-nums;
        line-height: 1.1;
      }
      .sc-foot {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
        font-size: 12px;
      }
      /* ── Sparkline (animation draw identique au saas-dashboard) ─────── */
      @keyframes sparkDraw {
        from {
          stroke-dashoffset: 600;
        }
        to {
          stroke-dashoffset: 0;
        }
      }
      @keyframes sparkFade {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      .sc-spark {
        margin-top: 12px;
        margin-left: -2px;
      }
      .sc-spark svg {
        display: block;
        overflow: visible;
      }
      .spark-line {
        stroke-dasharray: 600;
        stroke-dashoffset: 600;
        animation: sparkDraw 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
      }
      .spark-fill {
        opacity: 0;
        animation: sparkFade 0.6s ease 0.3s forwards;
      }
      .spark-dot {
        opacity: 0;
        animation: sparkFade 0.3s ease 1s forwards;
      }

      /* ── Cercle TOTP ──────────────────────────────────────────────────── */
      .totp-wrap {
        display: flex;
        justify-content: center;
        padding: 10px 0 4px;
      }
      .totp-svg {
        width: 108px;
        height: 108px;
        filter: drop-shadow(0 2px 8px rgba(239, 68, 68, 0.18));
      }
      .totp-arc {
        transition: stroke-dasharray 0.85s cubic-bezier(0.22, 1, 0.36, 1);
      }

      /* Barre de progression 2FA et plan */
      .twofa-bar {
        margin-top: 10px;
        height: 4px;
        background: var(--pz-surface-3);
        border-radius: 999px;
        overflow: hidden;
      }
      .twofa-fill {
        height: 100%;
        background: var(--bar-color, #f59e0b);
        border-radius: 999px;
        transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .main-grid {
        display: grid;
        gap: var(--pz-gap);
        grid-template-columns: 2fr 1fr;
      }
      .card-head {
        display: flex;
        align-items: center;
        padding: 16px 20px 12px;
      }
      .card-title {
        font-size: 14px;
        font-weight: 600;
        flex: 1;
      }
      .card-body {
        padding: 4px 20px 20px;
      }

      .small {
        font-size: 12px;
      }
      .strong {
        font-weight: 500;
      }

      .company-head {
        display: flex;
        gap: 14px;
        align-items: center;
        margin-bottom: 14px;
      }
      .logo {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--pz-primary), #7c3aed);
        color: #fff;
        display: grid;
        place-items: center;
        font-weight: 700;
        font-size: 18px;
      }
      .info-rows {
        margin-bottom: 4px;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid var(--pz-line);
        font-size: 12.5px;
      }
      .info-row:last-child {
        border-bottom: 0;
      }

      .pz-tbl {
        width: 100%;
        border-collapse: collapse;
      }
      .pz-tbl thead th {
        text-align: left;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
        color: var(--pz-muted);
        padding: 10px 16px;
        border-bottom: 1px solid var(--pz-line);
        background: var(--pz-surface-2);
      }
      .pz-tbl tbody td {
        padding: 10px 16px;
        border-bottom: 1px solid var(--pz-line);
        font-size: 13px;
        color: var(--pz-ink-2);
        vertical-align: middle;
      }
      .pz-tbl tbody tr:last-child td {
        border-bottom: 0;
      }
      .pz-tbl tbody tr:hover {
        background: var(--pz-surface-2);
      }
      .u-cell {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .no-company-banner {
        display: flex;
        align-items: center;
        gap: 14px;
        background: #ede9fe;
        border: 1px solid #c4b5fd;
        border-radius: var(--pz-radius-lg);
        padding: 16px 20px;
        color: #4338ca;
        font-size: 13.5px;
      }
      .no-company-banner div {
        flex: 1;
      }

      .pz-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .pz-modal {
        background: var(--pz-surface);
        border-radius: 14px;
        width: 520px;
        max-width: 95vw;
        max-height: 90vh;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
        display: flex;
        flex-direction: column;
      }
      .pz-modal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 20px 14px;
        font-weight: 600;
        font-size: 15px;
        border-bottom: 1px solid var(--pz-line);
      }
      .pz-modal-close {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--pz-muted);
        display: flex;
      }
      .pz-modal-body {
        padding: 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
      }
      .pz-modal-foot {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 14px 20px;
        border-top: 1px solid var(--pz-line);
      }
      .pz-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .pz-field-row {
        display: flex;
        gap: 12px;
      }
      .pz-field-row .pz-field {
        flex: 1;
      }
      .pz-field label {
        font-size: 12px;
        font-weight: 500;
        color: var(--pz-muted);
      }
      .pz-field input {
        border: 1px solid var(--pz-line);
        border-radius: 8px;
        padding: 8px 12px;
        font: inherit;
        font-size: 13px;
        background: var(--pz-surface);
        color: var(--pz-ink);
        outline: none;
        width: 100%;
        box-sizing: border-box;
      }
      .pz-field input:focus {
        border-color: var(--pz-primary);
      }
      .pz-err {
        color: #b91c1c;
        font-size: 12.5px;
        background: #fee2e2;
        border-radius: 8px;
        padding: 8px 12px;
      }
    `,
  ],
})
export default class AdminDashboardComponent implements OnInit, OnDestroy {
  protected readonly data = inject(DataService);
  private readonly api = inject(ApiService);
  private readonly account = inject(AccountService);

  readonly jhUsers = signal<any[]>([]);

  // ── Company setup modal ──────────────────────────────────────────────────
  readonly showSetup = signal(false);
  readonly setupBusy = signal(false);
  readonly setupErr = signal('');
  setupForm = { name: '', taxId: '', phone: '', email: '', city: '', gouvernorat: '' };

  openSetup(): void {
    this.setupForm = { name: '', taxId: '', phone: '', email: '', city: '', gouvernorat: '' };
    this.setupErr.set('');
    this.showSetup.set(true);
  }

  closeSetup(): void {
    this.showSetup.set(false);
  }

  submitSetup(): void {
    if (!this.setupForm.name.trim() || !this.setupForm.taxId.trim()) {
      this.setupErr.set('La raison sociale et le matricule fiscal sont obligatoires.');
      return;
    }
    this.setupBusy.set(true);
    this.setupErr.set('');
    this.api
      .createCompany({
        name: this.setupForm.name.trim(),
        taxId: this.setupForm.taxId.trim(),
        phone: this.setupForm.phone.trim() || null,
        email: this.setupForm.email.trim() || null,
        city: this.setupForm.city.trim() || null,
        gouvernorat: this.setupForm.gouvernorat.trim() || null,
      })
      .subscribe({
        next: company => {
          this.data.companies.set([company]);
          this.closeSetup();
          this.setupBusy.set(false);
        },
        error: err => {
          const msg = err?.error?.detail ?? err?.error?.title ?? 'Erreur lors de la création.';
          this.setupErr.set(msg);
          this.setupBusy.set(false);
        },
      });
  }

  readonly today = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  readonly company = computed(() => this.data.companies()[0]);

  readonly companyInitials = computed(() => {
    const n = this.company()?.name ?? '';
    return (
      n
        .split(' ')
        .slice(0, 2)
        .map(w => w[0] ?? '')
        .join('')
        .toUpperCase() || 'CO'
    );
  });

  readonly activeCount = computed(() => this.jhUsers().filter(u => u.activated).length);
  readonly pendingLeaves = computed(() => this.data.leaves().filter(l => l.status === 'pending').length);
  readonly pendingAdvances = computed(() => this.data.advances().filter(a => a.status === 'pending').length);

  // ── Séries sparkline ──────────────────────────────────────────────────────
  readonly userSeries = computed(() => {
    const curr = this.jhUsers().length || 0;
    return Array.from({ length: 6 }, (_, i) => Math.max(1, Math.round(curr * Math.pow(0.85, 5 - i))));
  });

  readonly empSeries = computed(() => {
    const curr = this.data.employees().length || 0;
    return Array.from({ length: 6 }, (_, i) => Math.max(1, Math.round(curr * Math.pow(0.88, 5 - i))));
  });

  readonly twofaSeries = computed(() => {
    const curr = this.twofaPct() || 10;
    return Array.from({ length: 6 }, (_, i) => Math.max(0, Math.round(curr * Math.pow(0.78, 5 - i))));
  });

  /** Courbe de Bézier cubique (identique au SaaS dashboard). */
  sparkline(data: number[], W = 220, H = 34): { line: string; area: string; lastX: number; lastY: number } {
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

  // ── TOTP Countdown (fenêtre 30s standard) ────────────────────────────────
  readonly totpRemaining = signal(30);

  /** Pourcentage restant du code TOTP courant (100% = début, 0% = expiré). */
  readonly totpProgress = computed(() => Math.round((this.totpRemaining() / 30) * 100));

  /** stroke-dasharray pour le cercle SVG r=38, basé sur le % adoption 2FA */
  readonly twofaDash = computed(() => {
    const C = 2 * Math.PI * 38;
    const filled = (this.twofaPct() / 100) * C;
    return `${filled.toFixed(2)} ${C.toFixed(2)}`;
  });

  /** Couleur interpolée Red→Orange→Yellow selon le % restant */
  readonly totpColor = computed(() => {
    const p = this.totpProgress();
    if (p > 66) return '#eab308'; // > 20s : jaune (sûr)
    if (p > 33) return '#f97316'; // 10-20s : orange
    return '#ef4444'; // < 10s : rouge (urgent)
  });

  private totpTimer?: ReturnType<typeof setInterval>;

  /** Prénom de l'utilisateur connecté */
  readonly firstName = computed(() => this.account.account()?.firstName ?? 'vous');

  /** % utilisateurs avec 2FA active */
  readonly twofaPct = computed(() => {
    const users = this.jhUsers();
    if (!users.length) return 0;
    const with2fa = users.filter((u: any) => u.activated && u.twoFactorEnabled).length;
    return Math.round((with2fa / users.length) * 100);
  });

  /** Utilisateurs jamais connectés */
  readonly neverLoggedIn = computed(() => this.jhUsers().filter((u: any) => !u.lastLoginDate).length);

  /** % d'usage du quota employés du plan */
  readonly employeeUsagePct = computed(() => {
    const c = this.company();
    const max = c?.maxEmployees;
    if (!max || max <= 0) return 0;
    return Math.min(100, Math.round((this.data.employees().length / max) * 100));
  });

  ngOnInit(): void {
    this.api.myCompanyUsers().subscribe({ next: u => this.jhUsers.set(u), error: () => {} });
    // Synchronise le countdown TOTP sur la fenêtre réelle de 30s
    const tick = () => {
      const rem = 30 - (Math.floor(Date.now() / 1000) % 30);
      this.totpRemaining.set(rem);
    };
    tick();
    this.totpTimer = setInterval(tick, 1000);
  }

  ngOnDestroy(): void {
    if (this.totpTimer) clearInterval(this.totpTimer);
  }
}
