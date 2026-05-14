// PaieZone RH — ADMIN/RH screens
// 1) Tableau de bord RH  2) Employés  3) Structure  4) Paie
// 5) Finances RH (avances + primes)  6) Congés

// ═════════════════════════════════════════════════════════════════════
// 1) TABLEAU DE BORD RH
// ═════════════════════════════════════════════════════════════════════
function ScreenRHDashboard({ onOpenModal, onNav }) {
  const headcount = EMPLOYEES.length;
  const pendingLeaves = LEAVES.filter(l => l.status === 'pending').length;
  const pendingAdvances = ADVANCES.filter(a => a.status === 'pending').length;
  const currentPayroll = PAYROLL_PERIODS[0];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs"><strong>Atlas Tech</strong> <span className="sep">/</span> Tableau de bord</div>
          <h1 className="page-title">Bonjour Leila 👋</h1>
          <div className="page-sub">Mercredi 14 mai 2026 · {headcount} collaborateurs · {pendingLeaves + pendingAdvances} demandes en attente</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Ico.Download/>Exporter</button>
          <button className="btn primary" onClick={() => onOpenModal('new-employee')}><Ico.Plus/>Ajouter un employé</button>
        </div>
      </div>

      {/* Hero — current payroll workflow */}
      <PayrollHero period={currentPayroll} onOpen={() => onNav('rh-payroll')}/>

      <div className="stat-grid cols-4">
        <div className="stat">
          <div className="stat-head"><span className="ico"><Ico.Users/></span>Effectifs</div>
          <div className="stat-val">{headcount}</div>
          <div className="stat-foot">
            <span className="stat-delta"><Ico.Up/>+2</span>
            <span className="stat-foot-text">ce mois</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-head"><span className="ico info"><Ico.Wallet/></span>Masse salariale</div>
          <div className="stat-val">{fmtTND(96400)}</div>
          <div className="stat-foot">
            <span className="stat-delta"><Ico.Up/>+1.7%</span>
            <span className="stat-foot-text">vs Avril</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-head"><span className="ico warn"><Ico.Calendar/></span>Congés à valider</div>
          <div className="stat-val">{pendingLeaves}</div>
          <div className="stat-foot">
            <span className="stat-foot-text">{LEAVES.filter(l => l.status === 'pending').reduce((s,l)=>s+l.days,0)} jours au total</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-head"><span className="ico danger"><Ico.Cash/></span>Avances en attente</div>
          <div className="stat-val">{pendingAdvances}</div>
          <div className="stat-foot">
            <span className="stat-foot-text">{fmtTND(ADVANCES.filter(a=>a.status==='pending').reduce((s,a)=>s+a.amount,0))} à valider</span>
          </div>
        </div>
      </div>

      <div className="grid c2-21">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Masse salariale — 6 mois</div>
              <div className="card-sub">Salaires bruts + charges patronales</div>
            </div>
            <div className="legend right">
              <span><span className="sw" style={{background:'#4f46e5'}}></span>Brut</span>
              <span><span className="sw" style={{background:'#c7d2fe'}}></span>Charges</span>
            </div>
          </div>
          <div className="card-body"><BarChart data={RH_PAYROLL_SERIES}/></div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Demandes en attente</div>
            <button className="btn sm ghost" onClick={() => onNav('rh-leaves')}>Tout voir <Ico.Arrow/></button>
          </div>
          <div className="card-body flush" style={{padding:'4px 12px 12px'}}>
            {LEAVES.filter(l => l.status === 'pending').slice(0, 4).map(l => {
              const e = empById(l.empId);
              return (
                <div key={l.id} className="row" style={{padding:'10px 8px',borderTop:'1px solid var(--line)',gap:10}}>
                  <div className="avatar sm" data-bg={empBgIdx(e.id)}>{initials(e)}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500}}>{fullName(e)}</div>
                    <div className="muted" style={{fontSize:11.5}}>{l.type} · {l.days}j · {l.from}</div>
                  </div>
                  <div className="row" style={{gap:4}}>
                    <button className="btn sm pos" style={{width:30,padding:0}}><Ico.Check/></button>
                    <button className="btn sm danger" style={{width:30,padding:0}}><Ico.X/></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid c2">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Calendrier d'équipe — Mai 2026</div>
            <button className="btn sm ghost" onClick={() => onNav('rh-leaves')}>Voir détaillé <Ico.Arrow/></button>
          </div>
          <div className="card-body">
            <div className="cal">
              {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d => <div key={d} className="cal-h">{d}</div>)}
              {CAL_MAY.weeks.flat().map((c, i) => (
                <div key={i} className={`cal-c ${c.dim?'dim':''} ${c.today?'today':''} ${c.has?'has':''} ${c.warn?'warn':''} ${c.danger?'danger':''} ${c.weekend?'weekend':''}`}>{c.n}</div>
              ))}
            </div>
            <div className="legend" style={{marginTop:14}}>
              <span><span className="sw" style={{background:'#4f46e5'}}></span>Congés payés</span>
              <span><span className="sw" style={{background:'#f59e0b'}}></span>Maladie</span>
              <span><span className="sw" style={{background:'#ef4444'}}></span>Férié</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Activité récente</div>
            <button className="btn sm ghost">Tout voir <Ico.Arrow/></button>
          </div>
          <div className="card-body" style={{padding:'0 20px 14px'}}>
            {ACTIVITY.map((a, i) => {
              const I = Ico[a.icon] || Ico.Doc;
              return (
                <div key={i} className="tl-item">
                  <div className="tl-dot"><I/></div>
                  <div>
                    <div className="tl-text">{a.text}</div>
                    <div className="tl-time">{a.date} · {a.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PayrollHero({ period, onOpen }) {
  const stepIdx = period.status === 'DRAFT' ? 1 : period.status === 'CALCULATED' ? 2 : 3;
  return (
    <div className="card" style={{background:'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',color:'#fff',border:0,padding:24,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:-40,right:-40,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle, rgba(124,58,237,0.35), transparent 70%)',pointerEvents:'none'}}/>
      <div className="row" style={{justifyContent:'space-between',alignItems:'flex-start',position:'relative'}}>
        <div>
          <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'0.1em',opacity:0.65,fontWeight:500,marginBottom:8}}>Période de paie en cours</div>
          <h2 style={{fontSize:24,fontWeight:600,letterSpacing:'-0.02em',margin:'0 0 6px'}}>{period.label}</h2>
          <div style={{opacity:0.75,fontSize:13.5}}>
            {period.employees} bulletins · Brut prévu <strong style={{color:'#fff',fontWeight:600}}>{fmtTND(period.gross)}</strong> · Net <strong style={{color:'#fff',fontWeight:600}}>{fmtTND(period.net)}</strong>
          </div>
        </div>
        <button className="btn lg" style={{background:'#fff',color:'#312e81',borderColor:'transparent'}} onClick={onOpen}>
          Ouvrir la paie <Ico.Arrow/>
        </button>
      </div>
      <div className="row" style={{marginTop:20,gap:8,position:'relative'}}>
        {['Ouverture', 'Calcul auto', 'Validation', 'Verrouillage'].map((s, i) => (
          <div key={i} style={{flex:1,padding:'10px 14px',borderRadius:8,background: i < stepIdx ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',border:`1px solid ${i === stepIdx-1 ? 'rgba(255,255,255,0.45)' : 'transparent'}`}}>
            <div style={{fontSize:11,opacity:0.7}}>Étape {i+1}</div>
            <div style={{fontSize:13.5,fontWeight:500,marginTop:2}}>
              {i < stepIdx-1 ? <span style={{color:'#4ade80'}}>✓ </span> : i === stepIdx-1 ? '◆ ' : ''}{s}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 2) EMPLOYÉS — annuaire + détail
// ═════════════════════════════════════════════════════════════════════
function ScreenEmployees({ onOpenModal }) {
  const [selected, setSelected] = React.useState(null);
  const [dept, setDept] = React.useState('Tous');
  const [search, setSearch] = React.useState('');
  const depts = ['Tous', ...new Set(EMPLOYEES.map(e => e.dept))];
  const list = EMPLOYEES.filter(e => {
    if (dept !== 'Tous' && e.dept !== dept) return false;
    if (search && !fullName(e).toLowerCase().includes(search.toLowerCase()) && !e.matricule.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs"><strong>Atlas Tech</strong> <span className="sep">/</span> Capital humain <span className="sep">/</span> Employés</div>
          <h1 className="page-title">Annuaire</h1>
          <div className="page-sub">{EMPLOYEES.length} collaborateurs actifs · {DEPARTMENTS.length} départements</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Ico.Upload/>Importer</button>
          <button className="btn primary" onClick={() => onOpenModal('new-employee')}><Ico.Plus/>Nouvel employé</button>
        </div>
      </div>

      <div className="card">
        <div className="table-tools">
          {depts.slice(0, 6).map(d => (
            <button key={d} className={`filter-chip ${dept===d?'active':''}`} onClick={()=>setDept(d)}>
              {d} <span className="count">{d==='Tous' ? EMPLOYEES.length : EMPLOYEES.filter(e=>e.dept===d).length}</span>
            </button>
          ))}
          <div className="input-pill" style={{marginLeft:'auto',width:240}}>
            <Ico.Search/>
            <input placeholder="Nom, matricule, email…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <button className="btn sm"><Ico.Filter/>Filtres</button>
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr>
              <th>Matricule</th><th>Employé</th><th>Département / Poste</th>
              <th>Contrat</th><th>Date d'embauche</th><th className="num">Salaire</th><th></th>
            </tr></thead>
            <tbody>
              {list.map(e => (
                <tr key={e.id} onClick={() => setSelected(e)} style={{cursor:'pointer'}}>
                  <td className="mono" style={{fontSize:12}}>{e.matricule}</td>
                  <td>
                    <div className="ev-name">
                      <div className="avatar" data-bg={empBgIdx(e.id)}>{initials(e)}</div>
                      <div className="meta">
                        <div style={{fontWeight:500}}>{fullName(e)}</div>
                        <small>{e.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{fontWeight:500}}>{e.role}</div>
                    <div className="muted" style={{fontSize:11.5}}>{e.dept}</div>
                  </td>
                  <td>
                    <span className={`pill ${e.contract==='CDI'?'pos':e.contract==='CDD'?'info':e.contract==='CIVP'?'warn':''}`}>{e.contract}</span>
                  </td>
                  <td className="mono" style={{fontSize:12}}>{new Date(e.hireDate).toLocaleDateString('fr-FR')}</td>
                  <td className="num">{fmtTND(e.salary)}</td>
                  <td>
                    <div className="hover-actions row" style={{gap:4}}>
                      <button className="btn sm ghost" onClick={(ev)=>{ev.stopPropagation(); setSelected(e);}}><Ico.Eye/></button>
                      <button className="btn sm ghost" onClick={(ev)=>ev.stopPropagation()}><Ico.More/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-foot">
          <div>Affichage de {list.length} employés</div>
          <div className="pag"><button disabled>‹</button><button className="active">1</button><button>›</button></div>
        </div>
      </div>

      {selected && <EmployeeDrawer employee={selected} onClose={() => setSelected(null)}/>}
    </div>
  );
}

function EmployeeDrawer({ employee: e, onClose }) {
  const [tab, setTab] = React.useState('infos');
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal lg" onClick={ev => ev.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{gap:14}}>
            <div className="avatar xl" data-bg={empBgIdx(e.id)}>{initials(e)}</div>
            <div>
              <div className="modal-title">{fullName(e)} <span className="muted" style={{fontWeight:400,fontSize:13,marginLeft:4,fontFamily:'Plus Jakarta Sans, sans-serif'}} dir="rtl">{e.ar}</span></div>
              <div className="modal-sub">{e.role} · {e.dept}</div>
              <div className="row" style={{marginTop:8,gap:6}}>
                <span className="pill mono" style={{fontSize:11}}>{e.matricule}</span>
                <span className={`pill ${e.contract==='CDI'?'pos':e.contract==='CDD'?'info':'warn'}`}>{e.contract}</span>
                <span className="pill primary">{e.cat}</span>
              </div>
            </div>
          </div>
          <button className="btn ghost modal-x" onClick={onClose}><Ico.X/></button>
        </div>
        <div className="row" style={{padding:'8px 24px 0',gap:4,borderBottom:'1px solid var(--line)'}}>
          {[
            {id:'infos',label:'Informations'},
            {id:'contract',label:'Contrat'},
            {id:'docs',label:'Documents'},
            {id:'pay',label:'Historique paie'},
          ].map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{padding:'10px 12px',fontSize:13,fontWeight:500,color:tab===t.id?'var(--primary)':'var(--muted)',borderBottom:`2px solid ${tab===t.id?'var(--primary)':'transparent'}`,marginBottom:-1}}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="modal-body" style={{paddingTop:18}}>
          {tab === 'infos' && (
            <div className="grid c2">
              <InfoLine label="Email pro." value={e.email}/>
              <InfoLine label="Téléphone" value={e.phone}/>
              <InfoLine label="Ville" value={e.city}/>
              <InfoLine label="N° CNSS" value={<span className="mono">{e.cnss}</span>}/>
              <InfoLine label="Genre" value={e.gender === 'M' ? 'Homme' : 'Femme'}/>
              <InfoLine label="Enfants à charge" value={e.children}/>
            </div>
          )}
          {tab === 'contract' && (
            <div className="grid c2">
              <InfoLine label="Type de contrat" value={<span className={`pill ${e.contract==='CDI'?'pos':e.contract==='CDD'?'info':'warn'}`}>{e.contract}</span>}/>
              <InfoLine label="Date d'embauche" value={new Date(e.hireDate).toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric'})}/>
              <InfoLine label="Salaire de base" value={<span style={{fontWeight:600,fontSize:15}}>{fmtTND(e.salary)}</span>}/>
              <InfoLine label="Catégorie" value={e.cat}/>
              <InfoLine label="Département" value={e.dept}/>
              <InfoLine label="Manager" value={e.id !== 1 ? 'Leila Chaâbane' : '—'}/>
            </div>
          )}
          {tab === 'docs' && <EmployeeDocs employee={e}/>}
          {tab === 'pay' && (
            <table className="tbl" style={{margin:'-8px -8px'}}>
              <thead><tr><th>Période</th><th className="num">Brut</th><th className="num">Net</th><th>Statut</th><th></th></tr></thead>
              <tbody>
                {PAYROLL_PERIODS.slice(0, 4).map(p => (
                  <tr key={p.id}>
                    <td>{p.label}</td>
                    <td className="num">{fmtTND(Math.round(e.salary * 1.15))}</td>
                    <td className="num">{fmtTND(Math.round(e.salary * 0.78))}</td>
                    <td><span className={payrollStatusBg[p.status]}>{payrollStatusLabel[p.status]}</span></td>
                    <td><button className="btn sm"><Ico.Pdf/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Fermer</button>
          <button className="btn primary"><Ico.Edit/>Modifier</button>
        </div>
      </div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div>
      <div className="muted" style={{fontSize:11,textTransform:'uppercase',letterSpacing:'0.05em',fontWeight:500,marginBottom:4}}>{label}</div>
      <div style={{fontSize:13.5,fontWeight:500,color:'var(--ink)'}}>{value}</div>
    </div>
  );
}

// Documents tab — list + drag-and-drop upload
function EmployeeDocs({ employee: e }) {
  const [docs, setDocs] = React.useState([
    { id: 1, n: 'Contrat de travail signé', type: 'Contrat', s: 'PDF · 2.1 Mo', date: '14/04/2024', icon: 'Pdf' },
    { id: 2, n: 'Pièce d\'identité (CIN)', type: 'Identité', s: 'PDF · 480 Ko', date: '02/04/2024', icon: 'Pdf' },
    { id: 3, n: 'RIB bancaire', type: 'Bancaire', s: 'PDF · 220 Ko', date: '02/04/2024', icon: 'Pdf' },
    { id: 4, n: 'Diplôme — Ingénieur logiciel', type: 'Diplôme', s: 'PDF · 1.4 Mo', date: '14/04/2024', icon: 'Pdf' },
    { id: 5, n: 'Certificat médical', type: 'Médical', s: 'PDF · 320 Ko', date: '12/05/2026', icon: 'Pdf' },
    { id: 6, n: 'Attestation CNSS', type: 'CNSS', s: 'PDF · 180 Ko', date: '03/04/2024', icon: 'Pdf' },
  ]);
  const [drag, setDrag] = React.useState(false);
  const [uploading, setUploading] = React.useState(null);
  const inputRef = React.useRef(null);
  const [category, setCategory] = React.useState('Autre');
  const DOC_CATS = ['Contrat', 'Identité', 'Bancaire', 'Diplôme', 'Médical', 'CNSS', 'Attestation', 'Autre'];

  const fmtSize = (b) => b < 1024*1024 ? `${Math.round(b/1024)} Ko` : `${(b/1024/1024).toFixed(1)} Mo`;
  const today = new Date().toLocaleDateString('fr-FR');

  const handleFiles = (files) => {
    const arr = Array.from(files).slice(0, 5);
    arr.forEach((f, i) => {
      const id = Date.now() + i;
      setUploading(prev => ({ ...(prev||{}), [id]: { name: f.name, size: f.size, progress: 0 } }));
      let p = 0;
      const tick = setInterval(() => {
        p += 12 + Math.random() * 18;
        if (p >= 100) {
          clearInterval(tick);
          setUploading(prev => {
            const next = { ...(prev||{}) };
            delete next[id];
            return Object.keys(next).length ? next : null;
          });
          setDocs(d => [{
            id, n: f.name, type: category, s: `${(f.type.split('/')[1] || 'FILE').toUpperCase()} · ${fmtSize(f.size)}`,
            date: today, icon: f.type === 'application/pdf' ? 'Pdf' : 'Doc', _new: true,
          }, ...d]);
        } else {
          setUploading(prev => ({ ...(prev||{}), [id]: { name: f.name, size: f.size, progress: Math.min(100, p) } }));
        }
      }, 120);
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };
  const onDragOver = (e) => { e.preventDefault(); setDrag(true); };
  const onDragLeave = () => setDrag(false);

  return (
    <div className="col" style={{gap:14}}>
      {/* Upload zone */}
      <div
        onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
        style={{
          border: `2px dashed ${drag ? 'var(--primary)' : 'var(--line-2)'}`,
          borderRadius: 12,
          background: drag ? 'var(--primary-soft)' : 'var(--surface-2)',
          padding: '20px 16px',
          textAlign: 'center',
          transition: 'all 0.12s',
        }}
      >
        <div style={{width:44,height:44,borderRadius:'50%',background:drag?'var(--primary)':'var(--surface)',color:drag?'#fff':'var(--primary)',display:'grid',placeItems:'center',margin:'0 auto 10px',border: drag?'0':'1px solid var(--line)'}}>
          <Ico.Upload style={{width:20,height:20}}/>
        </div>
        <div style={{fontSize:14,fontWeight:600}}>
          {drag ? 'Déposez les fichiers ici' : 'Glissez-déposez des documents'}
        </div>
        <div className="muted" style={{fontSize:12.5,marginTop:4}}>
          ou <button onClick={() => inputRef.current?.click()} style={{color:'var(--primary)',fontWeight:500,textDecoration:'underline'}}>parcourez vos fichiers</button>
          <span style={{marginLeft:6}}>· PDF, JPG, PNG · 10 Mo max</span>
        </div>
        <input ref={inputRef} type="file" multiple style={{display:'none'}}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}/>

        <div className="row" style={{gap:8,justifyContent:'center',marginTop:12}}>
          <span className="muted" style={{fontSize:11.5}}>Catégorie par défaut :</span>
          <select className="input" style={{height:28,fontSize:12,padding:'0 24px 0 8px'}} value={category} onChange={e => setCategory(e.target.value)}>
            {DOC_CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Uploading progress */}
      {uploading && Object.entries(uploading).map(([id, u]) => (
        <div key={id} className="doc-tile" style={{borderColor:'var(--primary)',background:'var(--primary-soft)'}}>
          <div className="doc-ico"><Ico.Doc/></div>
          <div style={{flex:1,minWidth:0}}>
            <div className="doc-name truncate">{u.name}</div>
            <div className="progress thin" style={{marginTop:6}}><i style={{width:`${u.progress}%`}}/></div>
            <div className="doc-meta">{Math.round(u.progress)}% · {fmtSize(u.size)}</div>
          </div>
        </div>
      ))}

      {/* Existing docs */}
      <div>
        <div className="row" style={{justifyContent:'space-between',marginBottom:10}}>
          <span style={{fontSize:13,fontWeight:600}}>Documents du dossier ({docs.length})</span>
          <span className="muted" style={{fontSize:11.5}}>Confidentialité : visible uniquement par {fullName(e)} et le RH</span>
        </div>
        <div className="grid c2">
          {docs.map(d => {
            const I = Ico[d.icon] || Ico.Pdf;
            return (
              <div key={d.id} className="doc-tile" style={d._new?{borderColor:'var(--pos)',background:'var(--pos-soft)'}:undefined}>
                <div className="doc-ico"><I/></div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="row" style={{gap:6,alignItems:'center'}}>
                    <div className="doc-name truncate">{d.n}</div>
                    {d._new && <span className="pill pos" style={{fontSize:10,padding:'1px 6px',height:18}}>Nouveau</span>}
                  </div>
                  <div className="doc-meta">
                    <span className="pill" style={{fontSize:10,padding:'1px 6px',height:18,verticalAlign:'middle'}}>{d.type}</span>
                    <span style={{marginLeft:6}}>{d.s} · {d.date}</span>
                  </div>
                </div>
                <div className="row" style={{gap:2}}>
                  <button className="btn sm ghost" title="Aperçu"><Ico.Eye/></button>
                  <button className="btn sm ghost" title="Télécharger"><Ico.Download/></button>
                  <button className="btn sm ghost" title="Supprimer"><Ico.Trash/></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 3) STRUCTURE — départements + postes
// ═════════════════════════════════════════════════════════════════════
function ScreenStructure() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs"><strong>Atlas Tech</strong> <span className="sep">/</span> Structure organisationnelle</div>
          <h1 className="page-title">Départements & postes</h1>
          <div className="page-sub">{DEPARTMENTS.length} départements · {DEPARTMENTS.reduce((s,d)=>s+d.count,0)} postes</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Ico.Briefcase/>Nouveau poste</button>
          <button className="btn primary"><Ico.Plus/>Nouveau département</button>
        </div>
      </div>

      <div className="grid c3">
        {DEPARTMENTS.map(d => (
          <div key={d.id} className="card" style={{padding:18}}>
            <div className="row" style={{justifyContent:'space-between',alignItems:'flex-start'}}>
              <div style={{width:40,height:40,borderRadius:10,background:'var(--primary-soft)',color:'var(--primary)',display:'grid',placeItems:'center'}}>
                <Ico.Folder/>
              </div>
              <button className="btn sm ghost"><Ico.More/></button>
            </div>
            <div style={{marginTop:14,fontSize:15,fontWeight:600}}>{d.name}</div>
            <div className="muted" style={{fontSize:12,marginTop:2}}>Code <span className="mono">{d.code}</span></div>
            <div className="divider" style={{margin:'14px 0'}}/>
            <div className="row" style={{justifyContent:'space-between'}}>
              <div>
                <div className="muted" style={{fontSize:11}}>Responsable</div>
                <div style={{fontSize:13,fontWeight:500,marginTop:2}}>{d.head}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="muted" style={{fontSize:11}}>Effectif</div>
                <div style={{fontSize:18,fontWeight:600,fontFamily:'JetBrains Mono, monospace'}}>{d.count}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 4) PAIE — moteur
// ═════════════════════════════════════════════════════════════════════
function ScreenPayroll({ onOpenModal }) {
  const current = PAYROLL_PERIODS[0];
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs"><strong>Atlas Tech</strong> <span className="sep">/</span> Paie</div>
          <h1 className="page-title">Moteur de paie</h1>
          <div className="page-sub">Workflow : Ouverture → Calcul auto → Validation → Verrouillage → Export</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Ico.Download/>Historique CNSS</button>
          <button className="btn primary" onClick={() => onOpenModal('run-payroll')}><Ico.Sparkles/>Lancer le calcul</button>
        </div>
      </div>

      {/* Workflow steps */}
      <div className="steps">
        {[
          {n:1, label:'Ouverture', sub:'01/05/2026'},
          {n:2, label:'Calcul automatique', sub:'En cours'},
          {n:3, label:'Validation', sub:'À faire'},
          {n:4, label:'Verrouillage', sub:'À faire'},
          {n:5, label:'Export & envoi', sub:'À faire'},
        ].map((s, i) => (
          <div key={i} className={`step ${i === 0 ? 'done' : i === 1 ? 'active' : ''}`}>
            <div className="step-num">{i === 0 ? <Ico.Check/> : s.n}</div>
            <div className="step-text">
              <div style={{fontSize:13,fontWeight:500}}>{s.label}</div>
              <small>{s.sub}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="stat-grid cols-4">
        <div className="stat">
          <div className="stat-head"><span className="ico"><Ico.Users/></span>Bulletins à générer</div>
          <div className="stat-val">42</div>
          <div className="stat-foot"><span className="stat-foot-text">12 CDI · 28 CDI · 2 CIVP</span></div>
        </div>
        <div className="stat">
          <div className="stat-head"><span className="ico info"><Ico.Wallet/></span>Masse brute estimée</div>
          <div className="stat-val">{fmtTND(96400)}</div>
          <div className="stat-foot"><span className="stat-foot-text">+ primes : 3 080 TND</span></div>
        </div>
        <div className="stat">
          <div className="stat-head"><span className="ico warn"><Ico.Shield/></span>Charges patronales</div>
          <div className="stat-val">{fmtTND(20030)}</div>
          <div className="stat-foot"><span className="stat-foot-text">CNSS 16.57% + TFP + Foprolos</span></div>
        </div>
        <div className="stat">
          <div className="stat-head"><span className="ico pos"><Ico.Cash/></span>Coût employeur total</div>
          <div className="stat-val">{fmtTND(119510)}</div>
          <div className="stat-foot"><span className="stat-foot-text">Net + cotisations + IRPP</span></div>
        </div>
      </div>

      <div className="grid c2-21">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Périodes de paie</div>
            <div className="card-sub">Historique 12 derniers mois</div>
          </div>
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr>
                <th>Période</th><th>Bulletins</th><th className="num">Brut</th><th className="num">Net</th><th>Statut</th><th></th>
              </tr></thead>
              <tbody>
                {PAYROLL_PERIODS.map(p => (
                  <tr key={p.id}>
                    <td><span style={{fontWeight:500}}>{p.label}</span></td>
                    <td>{p.employees}</td>
                    <td className="num">{fmtTND(p.gross)}</td>
                    <td className="num">{fmtTND(p.net)}</td>
                    <td><span className={payrollStatusBg[p.status]}><span className="dot"></span>{payrollStatusLabel[p.status]}</span></td>
                    <td>
                      <div className="row" style={{gap:4}}>
                        <button className="btn sm"><Ico.Eye/></button>
                        {p.status !== 'DRAFT' && <button className="btn sm"><Ico.Download/></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Aperçu fiche de paie type</div>
            <div className="card-sub">Mehdi Ben Salah · Mai 2026</div>
          </div>
          <div className="card-body">
            <PaySlipPreview/>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaySlipPreview() {
  const lines = [
    { label: 'Salaire de base', value: 3400, type: 'gain' },
    { label: 'Prime de performance', value: 200, type: 'gain' },
    { label: 'Indemnité transport', value: 80, type: 'gain' },
    { label: 'CNSS salarié (9,18%)', value: -329.45, type: 'ded' },
    { label: 'CAVIS (1%)', value: -36.80, type: 'ded' },
    { label: 'CSS (0,5%)', value: -18.40, type: 'ded' },
    { label: 'IRPP (barème)', value: -512.30, type: 'ded' },
  ];
  return (
    <>
      {lines.map((l, i) => (
        <div key={i} className="row" style={{justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--line)'}}>
          <span style={{fontSize:13,color:l.type==='ded'?'var(--muted)':'var(--ink-2)'}}>{l.label}</span>
          <span className="mono" style={{fontWeight:500,color:l.type==='ded'?'var(--danger-ink)':'var(--ink)'}}>{l.value > 0 ? '+' : ''}{l.value.toFixed(3)}</span>
        </div>
      ))}
      <div className="row" style={{justifyContent:'space-between',marginTop:12,padding:'12px 14px',background:'var(--primary-soft)',borderRadius:8}}>
        <span style={{fontSize:13,fontWeight:600,color:'var(--primary-ink)'}}>Net à payer</span>
        <span style={{fontSize:18,fontWeight:700,color:'var(--primary-ink)',fontFamily:'JetBrains Mono, monospace'}}>{fmtTNDdec(2783.05)}</span>
      </div>
      <button className="btn primary" style={{width:'100%',marginTop:12}}><Ico.Pdf/>Voir bulletin complet</button>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 5) FINANCES RH — avances + primes
// ═════════════════════════════════════════════════════════════════════
function ScreenFinances() {
  const [tab, setTab] = React.useState('advances');
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs"><strong>Atlas Tech</strong> <span className="sep">/</span> Finances RH</div>
          <h1 className="page-title">Avances & primes</h1>
          <div className="page-sub">Demandes d'avances sur salaire et primes variables — à valider mensuellement</div>
        </div>
      </div>

      <div className="row" style={{gap:6,borderBottom:'1px solid var(--line)'}}>
        {[{id:'advances',label:'Avances sur salaire',n:ADVANCES.length},{id:'bonuses',label:'Primes variables',n:BONUSES.length}].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:'12px 16px',fontSize:13.5,fontWeight:500,color:tab===t.id?'var(--primary)':'var(--muted)',borderBottom:`2px solid ${tab===t.id?'var(--primary)':'transparent'}`,marginBottom:-1,display:'flex',gap:8,alignItems:'center'}}>
            {t.label} <span className="pill" style={{fontSize:10.5}}>{t.n}</span>
          </button>
        ))}
      </div>

      {tab === 'advances' && (
        <div className="card">
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr>
                <th>Référence</th><th>Employé</th><th className="num">Montant</th>
                <th>Motif</th><th>Remboursement</th><th>Statut</th><th></th>
              </tr></thead>
              <tbody>
                {ADVANCES.map(a => {
                  const e = empById(a.empId);
                  return (
                    <tr key={a.id}>
                      <td className="mono" style={{fontSize:12}}>{a.id}</td>
                      <td>
                        <div className="ev-name">
                          <div className="avatar sm" data-bg={empBgIdx(e.id)}>{initials(e)}</div>
                          <div className="meta">
                            <div style={{fontWeight:500}}>{fullName(e)}</div>
                            <small>{e.role}</small>
                          </div>
                        </div>
                      </td>
                      <td className="num"><span style={{fontWeight:600}}>{fmtTND(a.amount)}</span></td>
                      <td>{a.reason}</td>
                      <td>{a.repayment}</td>
                      <td>
                        <span className={`pill ${a.status==='approved'?'pos':a.status==='rejected'?'danger':'warn'}`}>
                          <span className="dot"></span>
                          {a.status==='approved'?'Approuvée':a.status==='rejected'?'Refusée':'En attente'}
                        </span>
                      </td>
                      <td>
                        {a.status === 'pending' ? (
                          <div className="row" style={{gap:4}}>
                            <button className="btn sm pos"><Ico.Check/>Approuver</button>
                            <button className="btn sm danger" style={{width:30,padding:0}}><Ico.X/></button>
                          </div>
                        ) : (<button className="btn sm ghost"><Ico.Eye/></button>)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'bonuses' && (
        <div className="card">
          <div className="card-body flush">
            <table className="tbl">
              <thead><tr>
                <th>Référence</th><th>Employé</th><th>Type de prime</th>
                <th className="num">Montant</th><th>Période</th><th>Statut</th><th></th>
              </tr></thead>
              <tbody>
                {BONUSES.map(b => {
                  const e = empById(b.empId);
                  return (
                    <tr key={b.id}>
                      <td className="mono" style={{fontSize:12}}>{b.id}</td>
                      <td>
                        <div className="ev-name">
                          <div className="avatar sm" data-bg={empBgIdx(e.id)}>{initials(e)}</div>
                          <div className="meta"><div style={{fontWeight:500}}>{fullName(e)}</div><small>{e.role}</small></div>
                        </div>
                      </td>
                      <td>{b.type}</td>
                      <td className="num"><span style={{fontWeight:600}}>{fmtTND(b.amount)}</span></td>
                      <td>{b.period}</td>
                      <td><span className={`pill ${b.status==='approved'?'pos':'warn'}`}><span className="dot"></span>{b.status==='approved'?'Validée':'En attente'}</span></td>
                      <td>{b.status === 'pending' ? <button className="btn sm pos"><Ico.Check/>Valider</button> : <button className="btn sm ghost"><Ico.Eye/></button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 6) CONGÉS — calendrier + validation
// ═════════════════════════════════════════════════════════════════════
function ScreenLeaves() {
  const [status, setStatus] = React.useState('pending');
  const list = LEAVES.filter(l => status === 'all' || l.status === status);
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs"><strong>Atlas Tech</strong> <span className="sep">/</span> Congés & absences</div>
          <h1 className="page-title">Gestion des congés</h1>
          <div className="page-sub">Calendrier d'équipe et validation des demandes d'absences</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Ico.Download/>Export Excel</button>
          <button className="btn primary"><Ico.Plus/>Saisir une absence</button>
        </div>
      </div>

      <div className="grid c2-12">
        <div className="card">
          <div className="card-head">
            <div className="card-title">Calendrier d'équipe — Mai 2026</div>
            <div className="legend right">
              <span><span className="sw" style={{background:'#4f46e5'}}></span>Congés payés</span>
              <span><span className="sw" style={{background:'#f59e0b'}}></span>Maladie</span>
              <span><span className="sw" style={{background:'#ef4444'}}></span>Férié</span>
            </div>
          </div>
          <div className="card-body">
            <div className="cal">
              {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d => <div key={d} className="cal-h">{d}</div>)}
              {CAL_MAY.weeks.flat().map((c, i) => (
                <div key={i} className={`cal-c ${c.dim?'dim':''} ${c.today?'today':''} ${c.has?'has':''} ${c.warn?'warn':''} ${c.danger?'danger':''} ${c.weekend?'weekend':''}`}>{c.n}</div>
              ))}
            </div>
            <div className="divider" style={{margin:'16px 0'}}/>
            <div className="row" style={{gap:14,flexWrap:'wrap'}}>
              {LEAVES.filter(l=>l.status==='approved').slice(0,3).map(l => {
                const e = empById(l.empId);
                return (
                  <div key={l.id} className="row" style={{gap:8,padding:'6px 10px',background:'var(--surface-2)',borderRadius:7}}>
                    <div className="avatar sm" data-bg={empBgIdx(e.id)}>{initials(e)}</div>
                    <div>
                      <div style={{fontSize:12.5,fontWeight:500}}>{fullName(e)}</div>
                      <div className="muted mono" style={{fontSize:11}}>{l.from} — {l.to}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">Soldes congés — Mai 2026</div></div>
          <div className="card-body">
            {[
              { label: 'Congés payés', used: 4, total: 24, color: '#4f46e5' },
              { label: 'RTT', used: 2, total: 11, color: '#0ea5e9' },
              { label: 'Maladie', used: 1, total: 15, color: '#f59e0b' },
              { label: 'Exceptionnel', used: 0, total: 5, color: '#10b981' },
            ].map((b, i) => (
              <div key={i} style={{marginBottom:14}}>
                <div className="row" style={{justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontSize:13,fontWeight:500}}>{b.label}</span>
                  <span className="mono" style={{fontSize:12.5}}>{b.used} / {b.total}j</span>
                </div>
                <div className="progress thin"><i style={{width:`${(b.used/b.total)*100}%`,background:b.color}}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-tools">
          {[{id:'pending',label:'En attente',n:LEAVES.filter(l=>l.status==='pending').length},{id:'approved',label:'Approuvées',n:LEAVES.filter(l=>l.status==='approved').length},{id:'all',label:'Toutes',n:LEAVES.length}].map(t => (
            <button key={t.id} className={`filter-chip ${status===t.id?'active':''}`} onClick={()=>setStatus(t.id)}>
              {t.label} <span className="count">{t.n}</span>
            </button>
          ))}
        </div>
        <div className="card-body flush">
          <table className="tbl">
            <thead><tr>
              <th>Référence</th><th>Employé</th><th>Type</th>
              <th className="num">Jours</th><th>Période</th><th>Soumis</th><th>Statut</th><th></th>
            </tr></thead>
            <tbody>
              {list.map(l => {
                const e = empById(l.empId);
                return (
                  <tr key={l.id}>
                    <td className="mono" style={{fontSize:12}}>{l.id}</td>
                    <td>
                      <div className="ev-name">
                        <div className="avatar sm" data-bg={empBgIdx(e.id)}>{initials(e)}</div>
                        <div className="meta"><div style={{fontWeight:500}}>{fullName(e)}</div><small>{e.dept}</small></div>
                      </div>
                    </td>
                    <td>{l.type}</td>
                    <td className="num"><span style={{fontWeight:600}}>{l.days}j</span></td>
                    <td className="mono" style={{fontSize:12}}>{l.from} → {l.to}</td>
                    <td className="muted" style={{fontSize:12}}>{l.submitted}</td>
                    <td>
                      <span className={`pill ${l.status==='approved'?'pos':l.status==='rejected'?'danger':'warn'}`}>
                        <span className="dot"></span>
                        {l.status==='approved'?'Approuvée':l.status==='rejected'?'Refusée':'En attente'}
                      </span>
                    </td>
                    <td>
                      {l.status === 'pending' ? (
                        <div className="row" style={{gap:4}}>
                          <button className="btn sm pos"><Ico.Check/>Approuver</button>
                          <button className="btn sm danger" style={{width:30,padding:0}}><Ico.X/></button>
                        </div>
                      ) : <button className="btn sm ghost"><Ico.Eye/></button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ScreenRHDashboard, ScreenEmployees, ScreenStructure,
  ScreenPayroll, ScreenFinances, ScreenLeaves,
});
