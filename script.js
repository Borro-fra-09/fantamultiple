// ============================================================
// CONFIGURAZIONE FIREBASE
// ============================================================
const firebaseConfig = {
  apiKey:            "AIzaSyBNMn2MADZjdgXg8CL7D3z5mEPTa7ol5Lw",
  authDomain:        "fantamultiple.firebaseapp.com",
  databaseURL:       "https://fantamultiple-default-rtdb.firebaseio.com",
  projectId:         "fantamultiple",
  storageBucket:     "fantamultiple.firebasestorage.app",
  messagingSenderId: "555323385083",
  appId:             "1:555323385083:web:9570347c893be4813fbc5e",
};

firebase.initializeApp(firebaseConfig);
const firebaseDb = firebase.database();

// ============================================================
// MODALITÀ ACCESSO
// ?view=true  → sola lettura forzata
// Altrimenti  → campo password nell'header
// ============================================================
const FORCEVIEW = new URLSearchParams(window.location.search).get('view') === 'true';
let READONLY = true;
const PASSWORD = 'FantaMBorro';

function tentaLogin() {
  const input = document.getElementById('login-input');
  if (!input) return;
  if (input.value === PASSWORD) {
    READONLY = false;
    sessionStorage.setItem('moltuple_auth', PASSWORD);
    document.getElementById('login-box').style.display = 'none';
    document.getElementById('readonly-badge').style.display = 'none';
    applicaModalita();
    mostraNotifica('Accesso effettuato — modalità modifica attiva', 'success');
  } else {
    input.value = '';
    input.placeholder = 'Password errata!';
    input.style.borderColor = 'var(--accent3)';
    setTimeout(() => { input.placeholder = 'Password…'; input.style.borderColor = ''; }, 2000);
  }
}

function isEditable() { return !READONLY && !FORCEVIEW; }

function applicaModalita() {
  const ro = !isEditable();
  const formSq = document.getElementById('form-nuova-squadra');
  const formAt = document.getElementById('form-nuovo-atleta');
  const navRis = document.getElementById('nav-risultati');
  if (formSq) formSq.style.display = ro ? 'none' : 'block';
  if (formAt) formAt.style.display = ro ? 'none' : 'block';
  if (navRis) navRis.style.display = ro ? 'none' : '';
  renderSquadre();
  renderAtleti();
}

// ============================================================
// STATO LOCALE
// Struttura risultati: { atletaId: [ { gara:1, discipline:{}, bonus:{} }, ... ] }
// ============================================================
let DB = { squadre: [], atleti: [], risultati: {} };

// ============================================================
// FIREBASE
// ============================================================
function salvaDati() {
  if (!isEditable()) return;
  firebaseDb.ref('moltuple').set(DB)
    .catch(err => console.error('Errore Firebase:', err));
}

function toArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return Object.values(v);
}

function inizializzaFirebase() {
  const statusEl = document.getElementById('db-status');
  statusEl.textContent = 'Connessione al database...';
  statusEl.className = 'alert alert-info show';

  firebaseDb.ref('moltuple').on('value', snapshot => {
    const data = snapshot.val();
    if (data) {
      DB = {
        squadre:   toArray(data.squadre),
        atleti:    toArray(data.atleti),
        // risultati: oggetto { atletaId: [array gare] }
        risultati: data.risultati
          ? Object.fromEntries(
              Object.entries(data.risultati).map(([k, v]) => [k, toArray(v)])
            )
          : {},
      };
    } else {
      DB = { squadre: [], atleti: [], risultati: {} };
    }
    renderSquadre();
    renderAtleti();
    aggiornaSelectSquadre('at-squadra');
    aggiornaSelectAtleti();
    aggiornaDashboard();
    mostraClassifica('tutti');
    applicaModalita();
    statusEl.className = 'alert';
  }, err => {
    statusEl.textContent = '⚠ Errore connessione: ' + err.message;
    statusEl.className = 'alert alert-error show';
  });
}

// ============================================================
// DISCIPLINE
// ============================================================
const DISCIPLINE_DECATHLON = [
  { id: 'd_100',   nome: '100m',        tipo: 'pista'  },
  { id: 'd_lun',   nome: 'Lungo',       tipo: 'salto'  },
  { id: 'd_pes',   nome: 'Peso',        tipo: 'lancio' },
  { id: 'd_alt',   nome: 'Alto',        tipo: 'salto'  },
  { id: 'd_400',   nome: '400m',        tipo: 'pista'  },
  { id: 'd_110h',  nome: '110hs',       tipo: 'pista'  },
  { id: 'd_dis',   nome: 'Disco',       tipo: 'lancio' },
  { id: 'd_ast',   nome: 'Asta',        tipo: 'salto'  },
  { id: 'd_gia',   nome: 'Giavellotto', tipo: 'lancio' },
  { id: 'd_1500',  nome: '1500m',       tipo: 'pista'  },
];
const DISCIPLINE_DECATHLON_F = [
  { id: 'fd_100',  nome: '100m',        tipo: 'pista'  },
  { id: 'f_lun',   nome: 'Lungo',       tipo: 'salto'  },
  { id: 'f_pes',   nome: 'Peso',        tipo: 'lancio' },
  { id: 'f_alt',   nome: 'Alto',        tipo: 'salto'  },
  { id: 'fd_400',  nome: '400m',        tipo: 'pista'  },
  { id: 'f_100h',  nome: '100hs',       tipo: 'pista'  },
  { id: 'fd_dis',  nome: 'Disco',       tipo: 'lancio' },
  { id: 'fd_ast',  nome: 'Asta',        tipo: 'salto'  },
  { id: 'f_gia',   nome: 'Giavellotto', tipo: 'lancio' },
  { id: 'fd_1500', nome: '1500m',       tipo: 'pista'  },
];
const DISCIPLINE_EPTATHLON = [
  { id: 'f_100h',  nome: '100hs',       tipo: 'pista'  },
  { id: 'f_alt',   nome: 'Alto',        tipo: 'salto'  },
  { id: 'f_pes',   nome: 'Peso',        tipo: 'lancio' },
  { id: 'f_200',   nome: '200m',        tipo: 'pista'  },
  { id: 'f_lun',   nome: 'Lungo',       tipo: 'salto'  },
  { id: 'f_gia',   nome: 'Giavellotto', tipo: 'lancio' },
  { id: 'f_800',   nome: '800m',        tipo: 'pista'  },
];

const IAAF = {
  d_100:   { A: 25.4347,  B: 18,    C: 1.81,   tipo: 'pista'  },
  d_lun:   { A: 0.14354,  B: 220,   C: 1.4,    tipo: 'salto'  },
  d_pes:   { A: 51.39,    B: 1.5,   C: 1.05,   tipo: 'lancio' },
  d_alt:   { A: 0.8465,   B: 75,    C: 1.42,   tipo: 'salto'  },
  d_400:   { A: 1.53775,  B: 82,    C: 1.81,   tipo: 'pista'  },
  d_110h:  { A: 5.74352,  B: 28.5,  C: 1.92,   tipo: 'pista'  },
  d_dis:   { A: 12.91,    B: 4,     C: 1.1,    tipo: 'lancio' },
  d_ast:   { A: 0.2797,   B: 100,   C: 1.35,   tipo: 'salto'  },
  d_gia:   { A: 10.14,    B: 7,     C: 1.08,   tipo: 'lancio' },
  d_1500:  { A: 0.03768,  B: 480,   C: 1.85,   tipo: 'pista'  },
  f_100h:  { A: 9.23076,  B: 26.7,  C: 1.835,  tipo: 'pista'  },
  f_alt:   { A: 1.84523,  B: 75,    C: 1.348,  tipo: 'salto'  },
  f_pes:   { A: 56.0211,  B: 1.5,   C: 1.05,   tipo: 'lancio' },
  f_200:   { A: 4.99087,  B: 42.5,  C: 1.81,   tipo: 'pista'  },
  f_lun:   { A: 0.188807, B: 210,   C: 1.41,   tipo: 'salto'  },
  f_gia:   { A: 15.9803,  B: 3.8,   C: 1.04,   tipo: 'lancio' },
  f_800:   { A: 0.11193,  B: 254,   C: 1.88,   tipo: 'pista'  },
  fd_100:  { A: 17.8570,  B: 21.0,  C: 1.81,   tipo: 'pista'  },
  fd_400:  { A: 1.34285,  B: 91.7,  C: 1.81,   tipo: 'pista'  },
  fd_1500: { A: 0.02883,  B: 535,   C: 1.88,   tipo: 'pista'  },
  fd_ast:  { A: 0.44125,  B: 100,   C: 1.35,   tipo: 'salto'  },
  fd_dis:  { A: 12.3311,  B: 3.0,   C: 1.10,   tipo: 'lancio' },
};

function calcolaIAAF(discId, valore) {
  const c = IAAF[discId];
  if (!c || valore === '' || valore === null || valore === undefined) return 0;
  const v = parseFloat(valore);
  if (isNaN(v) || v <= 0) return 0;
  const p = c.tipo === 'pista'
    ? c.A * Math.pow(Math.max(c.B - v, 0), c.C)
    : c.A * Math.pow(Math.max(v - c.B, 0), c.C);
  return Math.floor(p);
}

function getDiscipline(gara) {
  if (gara === 'decathlon')   return DISCIPLINE_DECATHLON;
  if (gara === 'decathlon_f') return DISCIPLINE_DECATHLON_F;
  return DISCIPLINE_EPTATHLON;
}

function getHint(d) {
  if (d.tipo === 'pista')  return 'sec';
  if (d.tipo === 'lancio') return 'm';
  return 'cm';
}

// ============================================================
// BONUS & MALUS
// ============================================================
const BONUS_LIST = [
  { id: 'pb',            label: 'PB (Personal Best)',     punti: 150,  range: null,       perc: null },
  { id: 'primo_singola', label: '1° posto gara singola',  punti: 200,  range: null,       perc: null },
  { id: 'podio_singola', label: 'Podio gara singola',     punti: null, range: [100, 150], perc: null },
  { id: 'primo_multi',   label: '1° posto gara multipla', punti: 250,  range: null,       perc: null },
  { id: 'podio_multi',   label: 'Podio gara multipla',    punti: null, range: [150, 200], perc: null },
  { id: 'perc5',         label: '+5% sul personale',      punti: null, range: null,       perc: 1.2  },
];
const MALUS_LIST = [
  { id: 'falsa',        label: 'Falsa partenza',           punti: -150, range: null, perc: null },
  { id: 'stecche',      label: '3 stecche',                punti: -200, range: null, perc: null },
  { id: 'squalificato', label: 'Squalificato',             punti: -300, range: null, perc: null },
  { id: 'perc95',       label: '95% inferiore al PB',      punti: null, range: null, perc: -0.2 },
];

function calcolaBonus(bonusObj, puntiBase) {
  let extra = 0;
  [...BONUS_LIST, ...MALUS_LIST].forEach(item => {
    const val = bonusObj[item.id];
    if (!val) return;
    if (item.perc !== null) extra += Math.round(puntiBase * item.perc / 100);
    else if (item.range)    extra += parseInt(val) || 0;
    else                    extra += item.punti;
  });
  return extra;
}

function leggiBonus() {
  const result = {};
  [...BONUS_LIST, ...MALUS_LIST].forEach(item => {
    const cb = document.getElementById('bm-' + item.id);
    if (cb && cb.checked) {
      if (item.range) {
        const sel = document.getElementById('bm-range-' + item.id);
        result[item.id] = sel ? sel.value : String(item.range[0]);
      } else {
        result[item.id] = true;
      }
    }
  });
  return result;
}

// ============================================================
// PUNTEGGI — somma di tutte le gare dell'atleta
// ============================================================
function calcolaPuntiGara(gara, atletaGara) {
  // gara = { discipline: {}, bonus: {} }
  const disc = getDiscipline(atletaGara);
  const base = disc.reduce((acc, d) => acc + calcolaIAAF(d.id, gara.discipline?.[d.id] ?? ''), 0);
  const bonus = calcolaBonus(gara.bonus || {}, base);
  return { base, bonus, totale: base + bonus };
}

function getPuntiTotali(atletaId) {
  const atleta = DB.atleti.find(a => a.id === atletaId);
  if (!atleta) return 0;
  const gare = DB.risultati[atletaId] || [];
  return gare.reduce((acc, g) => acc + calcolaPuntiGara(g, atleta.gara).totale, 0);
}

function getNumGare(atletaId) {
  return (DB.risultati[atletaId] || []).length;
}

// ============================================================
// BADGE
// ============================================================
function badgeGara(gara) {
  const map = {
    decathlon:   ['deca',   'Decathlon (M)'],
    decathlon_f: ['deca_f', 'Decathlon (F)'],
    eptathlon:   ['epta',   'Eptathlon'],
  };
  const [cls, label] = map[gara] || ['epta', gara];
  return `<span class="badge badge-${cls}">${label}</span>`;
}

// ============================================================
// NAV
// ============================================================
function showPage(id, event) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  event.target.classList.add('active');
  if (id === 'dashboard')  aggiornaDashboard();
  if (id === 'atleti')     aggiornaSelectSquadre('at-squadra');
  if (id === 'risultati')  { aggiornaSelectAtleti(); resetFormRisultati(); }
  if (id === 'classifica') mostraClassifica('tutti');
}

// ============================================================
// DASHBOARD
// ============================================================
function aggiornaDashboard() {
  const nSq  = DB.squadre.length;
  const nAt  = DB.atleti.length;
  const nRis = Object.values(DB.risultati).reduce((acc, g) => acc + g.length, 0);
  const pts  = DB.atleti.reduce((acc, at) => acc + getPuntiTotali(at.id), 0);

  document.getElementById('stats-bar').innerHTML = `
    <div class="stat-box"><div class="stat-num">${nSq}</div><div class="stat-label">Squadre</div></div>
    <div class="stat-box"><div class="stat-num">${nAt}</div><div class="stat-label">Atleti</div></div>
    <div class="stat-box"><div class="stat-num">${nRis}</div><div class="stat-label">Gare Inserite</div></div>
    <div class="stat-box"><div class="stat-num">${pts}</div><div class="stat-label">Punti Totali</div></div>
  `;

  const top5 = [...DB.atleti]
    .map(at => ({ ...at, punti: getPuntiTotali(at.id) }))
    .sort((a, b) => b.punti - a.punti).slice(0, 5);

  const tbody = document.getElementById('top5-body');
  if (!top5.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty"><div class="empty-icon">🏅</div>Nessun risultato ancora inserito</td></tr>`;
    return;
  }
  tbody.innerHTML = top5.map((at, i) => {
    const sq   = DB.squadre.find(s => s.id === at.squadraId);
    const rank = ['🥇','🥈','🥉','4','5'][i];
    return `<tr>
      <td>${rank}</td><td>${at.nome} ${at.cognome}</td>
      <td>${sq ? `<span class="color-dot" style="background:${sq.colore}"></span>${sq.nome}` : '—'}</td>
      <td>${badgeGara(at.gara)}</td>
      <td class="points-col">${at.punti}</td>
    </tr>`;
  }).join('');
}

// ============================================================
// SQUADRE
// ============================================================
function aggiungiSquadra() {
  if (!isEditable()) return;
  const nome   = document.getElementById('sq-nome').value.trim();
  const colore = document.getElementById('sq-colore').value;
  if (!nome) { showAlert('alert-sq', 'Inserisci il nome della squadra', 'error'); return; }
  if (DB.squadre.find(s => s.nome.toLowerCase() === nome.toLowerCase())) {
    showAlert('alert-sq', 'Squadra già esistente', 'error'); return;
  }
  DB.squadre.push({ id: genId(), nome, colore });
  salvaDati();
  document.getElementById('sq-nome').value = '';
  showAlert('alert-sq', `Squadra "${nome}" aggiunta`, 'success');
}

function eliminaSquadra(id) {
  if (!isEditable()) return;
  if (!confirm('Eliminare questa squadra?')) return;
  DB.squadre = DB.squadre.filter(s => s.id !== id);
  DB.atleti.forEach(at => { if (at.squadraId === id) at.squadraId = null; });
  salvaDati();
}

function renderSquadre() {
  const tbody = document.getElementById('squadre-tbody');
  if (!DB.squadre.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty"><div class="empty-icon">🏆</div>Nessuna squadra registrata</td></tr>`;
    return;
  }
  tbody.innerHTML = DB.squadre.map(sq => {
    const n = DB.atleti.filter(a => a.squadraId === sq.id).length;
    const az = isEditable() ? `<button class="btn btn-danger" onclick="eliminaSquadra('${sq.id}')">Elimina</button>` : '—';
    return `<tr>
      <td><span class="color-dot" style="background:${sq.colore};width:20px;height:20px"></span></td>
      <td>${sq.nome}</td><td>${n}</td><td>${az}</td>
    </tr>`;
  }).join('');
}

// ============================================================
// ATLETI
// ============================================================
function aggiungiAtleta() {
  if (!isEditable()) return;
  const nome      = document.getElementById('at-nome').value.trim();
  const cognome   = document.getElementById('at-cognome').value.trim();
  const squadraId = document.getElementById('at-squadra').value;
  const gara      = document.getElementById('at-gara').value;
  if (!nome || !cognome) { showAlert('alert-at', 'Inserisci nome e cognome', 'error'); return; }
  if (!squadraId)        { showAlert('alert-at', 'Seleziona una squadra', 'error'); return; }
  DB.atleti.push({ id: genId(), nome, cognome, squadraId, gara });
  salvaDati();
  document.getElementById('at-nome').value    = '';
  document.getElementById('at-cognome').value = '';
  showAlert('alert-at', `Atleta "${nome} ${cognome}" aggiunto`, 'success');
}

function eliminaAtleta(id) {
  if (!isEditable()) return;
  if (!confirm('Eliminare questo atleta e tutti i suoi risultati?')) return;
  DB.atleti = DB.atleti.filter(a => a.id !== id);
  delete DB.risultati[id];
  salvaDati();
}

function renderAtleti() {
  const tbody = document.getElementById('atleti-tbody');
  if (!DB.atleti.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty"><div class="empty-icon">👤</div>Nessun atleta registrato</td></tr>`;
    return;
  }
  tbody.innerHTML = DB.atleti.map(at => {
    const sq    = DB.squadre.find(s => s.id === at.squadraId);
    const punti = getPuntiTotali(at.id);
    const nGare = getNumGare(at.id);
    const az    = isEditable() ? `<button class="btn btn-danger" onclick="eliminaAtleta('${at.id}')">Elimina</button>` : '—';
    return `<tr>
      <td>${at.nome}</td><td>${at.cognome}</td>
      <td>${sq ? `<span class="color-dot" style="background:${sq.colore}"></span>${sq.nome}` : '—'}</td>
      <td>${badgeGara(at.gara)}</td>
      <td style="text-align:center">${nGare}</td>
      <td class="points-col">${punti > 0 ? punti : '—'}</td>
      <td>${az}</td>
    </tr>`;
  }).join('');
}

function aggiornaSelectSquadre(selectId) {
  const sel = document.getElementById(selectId);
  const val = sel.value;
  sel.innerHTML = '<option value="">— Seleziona —</option>' +
    DB.squadre.map(s => `<option value="${s.id}">${s.nome}</option>`).join('');
  if (val) sel.value = val;
}

// ============================================================
// RISULTATI — più gare per atleta
// ============================================================
let atletaSelezionato = null;
let garaSelezionata   = null; // indice della gara in modifica, null = nuova

function aggiornaSelectAtleti() {
  const sel = document.getElementById('ris-atleta');
  const val = sel.value;
  sel.innerHTML = '<option value="">— Seleziona atleta —</option>' +
    DB.atleti.map(at => {
      const sq = DB.squadre.find(s => s.id === at.squadraId);
      return `<option value="${at.id}">${at.nome} ${at.cognome} (${sq ? sq.nome : '—'} / ${at.gara})</option>`;
    }).join('');
  if (val) sel.value = val;
}

function resetFormRisultati() {
  atletaSelezionato = null;
  garaSelezionata   = null;
  document.getElementById('ris-atleta').value = '';
  document.getElementById('sezione-gare').style.display      = 'none';
  document.getElementById('sezione-form-gara').style.display = 'none';
}

function onAtletaSelezionato() {
  const id = document.getElementById('ris-atleta').value;
  if (!id) { resetFormRisultati(); return; }
  atletaSelezionato = id;
  garaSelezionata   = null;
  document.getElementById('sezione-form-gara').style.display = 'none';
  renderListaGare();
  document.getElementById('sezione-gare').style.display = 'block';
}

function renderListaGare() {
  if (!atletaSelezionato) return;
  const atleta = DB.atleti.find(a => a.id === atletaSelezionato);
  const gare   = DB.risultati[atletaSelezionato] || [];

  document.getElementById('gare-atleta-nome').textContent =
    `// ${atleta.nome} ${atleta.cognome} — ${atleta.gara}`;

  const tbody = document.getElementById('gare-tbody');
  if (!gare.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty" style="padding:1.5rem">Nessuna gara inserita</td></tr>`;
  } else {
    tbody.innerHTML = gare.map((g, i) => {
      const { base, bonus, totale } = calcolaPuntiGara(g, atleta.gara);
      const bonusStr = bonus !== 0 ? ` (${bonus >= 0 ? '+' : ''}${bonus})` : '';
      const az = isEditable()
        ? `<button class="btn btn-secondary" style="padding:0.3rem 0.8rem;font-size:0.65rem" onclick="modificaGara(${i})">Modifica</button>
           <button class="btn btn-danger"    style="padding:0.3rem 0.8rem;font-size:0.65rem;margin-left:0.4rem" onclick="eliminaGara(${i})">Elimina</button>`
        : `<button class="btn btn-secondary" style="padding:0.3rem 0.8rem;font-size:0.65rem" onclick="modificaGara(${i})">Vedi</button>`;
      return `<tr>
        <td><strong>Gara ${i + 1}</strong></td>
        <td class="points-col">${base}</td>
        <td style="color:${bonus >= 0 ? '#40e060' : 'var(--accent3)'}">${bonusStr || '—'}</td>
        <td class="points-col"><strong>${totale}</strong> &nbsp;${az}</td>
      </tr>`;
    }).join('');
  }

  // Totale
  const tot = gare.reduce((acc, g) => acc + calcolaPuntiGara(g, atleta.gara).totale, 0);
  document.getElementById('gare-totale').textContent = `Totale: ${tot} pt`;

  // Bottone nuova gara
  document.getElementById('btn-nuova-gara').style.display = isEditable() ? 'inline-block' : 'none';
}

function nuovaGara() {
  garaSelezionata = null;
  apriFormGara(null);
}

function modificaGara(idx) {
  garaSelezionata = idx;
  const gare = DB.risultati[atletaSelezionato] || [];
  apriFormGara(gare[idx] || null);
}

function eliminaGara(idx) {
  if (!isEditable()) return;
  if (!confirm(`Eliminare Gara ${idx + 1}?`)) return;
  DB.risultati[atletaSelezionato].splice(idx, 1);
  if (DB.risultati[atletaSelezionato].length === 0) delete DB.risultati[atletaSelezionato];
  salvaDati();
  renderListaGare();
  document.getElementById('sezione-form-gara').style.display = 'none';
}

function apriFormGara(existing) {
  const atleta  = DB.atleti.find(a => a.id === atletaSelezionato);
  const disc    = getDiscipline(atleta.gara);
  const exDisc  = existing?.discipline || {};
  const exBonus = existing?.bonus || {};
  const ro      = !isEditable();
  const idx     = garaSelezionata;
  const titolo  = idx === null ? '// Nuova Gara' : `// Gara ${idx + 1}${ro ? ' — sola lettura' : ''}`;

  document.getElementById('form-gara-titolo').textContent = titolo;
  document.getElementById('sezione-form-gara').style.display = 'block';
  document.getElementById('punti-preview').style.display = 'none';
  document.getElementById('risultati-actions').style.display = ro ? 'none' : 'flex';

  // Discipline
  document.getElementById('discipline-inputs').innerHTML = disc.map(d => {
    const val = exDisc[d.id] ?? '';
    return `<div class="disc-item">
      <label>${d.nome} <span style="color:var(--muted)">(${getHint(d)})</span></label>
      <input type="number" step="0.01" id="disc-${d.id}" value="${val}" placeholder="—" ${ro ? 'disabled' : ''}>
    </div>`;
  }).join('');

  // Bonus
  const bonusHtml = BONUS_LIST.map(b => {
    const checked  = exBonus[b.id] ? 'checked' : '';
    const ptsLabel = b.perc !== null ? `+${b.perc}% pt`
      : b.range ? `${b.range[0]}/${b.range[1]} pt` : `+${b.punti} pt`;
    const rangeEl  = b.range ? `
      <select id="bm-range-${b.id}" class="bm-range-sel" ${ro ? 'disabled' : ''}>
        ${b.range.map(v => `<option value="${v}" ${String(exBonus[b.id])===String(v)?'selected':''}>${v} pt</option>`).join('')}
      </select>` : '';
    return `<div class="bm-item bonus-item">
      <label class="bm-label">
        <input type="checkbox" id="bm-${b.id}" ${checked} ${ro ? 'disabled' : ''}>
        <span>${b.label}</span>
        <span class="bm-pts bonus-pts">${ptsLabel}</span>
      </label>${rangeEl}
    </div>`;
  }).join('');

  const malusHtml = MALUS_LIST.map(m => {
    const checked  = exBonus[m.id] ? 'checked' : '';
    const ptsLabel = m.perc !== null ? `${m.perc}% pt` : `${m.punti} pt`;
    return `<div class="bm-item malus-item">
      <label class="bm-label">
        <input type="checkbox" id="bm-${m.id}" ${checked} ${ro ? 'disabled' : ''}>
        <span>${m.label}</span>
        <span class="bm-pts malus-pts">${ptsLabel}</span>
      </label>
    </div>`;
  }).join('');

  document.getElementById('bonus-malus-section').innerHTML = `
    <div class="bm-col"><div class="bm-header bonus-header">⬆ BONUS</div>${bonusHtml}</div>
    <div class="bm-col"><div class="bm-header malus-header">⬇ MALUS</div>${malusHtml}</div>`;

  if (ro) calcolaPunti();
  // Scroll verso il form
  document.getElementById('sezione-form-gara').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function salvaRisultati() {
  if (!isEditable()) return;
  const atleta = DB.atleti.find(a => a.id === atletaSelezionato);
  const disc   = getDiscipline(atleta.gara);
  const discipline = {};
  disc.forEach(d => {
    const v = document.getElementById('disc-' + d.id)?.value;
    if (v !== '' && v !== undefined) discipline[d.id] = parseFloat(v);
  });
  const bonus = leggiBonus();
  const garaData = { discipline, bonus };

  if (!DB.risultati[atletaSelezionato]) DB.risultati[atletaSelezionato] = [];

  if (garaSelezionata === null) {
    // Nuova gara
    DB.risultati[atletaSelezionato].push(garaData);
    garaSelezionata = DB.risultati[atletaSelezionato].length - 1;
  } else {
    // Modifica gara esistente
    DB.risultati[atletaSelezionato][garaSelezionata] = garaData;
  }

  salvaDati();
  showAlert('alert-ris', `Gara ${garaSelezionata + 1} salvata`, 'success');
  renderListaGare();
  calcolaPunti();
}

function calcolaPunti() {
  const atleta = DB.atleti.find(a => a.id === atletaSelezionato);
  if (!atleta) return;
  const disc = getDiscipline(atleta.gara);
  let base = 0;
  const dettaglio = disc.map(d => {
    const v = document.getElementById('disc-' + d.id)?.value ?? '';
    const p = calcolaIAAF(d.id, v);
    base += p;
    return `${d.nome}: <strong>${p}</strong>`;
  }).join(' &nbsp;|&nbsp; ');

  const bonusObj   = leggiBonus();
  const bonusExtra = calcolaBonus(bonusObj, base);
  const totale     = base + bonusExtra;

  const bonusDet = [...BONUS_LIST, ...MALUS_LIST]
    .filter(item => bonusObj[item.id])
    .map(item => {
      if (item.perc !== null) return `${item.label}: ${Math.round(base * item.perc / 100)} pt`;
      if (item.range)         return `${item.label}: ${bonusObj[item.id]} pt`;
      return `${item.label}: ${item.punti} pt`;
    }).join(' | ');

  const el = document.getElementById('punti-preview');
  el.style.display = 'block';
  el.innerHTML = `
    <div class="punti-det">${dettaglio}</div>
    <div class="punti-base">Base IAAF: <strong>${base}</strong> pt</div>
    ${bonusDet ? `<div class="punti-bonus" style="color:${bonusExtra >= 0 ? '#40e060' : 'var(--accent3)'}">
      Bonus/Malus: ${bonusExtra >= 0 ? '+' : ''}${bonusExtra} pt — ${bonusDet}
    </div>` : ''}
    <div class="punti-tot">TOTALE GARA <strong>${totale}</strong> pt</div>`;
}

// ============================================================
// CLASSIFICA
// ============================================================
function mostraClassifica(filtro) {
  ['tutti','deca','deca_f','epta'].forEach(f => {
    const btn = document.getElementById('cf-' + f);
    if (btn) btn.style.borderColor = '';
  });
  const map = { tutti: 'tutti', decathlon: 'deca', decathlon_f: 'deca_f', eptathlon: 'epta' };
  const btn = document.getElementById('cf-' + (map[filtro] || 'tutti'));
  if (btn) btn.style.borderColor = 'var(--accent)';

  let atleti = DB.atleti;
  if (filtro !== 'tutti') atleti = atleti.filter(a => a.gara === filtro);

  const ranked = [...atleti]
    .map(at => ({ ...at, punti: getPuntiTotali(at.id), nGare: getNumGare(at.id) }))
    .sort((a, b) => b.punti - a.punti);

  const tbody = document.getElementById('classifica-individuale');
  if (!ranked.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty"><div class="empty-icon">🏁</div>Nessun dato disponibile</td></tr>`;
  } else {
    tbody.innerHTML = ranked.map((at, i) => {
      const sq  = DB.squadre.find(s => s.id === at.squadraId);
      const cls = ['rank-1','rank-2','rank-3'][i] || '';
      return `<tr class="${cls}">
        <td>${i + 1}</td><td>${at.nome} ${at.cognome}</td>
        <td>${sq ? `<span class="color-dot" style="background:${sq.colore}"></span>${sq.nome}` : '—'}</td>
        <td>${badgeGara(at.gara)}</td>
        <td style="text-align:center;color:var(--muted)">${at.nGare}</td>
        <td class="points-col">${at.punti > 0 ? at.punti : '—'}</td>
      </tr>`;
    }).join('');
  }

  const squadrePunti = DB.squadre.map(sq => {
    const atlSq = atleti.filter(a => a.squadraId === sq.id);
    const punti = atlSq.reduce((acc, at) => acc + getPuntiTotali(at.id), 0);
    return { ...sq, punti, n: atlSq.length };
  }).sort((a, b) => b.punti - a.punti);

  const tsq = document.getElementById('classifica-squadre');
  if (!squadrePunti.length) {
    tsq.innerHTML = `<tr><td colspan="4" class="empty"><div class="empty-icon">🏆</div>Nessuna squadra</td></tr>`;
  } else {
    tsq.innerHTML = squadrePunti.map((sq, i) => {
      const cls = ['rank-1','rank-2','rank-3'][i] || '';
      return `<tr class="${cls}">
        <td>${i + 1}</td>
        <td><span class="color-dot" style="background:${sq.colore}"></span>${sq.nome}</td>
        <td>${sq.n}</td>
        <td class="points-col">${sq.punti > 0 ? sq.punti : '—'}</td>
      </tr>`;
    }).join('');
  }
}

// ============================================================
// UTILS
// ============================================================
function genId() { return Math.random().toString(36).substr(2, 9) + Date.now().toString(36); }

function showAlert(id, msg, tipo) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `alert alert-${tipo} show`;
  setTimeout(() => el.classList.remove('show'), 3000);
}

function mostraNotifica(msg, tipo) {
  const el = document.getElementById('db-status');
  el.textContent = msg;
  el.className = `alert alert-${tipo} show`;
  setTimeout(() => el.classList.remove('show'), 3000);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  if (FORCEVIEW) {
    document.getElementById('readonly-badge').style.display = 'block';
    document.getElementById('login-box').style.display = 'none';
  } else {
    if (sessionStorage.getItem('moltuple_auth') === PASSWORD) {
      READONLY = false;
      document.getElementById('login-box').style.display = 'none';
    } else {
      document.getElementById('readonly-badge').style.display = 'block';
      document.getElementById('login-box').style.display = 'flex';
      document.getElementById('login-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') tentaLogin();
      });
    }
  }
  inizializzaFirebase();
});
