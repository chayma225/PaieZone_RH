// PaieZone RH — Floating RAG chatbot widget
// Simulates the Tunisian HR RAG assistant. Uses canned responses keyed on
// keywords; calls window.claude.complete() if the user types something
// outside the scripted intents.

function Chatbot({ role }) {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [msgs, setMsgs] = React.useState(() => initialMessages(role));
  const bodyRef = React.useRef(null);

  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, open, busy]);

  // Re-initialize greeting when role switches
  React.useEffect(() => {
    setMsgs(initialMessages(role));
  }, [role]);

  const quickFor = (r) => {
    if (r === 'super') return ['État des serveurs', 'Top entreprises MRR', 'Dernière modif réglementaire'];
    if (r === 'rh') return ['Quels congés à valider ?', 'Masse salariale du mois', 'Calcul CNSS d\'un salaire de 2 500 TND'];
    return ['Quel est mon solde de congés ?', 'Mon dernier bulletin', 'Demander une avance'];
  };

  const send = async (text) => {
    if (!text.trim() || busy) return;
    const me = { role: 'me', text };
    setMsgs(m => [...m, me]);
    setInput('');
    setBusy(true);
    // Try canned answer first
    const canned = matchCanned(text, role);
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    if (canned) {
      setMsgs(m => [...m, { role: 'bot', ...canned }]);
      setBusy(false);
      return;
    }
    // Fallback to Claude
    try {
      const resp = await window.claude.complete(
        'Tu es l\'assistant RH de PaieZone (SaaS de paie tunisien). Réponds très brièvement (2-3 phrases max), en français, en restant factuel. Le contexte du droit du travail tunisien est : CNSS 9.18% salarié + 16.57% employeur, CAVIS 1%, CSS 0.5%, IRPP par barème progressif (5k=0%, 10k=15%, 20k=25%, 30k=30%, 40k=33%, 50k=36%, 70k=38%, >70k=40%). Question : ' + text
      );
      setMsgs(m => [...m, { role: 'bot', text: resp || 'Je n\'ai pas pu générer de réponse. Reformulez votre question.' }]);
    } catch (e) {
      setMsgs(m => [...m, { role: 'bot', text: 'Désolé, je n\'arrive pas à contacter le service IA en ce moment.' }]);
    }
    setBusy(false);
  };

  return (
    <>
      {!open && (
        <button className="chat-fab" onClick={() => setOpen(true)} aria-label="Assistant IA">
          <Ico.Sparkles/>
          <span className="pulse"/>
        </button>
      )}
      {open && (
        <div className="chat-win" role="dialog" aria-label="Assistant RH IA">
          <div className="chat-head">
            <div className="chat-head-avatar"><Ico.Sparkles/></div>
            <div>
              <div className="chat-head-name">Assistant RH · PaieZone IA</div>
              <div className="chat-head-status"><span className="dot"/>En ligne · RAG juridique TN</div>
            </div>
            <button className="chat-x" onClick={() => setOpen(false)}><Ico.X/></button>
          </div>

          <div className="chat-body" ref={bodyRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role==='me'?'me':''}`}>
                {m.role === 'bot' && <div className="chat-avatar"><Ico.Sparkles/></div>}
                <div className="chat-bubble">
                  {typeof m.text === 'string' ? m.text.split('\n').map((line, j) => <div key={j}>{line}</div>) : m.text}
                  {m.cite && (
                    <div className="cite">
                      <strong>Source :</strong> {m.cite}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="chat-msg">
                <div className="chat-avatar"><Ico.Sparkles/></div>
                <div className="chat-bubble">
                  <div className="chat-typing"><i/><i/><i/></div>
                </div>
              </div>
            )}
          </div>

          {msgs.length <= 1 && (
            <div className="chat-quick">
              {quickFor(role).map((q, i) => (
                <button key={i} onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          )}

          <form className="chat-input" onSubmit={e => { e.preventDefault(); send(input); }}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Posez votre question RH…"/>
            <button type="submit" className="chat-send" disabled={!input.trim() || busy}>
              <Ico.Send/>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function initialMessages(role) {
  if (role === 'super') {
    return [{ role: 'bot', text: 'Bonjour 👋 Je suis votre assistant SaaS. Je peux vous renseigner sur l\'état des entreprises, les revenus et la santé de la plateforme.' }];
  }
  if (role === 'rh') {
    return [{ role: 'bot', text: 'Bonjour Leila 👋 Je suis l\'assistant PaieZone. Je peux calculer une paie, expliquer un taux légal tunisien ou vous aider à valider des demandes.' }];
  }
  return [{ role: 'bot', text: 'Bonjour Mehdi 👋 Je suis votre assistant RH. Posez-moi une question sur votre paie, vos congés ou faites une demande directement.' }];
}

function matchCanned(text, role) {
  const t = text.toLowerCase();

  // Bulletin / paie
  if (/(bulletin|paie|fiche)/.test(t) && (role === 'emp' || /\bmon\b/.test(t))) {
    return {
      text: 'Votre bulletin d\'avril 2026 est disponible :\n• Net à payer : 2 783,050 TND\n• Brut : 3 680,000 TND\n• Cotisations : −896,950 TND\nVous pouvez le télécharger depuis « Mes documents ».',
    };
  }

  // Congés solde
  if (/(solde|cong[ée])/.test(t) && /(mon|mes|combien)/.test(t)) {
    return {
      text: 'Vos soldes 2026 :\n• Congés payés : 20 j restants (sur 24)\n• RTT : 9 j restants (sur 11)\n• Maladie : 15 j restants (sur 15)\n\nVoulez-vous déposer une demande ?',
    };
  }

  // Congés à valider
  if (/(valider|attente)/.test(t) && /cong/.test(t)) {
    return {
      text: '4 demandes de congés sont en attente :\n• Amal Trabelsi — 5 j (02→06 juin)\n• Nour Hamdi — 1 j (20 mai)\n• Oussama Romdhane — 3 j (12→14 mai, maladie)\n• Rim Saidi — 8 j (15→24 juin)\n\nVous pouvez les traiter dans la section Congés.',
    };
  }

  // CNSS
  if (/cnss/.test(t)) {
    const match = t.match(/(\d[\d\s]*)/);
    const salary = match ? parseInt(match[0].replace(/\s/g, ''), 10) : null;
    if (salary && salary > 100) {
      const sal = salary;
      const cnss = sal * 0.0918;
      const cavis = sal * 0.01;
      const css = sal * 0.005;
      return {
        text: `Pour un salaire brut de ${sal.toLocaleString('fr-FR')} TND :\n• CNSS salarié (9,18%) : ${cnss.toFixed(3)} TND\n• CAVIS (1%) : ${cavis.toFixed(3)} TND\n• CSS (0,5%) : ${css.toFixed(3)} TND\n• Total cotisations sociales : ${(cnss+cavis+css).toFixed(3)} TND`,
        cite: 'JORT n°3-2026 — Cotisations sociales',
      };
    }
    return {
      text: 'Le taux CNSS salarié est de 9,18% (régime de base). Avec CAVIS, il monte à 9,68%. Côté employeur, le taux total est de 16,57%.',
      cite: 'JORT n°3-2026',
    };
  }

  // IRPP
  if (/irpp|imp[oô]t/.test(t)) {
    return {
      text: 'Le barème IRPP 2026 (LF) est progressif :\n• 0 → 5 000 TND : 0%\n• 5 000 → 10 000 : 15%\n• 10 000 → 20 000 : 25%\n• 20 000 → 30 000 : 30%\n• 30 000 → 40 000 : 33%\n• 40 000 → 50 000 : 36%\n• 50 000 → 70 000 : 38%\n• > 70 000 : 40%',
      cite: 'Loi de Finances 2026 — Art. 12',
    };
  }

  // Masse salariale
  if (/masse\s*salariale/.test(t)) {
    return {
      text: 'Masse salariale brute de mai 2026 : 96 400 TND (+1,7% vs avril).\nCharges patronales : 20 030 TND.\nCoût employeur total : 119 510 TND.',
    };
  }

  // État serveurs / plateforme
  if (/(serveur|plateforme|uptime|disponibilit)/.test(t)) {
    return {
      text: 'Tous les services sont opérationnels :\n• API & auth : 42 ms\n• PostgreSQL : 8 ms\n• Moteur de paie : 156 ms\n• Assistant IA (Ollama) : 2,1 s ⚠️ (dégradé)\n\nDisponibilité 30j : 99,97%.',
    };
  }

  // Avance
  if (/avance/.test(t)) {
    return {
      text: 'Pour demander une avance sur salaire, allez dans « Mes demandes » > « Demander une avance ». La validation se fait sous 48h ouvrées par votre responsable RH.\n\nMontant maximum : 50% de votre salaire net du mois.',
    };
  }

  return null;
}

window.Chatbot = Chatbot;
