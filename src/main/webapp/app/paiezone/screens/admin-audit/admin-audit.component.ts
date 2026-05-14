import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'pz-admin-audit',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>Administration</strong> <span class="sep">/</span> Audit</div>
          <h1>Journal d'audit</h1>
          <div class="pz-muted">Historique des actions réalisées sur la plateforme</div>
        </div>
        <button class="pz-btn"><pz-icon name="Download" [size]="14" /> Exporter</button>
      </div>

      <div class="pz-card">
        @if (data.audit().length === 0) {
          <div style="padding:60px;text-align:center">
            <pz-icon name="History" [size]="32" [strokeWidth]="1.2" />
            <div style="margin-top:12px;font-size:14px;font-weight:500;color:var(--pz-ink)">Journal vide</div>
            <div style="margin-top:4px;font-size:13px;color:var(--pz-muted)">Les actions seront enregistrées ici automatiquement</div>
          </div>
        } @else {
          <table class="pz-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Action</th>
                <th>Entité</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              @for (entry of data.audit(); track entry.id) {
                <tr>
                  <td class="pz-mono" style="font-size:12px;color:var(--pz-muted)">{{ entry.date }}</td>
                  <td style="font-weight:500;font-size:13px">{{ entry.user }}</td>
                  <td>
                    <span class="pz-pill info">{{ entry.role }}</span>
                  </td>
                  <td>
                    <span class="action-badge" [class.del]="entry.action === 'DELETE'" [class.create]="entry.action === 'CREATE'">
                      {{ entry.action }}
                    </span>
                  </td>
                  <td style="font-size:12.5px">
                    {{ entry.entity }} <span class="pz-mono pz-muted" style="font-size:11px">#{{ entry.entityId }}</span>
                  </td>
                  <td class="pz-mono" style="font-size:11.5px;color:var(--pz-muted)">{{ entry.ip }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .pz-table {
        width: 100%;
        border-collapse: collapse;
      }
      .pz-table th {
        text-align: left;
        font-size: 11.5px;
        font-weight: 600;
        color: var(--pz-muted);
        padding: 10px 16px;
        border-bottom: 1px solid var(--pz-line);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .pz-table td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--pz-line);
        font-size: 13px;
        vertical-align: middle;
      }
      .pz-table tr:last-child td {
        border-bottom: 0;
      }
      .pz-table tr:hover td {
        background: var(--pz-surface-3);
      }
      .action-badge {
        font-size: 11px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
        background: var(--pz-primary-soft);
        color: var(--pz-primary-ink);
      }
      .action-badge.del {
        background: #fee2e2;
        color: #b91c1c;
      }
      .action-badge.create {
        background: #dcfce7;
        color: #166534;
      }
    `,
  ],
})
export default class AdminAuditComponent {
  protected readonly data = inject(DataService);
}
