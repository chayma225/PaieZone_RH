// PaieZone RH — SUPER ADMIN screens
// 1) Dashboard SaaS  2) Multi-tenant  3) Paramètres Réglementaires  4) Journal d'Audit

// ─────────────────────────────────────────────────────────────────────
// Shared chart helper — line chart with area fill
// ─────────────────────────────────────────────────────────────────────
function LineChart({ data, valueKey, w = 600, h = 160, color = '#4f46e5', fill = '#eef2ff' }) {
  const pad = { l: 36, r: 12, t: 16, b: 22 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const vals = data.map(d => d[valueKey]);
  const max = Math.max(...vals) * 1.1;
  const min = Math.min(...vals) * 0.9;
  const xStep = innerW / (data.length - 1);
  const yFor = (v) => pad.t + innerH - ((v - min) / (max - min)) * innerH;
  const points = data.map((d, i) => [pad.l + i * xStep, yFor(d[valueKey])]);
  const pathD = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
  const areaD = pathD + ` L ${points[points.length - 1][0]} ${pad.t + innerH} L ${points[0][0]} ${pad.t + innerH} Z`;
  // 4 horizontal gridlines
  const grid = [0, 0.33, 0.66, 1];
  return (
    <svg className="chart-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="lc-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={fill} stopOpacity="0.9"/>
          <stop offset="1" stopColor={fill} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {grid.map((g, i) => (
        <line key={i} x1={pad.l} x2={w - pad.r}
              y1={pad.t + g * innerH} y2={pad.t + g * innerH}
              stroke="#e5e7eb" strokeDasharray={i === 3 ? '0' : '2 3'} strokeWidth="1"/>
      ))}
      <path d={areaD} fill="url(#lc-grad)"/>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#fff" stroke={color} strokeWidth="1.6"/>
      ))}
      {data.map((d, i) => (
        <text key={i} x={pad.l + i * xStep} y={h - 6}
              fill="#94a3b8" fontSize="10.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace">{d.m}</text>
      ))}
      {[min, (min + max) / 2, max].map((v, i) => (
        <text key={i} x={pad.l - 8} y={yFor(v) + 3}
              fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="JetBrains Mono, monospace">
          {Math.round(v / 1000)}k
        </text>
      ))}
    </svg>
  );
}

// Twin-bar chart for payroll (brut + charges)
function BarChart({ data, w = 600, h = 180 }) {
  const pad = { l: 36, r: 12, t: 16, b: 22 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const max = Math.max(...data.map(d => d.brut + d.charges)) * 1.05;
  const groupW = innerW / data.length;
  const barW = groupW * 0.5;
  const yFor = (v) => pad.t + innerH - (v / max) * innerH;
  return (
    <svg className="chart-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
        <line key={i} x1={pad.l} x2={w - pad.r}
              y1={pad.t + g * innerH} y2={pad.t + g * innerH}
              stroke="#e5e7eb" strokeDasharray={i === 4 ? '0' : '2 3'} strokeWidth="1"/>
      ))}
      {data.map((d, i) => {
        const x = pad.l + i * groupW + (groupW - barW) / 2;
        const chargesH = (d.charges / max) * innerH;
        const brutH = (d.brut / max) * innerH;
        const totalY = yFor(d.brut + d.charges);
        return (
          <g key={i}>
            <rect x={x} y={totalY} width={barW} height={chargesH}
                  fill="#c7d2fe" rx="3"/>
            <rect x={x} y={totalY + chargesH} width={barW} height={brutH}
                  fill="#4f46e5" rx="3"/>
            <text x={x + barW / 2} y={h - 6} fill="#94a3b8" fontSize="10.5"
                  textAnchor="middle" fontFamily="JetBrains Mono, monospace">{d.m}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 1) DASHBOARD SAAS
// ═════════════════════════════════════════════════════════════════════
function ScreenSaasDashboard() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs"><strong>Super Admin</strong> <span className="sep">/</span> Tableau de bord SaaS</div>
          <h1 className="page-title">Plateforme PaieZone</h1>
          <div className="page-sub">Vue consolidée des entreprises clientes, revenus et santé du service.</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Ico.Download/>Rapport mensuel</button>
          <button className="btn primary"><Ico.Plus/>Nouvelle entreprise</button>
        </div>
      </div>

      <div className="stat-grid cols-4">
        <div className="stat">
          <div className="stat-head"><span className="ico"><Ico.Wallet/></span>MRR — Mai 2026</div>
          <div className="stat-val">{fmtTND(SAAS_KPI.mrr)}</div>
          <div className="stat-foot">
            <span className="stat-delta"><Ico.Up/>+{SAAS_KPI.mrrDelta}%</span>
            <span className="stat-foot-text">vs Avril</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-head"><span className="ico info"><Ico.TrendUp/></span>ARR projeté</div>
          <div className="stat-val">{fmtTND(SAAS_KPI.arr)}</div>
          <div className="stat-foot">
            <span className="stat-delta"><Ico.Up/>+{SAAS_KPI.arrDelta}%</span>
            <span className="stat-foot-text">12 derniers mois</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-head"><span className="ico pos"><Ico.Building/></span>Entreprises clientes</div>
          <div className="stat-val">{SAAS_KPI.tenants}</div>
          <div className="stat-foot">
            <span className="stat-delta"><Ico.Up/>+{SAAS_KPI.tenantsDelta}</span>
            <span className="stat-foot-text">ce trimestre</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-head"><span className="ico warn"><Ico.Users/></span>Employés gérés</div>
          <div className="stat-val">{SAAS_KPI.totalEmployees}</div>
          <div className="stat-foot">
            <span className="stat-delta"><Ico.Up/>+{SAAS_KPI.employeesDelta}</span>
            <span className="stat-foot-text">ce mois-ci</span>
          </div>
        </div>
      </div>

      <div className="grid c2-21">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Revenu mensuel récurrent</div>
              <div className="card-sub">Évolution sur 7 mois — toutes formules confondues</div>
            </div>
            <div className="card-actions">
              <span className="pill pos lg"><Ico.Up/>+12.8% MoM</span>
            </div>
          </div>
          <div className="card-body">
            <LineChart data={SAAS_MRR_SERIES} valueKey="v"/>
            <div className="legend" style={{marginTop:8}}>
              <span><span className="sw" style={{background:'#4f46e5'}}></span>MRR (TND)</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">État de la plateforme</div></div>
          <div className="card-body">
            <ServiceStatus name="API & Authentification" up={true} latency="42 ms"/>
            <ServiceStatus name="Base de données PostgreSQL" up={true} latency="8 ms"/>
            <ServiceStatus name="Moteur de paie" up={true} latency="156 ms"/>
            <ServiceStatus name="Génération PDF (JasperReports)" up={true} latency="320 ms"/>
            <ServiceStatus name="Assistant IA (Ollama / phi3)" warn={true} latency="2.1 s"/>
            <ServiceStatus name="Service Email" up={true} latency="1.4 s"/>
            <div className="divider" style={{margin:'12px 0'}}/>
            <div className="row" style={{justifyContent:'space-between'}}>
              <span className="muted" style={{fontSize:12}}>Disponibilité 30 j</span>
              <span style={{fontWeight:600,fontSize:14,fontFamily:'JetBrains Mono, monospace'}}>{SAAS_KPI.uptime}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid c2-21">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Entreprises récentes</div>
              <div className="card-sub">Activité de connexion & paie sur les 7 derniers jours</div>
            </div>
            <button className="btn sm">Voir tout <Ico.Arrow/></button>
          </div>
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr>
                <th>Entreprise</th><th>Plan</th><th>Employés</th><th>MRR</th><th>Statut</th>
              </tr></thead>
              <tbody>
                {COMPANIES.slice(0, 5).map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="ev-name">
                        <div className="avatar sm" data-bg={(c.id % 6) + 1}>{c.tradeName.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
                        <div className="meta">
                          <div style={{fontWeight:500}}>{c.tradeName}</div>
                          <small>{c.city} · {c.taxId}</small>
                        </div>
                      </div>
                    </td>
                    <td><span className={planBg[c.plan]}>{PLAN_LIMITS[c.plan].label}</span></td>
                    <td className="num">{c.employees}</td>
                    <td className="num">{c.mrr > 0 ? fmtTND(c.mrr) : '—'}</td>
                    <td><span className={statusBg[c.status]}><span className="dot"></span>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">Répartition des plans</div></div>
          <div className="card-body">
            <PlanDist/>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceStatus({ name, up, warn, latency }) {
  const state = warn ? 'warn' : up ? 'pos' : 'danger';
  const label = warn ? 'Dégradé' : up ? 'Opérationnel' : 'Hors ligne';
  return (
    <div className="row" style={{padding:'8px 0',justifyContent:'space-between',borderBottom:'1px solid var(--line)'}}>
      <div className="row">
        <span className={`pill ${state}`}><span className="dot"></span>{label}</span>
        <span style={{fontSize:13,color:'var(--ink-2)',fontWeight:500}}>{name}</span>
      </div>
      <span className="mono muted" style={{fontSize:11.5}}>{latency}</span>
    </div>
  );
}

function PlanDist() {
  const dist = ['STARTER', 'PME', 'BUSINESS', 'ENTERPRISE'].map(plan => ({
    plan,
    count: COMPANIES.filter(c => c.plan === plan).length,
    mrr: COMPANIES.filter(c => c.plan === plan).reduce((s, c) => s + c.mrr, 0),
  }));
  const total = dist.reduce((s, d) => s + d.count, 0);
  const colors = { STARTER: '#94a3b8', PME: '#0ea5e9', BUSINESS: '#4f46e5', ENTERPRISE: '#f59e0b' };
  return (
    <>
      <div style={{display:'flex',gap:2,height:10,borderRadius:5,overflow:'hidden',marginBottom:14}}>
        {dist.map(d => d.count > 0 && (
          <div key={d.plan} style={{flex:d.count, background:colors[d.plan]}}/>
        ))}
      </div>
      {dist.map(d => (
        <div key={d.plan} className="row" style={{justifyContent:'space-between',padding:'6px 0'}}>
          <div className="row">
            <span style={{width:8,height:8,borderRadius:2,background:colors[d.plan]}}/>
            <span style={{fontSize:13,fontWeight:500}}>{PLAN_LIMITS[d.plan].label}</span>
          </div>
          <div className="row" style={{gap:14}}>
            <span className="mono muted" style={{fontSize:12}}>{d.count}/{total}</span>
            <span className="mono" style={{fontSize:12.5,fontWeight:500}}>{fmtTND(d.mrr)}</span>
          </div>
        </div>
      ))}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 2) MULTI-TENANT — companies list
// ═════════════════════════════════════════════════════════════════════
function ScreenTenants({ onOpenModal }) {
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const list = COMPANIES.filter(c => {
    if (filter === 'active' && c.status !== 'ACTIVE') return false;
    if (filter === 'trial' && c.status !== 'TRIAL') return false;
    if (filter === 'suspended' && c.status !== 'SUSPENDED') return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.taxId.includes(search)) return false;
    return true;
  });
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs"><strong>Super Admin</strong> <span className="sep">/</span> Multi-tenant</div>
          <h1 className="page-title">Entreprises clientes</h1>
          <div className="page-sub">{COMPANIES.length} entreprises · {SAAS_KPI.totalEmployees} employés gérés au total</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Ico.Download/>Exporter CSV</button>
          <button className="btn primary" onClick={() => onOpenModal('new-tenant')}><Ico.Plus/>Nouvelle entreprise</button>
        </div>
      </div>

      <div className="card">
        <div className="table-tools">
          <button className={`filter-chip ${filter==='all'?'active':''}`} onClick={()=>setFilter('all')}>
            Toutes <span className="count">{COMPANIES.length}</span>
          </button>
          <button className={`filter-chip ${filter==='active'?'active':''}`} onClick={()=>setFilter('active')}>
            Actives <span className="count">{COMPANIES.filter(c=>c.status==='ACTIVE').length}</span>
          </button>
          <button className={`filter-chip ${filter==='trial'?'active':''}`} onClick={()=>setFilter('trial')}>
            Essai <span className="count">{COMPANIES.filter(c=>c.status==='TRIAL').length}</span>
          </button>
          <button className={`filter-chip ${filter==='suspended'?'active':''}`} onClick={()=>setFilter('suspended')}>
            Suspendues <span className="count">{COMPANIES.filter(c=>c.status==='SUSPENDED').length}</span>
          </button>
          <div className="input-pill" style={{marginLeft:'auto',width:240}}>
            <Ico.Search/>
            <input placeholder="Rechercher par nom, matricule fiscal…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr>
              <th>Entreprise</th><th>Matricule fiscal</th><th>Plan</th>
              <th className="num">Employés</th><th className="num">MRR</th>
              <th>Renouvellement</th><th>Statut</th><th></th>
            </tr></thead>
            <tbody>
              {list.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="ev-name">
                      <div className="avatar" data-bg={(c.id%6)+1}>{c.tradeName.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
                      <div className="meta">
                        <div style={{fontWeight:500}}>{c.name}</div>
                        <small>{c.city} · schéma <span className="mono">{c.schema}</span></small>
                      </div>
                    </div>
                  </td>
                  <td className="mono" style={{fontSize:12}}>{c.taxId}</td>
                  <td><span className={planBg[c.plan]}>{PLAN_LIMITS[c.plan].label}</span></td>
                  <td className="num">
                    <span>{c.employees}</span>
                    <span className="muted" style={{fontSize:11}}> / {PLAN_LIMITS[c.plan].maxEmployees}</span>
                  </td>
                  <td className="num">{c.mrr > 0 ? fmtTND(c.mrr) : '—'}</td>
                  <td className="mono" style={{fontSize:12}}>{c.renewal}</td>
                  <td><span className={statusBg[c.status]}><span className="dot"></span>{c.status === 'ACTIVE' ? 'Active' : c.status === 'TRIAL' ? 'Essai' : c.status === 'SUSPENDED' ? 'Suspendue' : 'Résiliée'}</span></td>
                  <td>
                    <div className="hover-actions row" style={{gap:4}}>
                      <button className="btn sm ghost"><Ico.Eye/></button>
                      <button className="btn sm ghost"><Ico.Edit/></button>
                      <button className="btn sm ghost"><Ico.More/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-foot">
          <div>{list.length} entreprises affichées</div>
          <div className="pag">
            <button disabled>‹</button>
            <button className="active">1</button>
            <button>2</button>
            <button>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 3) PARAMÈTRES RÉGLEMENTAIRES
// ═════════════════════════════════════════════════════════════════════
function ScreenRegulatory() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs"><strong>Super Admin</strong> <span className="sep">/</span> Paramètres réglementaires</div>
          <h1 className="page-title">Taux légaux & barèmes</h1>
          <div className="page-sub">Loi de Finances 2026 · Code du Travail tunisien</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Ico.History/>Historique</button>
          <button className="btn primary"><Ico.Plus/>Nouveau paramètre</button>
        </div>
      </div>

      <div className="grid c2">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Cotisations sociales</div>
            <div className="card-sub">CNSS, CAVIS, CSS, TFP — applicables au 01/01/2026</div>
          </div>
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>Code</th><th>Libellé</th><th className="num">Taux</th><th>Mise à jour</th><th></th></tr></thead>
              <tbody>
                {REGULATORY.map(r => (
                  <tr key={r.code}>
                    <td className="mono" style={{fontSize:12}}>{r.code}</td>
                    <td>{r.label}<div className="muted" style={{fontSize:11}}>{r.source}</div></td>
                    <td className="num"><span style={{fontWeight:600,fontVariantNumeric:'tabular-nums'}}>{r.rate.toFixed(2)}</span><span className="muted"> {r.unit}</span></td>
                    <td className="mono" style={{fontSize:12}}>{r.updated}</td>
                    <td><button className="btn sm ghost"><Ico.Edit/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Barème IRPP — progressif</div>
            <div className="card-sub">Loi de Finances 2026 — base imposable annuelle</div>
          </div>
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>Tranche</th><th>De</th><th>À</th><th className="num">Taux</th></tr></thead>
              <tbody>
                {IRPP_BRACKETS.map((b, i) => (
                  <tr key={i}>
                    <td><span className="mono muted" style={{fontSize:11}}>T{i+1}</span></td>
                    <td className="num mono" style={{fontSize:12}}>{fmtTND(b.from)}</td>
                    <td className="num mono" style={{fontSize:12}}>{b.to ? fmtTND(b.to) : '—'}</td>
                    <td className="num"><span style={{fontWeight:600}}>{b.rate}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Génération des séquences (sequence_generator)</div>
          <div className="card-sub">Identifiants auto-incrémentés par entité</div>
        </div>
        <div className="card-body" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
          {[
            { name: 'employee', next: 1044, prefix: 'EMP-' },
            { name: 'payroll_period', next: 39, prefix: 'PP-' },
            { name: 'pay_slip', next: 1842, prefix: 'PS-' },
            { name: 'leave_request', next: 2815, prefix: 'LV-' },
            { name: 'contract', next: 622, prefix: 'CTR-' },
            { name: 'advance', next: 119, prefix: 'AV-' },
            { name: 'audit_log', next: 9413, prefix: 'AU-' },
            { name: 'invoice', next: 312, prefix: 'INV-' },
          ].map(s => (
            <div key={s.name} style={{padding:14,border:'1px solid var(--line)',borderRadius:10}}>
              <div className="mono muted" style={{fontSize:11}}>{s.name}</div>
              <div style={{fontSize:18,fontWeight:600,marginTop:4,fontFamily:'JetBrains Mono, monospace'}}>{s.prefix}{s.next}</div>
              <div className="muted" style={{fontSize:11,marginTop:2}}>prochain ID</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 4) JOURNAL D'AUDIT
// ═════════════════════════════════════════════════════════════════════
function ScreenAudit() {
  const [action, setAction] = React.useState('all');
  const list = AUDIT.filter(a => action === 'all' || a.action === action);
  const actionPill = {
    CREATE: 'pos', UPDATE: 'info', DELETE: 'danger', VALIDATE: 'primary',
    APPROVE: 'pos', REJECT: 'danger', LOGIN: '', LOGOUT: '', VIEW: '',
    EXPORT: 'info', SUSPEND: 'warn',
  };
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs"><strong>Super Admin</strong> <span className="sep">/</span> Journal d'audit</div>
          <h1 className="page-title">Traçabilité des actions</h1>
          <div className="page-sub">Toutes les actions sont horodatées et conservées 7 ans (conformité)</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Ico.Filter/>Filtres avancés</button>
          <button className="btn"><Ico.Download/>Exporter</button>
        </div>
      </div>

      <div className="card">
        <div className="table-tools">
          {['all', 'CREATE', 'UPDATE', 'APPROVE', 'REJECT', 'LOGIN', 'EXPORT'].map(a => (
            <button key={a} className={`filter-chip ${action===a?'active':''}`} onClick={()=>setAction(a)}>
              {a === 'all' ? 'Toutes les actions' : a}
            </button>
          ))}
          <div className="input-pill" style={{marginLeft:'auto',width:200}}>
            <Ico.Search/><input placeholder="IP, utilisateur, entité…"/>
          </div>
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr>
              <th>Date & heure</th><th>Utilisateur</th><th>Rôle</th>
              <th>Action</th><th>Entité</th><th>IP</th><th>Détail</th>
            </tr></thead>
            <tbody>
              {list.map(a => (
                <tr key={a.id}>
                  <td className="mono nowrap" style={{fontSize:11.5}}>{a.date}</td>
                  <td>{a.user}</td>
                  <td><span className="pill" style={{fontSize:10.5}}>{a.role}</span></td>
                  <td><span className={`pill ${actionPill[a.action]||''}`}><span className="dot"></span>{a.action}</span></td>
                  <td><span className="mono" style={{fontSize:12}}>{a.entity}</span> <span className="muted mono" style={{fontSize:11.5}}>{a.entityId}</span></td>
                  <td className="mono" style={{fontSize:11.5}}>{a.ip}</td>
                  <td className="muted" style={{fontSize:12.5}}>{a.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-foot">
          <div>Affichage de {list.length} entrées sur {AUDIT.length} (filtre actif)</div>
          <div className="pag"><button disabled>‹</button><button className="active">1</button><button>2</button><button>3</button><button>›</button></div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ScreenSaasDashboard, ScreenTenants, ScreenRegulatory, ScreenAudit,
  LineChart, BarChart,
});
