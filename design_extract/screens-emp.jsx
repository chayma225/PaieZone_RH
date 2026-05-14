// PaieZone RH — EMPLOYÉ self-service screens
// 1) Tableau de bord  2) Mes congés  3) Mes demandes

const ME = EMPLOYEES[1]; // Mehdi Ben Salah

// ═════════════════════════════════════════════════════════════════════
// 1) MON TABLEAU DE BORD
// ═════════════════════════════════════════════════════════════════════
function ScreenEmpDashboard({ onOpenModal }) {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs"><strong>Mon espace</strong> <span className="sep">/</span> Tableau de bord</div>
          <h1 className="page-title">Bonjour Mehdi 👋</h1>
          <div className="page-sub">Mercredi 14 mai 2026 · {ME.role} · matricule <span className="mono">{ME.matricule}</span></div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => onOpenModal('new-leave')}><Ico.Calendar/>Demander un congé</button>
          <button className="btn primary" onClick={() => onOpenModal('new-advance')}><Ico.Cash/>Demander une avance</button>
        </div>
      </div>

      {/* Last payslip — hero */}
      <div className="grid c2-21">
        <div className="card" style={{background:'linear-gradient(135deg, #ffffff 0%, #eef2ff 100%)',border:'1px solid var(--primary-soft)'}}>
          <div className="card-head">
            <div>
              <div className="card-title" style={{color:'var(--primary-ink)'}}>Dernier bulletin de paie</div>
              <div className="card-sub">Avril 2026 · disponible depuis le 03/05/2026</div>
            </div>
            <div className="card-actions">
              <span className="pill pos"><span className="dot"></span>Validé</span>
            </div>
          </div>
          <div className="card-body">
            <div className="row" style={{justifyContent:'space-between',alignItems:'flex-end'}}>
              <div>
                <div className="muted" style={{fontSize:12,fontWeight:500,textTransform:'uppercase',letterSpacing:'0.05em'}}>Net à payer</div>
                <div style={{fontSize:36,fontWeight:600,letterSpacing:'-0.025em',fontFamily:'JetBrains Mono, monospace',color:'var(--ink)',marginTop:4}}>
                  {fmtTNDdec(2783.05)}
                </div>
                <div className="muted" style={{fontSize:12,marginTop:6}}>
                  Brut <span className="mono" style={{fontWeight:500,color:'var(--ink-3)'}}>3 680,000</span> · Cotisations <span className="mono" style={{fontWeight:500,color:'var(--ink-3)'}}>−896,950</span>
                </div>
              </div>
              <div className="row">
                <button className="btn"><Ico.Eye/>Voir détail</button>
                <button className="btn primary"><Ico.Download/>Télécharger PDF</button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">Notifications</div></div>
          <div className="card-body" style={{padding:'0 20px 14px'}}>
            <NotifItem icon="Cash" tone="primary" title="Bulletin d'avril disponible" sub="Téléchargeable depuis Mes documents" time="il y a 1 jour"/>
            <NotifItem icon="Check" tone="pos" title="Avance approuvée" sub="800 TND — remboursement sur 3 mois" time="il y a 3 jours"/>
            <NotifItem icon="Calendar" tone="warn" title="Solde CP : 20 jours restants" sub="À utiliser avant le 31 décembre 2026" time="il y a 1 semaine"/>
            <NotifItem icon="Doc" tone="info" title="Mise à jour du règlement intérieur" sub="Veuillez consulter le nouveau document RH" time="il y a 2 semaines"/>
          </div>
        </div>
      </div>

      <div className="grid c2">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Mes soldes de congés</div>
            <div className="card-sub">Année 2026</div>
          </div>
          <div className="card-body">
            {[
              { label: 'Congés payés', used: 4, total: 24, color: '#4f46e5', remaining: 20 },
              { label: 'RTT', used: 2, total: 11, color: '#0ea5e9', remaining: 9 },
              { label: 'Maladie', used: 0, total: 15, color: '#f59e0b', remaining: 15 },
            ].map((b, i) => (
              <div key={i} style={{marginBottom:14}}>
                <div className="row" style={{justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontSize:13,fontWeight:500}}>{b.label}</span>
                  <span><strong style={{fontFamily:'JetBrains Mono, monospace'}}>{b.remaining}</strong> <span className="muted" style={{fontSize:12}}>/ {b.total}j restants</span></span>
                </div>
                <div className="progress thin"><i style={{width:`${(b.used/b.total)*100}%`,background:b.color}}/></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Historique paie — 6 mois</div>
          </div>
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr><th>Période</th><th className="num">Net</th><th></th></tr></thead>
              <tbody>
                {PAYROLL_PERIODS.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{fontWeight:500}}>{p.label}</div>
                      <div className="muted" style={{fontSize:11.5}}>
                        <span className={payrollStatusBg[p.status]} style={{fontSize:10.5,padding:'1px 6px'}}>{payrollStatusLabel[p.status]}</span>
                      </div>
                    </td>
                    <td className="num"><span style={{fontWeight:600}}>{fmtTNDdec(2783.05 - (p.id-1)*45)}</span></td>
                    <td><button className="btn sm"><Ico.Pdf/>PDF</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotifItem({ icon, tone, title, sub, time }) {
  const I = Ico[icon] || Ico.Bell;
  return (
    <div className="row" style={{padding:'10px 0',borderTop:'1px solid var(--line)',gap:12,alignItems:'flex-start'}}>
      <div className={`pill ${tone}`} style={{width:32,height:32,padding:0,borderRadius:8,justifyContent:'center'}}><I/></div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:500,color:'var(--ink)'}}>{title}</div>
        <div className="muted" style={{fontSize:12,marginTop:1}}>{sub}</div>
      </div>
      <div className="muted mono" style={{fontSize:11,whiteSpace:'nowrap'}}>{time}</div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 2) MES CONGÉS — soldes + historique + nouvelle demande
// ═════════════════════════════════════════════════════════════════════
function ScreenEmpLeaves({ onOpenModal }) {
  const myLeaves = [
    { id: 'LV-2810', type: 'Congés payés', days: 4, from: '28/05/2026', to: '31/05/2026', status: 'approved', submittedDate: '02/05/2026' },
    { id: 'LV-2802', type: 'RTT', days: 1, from: '02/05/2026', to: '02/05/2026', status: 'approved', submittedDate: '20/04/2026' },
    { id: 'LV-2796', type: 'Congés payés', days: 3, from: '08/04/2026', to: '10/04/2026', status: 'approved', submittedDate: '01/04/2026' },
    { id: 'LV-2780', type: 'Congé exceptionnel', days: 1, from: '14/03/2026', to: '14/03/2026', status: 'approved', submittedDate: '10/03/2026' },
  ];
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs"><strong>Mon espace</strong> <span className="sep">/</span> Mes congés</div>
          <h1 className="page-title">Mes congés & absences</h1>
          <div className="page-sub">Consultez vos soldes et déposez vos demandes</div>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => onOpenModal('new-leave')}><Ico.Plus/>Nouvelle demande</button>
        </div>
      </div>

      <div className="stat-grid cols-4">
        <BalanceStat label="Congés payés" used={4} total={24} color="#4f46e5"/>
        <BalanceStat label="RTT" used={2} total={11} color="#0ea5e9"/>
        <BalanceStat label="Maladie" used={0} total={15} color="#f59e0b"/>
        <BalanceStat label="Exceptionnel" used={0} total={5} color="#10b981"/>
      </div>

      <div className="card">
        <div className="card-head"><div className="card-title">Historique de mes demandes</div></div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Référence</th><th>Type</th><th className="num">Jours</th><th>Période</th><th>Soumis le</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {myLeaves.map(l => (
                <tr key={l.id}>
                  <td className="mono" style={{fontSize:12}}>{l.id}</td>
                  <td>{l.type}</td>
                  <td className="num"><span style={{fontWeight:600}}>{l.days}j</span></td>
                  <td className="mono" style={{fontSize:12}}>{l.from} → {l.to}</td>
                  <td className="mono muted" style={{fontSize:12}}>{l.submittedDate}</td>
                  <td><span className="pill pos"><span className="dot"></span>Approuvée</span></td>
                  <td><button className="btn sm ghost"><Ico.Eye/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BalanceStat({ label, used, total, color }) {
  const remaining = total - used;
  return (
    <div className="stat">
      <div className="stat-head">
        <span className="ico" style={{background:`${color}1a`, color}}><Ico.Beach/></span>
        {label}
      </div>
      <div className="row" style={{alignItems:'baseline',gap:4}}>
        <div className="stat-val">{remaining}</div>
        <div className="muted" style={{fontSize:14}}>/ {total}j</div>
      </div>
      <div className="progress thin" style={{marginTop:10}}><i style={{width:`${(used/total)*100}%`,background:color}}/></div>
      <div className="muted" style={{fontSize:11,marginTop:6}}>{used} jours consommés</div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 3) MES DEMANDES — toutes (avances, congés, autres)
// ═════════════════════════════════════════════════════════════════════
function ScreenEmpRequests({ onOpenModal }) {
  const requests = [
    { type: 'Avance sur salaire', ref: 'AV-117', date: '13/05/2026', detail: '500 TND · Remboursement sur 2 mois', status: 'pending' },
    { type: 'Congés payés', ref: 'LV-2810', date: '02/05/2026', detail: '4 jours · 28/05 → 31/05', status: 'approved' },
    { type: 'Avance sur salaire', ref: 'AV-101', date: '15/03/2026', detail: '600 TND · Remboursement sur 3 mois', status: 'approved' },
    { type: 'Mise à jour RIB', ref: 'DOC-088', date: '08/03/2026', detail: 'Nouveau RIB Banque de Tunisie', status: 'approved' },
    { type: 'Attestation employeur', ref: 'DOC-072', date: '20/02/2026', detail: 'Pour démarches administratives', status: 'approved' },
  ];
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs"><strong>Mon espace</strong> <span className="sep">/</span> Mes demandes</div>
          <h1 className="page-title">Toutes mes demandes</h1>
          <div className="page-sub">Suivi de l'ensemble de vos requêtes RH</div>
        </div>
      </div>

      <div className="grid c3">
        <ActionTile icon="Calendar" title="Demander un congé" sub="Posez vos congés payés, RTT ou jours exceptionnels" onClick={() => onOpenModal('new-leave')}/>
        <ActionTile icon="Cash" title="Demander une avance" sub="Sollicitez une avance sur votre prochain salaire" onClick={() => onOpenModal('new-advance')}/>
        <ActionTile icon="Doc" title="Demander un document" sub="Attestation employeur, certificat, etc." onClick={() => onOpenModal('new-doc')}/>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Historique</div>
          <div className="card-sub">Toutes vos demandes des 6 derniers mois</div>
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr><th>Référence</th><th>Type</th><th>Détail</th><th>Date</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {requests.map((r, i) => (
                <tr key={i}>
                  <td className="mono" style={{fontSize:12}}>{r.ref}</td>
                  <td><span style={{fontWeight:500}}>{r.type}</span></td>
                  <td className="muted">{r.detail}</td>
                  <td className="mono" style={{fontSize:12}}>{r.date}</td>
                  <td><span className={`pill ${r.status==='approved'?'pos':r.status==='rejected'?'danger':'warn'}`}><span className="dot"></span>{r.status==='approved'?'Approuvée':r.status==='rejected'?'Refusée':'En attente'}</span></td>
                  <td><button className="btn sm ghost"><Ico.Eye/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ActionTile({ icon, title, sub, onClick }) {
  const I = Ico[icon];
  return (
    <button className="card" onClick={onClick} style={{padding:20,textAlign:'left',cursor:'pointer',transition:'transform 0.12s, box-shadow 0.12s'}}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='var(--shadow-lg)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
      <div style={{width:44,height:44,borderRadius:11,background:'var(--primary-soft)',color:'var(--primary)',display:'grid',placeItems:'center'}}>
        <I/>
      </div>
      <div style={{fontSize:15,fontWeight:600,marginTop:14}}>{title}</div>
      <div className="muted" style={{fontSize:12.5,marginTop:4,lineHeight:1.5}}>{sub}</div>
      <div className="row" style={{marginTop:14,color:'var(--primary)',fontSize:13,fontWeight:500,gap:6}}>
        Commencer <Ico.Arrow/>
      </div>
    </button>
  );
}

Object.assign(window, {
  ScreenEmpDashboard, ScreenEmpLeaves, ScreenEmpRequests,
});
