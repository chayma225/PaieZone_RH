import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { ActivitySector } from 'app/paiezone/core/types';

interface Step1Data {
  plan: string;
}
interface Step2Data {
  companyName: string;
  taxId: string;
  cnssId: string;
  city: string;
  phone: string;
  activitySectorId: number | null;
}
interface Step3Data {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

@Component({
  selector: 'pz-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        max-width: 520px;
      }

      .auth-card {
        width: 100%;
        background: rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(40px) saturate(180%);
        -webkit-backdrop-filter: blur(40px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 28px;
        padding: 44px;
        box-shadow:
          0 50px 100px -20px rgba(0, 0, 0, 0.5),
          0 30px 60px -30px rgba(124, 58, 237, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        color: #fafaf7;
        position: relative;
        overflow: hidden;
      }
      .auth-card::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: conic-gradient(
          from 0deg,
          transparent 0deg,
          rgba(196, 181, 253, 0.08) 60deg,
          transparent 120deg,
          rgba(167, 139, 250, 0.06) 180deg,
          transparent 240deg,
          rgba(124, 58, 237, 0.08) 300deg,
          transparent 360deg
        );
        animation: rotate-glow 20s linear infinite;
        pointer-events: none;
        z-index: -1;
      }
      @keyframes rotate-glow {
        to {
          transform: rotate(360deg);
        }
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 11.5px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #fff;
        font-weight: 700;
        margin-bottom: 22px;
        padding: 5px 14px 5px 5px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 999px;
      }
      .ey-num {
        background: #c4b5fd;
        color: #0e0420;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: inline-grid;
        place-items: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10.5px;
        font-weight: 800;
        letter-spacing: 0;
      }

      h1 {
        font-size: 40px;
        font-weight: 700;
        letter-spacing: -0.035em;
        line-height: 1.05;
        margin: 0 0 14px;
        color: #fff;
      }
      h1 .serif {
        font-family: 'Instrument Serif', 'Times New Roman', serif;
        font-weight: 400;
        font-style: italic;
        color: #c4b5fd;
        letter-spacing: -0.005em;
      }
      .lead {
        font-size: 15px;
        color: rgba(250, 250, 247, 0.7);
        line-height: 1.55;
        margin: 0 0 32px;
      }
      .lead strong {
        color: #fff;
        font-weight: 600;
      }

      /* Stepper */
      .stepper {
        display: flex;
        align-items: center;
        gap: 0;
        margin-bottom: 28px;
      }
      .step-dot {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        flex: 0 0 auto;
        font-size: 10.5px;
        color: rgba(250, 250, 247, 0.5);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: color 0.2s;
      }
      .step-dot .num {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.06);
        border: 1.5px solid rgba(255, 255, 255, 0.1);
        color: rgba(250, 250, 247, 0.5);
        display: grid;
        place-items: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11.5px;
        font-weight: 700;
        transition: all 0.3s;
      }
      .step-dot.active .num {
        background: linear-gradient(135deg, #fff, #c4b5fd);
        color: #0e0420;
        border-color: #c4b5fd;
        box-shadow: 0 0 16px rgba(196, 181, 253, 0.5);
      }
      .step-dot.active {
        color: #fff;
      }
      .step-dot.done .num {
        background: #c4b5fd;
        color: #0e0420;
        border-color: #c4b5fd;
      }
      .step-dot.done {
        color: #c4b5fd;
      }
      .step-line {
        flex: 1;
        height: 1.5px;
        background: rgba(255, 255, 255, 0.1);
        margin: 0 12px;
        margin-bottom: 24px;
        border-radius: 2px;
        transition: background 0.3s;
      }
      .step-line.done {
        background: #c4b5fd;
      }

      /* Form */
      .form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .field label {
        font-size: 12px;
        font-weight: 600;
        color: rgba(250, 250, 247, 0.7);
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }
      .req {
        color: #c4b5fd;
        margin-left: 2px;
      }

      .input-wrap {
        height: 50px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.04);
        display: flex;
        align-items: center;
        padding: 0 18px;
        gap: 14px;
        transition: all 0.2s ease;
      }
      .input-wrap:focus-within {
        border-color: #c4b5fd;
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 0 4px rgba(196, 181, 253, 0.15);
      }
      .input-wrap input,
      .input-wrap select {
        flex: 1;
        min-width: 0;
        border: 0;
        outline: 0;
        background: transparent;
        color: #fff;
        font-size: 14.5px;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        height: 100%;
      }
      .input-wrap input::placeholder {
        color: rgba(250, 250, 247, 0.3);
      }
      .input-wrap .ico {
        color: rgba(250, 250, 247, 0.4);
        flex-shrink: 0;
        display: grid;
        place-items: center;
      }
      .input {
        height: 50px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.04);
        color: #fff;
        font-size: 14.5px;
        padding: 0 18px;
        outline: 0;
        transition: all 0.2s ease;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        width: 100%;
      }
      .input::placeholder {
        color: rgba(250, 250, 247, 0.3);
      }
      .input:focus {
        border-color: #c4b5fd;
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 0 4px rgba(196, 181, 253, 0.15);
      }
      select.input {
        appearance: none;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6'><path fill='%23ffffff80' d='M0 0h10L5 6z'/></svg>");
        background-repeat: no-repeat;
        background-position: right 18px center;
        padding-right: 40px;
      }
      select.input option {
        background: #1a0735;
        color: #fafaf7;
      }

      /* Grid rows */
      .two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }

      /* Buttons */
      .btn-row {
        display: flex;
        gap: 10px;
        margin-top: 10px;
      }
      .pz-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        height: 52px;
        padding: 0 24px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        background: rgba(255, 255, 255, 0.04);
        color: #fff;
        font-size: 14.5px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      }
      .pz-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: #c4b5fd;
        transform: translateY(-1px);
      }
      .pz-btn.primary {
        background: linear-gradient(135deg, #fff, #ddd6fe);
        color: #0e0420;
        border-color: transparent;
        box-shadow: 0 10px 30px rgba(196, 181, 253, 0.3);
      }
      .pz-btn.primary:hover {
        box-shadow: 0 14px 40px rgba(196, 181, 253, 0.5);
        transform: translateY(-2px);
      }
      .pz-btn.primary[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
      .pz-btn.flex1 {
        flex: 1;
      }
      .arrow {
        transition: transform 0.2s;
      }
      .pz-btn:hover .arrow {
        transform: translateX(3px);
      }

      /* Alert */
      .alert {
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 13px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        line-height: 1.5;
      }
      .alert.error {
        background: rgba(251, 113, 133, 0.12);
        border: 1px solid rgba(251, 113, 133, 0.3);
        color: #fda4af;
      }
      .alert.success {
        background: rgba(74, 222, 128, 0.1);
        border: 1px solid rgba(74, 222, 128, 0.3);
        color: #86efac;
      }

      .foot-link {
        text-align: center;
        color: rgba(250, 250, 247, 0.7);
        font-size: 13px;
        margin: 18px 0 0;
      }
      .link-pale {
        color: #c4b5fd;
        font-weight: 600;
        transition: color 0.15s;
      }
      .link-pale:hover {
        color: #fff;
      }

      /* Strength bar */
      .strength-bar {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .strength-track {
        flex: 1;
        height: 4px;
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.12);
        overflow: hidden;
      }
      .strength-fill {
        height: 100%;
        border-radius: 2px;
        transition:
          width 0.3s,
          background 0.3s;
      }
      .strength-fill.weak {
        background: #ef4444;
      }
      .strength-fill.fair {
        background: #f97316;
      }
      .strength-fill.good {
        background: #eab308;
      }
      .strength-fill.strong {
        background: #22c55e;
      }
      .strength-label {
        font-size: 11px;
        font-weight: 600;
        min-width: 48px;
        text-align: right;
      }
      .strength-label.weak {
        color: #ef4444;
      }
      .strength-label.fair {
        color: #f97316;
      }
      .strength-label.good {
        color: #eab308;
      }
      .strength-label.strong {
        color: #22c55e;
      }

      .spinner {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid rgba(14, 4, 32, 0.3);
        border-top-color: #0e0420;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Plan selection step */
      .plan-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 4px;
      }
      .plan-opt {
        border: 1.5px solid rgba(255, 255, 255, 0.18);
        border-radius: 14px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.2s;
        background: rgba(255, 255, 255, 0.04);
      }
      .plan-opt:hover {
        border-color: #c4b5fd;
        background: rgba(196, 181, 253, 0.08);
      }
      .plan-opt.selected {
        border-color: #c4b5fd;
        background: rgba(196, 181, 253, 0.12);
      }
      .plan-opt-name {
        font-size: 13px;
        font-weight: 700;
        color: #fff;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 4px;
      }
      .plan-opt-price {
        font-size: 12px;
        color: rgba(250, 250, 247, 0.55);
      }

      /* Confirm step */
      .confirm-rows {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 4px;
      }
      .confirm-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13.5px;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.04);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .confirm-row .lbl {
        color: rgba(250, 250, 247, 0.55);
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .confirm-row .val {
        color: #fff;
        font-weight: 600;
      }

      @media (max-width: 640px) {
        :host {
          max-width: 100%;
        }
        .auth-card {
          padding: 32px 24px;
          border-radius: 22px;
        }
        h1 {
          font-size: 30px;
        }
        .two-col {
          grid-template-columns: 1fr;
        }
        .plan-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  template: `
    <div class="auth-card">
      <!-- Step 1 — Plan -->
      @if (step() === 1) {
        <div class="eyebrow"><span class="ey-num">02</span> Inscription</div>
        <h1>Choisissez votre <span class="serif">formule.</span></h1>
        <p class="lead">14 jours d'essai gratuit, sans carte bancaire. Changez de formule à tout moment.</p>

        <div class="stepper">
          <div class="step-dot active">
            <div class="num">1</div>
            Plan
          </div>
          <div class="step-line"></div>
          <div class="step-dot">
            <div class="num">2</div>
            Entreprise
          </div>
          <div class="step-line"></div>
          <div class="step-dot">
            <div class="num">3</div>
            Admin
          </div>
          <div class="step-line"></div>
          <div class="step-dot">
            <div class="num">4</div>
            Confirm.
          </div>
        </div>

        <div class="plan-grid">
          @for (pl of PLANS; track pl.code) {
            <div class="plan-opt" [class.selected]="selectedPlan() === pl.code" (click)="selectedPlan.set(pl.code)">
              <div class="plan-opt-name">{{ pl.label }}</div>
              <div class="plan-opt-price">{{ pl.priceLabel }}</div>
            </div>
          }
        </div>

        <div class="btn-row" style="margin-top:20px">
          <button class="pz-btn primary flex1" (click)="goStep(2)">Continuer <span class="arrow">→</span></button>
        </div>
        <p class="foot-link">Déjà inscrit ? <a routerLink="/paiezone/login" class="link-pale">Me connecter</a></p>
      }

      <!-- Step 2 — Entreprise -->
      @if (step() === 2) {
        <div class="eyebrow"><span class="ey-num">02</span> Inscription</div>
        <h1>Créez votre <span class="serif">entreprise.</span></h1>
        <p class="lead">14 jours d'essai gratuit, sans carte bancaire. <strong>10 minutes</strong> chrono.</p>

        <div class="stepper">
          <div class="step-dot done">
            <div class="num">✓</div>
            Plan
          </div>
          <div class="step-line done"></div>
          <div class="step-dot active">
            <div class="num">2</div>
            Entreprise
          </div>
          <div class="step-line"></div>
          <div class="step-dot">
            <div class="num">3</div>
            Admin
          </div>
          <div class="step-line"></div>
          <div class="step-dot">
            <div class="num">4</div>
            Confirm.
          </div>
        </div>

        @if (errMsg()) {
          <div class="alert error">{{ errMsg() }}</div>
        }

        <form class="form" (submit)="$event.preventDefault(); goStep(3)">
          <div class="field">
            <label for="su-name">Raison sociale <span class="req">*</span></label>
            <div class="input-wrap">
              <span class="ico">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="2" width="10" height="12" rx="1" />
                  <path d="M5.5 5h1M9.5 5h1M5.5 8h1M9.5 8h1" />
                </svg>
              </span>
              <input id="su-name" type="text" placeholder="Atlas Tech SARL" [(ngModel)]="step2.companyName" name="companyName" required />
            </div>
          </div>
          <div class="two-col">
            <div class="field">
              <label for="su-tax">Matricule fiscal <span class="req">*</span></label>
              <input id="su-tax" class="input" type="text" placeholder="1234567/A" [(ngModel)]="step2.taxId" name="taxId" required />
            </div>
            <div class="field">
              <label for="su-cnss">ID CNSS</label>
              <input id="su-cnss" class="input" type="text" placeholder="12500-0001" [(ngModel)]="step2.cnssId" name="cnssId" />
            </div>
          </div>
          <div class="field">
            <label for="su-sector">Secteur d'activité</label>
            <select id="su-sector" class="input" [(ngModel)]="step2.activitySectorId" name="activitySectorId">
              <option [ngValue]="null">— Sélectionner un secteur —</option>
              @for (s of sectors(); track s.id) {
                <option [ngValue]="s.id">{{ s.label }}</option>
              }
            </select>
          </div>
          <div class="two-col">
            <div class="field">
              <label for="su-city">Ville <span class="req">*</span></label>
              <select id="su-city" class="input" [(ngModel)]="step2.city" name="city" required>
                <option value="">Sélectionner…</option>
                <option>Tunis</option>
                <option>Ariana</option>
                <option>Sousse</option>
                <option>Sfax</option>
                <option>Bizerte</option>
                <option>Hammamet</option>
                <option>Nabeul</option>
                <option>Monastir</option>
                <option>Kairouan</option>
              </select>
            </div>
            <div class="field">
              <label for="su-phone">Téléphone</label>
              <input id="su-phone" class="input" type="tel" placeholder="+216 …" [(ngModel)]="step2.phone" name="phone" />
            </div>
          </div>
          <div class="btn-row">
            <button type="button" class="pz-btn" (click)="goStep(1)">← Précédent</button>
            <button type="submit" class="pz-btn primary flex1">Continuer <span class="arrow">→</span></button>
          </div>
        </form>
        <p class="foot-link">Déjà inscrit ? <a routerLink="/paiezone/login" class="link-pale">Me connecter</a></p>
      }

      <!-- Step 3 — Admin -->
      @if (step() === 3) {
        <div class="eyebrow"><span class="ey-num">02</span> Inscription</div>
        <h1>Votre <span class="serif">compte admin.</span></h1>
        <p class="lead">Vous serez l'administrateur principal de votre entreprise sur PaieZone.</p>

        <div class="stepper">
          <div class="step-dot done">
            <div class="num">✓</div>
            Plan
          </div>
          <div class="step-line done"></div>
          <div class="step-dot done">
            <div class="num">✓</div>
            Entreprise
          </div>
          <div class="step-line done"></div>
          <div class="step-dot active">
            <div class="num">3</div>
            Admin
          </div>
          <div class="step-line"></div>
          <div class="step-dot">
            <div class="num">4</div>
            Confirm.
          </div>
        </div>

        @if (errMsg()) {
          <div class="alert error">{{ errMsg() }}</div>
        }

        <form class="form" (submit)="$event.preventDefault(); validateStep3()">
          <div class="two-col">
            <div class="field">
              <label for="ad-first">Prénom <span class="req">*</span></label>
              <input id="ad-first" class="input" type="text" placeholder="Leila" [(ngModel)]="step3.firstName" name="firstName" required />
            </div>
            <div class="field">
              <label for="ad-last">Nom <span class="req">*</span></label>
              <input id="ad-last" class="input" type="text" placeholder="Chaâbane" [(ngModel)]="step3.lastName" name="lastName" required />
            </div>
          </div>
          <div class="field">
            <label for="ad-email">Email professionnel <span class="req">*</span></label>
            <div class="input-wrap">
              <span class="ico">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="2" y="3.5" width="12" height="9" rx="1.4" />
                  <path d="m2 5 6 4 6-4" />
                </svg>
              </span>
              <input
                id="ad-email"
                type="email"
                placeholder="prenom.nom@entreprise.tn"
                [(ngModel)]="step3.email"
                name="email"
                required
                autocomplete="email"
              />
            </div>
          </div>
          <div class="field">
            <label for="ad-pwd">Mot de passe <span class="req">*</span></label>
            <div class="input-wrap">
              <span class="ico">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3.5" y="7.5" width="9" height="6.5" rx="1.2" />
                  <path d="M5.5 7.5V5.5a2.5 2.5 0 0 1 5 0v2" />
                </svg>
              </span>
              <input
                id="ad-pwd"
                [type]="showPwd() ? 'text' : 'password'"
                placeholder="Au moins 8 caractères"
                [(ngModel)]="step3.password"
                name="password"
                required
                autocomplete="new-password"
              />
              <button type="button" class="ico" style="cursor:pointer;background:transparent;border:0" (click)="showPwd.set(!showPwd())">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  @if (showPwd()) {
                    <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
                    <line x1="1.5" y1="1.5" x2="14.5" y2="14.5" />
                  } @else {
                    <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
                    <circle cx="8" cy="8" r="2" />
                  }
                </svg>
              </button>
            </div>
            <div class="strength-bar">
              <div class="strength-track"><div class="strength-fill" [class]="strengthClass()" [style.width.%]="strengthPct()"></div></div>
              <span class="strength-label" [class]="strengthClass()">{{ strengthLabel() }}</span>
            </div>
          </div>
          <div class="btn-row">
            <button type="button" class="pz-btn" (click)="goStep(2)">← Précédent</button>
            <button type="submit" class="pz-btn primary flex1">Continuer <span class="arrow">→</span></button>
          </div>
        </form>
      }

      <!-- Step 4 — Confirm -->
      @if (step() === 4) {
        <div class="eyebrow"><span class="ey-num">02</span> Inscription</div>
        <h1>C'est <span class="serif">presque fini !</span></h1>
        <p class="lead">Vérifiez vos informations avant de créer votre entreprise sur PaieZone.</p>

        <div class="stepper">
          <div class="step-dot done">
            <div class="num">✓</div>
            Plan
          </div>
          <div class="step-line done"></div>
          <div class="step-dot done">
            <div class="num">✓</div>
            Entreprise
          </div>
          <div class="step-line done"></div>
          <div class="step-dot done">
            <div class="num">✓</div>
            Admin
          </div>
          <div class="step-line done"></div>
          <div class="step-dot active">
            <div class="num">4</div>
            Confirm.
          </div>
        </div>

        @if (errMsg()) {
          <div class="alert error">{{ errMsg() }}</div>
        }

        <div class="confirm-rows">
          <div class="confirm-row">
            <span class="lbl">Formule</span>
            <span class="val">{{ planLabel() }}</span>
          </div>
          <div class="confirm-row">
            <span class="lbl">Entreprise</span>
            <span class="val">{{ step2.companyName }}</span>
          </div>
          <div class="confirm-row">
            <span class="lbl">Matricule</span>
            <span class="val">{{ step2.taxId }}</span>
          </div>
          <div class="confirm-row">
            <span class="lbl">Ville</span>
            <span class="val">{{ step2.city }}</span>
          </div>
          @if (step2.activitySectorId) {
            <div class="confirm-row">
              <span class="lbl">Secteur</span>
              <span class="val">{{ sectors().find(s => s.id === step2.activitySectorId)?.label }}</span>
            </div>
          }
          <div class="confirm-row">
            <span class="lbl">Admin</span>
            <span class="val">{{ step3.firstName }} {{ step3.lastName }}</span>
          </div>
          <div class="confirm-row">
            <span class="lbl">Email</span>
            <span class="val">{{ step3.email }}</span>
          </div>
        </div>

        <div class="btn-row" style="margin-top:20px">
          <button type="button" class="pz-btn" (click)="goStep(3)">← Modifier</button>
          <button type="button" class="pz-btn primary flex1" [disabled]="busy()" (click)="submit()">
            @if (busy()) {
              <span class="spinner"></span> Création en cours…
            } @else {
              Créer mon compte <span class="arrow">→</span>
            }
          </button>
        </div>
      }
    </div>
  `,
})
export default class RegisterComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(ApplicationConfigService);
  private readonly router = inject(Router);

  protected readonly step = signal(1);
  protected readonly selectedPlan = signal('STARTER');
  protected readonly busy = signal(false);
  protected readonly errMsg = signal('');
  protected readonly showPwd = signal(false);
  protected readonly sectors = signal<ActivitySector[]>([]);

  protected step2: Step2Data = { companyName: '', taxId: '', cnssId: '', city: '', phone: '', activitySectorId: null };

  ngOnInit(): void {
    this.http.get<ActivitySector[]>(this.appConfig.getEndpointFor('api/activity-sectors')).subscribe({
      next: list => this.sectors.set(list.filter(s => s.active)),
      error: () => {},
    });
  }
  protected step3: Step3Data = { firstName: '', lastName: '', email: '', password: '' };

  protected readonly PLANS = [
    { code: 'STARTER', label: 'Starter', priceLabel: 'Gratuit 14 jours' },
    { code: 'PME', label: 'PME', priceLabel: '290 TND / mois' },
    { code: 'BUSINESS', label: 'Business', priceLabel: '720 TND / mois' },
    { code: 'ENTERPRISE', label: 'Enterprise', priceLabel: '1 480 TND / mois' },
  ];

  protected planLabel(): string {
    return this.PLANS.find(p => p.code === this.selectedPlan())?.label ?? this.selectedPlan();
  }

  protected goStep(n: number): void {
    this.errMsg.set('');
    if (n === 3 && !this.validateStep2()) return;
    this.step.set(n);
  }

  private validateStep2(): boolean {
    if (!this.step2.companyName.trim()) {
      this.errMsg.set('La raison sociale est obligatoire.');
      return false;
    }
    if (!this.step2.taxId.trim()) {
      this.errMsg.set('Le matricule fiscal est obligatoire.');
      return false;
    }
    if (!this.step2.city) {
      this.errMsg.set('Veuillez sélectionner une ville.');
      return false;
    }
    return true;
  }

  protected validateStep3(): void {
    this.errMsg.set('');
    if (!this.step3.firstName.trim() || !this.step3.lastName.trim()) {
      this.errMsg.set('Prénom et nom sont obligatoires.');
      return;
    }
    if (!this.step3.email.trim() || !this.step3.email.includes('@')) {
      this.errMsg.set('Veuillez saisir une adresse email valide.');
      return;
    }
    if (this.step3.password.length < 4) {
      this.errMsg.set('Le mot de passe doit comporter au moins 4 caractères.');
      return;
    }
    this.step.set(4);
  }

  protected submit(): void {
    this.errMsg.set('');
    this.busy.set(true);

    const payload = {
      login: this.step3.email,
      email: this.step3.email,
      password: this.step3.password,
      firstName: this.step3.firstName,
      lastName: this.step3.lastName,
      langKey: 'fr',
      companyName: this.step2.companyName,
      taxId: this.step2.taxId,
      cnssId: this.step2.cnssId,
      city: this.step2.city,
      phone: this.step2.phone,
      activitySectorId: this.step2.activitySectorId,
      companyEmail: this.step3.email,
      plan: this.selectedPlan(),
    };

    this.http.post(this.appConfig.getEndpointFor('api/register-with-company'), payload).subscribe({
      next: () => {
        this.busy.set(false);
        this.router.navigate(['/paiezone/login'], { queryParams: { registered: 'true' } });
      },
      error: err => {
        this.busy.set(false);
        const msg = err?.error?.detail ?? err?.error?.title ?? 'Une erreur est survenue. Veuillez réessayer.';
        this.errMsg.set(msg);
      },
    });
  }

  protected strengthPct(): number {
    const p = this.step3.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 4) score += 25;
    if (p.length >= 8) score += 25;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score += 25;
    if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) score += 25;
    return score;
  }

  protected strengthClass(): string {
    const p = this.strengthPct();
    if (p <= 25) return 'weak';
    if (p <= 50) return 'fair';
    if (p <= 75) return 'good';
    return 'strong';
  }

  protected strengthLabel(): string {
    const m: Record<string, string> = { weak: 'Faible', fair: 'Moyen', good: 'Bon', strong: 'Fort' };
    return m[this.strengthClass()] ?? '';
  }
}
