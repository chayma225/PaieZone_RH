// PaieZone RH — ADMIN entreprise screens (rôle distinct du RH)
// L'Admin gère son entreprise : infos, utilisateurs/accès, documents, audit interne.
// 1) Tableau de bord Admin  2) Mon entreprise  3) Utilisateurs & accès  4) Audit interne

// Utilisateurs de l'entreprise (Atlas Tech) avec leurs rôles plateforme
const TENANT_USERS = [
  { id: 1, empId: 1, role: 'ADMIN', lastLogin: '14/05/2026 08:33', active: true, twofa: true },
  { id: 2, empId: 5, role: 'RH_COMPTABLE', lastLogin: '14/05/2026 07:58', active: true, twofa: true },
  { id: 3, empId: 11, role: 'RH_COMPTABLE', lastLogin: '13/05/2026 17:12', active: true, twofa: false },
  { id: 4, empId: 2, role: 'EMPLOYE', lastLogin: '14/05/2026 09:14', active: true, twofa: false },
  { id: 5, empId: 9, role: 'EMPLOYE', lastLogin: '13/05/2026 14:33', active: true, twofa: false },
  { id: 6, empId: 3, role: 'EMPLOYE', lastLogin: '13/05/2026 18:02', active: true, twofa: false },
  { id: 7, empId: 4, role: 'EMPLOYE', lastLogin: '12/05/2026 16:48', active: true, twofa: false },
  { id: 8, empId: 6, role: 'EMPLOYE', lastLogin: '11/05/2026 11:30', active: true, twofa: false },
  { id: 9, empId: 7, role: 'EMPLOYE', lastLogin: '14/05/2026 08:00', active: true, twofa: false },
  { id: 10, empId: 8, role: 'EMPLOYE', lastLogin: 'Jamais connecté', active: false, twofa: false },
];

const ROLE_LABELS = {
  ADMIN: { label: 'Administrateur', cls: 'pill primary', desc: 'Accès complet à l\'entreprise' },
  RH_COMPTABLE: { label: 'RH / Comptable', cls: 'pill info', desc: 'Gère paie, congés, employés' },
  EMPLOYE: { label: 'Employé', cls: 'pill', desc: 'Self-service (paie, congés, demandes)' },
};

// ═════════════════════════════════════════════════════════════════════
// 1) TABLEAU DE BORD ADMIN
// ═════════════════════════════════════════════════════════════════════
function ScreenAdminDashboard({ onNav, onOpenModal }) {
  const activeUsers = TENANT_USERS.filter(u => u.active).length;
  const twofaPct = Math.round((TENANT_USERS.filter(u => u.twofa).length / TENANT_USERS.length) * 100);
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs"><strong>Administration</strong> <span className="sep">/</span> Tableau de bord</div>
          <h1 className="page-title">Atlas Tech SARL</h1>
          <div className="page-sub">Vue administrateur · Mehdi Trabelsi · Mercredi 14 mai 2026</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => onNav('admin-company')}><Ico.Building/>Mon entreprise</button>
          <button className="btn primary" onClick={() => onOpenModal('invite-user')}><Ico.Plus/>Inviter un utilisateur</button>
        </div>
      </div>

      <div className="stat-grid cols-4">
        <div className="stat">
          <div className="stat-head"><span className="ico"><Ico.Users/></span>Utilisateurs actifs</div>
          <div className="stat-val">{activeUsers}<small>/ {TENANT_USERS.length}</small></div>
          <div className="stat-foot"><span className="stat-foot-text">1 désactivé · {TENANT_USERS.filter(u=>u.lastLogin==='Jamais connecté').length} jamais connecté</span></div>
        </div>
        <div className="stat">
          <div className="stat-head"><span className="ico info"><Ico.Briefcase/></span>Effectif total</div>
          <div className="stat-val">{EMPLOYEES.length}</div>
          <div className="stat-foot">
            <span className="stat-delta"><Ico.Up/>+2</span>
            <span className="stat-foot-text">ce mois</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-head"><span className="ico warn"><Ico.Shield/></span>2FA activée</div>
          <div className="stat-val">{twofaPct}<small>%</small></div>
          <div className="stat-foot"><span className="stat-foot-text">Recommandé pour Admin & RH</span></div>
        </div>
        <div className="stat">
          <div className="stat-head"><span className="ico pos"><Ico.Wallet/></span>Plan d'abonnement</div>
          <div className="stat-val" style={{fontSize:20}}>Business</div>
          <div className="stat-foot"><span className="stat-foot-text">42/100 employés · 540 TND/mois</span></div>
        </div>
      </div>

      <div className="grid c2-21">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Répartition des rôles</div>
            <button className="btn sm ghost" onClick={() => onNav('admin-users')}>Gérer <Ico.Arrow/></button>
          </div>
          <div className="card-body">
            {['ADMIN', 'RH_COMPTABLE', 'EMPLOYE'].map(r => {
              const count = TENANT_USERS.filter(u => u.role === r).length;
              const pct = (count / TENANT_USERS.length) * 100;
              return (
                <div key={r} style={{marginBottom:14}}>
                  <div className="row" style={{justifyContent:'space-between',marginBottom:6}}>
                    <div className="row" style={{gap:8}}>
                      <span className={ROLE_LABELS[r].cls}>{ROLE_LABELS[r].label}</span>
                      <span className="muted" style={{fontSize:12}}>{ROLE_LABELS[r].desc}</span>
                    </div>
                    <span className="mono" style={{fontSize:13,fontWeight:600}}>{count}</span>
                  </div>
                  <div className="progress thin"><i style={{width:`${pct}%`}}/></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">Mon entreprise</div></div>
          <div className="card-body">
            <div className="row" style={{gap:14,marginBottom:14}}>
              <div style={{width:56,height:56,borderRadius:12,background:'linear-gradient(135deg, var(--primary), #7c3aed)',color:'#fff',display:'grid',placeItems:'center',fontWeight:700,fontSize:18}}>AT</div>
              <div>
                <div style={{fontSize:15,fontWeight:600}}>Atlas Tech SARL</div>
                <div className="muted" style={{fontSize:12}}>Tunis · Création 02/04/2018</div>
              </div>
            </div>
            <div className="col" style={{gap:8}}>
              <InfoRow label="Matricule fiscal" value={<span className="mono">1234567/A</span>}/>
              <InfoRow label="ID CNSS" value={<span className="mono">12500-0001</span>}/>
              <InfoRow label="Effectif" value={`${EMPLOYEES.length} collaborateurs`}/>
              <InfoRow label="Plan" value={<span className="pill primary">Business</span>}/>
            </div>
            <button className="btn" style={{width:'100%',marginTop:14}} onClick={() => onNav('admin-company')}>
              <Ico.Edit/>Modifier les informations
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Activité administrateur récente</div>
          <div className="card-sub">Actions admin sur les 7 derniers jours</div>
        </div>
        <div className="card-body" style={{padding:'0 20px 14px'}}>
          {[
            {icon:'User', text: (<><strong>Sirine Mansouri</strong> a reçu le rôle <span className="pill info" style={{fontSize:10.5}}>RH_COMPTABLE</span></>), time:'il y a 2h'},
            {icon:'Building', text: (<>Modification de l'adresse postale de l'entreprise</>), time:'il y a 1 jour'},
            {icon:'Shield', text: (<>2FA activée pour <strong>Leila Chaâbane</strong></>), time:'il y a 3 jours'},
            {icon:'Doc', text: (<>Mise à jour du règlement intérieur (v2026.2)</>), time:'il y a 1 semaine'},
            {icon:'Lock', text: (<>Compte <strong>Anis Gharbi</strong> désactivé (fin de stage)</>), time:'il y a 2 semaines'},
          ].map((a, i) => {
            const I = Ico[a.icon] || Ico.Doc;
            return (
              <div key={i} className="tl-item">
                <div className="tl-dot"><I/></div>
                <div>
                  <div className="tl-text">{a.text}</div>
                  <div className="tl-time">{a.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="row" style={{justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--line)'}}>
      <span className="muted" style={{fontSize:12.5}}>{label}</span>
      <span style={{fontSize:13,fontWeight:500}}>{value}</span>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 2) MON ENTREPRISE — fiche modifiable
// ═════════════════════════════════════════════════════════════════════
function ScreenCompany() {
  const [edit, setEdit] = React.useState(false);
  const [data, setData] = React.useState({
    name: 'Atlas Tech SARL',
    tradeName: 'Atlas Tech',
    taxId: '1234567/A',
    cnssId: '12500-0001',
    legalForm: 'SARL',
    capital: '50 000 TND',
    address: '12 rue de la Liberté, Immeuble Atlas, 3ème étage',
    city: 'Tunis',
    postalCode: '1002',
    phone: '+216 71 234 567',
    email: 'contact@atlas-tech.tn',
    website: 'https://atlas-tech.tn',
    activity: 'Édition de logiciels (CN: 62.01)',
    createdAt: '02/04/2018',
  });
  const update = (k, v) => setData(d => ({ ...d, [k]: v }));
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs"><strong>Administration</strong> <span className="sep">/</span> Mon entreprise</div>
          <h1 className="page-title">Informations de l'entreprise</h1>
          <div className="page-sub">Coordonnées légales et fiscales · visible par les utilisateurs autorisés</div>
        </div>
        <div className="page-actions">
          {edit ? (
            <>
              <button className="btn" onClick={() => setEdit(false)}>Annuler</button>
              <button className="btn primary" onClick={() => setEdit(false)}><Ico.Check/>Enregistrer</button>
            </>
          ) : (
            <button className="btn primary" onClick={() => setEdit(true)}><Ico.Edit/>Modifier</button>
          )}
        </div>
      </div>

      <div className="grid c2-21">
        <div className="col" style={{gap:'var(--gap)'}}>
          <div className="card">
            <div className="card-head"><div className="card-title">Identité de l'entreprise</div></div>
            <div className="card-body">
              <div className="grid c2">
                <Field label="Raison sociale" value={data.name} edit={edit} onChange={v => update('name', v)}/>
                <Field label="Nom commercial" value={data.tradeName} edit={edit} onChange={v => update('tradeName', v)}/>
                <Field label="Forme juridique" value={data.legalForm} edit={edit} onChange={v => update('legalForm', v)}/>
                <Field label="Capital social" value={data.capital} edit={edit} onChange={v => update('capital', v)}/>
                <Field label="Activité principale" value={data.activity} edit={edit} onChange={v => update('activity', v)} full/>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">Identifiants fiscaux & sociaux</div></div>
            <div className="card-body">
              <div className="grid c2">
                <Field label="Matricule fiscal" value={data.taxId} edit={edit} mono onChange={v => update('taxId', v)}/>
                <Field label="Identifiant CNSS" value={data.cnssId} edit={edit} mono onChange={v => update('cnssId', v)}/>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">Coordonnées</div></div>
            <div className="card-body">
              <div className="grid c2">
                <Field label="Adresse" value={data.address} edit={edit} onChange={v => update('address', v)} full/>
                <Field label="Ville" value={data.city} edit={edit} onChange={v => update('city', v)}/>
                <Field label="Code postal" value={data.postalCode} edit={edit} mono onChange={v => update('postalCode', v)}/>
                <Field label="Téléphone" value={data.phone} edit={edit} onChange={v => update('phone', v)}/>
                <Field label="Email" value={data.email} edit={edit} onChange={v => update('email', v)}/>
                <Field label="Site web" value={data.website} edit={edit} onChange={v => update('website', v)} full/>
              </div>
            </div>
          </div>
        </div>

        <div className="col" style={{gap:'var(--gap)'}}>
          <div className="card">
            <div className="card-head"><div className="card-title">Logo de l'entreprise</div></div>
            <div className="card-body">
              <div style={{width:'100%',aspectRatio:'1.6/1',borderRadius:12,background:'linear-gradient(135deg, var(--primary), #7c3aed)',color:'#fff',display:'grid',placeItems:'center',fontWeight:700,fontSize:48,letterSpacing:'-0.04em'}}>AT</div>
              <button className="btn" style={{width:'100%',marginTop:12}} disabled={!edit}>
                <Ico.Upload/>{edit ? 'Téléverser un logo' : 'Activez "Modifier" pour téléverser'}
              </button>
              <div className="muted" style={{fontSize:11,marginTop:6,textAlign:'center'}}>PNG, JPG ou SVG · 2 Mo max</div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">Abonnement</div></div>
            <div className="card-body">
              <div className="row" style={{justifyContent:'space-between',marginBottom:14}}>
                <div>
                  <div style={{fontSize:18,fontWeight:600}}>Plan Business</div>
                  <div className="muted" style={{fontSize:12}}>Renouvellement le 12/08/2026</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:20,fontWeight:600,fontFamily:'JetBrains Mono, monospace'}}>540 TND</div>
                  <div className="muted" style={{fontSize:11}}>HT / mois</div>
                </div>
              </div>
              <div className="progress thin" style={{marginBottom:6}}><i style={{width:'42%'}}/></div>
              <div className="muted" style={{fontSize:12}}>42 / 100 employés inclus</div>
              <button className="btn" style={{width:'100%',marginTop:12}}>Voir les détails du plan</button>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><div className="card-title">Données système</div></div>
            <div className="card-body">
              <InfoRow label="Schéma BD" value={<span className="mono">atlas_tech</span>}/>
              <InfoRow label="Région" value="Tunisie (eu-south-1)"/>
              <InfoRow label="Créée le" value={data.createdAt}/>
              <InfoRow label="ID tenant" value={<span className="mono">#1</span>}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, edit, onChange, mono, full }) {
  return (
    <div className={`field ${full?'':''}`} style={full ? {gridColumn:'1/-1'} : {}}>
      <label>{label}</label>
      {edit ? (
        <input className={`input ${mono?'mono':''}`} value={value} onChange={e => onChange(e.target.value)}/>
      ) : (
        <div style={{padding:'9px 12px',background:'var(--surface-2)',border:'1px solid var(--line)',borderRadius:8,fontSize:13.5,fontWeight:500,fontFamily: mono?'JetBrains Mono, monospace':'inherit'}}>{value}</div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 3) UTILISATEURS & ACCÈS
// ═════════════════════════════════════════════════════════════════════
function ScreenUsers({ onOpenModal }) {
  const [roleFilter, setRoleFilter] = React.useState('all');
  const list = TENANT_USERS.filter(u => roleFilter === 'all' || u.role === roleFilter);
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs"><strong>Administration</strong> <span className="sep">/</span> Utilisateurs & accès</div>
          <h1 className="page-title">Gestion des accès</h1>
          <div className="page-sub">{TENANT_USERS.filter(u=>u.active).length} comptes actifs · {TENANT_USERS.length - TENANT_USERS.filter(u=>u.active).length} désactivé(s)</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Ico.Mail/>Voir invitations en cours</button>
          <button className="btn primary" onClick={() => onOpenModal('invite-user')}><Ico.Plus/>Inviter un utilisateur</button>
        </div>
      </div>

      <div className="stat-grid cols-3">
        {[
          {role:'ADMIN', count: TENANT_USERS.filter(u=>u.role==='ADMIN').length, icon:'Shield', tone:''},
          {role:'RH_COMPTABLE', count: TENANT_USERS.filter(u=>u.role==='RH_COMPTABLE').length, icon:'Briefcase', tone:'info'},
          {role:'EMPLOYE', count: TENANT_USERS.filter(u=>u.role==='EMPLOYE').length, icon:'User', tone:'pos'},
        ].map(r => {
          const I = Ico[r.icon];
          return (
            <button key={r.role} className="stat" style={{cursor:'pointer',textAlign:'left'}} onClick={() => setRoleFilter(r.role)}>
              <div className="stat-head"><span className={`ico ${r.tone}`}><I/></span>{ROLE_LABELS[r.role].label}</div>
              <div className="stat-val">{r.count}</div>
              <div className="stat-foot"><span className="stat-foot-text">{ROLE_LABELS[r.role].desc}</span></div>
            </button>
          );
        })}
      </div>

      <div className="card">
        <div className="table-tools">
          <button className={`filter-chip ${roleFilter==='all'?'active':''}`} onClick={()=>setRoleFilter('all')}>
            Tous <span className="count">{TENANT_USERS.length}</span>
          </button>
          {Object.keys(ROLE_LABELS).map(r => (
            <button key={r} className={`filter-chip ${roleFilter===r?'active':''}`} onClick={()=>setRoleFilter(r)}>
              {ROLE_LABELS[r].label} <span className="count">{TENANT_USERS.filter(u=>u.role===r).length}</span>
            </button>
          ))}
          <div className="input-pill" style={{marginLeft:'auto',width:220}}>
            <Ico.Search/><input placeholder="Rechercher…"/>
          </div>
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr>
              <th>Utilisateur</th><th>Rôle plateforme</th><th>Département</th>
              <th>2FA</th><th>Dernière connexion</th><th>Statut</th><th></th>
            </tr></thead>
            <tbody>
              {list.map(u => {
                const e = empById(u.empId);
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="ev-name">
                        <div className="avatar" data-bg={empBgIdx(e.id)}>{initials(e)}</div>
                        <div className="meta">
                          <div style={{fontWeight:500}}>{fullName(e)}</div>
                          <small>{e.email}</small>
                        </div>
                      </div>
                    </td>
                    <td><span className={ROLE_LABELS[u.role].cls}>{ROLE_LABELS[u.role].label}</span></td>
                    <td>{e.dept}</td>
                    <td>
                      {u.twofa ? (
                        <span className="pill pos"><Ico.Check/>Activée</span>
                      ) : (
                        <span className="pill"><Ico.X/>Inactive</span>
                      )}
                    </td>
                    <td className="mono muted" style={{fontSize:12}}>{u.lastLogin}</td>
                    <td>
                      <span className={`pill ${u.active?'pos':'danger'}`}>
                        <span className="dot"></span>{u.active?'Actif':'Désactivé'}
                      </span>
                    </td>
                    <td>
                      <div className="hover-actions row" style={{gap:4}}>
                        <button className="btn sm ghost"><Ico.Edit/></button>
                        <button className="btn sm ghost"><Ico.Lock/></button>
                        <button className="btn sm ghost"><Ico.More/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="table-foot">
          <div>{list.length} utilisateur(s) affiché(s)</div>
          <div className="pag"><button disabled>‹</button><button className="active">1</button><button>›</button></div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 4) AUDIT INTERNE (filtré sur l'entreprise courante)
// ═════════════════════════════════════════════════════════════════════
function ScreenAdminAudit() {
  // Filter audit logs : keep only Atlas Tech-related actions (non SUPER_ADMIN)
  const tenantAudit = AUDIT.filter(a => a.role !== 'SUPER_ADMIN');
  const [action, setAction] = React.useState('all');
  const list = tenantAudit.filter(a => action === 'all' || a.action === action);
  const actionPill = {
    CREATE: 'pos', UPDATE: 'info', DELETE: 'danger', VALIDATE: 'primary',
    APPROVE: 'pos', REJECT: 'danger', LOGIN: '', LOGOUT: '', VIEW: '',
    EXPORT: 'info', SUSPEND: 'warn',
  };
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs"><strong>Administration</strong> <span className="sep">/</span> Journal d'audit interne</div>
          <h1 className="page-title">Traçabilité — Atlas Tech</h1>
          <div className="page-sub">Toutes les actions sur les données de votre entreprise · conservation 7 ans</div>
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
          <div>{list.length} entrée(s) — visibilité limitée à votre entreprise</div>
          <div className="pag"><button disabled>‹</button><button className="active">1</button><button>2</button><button>›</button></div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ScreenAdminDashboard, ScreenCompany, ScreenUsers, ScreenAdminAudit,
  TENANT_USERS, ROLE_LABELS,
});
