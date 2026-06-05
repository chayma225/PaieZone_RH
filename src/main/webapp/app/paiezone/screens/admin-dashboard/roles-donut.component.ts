import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';

const ROLE_DONUT: Record<string, { from: string; to: string; solid: string; icon: string; label: string; desc: string }> = {
  ROLE_ADMIN: {
    from: '#7c3aed',
    to: '#a855f7',
    solid: '#8b5cf6',
    icon: 'Shield',
    label: 'Administrateur',
    desc: "Accès complet à l'entreprise",
  },
  ROLE_RH_COMPTABLE: {
    from: '#4f46e5',
    to: '#6366f1',
    solid: '#4f46e5',
    icon: 'Briefcase',
    label: 'RH / Comptable',
    desc: 'Gère paie, congés, employés',
  },
  ROLE_EMPLOYE: {
    from: '#0ea5e9',
    to: '#22d3ee',
    solid: '#0ea5e9',
    icon: 'User',
    label: 'Employé',
    desc: 'Self-service (paie, congés, demandes)',
  },
};
const ORDER = ['ROLE_ADMIN', 'ROLE_RH_COMPTABLE', 'ROLE_EMPLOYE'];

@Component({
  selector: 'pz-roles-donut',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }
      @keyframes donutPop {
        from {
          opacity: 0;
          transform: scale(0.8) rotate(-14deg);
        }
        to {
          opacity: 1;
          transform: scale(1) rotate(0);
        }
      }
      @keyframes iconPop {
        from {
          opacity: 0;
          transform: scale(0);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      .rd-svg {
        animation: donutPop 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        display: block;
        margin: 0 auto;
      }
      .rd-arc {
        transition:
          stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1),
          stroke-width 0.25s,
          opacity 0.2s;
        cursor: pointer;
      }
      .rd-ico {
        animation: iconPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      .rd-leg {
        transition:
          background 0.15s,
          transform 0.15s;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 9px;
      }
      .rd-leg:hover,
      .rd-leg.on {
        background: var(--pz-surface-2);
        transform: translateX(2px);
      }
      .wrap {
        position: relative;
        width: 260px;
        height: 260px;
        margin: 0 auto 4px;
      }
      .center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }
      .num {
        font-family: 'JetBrains Mono', monospace;
        font-size: 42px;
        font-weight: 700;
        letter-spacing: -0.04em;
        line-height: 1;
        transition: color 0.25s;
      }
      .lbl {
        font-size: 11px;
        font-weight: 600;
        margin-top: 3px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        text-align: center;
        max-width: 120px;
      }
      .sub {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        margin-top: 2px;
        color: var(--pz-muted);
      }
    `,
  ],
  template: `
    <div class="wrap">
      <svg class="rd-svg" width="260" height="260" viewBox="0 0 260 260">
        <defs>
          @for (a of arcs(); track a.role) {
            <linearGradient [id]="'grad-' + a.role" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" [attr.stop-color]="meta[a.role].from" />
              <stop offset="1" [attr.stop-color]="meta[a.role].to" />
            </linearGradient>
          }
        </defs>
        <circle cx="130" cy="130" [attr.r]="R" fill="none" stroke="var(--pz-surface-3)" [attr.stroke-width]="SW" />
        @for (a of arcs(); track a.role) {
          <circle
            class="rd-arc"
            cx="130"
            cy="130"
            [attr.r]="R"
            fill="none"
            [attr.stroke]="'url(#grad-' + a.role + ')'"
            [attr.stroke-width]="active() === a.role ? SW + 7 : SW"
            stroke-linecap="round"
            [attr.stroke-dasharray]="a.dash + ' ' + (C - a.dash)"
            [attr.stroke-dashoffset]="mounted() ? 0 : a.dash"
            [attr.opacity]="active() && active() !== a.role ? 0.32 : 1"
            [attr.transform]="'rotate(' + a.rot + ' 130 130)'"
            [style.transition-delay.s]="a.i * 0.16"
            (mouseenter)="active.set(a.role)"
            (mouseleave)="active.set(null)"
          />
        }
        @if (mounted()) {
          @for (a of arcs(); track a.role) {
            <g
              class="rd-ico"
              [style.animation-delay.s]="0.6 + a.i * 0.16"
              [attr.transform]="'translate(' + (a.ix - 9) + ' ' + (a.iy - 9) + ')'"
              [attr.opacity]="active() && active() !== a.role ? 0.4 : 1"
              style="pointer-events:none; color:#fff;"
            >
              <pz-icon [name]="meta[a.role].icon" [size]="18" />
            </g>
            <text
              [attr.x]="a.lx"
              [attr.y]="a.ly + 4"
              text-anchor="middle"
              font-family="'JetBrains Mono',monospace"
              font-size="15"
              font-weight="700"
              [attr.fill]="meta[a.role].solid"
              [attr.opacity]="active() && active() !== a.role ? 0.35 : 1"
            >
              {{ a.pctR }}%
            </text>
          }
        }
      </svg>
      <div class="center">
        <div class="num" [style.color]="activeData() ? meta[active()!].solid : 'var(--pz-ink)'">{{ centerNum() }}</div>
        <div class="lbl" [style.color]="activeData() ? meta[active()!].solid : 'var(--pz-muted)'">{{ centerLbl() }}</div>
        @if (activeData()) {
          <div class="sub">{{ centerPct() }}% du total</div>
        }
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:2px;margin-top:8px">
      @for (a of arcs(); track a.role) {
        <div class="rd-leg" [class.on]="active() === a.role" (mouseenter)="active.set(a.role)" (mouseleave)="active.set(null)">
          <span
            style="width:11px;height:11px;border-radius:3px;flex-shrink:0"
            [style.background]="'linear-gradient(135deg,' + meta[a.role].from + ',' + meta[a.role].to + ')'"
          ></span>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;color:var(--pz-ink);line-height:1.2">{{ meta[a.role].label }}</div>
            <div style="font-size:11px;color:var(--pz-muted);line-height:1.3">{{ meta[a.role].desc }}</div>
          </div>
          <div style="text-align:right">
            <div style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:var(--pz-ink);line-height:1">
              {{ a.count }}
            </div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--pz-muted);margin-top:1px">{{ a.pctR }}%</div>
          </div>
        </div>
      }
    </div>
  `,
})
export default class RolesDonutComponent implements OnInit {
  private readonly data = inject(DataService);
  private readonly api = inject(ApiService);

  protected readonly meta = ROLE_DONUT;
  protected readonly R = 92;
  protected readonly SW = 38;
  protected readonly C = 2 * Math.PI * 92;

  protected readonly mounted = signal(false);
  protected readonly active = signal<string | null>(null);
  protected readonly users = signal<any[]>([]);

  protected readonly arcs = computed(() => {
    const all = this.users();
    const total = all.length || 1;
    const data = ORDER.map(role => ({ role, count: all.filter((u: any) => u.authorities?.includes(role)).length })).filter(
      d => d.count > 0,
    );
    const gap = 2.2,
      C = this.C,
      R = this.R;
    let cum = 0;
    return data.map((d, i) => {
      const pct = d.count / total,
        start = cum;
      cum += pct;
      const dash = Math.max(0, pct * C - (gap / 100) * C);
      const rot = -90 + start * 360 + ((gap / 100) * 360) / 2;
      const midAng = ((-90 + (start + pct / 2) * 360) * Math.PI) / 180;
      return {
        ...d,
        i,
        pct,
        pctR: Math.round(pct * 100),
        dash,
        rot,
        ix: 130 + R * Math.cos(midAng),
        iy: 130 + R * Math.sin(midAng),
        lx: 130 + (R + 38) * Math.cos(midAng),
        ly: 130 + (R + 38) * Math.sin(midAng),
      };
    });
  });

  protected readonly activeData = computed(() => this.arcs().find(a => a.role === this.active()) ?? null);
  protected readonly centerNum = computed(() => this.activeData()?.count ?? this.users().length);
  protected readonly centerPct = computed(() => this.activeData()?.pctR ?? 100);
  protected readonly centerLbl = computed(() => (this.activeData() ? this.meta[this.active()!].label : 'Utilisateurs actifs'));

  ngOnInit(): void {
    this.api.myCompanyUsers().subscribe({ next: u => this.users.set(u), error: () => {} });
    setTimeout(() => this.mounted.set(true), 80);
  }
}
