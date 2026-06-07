import { Component, ChangeDetectionStrategy, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import { ActivitySector } from '../../core/types';

@Component({
  selector: 'pz-admin-company',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <!-- ── En-tête ──────────────────────────────────────────────── -->
      <div class="page-header">
        <div class="page-header-left">
          <div class="pz-crumbs"><strong>Administration</strong> <span class="sep">/</span> Mon entreprise</div>
          <h1 class="page-title">Informations de l'entreprise</h1>
          <p class="page-subtitle">Coordonnées légales et fiscales · visible par les utilisateurs autorisés</p>
        </div>
        <button class="pz-btn pz-primary" (click)="openEdit()"><pz-icon name="Pencil" [size]="14" /> Modifier</button>
      </div>

      <div class="layout">
        <!-- ── Colonne gauche ────────────────────────────────────── -->
        <div class="col-left">
          <div class="pz-card info-card">
            <!-- Identité -->
            <div class="section-label">Identité de l'entreprise</div>
            <div class="fields-grid">
              <div class="field-box">
                <span class="field-lbl">Raison sociale</span>
                <span class="field-val strong">{{ company()?.name || '—' }}</span>
              </div>
              <div class="field-box">
                <span class="field-lbl">Nom commercial</span>
                <span class="field-val">{{ company()?.tradeName || '—' }}</span>
              </div>
              <div class="field-box">
                <span class="field-lbl">Forme juridique</span>
                <span class="field-val">{{ company()?.legalForm || '—' }}</span>
              </div>
              <div class="field-box">
                <span class="field-lbl">Capital social</span>
                <span class="field-val pz-mono">
                  {{ company()?.capitalSocial != null ? (company()!.capitalSocial! | number: '1.0-0') + ' TND' : '—' }}
                </span>
              </div>
              <div class="field-box full">
                <span class="field-lbl">Activité principale</span>
                <span class="field-val">{{ company()?.mainActivity || '—' }}</span>
              </div>
            </div>

            <div class="divider"></div>

            <!-- Identifiants fiscaux -->
            <div class="section-label">Identifiants fiscaux &amp; sociaux</div>
            <div class="fields-grid">
              <div class="field-box">
                <span class="field-lbl">Matricule fiscal</span>
                <span class="field-val pz-mono">{{ company()?.taxId || '—' }}</span>
              </div>
              <div class="field-box">
                <span class="field-lbl">Identifiant CNSS</span>
                <span class="field-val pz-mono">{{ company()?.cnssId || '—' }}</span>
              </div>
            </div>

            <div class="divider"></div>

            <!-- Coordonnées -->
            <div class="section-label">Coordonnées</div>
            <div class="fields-grid">
              <div class="field-box full">
                <span class="field-lbl">Adresse</span>
                <span class="field-val">{{ company()?.address || '—' }}</span>
              </div>
              <div class="field-box">
                <span class="field-lbl">Ville</span>
                <span class="field-val">{{ company()?.city || '—' }}</span>
              </div>
              <div class="field-box">
                <span class="field-lbl">Code postal</span>
                <span class="field-val pz-mono">{{ company()?.postalCode || '—' }}</span>
              </div>
              <div class="field-box">
                <span class="field-lbl">Téléphone</span>
                <span class="field-val">{{ company()?.phone || '—' }}</span>
              </div>
              <div class="field-box">
                <span class="field-lbl">Email</span>
                <span class="field-val">{{ company()?.email || '—' }}</span>
              </div>
              <div class="field-box full">
                <span class="field-lbl">Site web</span>
                <span class="field-val">{{ company()?.website || '—' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Colonne droite ─────────────────────────────────────── -->
        <div class="col-right">
          <!-- Logo -->
          <div class="pz-card logo-card">
            <div class="logo-label">Logo de l'entreprise</div>
            <div class="logo-preview">
              @if (company()?.logoUrl) {
                <img class="logo-img" [src]="company()!.logoUrl!" alt="Logo" />
              } @else {
                <div class="logo-initials">{{ initials() }}</div>
              }
            </div>
            <input
              #fileInput
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              style="display:none"
              (change)="onLogoSelected($event)"
            />
            <div class="logo-hint">
              @if (logoErr()) {
                <span class="err-txt">{{ logoErr() }}</span>
              } @else {
                <pz-icon name="Upload" [size]="12" class="hint-ico" />
                Activer "Modifier" pour téléverser
              }
            </div>
            <div class="logo-formats">PNG, JPG ou SVG · 2 Mo max</div>
          </div>

          <!-- Abonnement -->
          <div class="pz-card sub-card">
            <div class="sub-header">
              <span class="sub-title">Abonnement</span>
            </div>
            @if (company()) {
              @if (isOverLimit()) {
                <div class="over-banner">
                  <pz-icon name="AlertTriangle" [size]="13" />
                  Limite atteinte ({{ data.employees().length }}/{{ company()!.maxEmployees }})
                </div>
              }
              <div class="sub-plan-row">
                <div>
                  <div class="sub-plan-name">Plan {{ planLabel(company()!.plan) }}</div>
                  <div class="sub-renewal">Renouvellement le {{ company()!.renewal || '—' }}</div>
                </div>
                <div class="sub-price">
                  <span class="price-val">{{ data.fmtTND(company()!.priceHT) }}</span>
                  <span class="price-unit">HT/mois</span>
                </div>
              </div>
              <div class="emp-progress-wrap">
                <div class="emp-progress-bar">
                  <div class="emp-progress-fill" [style.width.%]="empPercent()"></div>
                </div>
                <span class="emp-count">{{ data.employees().length }}/{{ company()!.maxEmployees ?? '∞' }} employés inclus</span>
              </div>
              <button class="pz-btn pz-sm pz-ghost sub-btn" (click)="openPlanModal()">Voir les détails du plan</button>
            } @else {
              <div class="pz-muted no-sub">Aucun abonnement</div>
            }
          </div>

          <!-- Données système -->
          <div class="pz-card sys-card">
            <div class="sys-title">Données système</div>
            <div class="sys-rows">
              <div class="sys-row">
                <span class="sys-lbl">Schéma BD</span>
                <span class="sys-val pz-mono">{{ company()?.schema || '—' }}</span>
              </div>
              <div class="sys-row">
                <span class="sys-lbl">Région</span>
                <span class="sys-val">Tunisie (ar-tn)</span>
              </div>
              <div class="sys-row">
                <span class="sys-lbl">Créée le</span>
                <span class="sys-val">{{ fmtDate(company()?.createdAt) }}</span>
              </div>
              <div class="sys-row">
                <span class="sys-lbl">Tenant</span>
                <span class="sys-val pz-mono">#{{ company()?.id ?? '—' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Modal Plan ──────────────────────────────────────────────── -->
    @if (showPlanModal()) {
      <div class="pz-overlay" (click)="closePlanModal()">
        <div class="pz-modal plan-modal" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Choisir un plan d'abonnement</span>
            <button class="pz-modal-close" (click)="closePlanModal()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <p class="plan-intro pz-muted">
              Votre effectif actuel : <strong>{{ data.employees().length }} collaborateur(s)</strong>. Choisissez le plan adapté.
            </p>
            <div class="plan-cards">
              @for (p of plans; track p.key) {
                <div
                  class="plan-card"
                  [class.current]="company()?.plan === p.key"
                  [class.recommended]="p.key === suggestedPlan()"
                  [class.insufficient]="data.employees().length > p.maxEmp"
                  (click)="selectPlan(p.key)"
                >
                  @if (p.key === suggestedPlan() && p.key !== company()?.plan) {
                    <div class="plan-badge">Recommandé</div>
                  }
                  @if (company()?.plan === p.key) {
                    <div class="plan-badge current-badge">Plan actuel</div>
                  }
                  <div class="plan-card-name">{{ p.label }}</div>
                  <div class="plan-card-price">
                    @if (p.price === 0) {
                      <span class="price-free">Gratuit</span>
                    } @else {
                      <span class="price-val">{{ p.price }}</span>
                      <span class="price-unit"> TND / mois</span>
                    }
                  </div>
                  <div class="plan-card-limit">
                    <pz-icon name="Users" [size]="12" />
                    Jusqu'à <strong>{{ p.maxEmp }}</strong> collaborateurs
                  </div>
                  @if (data.employees().length > p.maxEmp) {
                    <div class="plan-card-warn"><pz-icon name="AlertTriangle" [size]="12" /> Effectif insuffisant</div>
                  }
                </div>
              }
            </div>
            @if (planErr()) {
              <div class="pz-err">{{ planErr() }}</div>
            }
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closePlanModal()">Annuler</button>
            <button
              class="pz-btn pz-primary"
              [disabled]="planBusy() || !selectedPlan() || selectedPlan() === company()?.plan"
              (click)="confirmPlan()"
            >
              {{ planBusy() ? 'Enregistrement…' : 'Confirmer' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ── Modal Modifier ──────────────────────────────────────────── -->
    @if (showEdit()) {
      <div class="pz-overlay" (click)="closeEdit()">
        <div class="pz-modal" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Modifier l'entreprise</span>
            <button class="pz-modal-close" (click)="closeEdit()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="modal-section-label">Identité</div>
            <div class="pz-field">
              <label>Raison sociale *</label>
              <input type="text" [(ngModel)]="editForm.name" placeholder="Raison sociale" />
            </div>
            <div class="pz-field">
              <label>Nom commercial</label>
              <input type="text" [(ngModel)]="editForm.tradeName" placeholder="Nom commercial" />
            </div>
            <div class="pz-field-row">
              <div class="pz-field">
                <label>Forme juridique</label>
                <select [(ngModel)]="editForm.legalForm">
                  <option value="">— Sélectionner —</option>
                  <option>SARL</option>
                  <option>SA</option>
                  <option>SUARL</option>
                  <option>SNC</option>
                  <option>GIE</option>
                  <option>Association</option>
                  <option>Autre</option>
                </select>
              </div>
              <div class="pz-field">
                <label>Capital social (TND)</label>
                <input type="number" [(ngModel)]="editForm.capitalSocial" placeholder="ex: 10000" min="0" />
              </div>
            </div>
            <div class="pz-field">
              <label>Activité principale</label>
              <input type="text" [(ngModel)]="editForm.mainActivity" placeholder="ex: Développement logiciel" />
            </div>
            <div class="pz-field">
              <label>Secteur d'activité</label>
              <select [(ngModel)]="editForm.activitySectorId" name="activitySectorId">
                <option [ngValue]="null">— Sélectionner un secteur —</option>
                @for (s of sectors(); track s.id) {
                  <option [ngValue]="s.id">{{ s.label }}</option>
                }
              </select>
            </div>

            <div class="modal-section-label">Identifiants</div>
            <div class="pz-field-row">
              <div class="pz-field">
                <label>Matricule fiscal *</label>
                <input type="text" [(ngModel)]="editForm.taxId" placeholder="ex: 1234567A/P/M/000" />
              </div>
              <div class="pz-field">
                <label>Identifiant CNSS</label>
                <input type="text" [(ngModel)]="editForm.cnssId" placeholder="ex: 123456789" />
              </div>
            </div>

            <div class="modal-section-label">Coordonnées</div>
            <div class="pz-field">
              <label>Adresse</label>
              <input type="text" [(ngModel)]="editForm.address" placeholder="Adresse complète" />
            </div>
            <div class="pz-field-row">
              <div class="pz-field">
                <label>Ville</label>
                <input type="text" [(ngModel)]="editForm.city" placeholder="ex: Tunis" />
              </div>
              <div class="pz-field">
                <label>Code postal</label>
                <input type="text" [(ngModel)]="editForm.postalCode" placeholder="ex: 1000" />
              </div>
            </div>
            <div class="pz-field">
              <label>Gouvernorat</label>
              <input type="text" [(ngModel)]="editForm.gouvernorat" placeholder="ex: Tunis" />
            </div>
            <div class="pz-field-row">
              <div class="pz-field">
                <label>Téléphone</label>
                <input type="text" [(ngModel)]="editForm.phone" placeholder="+216 XX XXX XXX" />
              </div>
              <div class="pz-field">
                <label>Email</label>
                <input type="email" [(ngModel)]="editForm.email" placeholder="contact@entreprise.tn" />
              </div>
            </div>
            <div class="pz-field">
              <label>Site web</label>
              <input type="url" [(ngModel)]="editForm.website" placeholder="https://www.entreprise.tn" />
            </div>

            @if (errMsg()) {
              <div class="pz-err">{{ errMsg() }}</div>
            }
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeEdit()">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="busy()" (click)="submitEdit()">
              {{ busy() ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      /* ── Header ─────────────────────────────────── */
      .page-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 24px;
        gap: 16px;
      }
      .page-title {
        font-size: 22px;
        font-weight: 700;
        color: var(--pz-ink);
        margin: 4px 0 4px;
        line-height: 1.2;
      }
      .page-subtitle {
        font-size: 13px;
        color: var(--pz-muted);
        margin: 0;
      }

      /* ── Layout ──────────────────────────────────── */
      .layout {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: var(--pz-gap);
        align-items: start;
      }
      .col-left,
      .col-right {
        display: flex;
        flex-direction: column;
        gap: var(--pz-gap);
      }

      /* ── Info card (left) ────────────────────────── */
      .info-card {
        padding: 24px;
      }

      .section-label {
        font-size: 13px;
        font-weight: 700;
        color: var(--pz-primary);
        margin-bottom: 16px;
      }

      .divider {
        border: none;
        border-top: 1px solid var(--pz-line);
        margin: 20px 0;
      }

      .fields-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .field-box {
        display: flex;
        flex-direction: column;
        gap: 5px;
        border: 1px solid var(--pz-line);
        border-radius: 8px;
        padding: 10px 14px;
        background: var(--pz-surface);
      }
      .field-box.full {
        grid-column: 1 / -1;
      }
      .field-lbl {
        font-size: 11px;
        font-weight: 500;
        color: var(--pz-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .field-val {
        font-size: 13.5px;
        color: var(--pz-ink);
        min-height: 20px;
      }
      .field-val.strong {
        font-weight: 600;
      }

      /* ── Logo card ────────────────────────────────── */
      .logo-card {
        padding: 0;
        overflow: hidden;
      }
      .logo-label {
        font-size: 13px;
        font-weight: 600;
        padding: 14px 18px 10px;
        border-bottom: 1px solid var(--pz-line);
      }
      .logo-preview {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        min-height: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .logo-initials {
        width: 80px;
        height: 80px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.18);
        border: 2px solid rgba(255, 255, 255, 0.35);
        color: #fff;
        display: grid;
        place-items: center;
        font-size: 26px;
        font-weight: 800;
        letter-spacing: -1px;
      }
      .logo-img {
        width: 80px;
        height: 80px;
        border-radius: 16px;
        object-fit: contain;
        background: rgba(255, 255, 255, 0.9);
      }
      .logo-hint {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--pz-muted);
        padding: 10px 18px 2px;
      }
      .hint-ico {
        color: var(--pz-primary);
      }
      .logo-formats {
        font-size: 11px;
        color: var(--pz-muted);
        padding: 0 18px 14px;
      }
      .err-txt {
        color: #b91c1c;
        font-size: 12px;
      }

      /* ── Subscription card ─────────────────────── */
      .sub-card {
        padding: 0;
        overflow: hidden;
      }
      .sub-header {
        padding: 14px 18px 10px;
        border-bottom: 1px solid var(--pz-line);
      }
      .sub-title {
        font-size: 13px;
        font-weight: 600;
      }
      .over-banner {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #fff7ed;
        border-bottom: 1px solid #fed7aa;
        padding: 8px 18px;
        font-size: 12px;
        color: #9a3412;
      }
      .sub-plan-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 14px 18px 10px;
        gap: 8px;
      }
      .sub-plan-name {
        font-size: 15px;
        font-weight: 700;
        color: var(--pz-ink);
      }
      .sub-renewal {
        font-size: 11.5px;
        color: var(--pz-muted);
        margin-top: 3px;
      }
      .sub-price {
        text-align: right;
        flex-shrink: 0;
      }
      .price-val {
        font-size: 22px;
        font-weight: 800;
        color: var(--pz-primary);
        display: block;
        line-height: 1.1;
      }
      .price-unit {
        font-size: 11px;
        color: var(--pz-muted);
      }
      .emp-progress-wrap {
        padding: 4px 18px 12px;
      }
      .emp-progress-bar {
        height: 6px;
        border-radius: 99px;
        background: var(--pz-line);
        overflow: hidden;
        margin-bottom: 6px;
      }
      .emp-progress-fill {
        height: 100%;
        background: var(--pz-primary);
        border-radius: 99px;
        transition: width 0.3s;
        max-width: 100%;
      }
      .emp-count {
        font-size: 11.5px;
        color: var(--pz-muted);
      }
      .sub-btn {
        display: block;
        width: calc(100% - 36px);
        margin: 0 18px 14px;
        text-align: center;
        justify-content: center;
      }
      .no-sub {
        padding: 20px 18px;
        font-size: 13px;
        text-align: center;
      }

      /* ── System data card ─────────────────────── */
      .sys-card {
        padding: 0;
        overflow: hidden;
      }
      .sys-title {
        font-size: 13px;
        font-weight: 600;
        padding: 14px 18px 10px;
        border-bottom: 1px solid var(--pz-line);
      }
      .sys-rows {
        padding: 4px 18px 10px;
      }
      .sys-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 7px 0;
        border-bottom: 1px solid var(--pz-line);
        font-size: 12.5px;
        gap: 8px;
      }
      .sys-row:last-child {
        border-bottom: none;
      }
      .sys-lbl {
        color: var(--pz-muted);
      }
      .sys-val {
        font-size: 12px;
        text-align: right;
      }

      /* ── Plan modal ─────────────────────────────── */
      .plan-modal {
        width: 680px;
      }
      .plan-intro {
        font-size: 13px;
        margin-bottom: 16px;
      }
      .plan-cards {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
      .plan-card {
        position: relative;
        border: 2px solid var(--pz-line);
        border-radius: 12px;
        padding: 16px;
        cursor: pointer;
        transition:
          border-color 0.15s,
          box-shadow 0.15s;
      }
      .plan-card:hover {
        border-color: var(--pz-primary);
      }
      .plan-card.current {
        border-color: var(--pz-primary);
        background: var(--pz-primary-soft);
      }
      .plan-card.recommended {
        border-color: #16a34a;
      }
      .plan-card.insufficient {
        opacity: 0.55;
        cursor: not-allowed;
        pointer-events: none;
      }
      .plan-badge {
        position: absolute;
        top: -10px;
        left: 12px;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 20px;
        background: #16a34a;
        color: #fff;
      }
      .current-badge {
        background: var(--pz-primary);
      }
      .plan-card-name {
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 6px;
      }
      .plan-card-price {
        margin-bottom: 8px;
      }
      .price-free {
        font-size: 18px;
        font-weight: 700;
        color: #16a34a;
      }
      .plan-card-price .price-val {
        font-size: 20px;
        font-weight: 700;
        color: var(--pz-ink);
        display: inline;
      }
      .plan-card-price .price-unit {
        font-size: 12px;
        color: var(--pz-muted);
      }
      .plan-card-limit {
        font-size: 12px;
        color: var(--pz-muted);
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .plan-card-warn {
        font-size: 11px;
        color: #b91c1c;
        margin-top: 6px;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      /* ── Modal shared ───────────────────────────── */
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
        width: 560px;
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

      .modal-section-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--pz-muted);
        padding-top: 4px;
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
      .pz-field input,
      .pz-field select {
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
      .pz-field input:focus,
      .pz-field select:focus {
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
export default class AdminCompanyComponent implements OnInit {
  protected readonly data = inject(DataService);
  protected readonly api = inject(ApiService);
  protected readonly busy = signal(false);
  protected readonly errMsg = signal('');
  protected readonly showEdit = signal(false);
  protected readonly logoUploading = signal(false);
  protected readonly logoErr = signal('');
  protected readonly sectors = signal<ActivitySector[]>([]);

  // ── Plan modal ──────────────────────────────────────────────────
  protected readonly showPlanModal = signal(false);
  protected readonly selectedPlan = signal<string>('');
  protected readonly planBusy = signal(false);
  protected readonly planErr = signal('');

  protected readonly plans = [
    { key: 'STARTER', label: 'Starter', maxEmp: 10, price: 0 },
    { key: 'PME', label: 'PME', maxEmp: 30, price: 290 },
    { key: 'BUSINESS', label: 'Business', maxEmp: 100, price: 720 },
    { key: 'ENTERPRISE', label: 'Enterprise', maxEmp: 500, price: 1480 },
  ];

  // company défini en premier — tous les computed qui en dépendent sont après
  protected readonly company = computed(() => this.data.companies()[0]);

  protected readonly empPercent = computed(() => {
    const c = this.company();
    if (!c?.maxEmployees) return 0;
    return Math.min(100, Math.round((this.data.employees().length / c.maxEmployees) * 100));
  });

  protected readonly isOverLimit = computed(() => {
    const c = this.company();
    if (!c || c.maxEmployees == null) return false;
    return this.data.employees().length > c.maxEmployees;
  });

  protected readonly suggestedPlan = computed(() => {
    const emp = this.data.employees().length;
    if (emp <= 10) return 'STARTER';
    if (emp <= 30) return 'PME';
    if (emp <= 100) return 'BUSINESS';
    if (emp <= 500) return 'ENTERPRISE';
    return 'CUSTOM';
  });

  ngOnInit(): void {
    this.api.activitySectors().subscribe(list => this.sectors.set(list.filter(s => s.active)));
  }

  protected readonly sectorLabel = computed(() => {
    const id = this.company()?.activitySectorId;
    if (!id) return '—';
    return this.sectors().find(s => s.id === id)?.label ?? '—';
  });

  protected readonly initials = computed(() => {
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

  protected editForm = {
    name: '',
    tradeName: '',
    taxId: '',
    cnssId: '',
    legalForm: '',
    capitalSocial: null as number | null,
    mainActivity: '',
    activitySectorId: null as number | null,
    city: '',
    postalCode: '',
    gouvernorat: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  };

  statusLabel(s: string): string {
    return s === 'ACTIVE' ? 'Actif' : s === 'TRIAL' ? 'Essai' : s === 'SUSPENDED' ? 'Suspendu' : s;
  }

  planLabel(key: string): string {
    return this.plans.find(p => p.key === key)?.label ?? key;
  }

  openPlanModal(): void {
    this.selectedPlan.set(this.company()?.plan ?? '');
    this.planErr.set('');
    this.showPlanModal.set(true);
  }

  closePlanModal(): void {
    this.showPlanModal.set(false);
  }

  selectPlan(key: string): void {
    this.selectedPlan.set(key);
  }

  confirmPlan(): void {
    const c = this.company();
    const plan = this.selectedPlan();
    if (!c || !plan || plan === c.plan) return;
    this.planBusy.set(true);
    this.planErr.set('');
    this.api.changePlan(c.id, plan).subscribe({
      next: updated => {
        this.data.companies.update(list => list.map(co => (co.id === c.id ? updated : co)));
        this.closePlanModal();
        this.planBusy.set(false);
      },
      error: () => {
        this.planErr.set('Erreur lors du changement de plan.');
        this.planBusy.set(false);
      },
    });
  }

  fmtDate(iso: string | undefined): string {
    if (!iso) return '—';
    try {
      return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
    } catch {
      return iso;
    }
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const MAX = 2 * 1024 * 1024;
    if (file.size > MAX) {
      this.logoErr.set('Fichier trop volumineux (max 2 Mo).');
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.logoErr.set('Format non supporté. Utilisez PNG, JPG, SVG ou WebP.');
      return;
    }

    const c = this.company();
    if (!c) return;

    this.logoErr.set('');
    this.logoUploading.set(true);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.api.patchCompany(c.id, { logoUrl: base64 }).subscribe({
        next: updated => {
          this.data.companies.update(list => list.map(co => (co.id === c.id ? updated : co)));
          this.logoUploading.set(false);
        },
        error: () => {
          this.logoErr.set("Erreur lors de l'enregistrement du logo.");
          this.logoUploading.set(false);
        },
      });
    };
    reader.onerror = () => {
      this.logoErr.set('Impossible de lire le fichier.');
      this.logoUploading.set(false);
    };
    reader.readAsDataURL(file);
  }

  openEdit() {
    const c = this.company();
    if (!c) return;
    this.editForm = {
      name: c.name,
      tradeName: c.tradeName ?? '',
      taxId: c.taxId,
      cnssId: c.cnssId ?? '',
      legalForm: c.legalForm ?? '',
      capitalSocial: c.capitalSocial ?? null,
      mainActivity: c.mainActivity ?? '',
      activitySectorId: c.activitySectorId ?? null,
      city: c.city ?? '',
      postalCode: c.postalCode ?? '',
      gouvernorat: c.gouvernorat ?? '',
      address: c.address ?? '',
      phone: c.phone ?? '',
      email: c.email ?? '',
      website: c.website ?? '',
    };
    this.errMsg.set('');
    this.showEdit.set(true);
  }

  closeEdit() {
    this.showEdit.set(false);
  }

  submitEdit() {
    const c = this.company();
    if (!c) return;
    if (!this.editForm.name.trim() || !this.editForm.taxId.trim()) {
      this.errMsg.set('La raison sociale et le matricule fiscal sont obligatoires.');
      return;
    }
    this.busy.set(true);
    this.errMsg.set('');
    this.api
      .updateCompany(c.id, {
        name: this.editForm.name.trim(),
        tradeName: this.editForm.tradeName.trim() || null,
        taxId: this.editForm.taxId.trim(),
        cnssId: this.editForm.cnssId.trim() || null,
        legalForm: this.editForm.legalForm || null,
        capitalSocial: this.editForm.capitalSocial ?? null,
        mainActivity: this.editForm.mainActivity.trim() || null,
        activitySectorId: this.editForm.activitySectorId ?? null,
        city: this.editForm.city.trim() || null,
        postalCode: this.editForm.postalCode.trim() || null,
        gouvernorat: this.editForm.gouvernorat.trim() || null,
        address: this.editForm.address.trim() || null,
        phone: this.editForm.phone.trim() || null,
        email: this.editForm.email.trim() || null,
        website: this.editForm.website.trim() || null,
        active: true,
      })
      .subscribe({
        next: updated => {
          this.data.companies.update(list => list.map(co => (co.id === c.id ? updated : co)));
          this.closeEdit();
          this.busy.set(false);
        },
        error: () => {
          this.errMsg.set('Erreur lors de la mise à jour.');
          this.busy.set(false);
        },
      });
  }
}
