// PaieZone RH — App shell, top nav, role switcher, modals, tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primary": "#4f46e5",
  "density": "regular",
  "showChatbot": true
}/*EDITMODE-END*/;

// Role configurations — 4 rôles : Super Admin (SaaS), Admin (entreprise),
// RH/Comptable (paie + employés), Employé (self-service).
// Note : le Super Admin n'a PAS accès à l'audit des entreprises (confidentialité).
const ROLES = {
  super: {
    label: 'Super Administrateur',
    sub: 'admin@paiezone.tn',
    initials: 'PZ',
    color: 'super',
    tabs: [
      { id: 'saas-dash', label: 'Tableau de bord', icon: 'Home' },
      { id: 'tenants', label: 'Entreprises clientes', icon: 'Building' },
      { id: 'regulatory', label: 'Réglementaire', icon: 'Shield' },
    ],
    default: 'saas-dash',
  },
  admin: {
    label: 'Admin entreprise — Atlas Tech',
    sub: 'mehdi.trabelsi@atlas-tech.tn',
    initials: 'MT',
    color: 'admin',
    tabs: [
      { id: 'admin-dash', label: 'Tableau de bord', icon: 'Home' },
      { id: 'rh-employees', label: 'Employés', icon: 'Users' },
      { id: 'rh-structure', label: 'Structure', icon: 'Briefcase' },
      { id: 'rh-payroll', label: 'Paie', icon: 'Cash' },
      { id: 'rh-finances', label: 'Finances RH', icon: 'Wallet', badge: 2 },
      { id: 'rh-leaves', label: 'Congés', icon: 'Calendar', badge: 4 },
      { id: 'admin-company', label: 'Mon entreprise', icon: 'Building' },
      { id: 'admin-users', label: 'Utilisateurs', icon: 'Shield' },
      { id: 'admin-audit', label: 'Audit', icon: 'History' },
    ],
    default: 'admin-dash',
  },
  rh: {
    label: 'RH / Comptable — Atlas Tech',
    sub: 'leila.chaabane@atlas-tech.tn',
    initials: 'LC',
    color: 'rh',
    tabs: [
      { id: 'rh-dash', label: 'Tableau de bord', icon: 'Home' },
      { id: 'rh-employees', label: 'Employés', icon: 'Users', badge: null },
      { id: 'rh-structure', label: 'Structure', icon: 'Briefcase' },
      { id: 'rh-payroll', label: 'Paie', icon: 'Cash' },
      { id: 'rh-finances', label: 'Finances RH', icon: 'Wallet', badge: 2 },
      { id: 'rh-leaves', label: 'Congés', icon: 'Calendar', badge: 4 },
    ],
    default: 'rh-dash',
  },
  emp: {
    label: 'Mehdi Ben Salah',
    sub: 'Lead Développeur · Engineering',
    initials: 'MB',
    color: 'emp',
    tabs: [
      { id: 'emp-dash', label: 'Tableau de bord', icon: 'Home' },
      { id: 'emp-leaves', label: 'Mes congés', icon: 'Calendar' },
      { id: 'emp-requests', label: 'Mes demandes', icon: 'Doc' },
    ],
    default: 'emp-dash',
  },
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [role, setRole] = React.useState('rh');
  const [page, setPage] = React.useState(ROLES['rh'].default);
  const [roleMenu, setRoleMenu] = React.useState(false);
  const [modal, setModal] = React.useState(null);

  // Apply tweaks
  React.useEffect(() => {
    document.documentElement.style.setProperty('--primary', t.primary);
    // derive primary-2 (slightly darker) and primary-soft
    document.documentElement.dataset.density = t.density;
  }, [t.primary, t.density]);

  const switchRole = (r) => {
    setRole(r);
    setPage(ROLES[r].default);
    setRoleMenu(false);
  };

  const nav = (id) => setPage(id);

  const cfg = ROLES[role];

  // Close role menu on outside click
  React.useEffect(() => {
    if (!roleMenu) return;
    const close = () => setRoleMenu(false);
    setTimeout(() => window.addEventListener('click', close), 0);
    return () => window.removeEventListener('click', close);
  }, [roleMenu]);

  return (
    <div className="app">
      <header className="topnav">
        <div className="brand">
          <div className="brand-mark">PZ</div>
          <div className="brand-name">paie<span>zone</span> RH</div>
        </div>

        <nav className="nav-tabs">
          {cfg.tabs.map(tab => {
            const I = Ico[tab.icon] || Ico.Home;
            return (
              <button key={tab.id} className={`nav-tab ${page === tab.id ? 'active' : ''}`} onClick={() => nav(tab.id)}>
                <span className="ico"><I/></span>
                {tab.label}
                {tab.badge && <span className="badge">{tab.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="top-right">
          <div className="topbar-search">
            <Ico.Search/>
            <input placeholder="Rechercher…"/>
            <span className="kbd">⌘K</span>
          </div>
          <button className="icon-btn"><Ico.Bell/><span className="dot"/></button>
          <button className="icon-btn"><Ico.Globe/></button>
          <button className="icon-btn"><Ico.CircleHelp/></button>
          <button className="role-pill" onClick={(e) => { e.stopPropagation(); setRoleMenu(v => !v); }}>
            <span className={`role-dot ${cfg.color}`}/>
            <span data-screen-label={`role-${role}`}>{role === 'super' ? 'Super Admin' : role === 'admin' ? 'Admin' : role === 'rh' ? 'RH / Comptable' : 'Employé'}</span>
            <span className="role-caret"><Ico.Caret/></span>
            <div className="avatar sm">{cfg.initials}</div>
          </button>
        </div>
      </header>

      {roleMenu && (
        <div className="role-menu" onClick={e => e.stopPropagation()}>
          <div style={{padding:'10px 12px 6px',fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--muted)'}}>Changer de rôle (démo)</div>
          <button className={`role-opt ${role==='super'?'active':''}`} onClick={() => switchRole('super')}>
            <div className="avatar" data-bg="5"><Ico.Server/></div>
            <div>
              <div className="role-title">Super Administrateur</div>
              <div className="role-sub">SaaS · tenants & taux légaux</div>
            </div>
            {role === 'super' && <span className="role-check"><Ico.Check/></span>}
          </button>
          <button className={`role-opt ${role==='admin'?'active':''}`} onClick={() => switchRole('admin')}>
            <div className="avatar" data-bg="2"><Ico.Shield/></div>
            <div>
              <div className="role-title">Admin entreprise</div>
              <div className="role-sub">Accès complet : RH + accès + audit</div>
            </div>
            {role === 'admin' && <span className="role-check"><Ico.Check/></span>}
          </button>
          <button className={`role-opt ${role==='rh'?'active':''}`} onClick={() => switchRole('rh')}>
            <div className="avatar" data-bg="4"><Ico.Briefcase/></div>
            <div>
              <div className="role-title">RH / Comptable</div>
              <div className="role-sub">Paie · employés · congés</div>
            </div>
            {role === 'rh' && <span className="role-check"><Ico.Check/></span>}
          </button>
          <button className={`role-opt ${role==='emp'?'active':''}`} onClick={() => switchRole('emp')}>
            <div className="avatar" data-bg="3"><Ico.User/></div>
            <div>
              <div className="role-title">Employé (self-service)</div>
              <div className="role-sub">Mehdi Ben Salah · Engineering</div>
            </div>
            {role === 'emp' && <span className="role-check"><Ico.Check/></span>}
          </button>
          <div className="role-opt-sep"/>
          <div style={{padding:'8px 12px 6px',fontSize:11.5,color:'var(--muted)',lineHeight:1.5}}>
            En production, le rôle est défini par l'authentification.
          </div>
        </div>
      )}

      <main data-screen-label={`page-${role}-${page}`}>
        {/* SUPER ADMIN — pas d'accès à l'audit des entreprises */}
        {page === 'saas-dash' && <ScreenSaasDashboard/>}
        {page === 'tenants' && <ScreenTenants onOpenModal={setModal}/>}
        {page === 'regulatory' && <ScreenRegulatory/>}
        {/* ADMIN entreprise */}
        {page === 'admin-dash' && <ScreenAdminDashboard onNav={nav} onOpenModal={setModal}/>}
        {page === 'admin-company' && <ScreenCompany/>}
        {page === 'admin-users' && <ScreenUsers onOpenModal={setModal}/>}
        {page === 'admin-audit' && <ScreenAdminAudit/>}
        {/* RH / Comptable */}
        {page === 'rh-dash' && <ScreenRHDashboard onOpenModal={setModal} onNav={nav}/>}
        {page === 'rh-employees' && <ScreenEmployees onOpenModal={setModal}/>}
        {page === 'rh-structure' && <ScreenStructure/>}
        {page === 'rh-payroll' && <ScreenPayroll onOpenModal={setModal}/>}
        {page === 'rh-finances' && <ScreenFinances/>}
        {page === 'rh-leaves' && <ScreenLeaves/>}
        {/* EMPLOYÉ */}
        {page === 'emp-dash' && <ScreenEmpDashboard onOpenModal={setModal}/>}
        {page === 'emp-leaves' && <ScreenEmpLeaves onOpenModal={setModal}/>}
        {page === 'emp-requests' && <ScreenEmpRequests onOpenModal={setModal}/>}
      </main>

      {modal && <Modal kind={modal} onClose={() => setModal(null)}/>}

      {t.showChatbot && <Chatbot role={role}/>}

      <TweaksPanel>
        <TweakSection label="Rôle de démo"/>
        <TweakSelect label="Vue active" value={role} options={[
          {value:'super',label:'Super Admin (SaaS)'},
          {value:'admin',label:'Admin entreprise'},
          {value:'rh',label:'RH / Comptable'},
          {value:'emp',label:'Employé'},
        ]} onChange={(v) => switchRole(v)}/>
        <TweakSection label="Apparence"/>
        <TweakColor label="Couleur primaire" value={t.primary}
          options={['#4f46e5','#0ea5e9','#10b981','#dc2626','#0f172a']}
          onChange={(v) => setTweak('primary', v)}/>
        <TweakRadio label="Densité" value={t.density} options={[
          {value:'compact',label:'Compact'},{value:'regular',label:'Normal'},{value:'comfy',label:'Aéré'},
        ]} onChange={(v) => setTweak('density', v)}/>
        <TweakSection label="Modules"/>
        <TweakToggle label="Assistant IA (RAG)" value={t.showChatbot} onChange={(v) => setTweak('showChatbot', v)}/>
      </TweaksPanel>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// MODALS
// ═════════════════════════════════════════════════════════════════════
function Modal({ kind, onClose }) {
  if (kind === 'new-leave') return <ModalNewLeave onClose={onClose}/>;
  if (kind === 'new-advance') return <ModalNewAdvance onClose={onClose}/>;
  if (kind === 'new-doc') return <ModalNewDoc onClose={onClose}/>;
  if (kind === 'new-employee') return <ModalNewEmployee onClose={onClose}/>;
  if (kind === 'new-tenant') return <ModalNewTenant onClose={onClose}/>;
  if (kind === 'run-payroll') return <ModalRunPayroll onClose={onClose}/>;
  if (kind === 'invite-user') return <ModalInviteUser onClose={onClose}/>;
  return null;
}

function ModalInviteUser({ onClose }) {
  const [sent, setSent] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState('EMPLOYE');
  const ROLE_INFO = {
    ADMIN: { label: 'Administrateur', desc: 'Accès complet : entreprise, utilisateurs, audit, paie, employés.', tone: 'primary' },
    RH_COMPTABLE: { label: 'RH / Comptable', desc: 'Gère la paie, les employés, les congés et les avances.', tone: 'info' },
    EMPLOYE: { label: 'Employé', desc: 'Self-service : son profil, ses bulletins, ses demandes.', tone: '' },
  };
  if (sent) return (
    <ModalShell title="Invitation envoyée ✓" sub="L'utilisateur recevra un email pour activer son compte" onClose={onClose}
      footer={<button className="btn primary" onClick={onClose}>Terminer</button>}>
      <div style={{padding:'20px 0',textAlign:'center'}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:'var(--pos-soft)',color:'var(--pos)',display:'grid',placeItems:'center',margin:'0 auto 14px'}}>
          <Ico.Mail style={{width:28,height:28}}/>
        </div>
        <div style={{fontSize:15,fontWeight:500}}>Email envoyé à <span className="mono">nouveau@atlas-tech.tn</span></div>
        <div className="muted" style={{fontSize:13,marginTop:6}}>Le lien d'activation est valide 7 jours.</div>
      </div>
    </ModalShell>
  );
  return (
    <ModalShell size="lg" title="Inviter un utilisateur" sub="Création du compte + email d'invitation" onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose}>Annuler</button>
        <button className="btn primary" onClick={() => setSent(true)}><Ico.Mail/>Envoyer l'invitation</button>
      </>}>
      <div className="grid c2">
        <div className="field"><label>Prénom</label><input className="input" placeholder="Ex. Sirine"/></div>
        <div className="field"><label>Nom</label><input className="input" placeholder="Ex. Mansouri"/></div>
        <div className="field" style={{gridColumn:'1/-1'}}>
          <label>Email professionnel</label>
          <input className="input" type="email" placeholder="prenom.nom@atlas-tech.tn"/>
          <div className="hint">L'email d'invitation sera envoyé à cette adresse.</div>
        </div>
      </div>
      <div className="field">
        <label>Rôle plateforme</label>
        <div className="col" style={{gap:6,marginTop:4}}>
          {Object.entries(ROLE_INFO).map(([k, v]) => (
            <button key={k} type="button" onClick={() => setSelectedRole(k)}
              style={{textAlign:'left',padding:'10px 12px',border:`1px solid ${selectedRole===k?'var(--primary)':'var(--line)'}`,borderRadius:8,background: selectedRole===k?'var(--primary-soft)':'var(--surface)',display:'flex',alignItems:'center',gap:10}}>
              <span style={{width:16,height:16,borderRadius:'50%',border:`5px solid ${selectedRole===k?'var(--primary)':'var(--line-2)'}`,background:'#fff',flexShrink:0}}/>
              <div style={{flex:1}}>
                <div className="row" style={{gap:8,alignItems:'center'}}>
                  <span style={{fontSize:13.5,fontWeight:600}}>{v.label}</span>
                  <span className={`pill ${v.tone}`} style={{fontSize:10.5}}>{k}</span>
                </div>
                <div className="muted" style={{fontSize:12,marginTop:2}}>{v.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="row" style={{padding:'10px 12px',background:'var(--primary-soft)',borderRadius:8,fontSize:12.5,color:'var(--primary-ink)',gap:8}}>
        <Ico.Shield/>
        <span>L'utilisateur devra activer son compte et choisir un mot de passe via le lien envoyé par email (valide 7 jours).</span>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, sub, onClose, footer, children, size }) {
  return (
    <div className="modal-back" onClick={onClose}>
      <div className={`modal ${size||''}`} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{title}</div>
            <div className="modal-sub">{sub}</div>
          </div>
          <button className="btn ghost modal-x" onClick={onClose}><Ico.X/></button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-foot">{footer}</div>
      </div>
    </div>
  );
}

function ModalNewLeave({ onClose }) {
  const [submitted, setSubmitted] = React.useState(false);
  if (submitted) return (
    <ModalShell title="Demande envoyée ✓" sub="Votre responsable RH a été notifié." onClose={onClose}
      footer={<button className="btn primary" onClick={onClose}>Terminer</button>}>
      <div style={{padding:'20px 0',textAlign:'center'}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:'var(--pos-soft)',color:'var(--pos)',display:'grid',placeItems:'center',margin:'0 auto 14px'}}>
          <Ico.Check style={{width:28,height:28}}/>
        </div>
        <div style={{fontSize:15,fontWeight:500}}>Référence : <span className="mono">LV-2815</span></div>
        <div className="muted" style={{fontSize:13,marginTop:6}}>Décision attendue sous 48h ouvrées.</div>
      </div>
    </ModalShell>
  );
  return (
    <ModalShell title="Nouvelle demande de congé" sub="Renseignez les dates et le motif" onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose}>Annuler</button>
        <button className="btn primary" onClick={()=>setSubmitted(true)}>Soumettre la demande</button>
      </>}>
      <div className="field">
        <label>Type d'absence</label>
        <select className="input" defaultValue="cp">
          <option value="cp">Congés payés (CP)</option>
          <option value="rtt">RTT</option>
          <option value="mal">Maladie</option>
          <option value="exc">Congé exceptionnel</option>
        </select>
      </div>
      <div className="grid c2">
        <div className="field"><label>Date de début</label><input className="input" type="date" defaultValue="2026-06-02"/></div>
        <div className="field"><label>Date de fin</label><input className="input" type="date" defaultValue="2026-06-06"/></div>
      </div>
      <div className="field"><label>Motif (optionnel)</label><textarea className="input" placeholder="Précisez si nécessaire…"></textarea></div>
      <div style={{padding:'10px 12px',background:'var(--primary-soft)',borderRadius:8,fontSize:12.5,color:'var(--primary-ink)'}}>
        <strong>5 jours ouvrés</strong> seront déduits de votre solde de congés payés (solde actuel : 20 j).
      </div>
    </ModalShell>
  );
}

function ModalNewAdvance({ onClose }) {
  const [submitted, setSubmitted] = React.useState(false);
  if (submitted) return (
    <ModalShell title="Demande envoyée ✓" sub="Votre responsable RH a été notifié." onClose={onClose}
      footer={<button className="btn primary" onClick={onClose}>Terminer</button>}>
      <div style={{padding:'20px 0',textAlign:'center'}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:'var(--pos-soft)',color:'var(--pos)',display:'grid',placeItems:'center',margin:'0 auto 14px'}}>
          <Ico.Check style={{width:28,height:28}}/>
        </div>
        <div style={{fontSize:15,fontWeight:500}}>Référence : <span className="mono">AV-119</span></div>
        <div className="muted" style={{fontSize:13,marginTop:6}}>Décision attendue sous 48h ouvrées.</div>
      </div>
    </ModalShell>
  );
  return (
    <ModalShell title="Demander une avance sur salaire" sub="Maximum 50% du salaire net du mois" onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose}>Annuler</button>
        <button className="btn primary" onClick={()=>setSubmitted(true)}>Soumettre la demande</button>
      </>}>
      <div className="field">
        <label>Montant demandé</label>
        <div className="input row" style={{padding:'0 12px'}}>
          <input type="number" defaultValue="500" style={{flex:1,height:'100%',border:0,outline:0,fontSize:16,fontFamily:'JetBrains Mono, monospace',fontWeight:500}}/>
          <span className="muted">TND</span>
        </div>
        <div className="hint">Maximum : 1 391 TND (50% du net)</div>
      </div>
      <div className="field">
        <label>Modalités de remboursement</label>
        <select className="input">
          <option>1 mois — prélèvement intégral</option>
          <option selected>2 mois — 50% × 2</option>
          <option>3 mois — 33,3% × 3</option>
        </select>
      </div>
      <div className="field"><label>Motif</label><textarea className="input" placeholder="Précisez la raison de votre demande…"></textarea></div>
      <div style={{padding:'10px 12px',background:'var(--warn-soft)',borderRadius:8,fontSize:12.5,color:'var(--warn-ink)'}}>
        ⚠️ Les avances sont déduites de votre salaire net selon les modalités choisies.
      </div>
    </ModalShell>
  );
}

function ModalNewDoc({ onClose }) {
  return (
    <ModalShell title="Demander un document" sub="Génération automatique sous 24h" onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose}>Annuler</button>
        <button className="btn primary" onClick={onClose}>Demander</button>
      </>}>
      <div className="field">
        <label>Type de document</label>
        <select className="input">
          <option>Attestation de travail</option>
          <option>Attestation de salaire</option>
          <option>Certificat de présence</option>
          <option>Solde de tout compte</option>
        </select>
      </div>
      <div className="field"><label>Motif / destinataire</label><input className="input" placeholder="Ex. demande de visa, banque…"/></div>
    </ModalShell>
  );
}

function ModalNewEmployee({ onClose }) {
  return (
    <ModalShell size="lg" title="Ajouter un employé" sub="Création du dossier + invitation par email" onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose}>Annuler</button>
        <button className="btn primary" onClick={onClose}><Ico.Mail/>Créer et envoyer l'invitation</button>
      </>}>
      <div className="grid c2">
        <div className="field"><label>Prénom</label><input className="input" placeholder="Mehdi"/></div>
        <div className="field"><label>Nom</label><input className="input" placeholder="Ben Salah"/></div>
        <div className="field"><label>Email professionnel</label><input className="input" type="email" placeholder="prenom.nom@atlas-tech.tn"/></div>
        <div className="field"><label>Téléphone</label><input className="input" placeholder="+216 ..."/></div>
        <div className="field"><label>Département</label>
          <select className="input">{DEPARTMENTS.map(d => <option key={d.id}>{d.name}</option>)}</select>
        </div>
        <div className="field"><label>Type de contrat</label>
          <select className="input"><option>CDI</option><option>CDD</option><option>CIVP</option><option>KARAMA</option></select>
        </div>
        <div className="field"><label>Salaire de base (TND)</label><input className="input" type="number" placeholder="2000"/></div>
        <div className="field"><label>Date d'embauche</label><input className="input" type="date" defaultValue="2026-05-15"/></div>
      </div>
    </ModalShell>
  );
}

function ModalNewTenant({ onClose }) {
  return (
    <ModalShell size="lg" title="Nouvelle entreprise cliente" sub="Provisioning du schéma multi-tenant" onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose}>Annuler</button>
        <button className="btn primary" onClick={onClose}>Créer le tenant</button>
      </>}>
      <div className="grid c2">
        <div className="field"><label>Raison sociale</label><input className="input" placeholder="Atlas Tech SARL"/></div>
        <div className="field"><label>Nom commercial</label><input className="input" placeholder="Atlas Tech"/></div>
        <div className="field"><label>Matricule fiscal</label><input className="input" placeholder="1234567/A"/></div>
        <div className="field"><label>Identifiant CNSS</label><input className="input"/></div>
        <div className="field"><label>Ville</label><input className="input"/></div>
        <div className="field"><label>Téléphone</label><input className="input"/></div>
        <div className="field"><label>Formule d'abonnement</label>
          <select className="input"><option>STARTER (Essai)</option><option>PME</option><option selected>BUSINESS</option><option>ENTERPRISE</option></select>
        </div>
        <div className="field"><label>Schéma BD (auto)</label><input className="input mono" defaultValue="atlas_tech" readOnly/></div>
      </div>
    </ModalShell>
  );
}

function ModalRunPayroll({ onClose }) {
  const [step, setStep] = React.useState(0); // 0 setup, 1 running, 2 done
  React.useEffect(() => {
    if (step === 1) {
      const t1 = setTimeout(() => setStep(2), 2200);
      return () => clearTimeout(t1);
    }
  }, [step]);
  return (
    <ModalShell title="Lancer le calcul de paie" sub="Mai 2026 · 42 employés" onClose={onClose}
      footer={step === 0 ? <>
        <button className="btn" onClick={onClose}>Annuler</button>
        <button className="btn primary" onClick={() => setStep(1)}><Ico.Sparkles/>Calculer la paie</button>
      </> : step === 2 ? <button className="btn primary" onClick={onClose}>Terminer</button> : null}>
      {step === 0 && (
        <>
          <div className="field"><label>Période</label><input className="input" value="Mai 2026" readOnly/></div>
          <div className="field"><label>Date de paiement</label><input className="input" type="date" defaultValue="2026-05-31"/></div>
          <div style={{padding:14,background:'var(--surface-2)',borderRadius:10}}>
            <div style={{fontSize:12.5,fontWeight:500,marginBottom:10}}>Le calcul inclura :</div>
            <div className="col" style={{gap:6}}>
              {[
                '42 bulletins de paie (CDI, CDD, CIVP)',
                'Cotisations sociales (CNSS, CAVIS, CSS)',
                'Impôt sur le revenu (IRPP — barème LF 2026)',
                'Charges patronales (CNSS 16,57%, TFP, Foprolos)',
                '3 primes variables validées',
              ].map((s, i) => (
                <div key={i} className="row" style={{gap:8,fontSize:12.5}}>
                  <Ico.Check style={{color:'var(--pos)'}}/>{s}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {step === 1 && (
        <div style={{padding:'30px 0',textAlign:'center'}}>
          <div className="chat-typing" style={{justifyContent:'center',marginBottom:14}}><i style={{background:'var(--primary)'}}/><i style={{background:'var(--primary)'}}/><i style={{background:'var(--primary)'}}/></div>
          <div style={{fontSize:15,fontWeight:500}}>Calcul en cours…</div>
          <div className="muted" style={{fontSize:13,marginTop:6}}>Application des barèmes CNSS et IRPP sur 42 bulletins.</div>
          <div className="progress" style={{margin:'18px auto 0',maxWidth:280}}><i style={{width:'68%'}}/></div>
        </div>
      )}
      {step === 2 && (
        <div style={{padding:'10px 0'}}>
          <div className="row" style={{gap:14,padding:'12px 14px',background:'var(--pos-soft)',borderRadius:10}}>
            <div style={{width:42,height:42,borderRadius:'50%',background:'var(--pos)',color:'#fff',display:'grid',placeItems:'center'}}>
              <Ico.Check style={{width:18,height:18}}/>
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:'var(--pos-ink)'}}>Calcul terminé avec succès</div>
              <div style={{fontSize:12.5,color:'var(--pos-ink)',opacity:0.85}}>42 bulletins générés en 1,8 s</div>
            </div>
          </div>
          <div className="grid c3" style={{marginTop:14}}>
            <div><div className="muted" style={{fontSize:11}}>BRUT</div><div style={{fontSize:18,fontWeight:600,fontFamily:'JetBrains Mono, monospace'}}>{fmtTND(96400)}</div></div>
            <div><div className="muted" style={{fontSize:11}}>NET</div><div style={{fontSize:18,fontWeight:600,fontFamily:'JetBrains Mono, monospace'}}>{fmtTND(71200)}</div></div>
            <div><div className="muted" style={{fontSize:11}}>COÛT EMP.</div><div style={{fontSize:18,fontWeight:600,fontFamily:'JetBrains Mono, monospace'}}>{fmtTND(119510)}</div></div>
          </div>
          <div className="muted" style={{fontSize:12.5,marginTop:14}}>Vous pouvez maintenant procéder à la validation des bulletins.</div>
        </div>
      )}
    </ModalShell>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
