// ============================================================ // DATI &
STORAGE // ============================================================
const STORAGE_KEY = 'moltuple_v1'; function caricaDati() { const raw =
localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : { squadre: [], atleti: [],
risultati: {} }; } function salvaDati(dati) { localStorage.setItem(STORAGE_KEY,
JSON.stringify(dati)); } let DB = caricaDati(); //
============================================================ // DISCIPLINE //
============================================================ const
DISCIPLINE_DECATHLON = [ { id: 'd_100', nome: '100m', tipo: 'pista' }, { id: 'd_lun', nome:
'Lungo', tipo: 'salto' }, { id: 'd_pes', nome: 'Peso', tipo: 'lancio' }, { id: 'd_alt', nome: 'Alto', tipo:
'salto' }, { id: 'd_400', nome: '400m', tipo: 'pista' }, { id: 'd_110h', nome: '110hs', tipo: 'pista' }, { id:
'd_dis', nome: 'Disco', tipo: 'lancio' }, { id: 'd_ast', nome: 'Asta', tipo: 'salto' }, { id: 'd_gia', nome:
'Giavellotto', tipo: 'lancio' }, { id: 'd_1500', nome: '1500m', tipo: 'pista' }, ]; // Decathlon femminile:
stessa struttura, coefficienti diversi // Le discipline condivise con l'eptathlon usano prefisso 'f_' //
Le discipline esclusive del decathlon (F) usano 'fd_' const DISCIPLINE_DECATHLON_F = [ { id:
'fd_100', nome: '100m', tipo: 'pista' }, { id: 'f_lun', nome: 'Lungo', tipo: 'salto' }, { id: 'f_pes', nome:
'Peso', tipo: 'lancio' }, { id: 'f_alt', nome: 'Alto', tipo: 'salto' }, { id: 'fd_400', nome: '400m', tipo:
'pista' }, { id: 'f_100h', nome: '100hs', tipo: 'pista' }, { id: 'fd_dis', nome: 'Disco', tipo: 'lancio' }, { id:
'fd_ast', nome: 'Asta', tipo: 'salto' }, { id: 'f_gia', nome: 'Giavellotto', tipo: 'lancio' }, { id: 'fd_1500',
nome: '1500m', tipo: 'pista' }, ]; const DISCIPLINE_EPTATHLON = [ { id: 'f_100h', nome: '100hs',
tipo: 'pista' }, { id: 'f_alt', nome: 'Alto', tipo: 'salto' }, { id: 'f_pes', nome: 'Peso', tipo: 'lancio' }, { id:
'f_200', nome: '200m', tipo: 'pista' }, { id: 'f_lun', nome: 'Lungo', tipo: 'salto' }, { id: 'f_gia', nome:
'Giavellotto', tipo: 'lancio' }, { id: 'f_800', nome: '800m', tipo: 'pista' }, ]; //
============================================================ //
COEFFICIENTI IAAF — PROVE MULTIPLE (tabelle IAAF 2001/2004) // Fonte: IAAF Scoring
Tables for Combined Events (PDF ufficiale) // // Formule: // pista: P = INT( A * (B - T)^C ) T in
secondi // salto: P = INT( A * (M - B)^C ) M in centimetri // lancio: P = INT( A * (D - B)^C ) D in
metri // ============================================================ const
IAAF = { // ── DECATHLON MASCHILE ──────────────────────────────────
d_100: { A: 25.4347, B: 18, C: 1.81, tipo: 'pista' }, // s d_lun: { A: 0.14354, B: 220, C: 1.4, tipo:
'salto' }, // cm d_pes: { A: 51.39, B: 1.5, C: 1.05, tipo: 'lancio' }, // m d_alt: { A: 0.8465, B: 75, C:
1.42, tipo: 'salto' }, // cm d_400: { A: 1.53775, B: 82, C: 1.81, tipo: 'pista' }, // s d_110h: { A:
5.74352, B: 28.5, C: 1.92, tipo: 'pista' }, // s d_dis: { A: 12.91, B: 4, C: 1.1, tipo: 'lancio' }, // m
d_ast: { A: 0.2797, B: 100, C: 1.35, tipo: 'salto' }, // cm d_gia: { A: 10.14, B: 7, C: 1.08, tipo:
'lancio' }, // m d_1500: { A: 0.03768, B: 480, C: 1.85, tipo: 'pista' }, // s // ── EPTATHLON /
DECATHLON FEMMINILE — discipline condivise ── // Coefficienti tabella IAAF 2001 per eventi
femminili f_100h: { A: 9.23076, B: 26.7, C: 1.835, tipo: 'pista' }, // s f_alt: { A: 1.84523, B: 75, C:
1.348, tipo: 'salto' }, // cm f_pes: { A: 56.0211, B: 1.5, C: 1.05, tipo: 'lancio' }, // m f_200: { A:
4.99087, B: 42.5, C: 1.81, tipo: 'pista' }, // s f_lun: { A: 0.188807, B: 210, C: 1.41, tipo: 'salto' }, //
cm f_gia: { A: 15.9803, B: 3.8, C: 1.04, tipo: 'lancio' }, // m f_800: { A: 0.11193, B: 254, C: 1.88,
tipo: 'pista' }, // s // ── DECATHLON FEMMINILE — discipline esclusive ─────────── //
Coefficienti specifici approvati IAAF 2001/2004 per il decathlon (F) // Diversi dall'eptathlon per
100m, 400m, 1500m, asta, disco fd_100: { A: 17.8570, B: 21.0, C: 1.81, tipo: 'pista' }, // s
fd_400: { A: 1.34285, B: 91.7, C: 1.81, tipo: 'pista' }, // s fd_1500: { A: 0.02883, B: 535, C: 1.88,
tipo: 'pista' }, // s fd_ast: { A: 0.44125, B: 100, C: 1.35, tipo: 'salto' }, // cm fd_dis: { A: 12.3311, B:
3.0, C: 1.10, tipo: 'lancio' }, // m }; function calcolaIAAF(discId, valore) { const c = IAAF[discId]; if
(!c || valore === '' || valore === null || valore === undefined) return 0; const v =
parseFloat(valore); if (isNaN(v) || v <= 0) return 0; let p; if (c.tipo === 'pista') { p = c.A *
Math.pow(Math.max(c.B - v, 0), c.C); } else { p = c.A * Math.pow(Math.max(v - c.B, 0), c.C); }
return Math.floor(p); } function getDiscipline(gara) { if (gara === 'decathlon') return
DISCIPLINE_DECATHLON; if (gara === 'decathlon_f') return DISCIPLINE_DECATHLON_F;
return DISCIPLINE_EPTATHLON; } function getHint(d) { if (d.tipo === 'pista') return 'sec'; if
(d.tipo === 'lancio') return 'm'; return 'cm'; } //
============================================================ // BONUS &
MALUS // ============================================================ const
BONUS_LIST = [ { id: 'pb', label: 'PB (Personal Best)', punti: 150, range: null, perc: null }, { id:
'primo_singola', label: '1° posto gara singola', punti: 200, range: null, perc: null }, { id:
'podio_singola', label: 'Podio gara singola', punti: null, range: [100, 150], perc: null }, { id:
'primo_multi', label: '1° posto gara multipla', punti: 250, range: null, perc: null }, { id: 'podio_multi',
label: 'Podio gara multipla', punti: null, range: [150, 200], perc: null }, { id: 'perc5', label: '+5% sul
personale', punti: null, range: null, perc: 1.2 }, ]; const MALUS_LIST = [ { id: 'falsa', label: 'Falsa
partenza', punti: -150, range: null, perc: null }, { id: 'stecche', label: '3 stecche', punti: -200,
range: null, perc: null }, { id: 'squalificato', label: 'Squalificato', punti: -300, range: null, perc: null },
{ id: 'perc95', label: '95% inferiore al PB', punti: null, range: null, perc: -0.2 }, ]; function
calcolaBonus(bonusObj, puntiBase) { let extra = 0; [...BONUS_LIST,
...MALUS_LIST].forEach(item => { const val = bonusObj[item.id]; if (!val) return; if (item.perc !==
null) extra += Math.round(puntiBase * item.perc / 100); else if (item.range) extra += parseInt(val)
|| 0; else extra += item.punti; }); return extra; } function leggiBonus() { const result = {};
[...BONUS_LIST, ...MALUS_LIST].forEach(item => { const cb = document.getElementById('bm-'
+ item.id); if (cb && cb.checked) { if (item.range) { const sel = document.getElementById('bmrange-' + item.id); result[item.id] = sel ? sel.value : String(item.range[0]); } else { result[item.id] =
true; } } }); return result; } //
============================================================ // PUNTEGGI //
============================================================ function
getPuntiBase(atletaId) { const atleta = DB.atleti.find(a => a.id === atletaId); if (!atleta) return 0;
const ris = DB.risultati[atletaId]; if (!ris) return 0; return getDiscipline(atleta.gara).reduce((acc, d)
=> acc + calcolaIAAF(d.id, ris[d.id] ?? ''), 0); } function getPuntiBonus(atletaId) { const ris =
DB.risultati[atletaId]; if (!ris?._bonus) return 0; return calcolaBonus(ris._bonus,
getPuntiBase(atletaId)); } function getPuntiTotali(atletaId) { return getPuntiBase(atletaId) +
getPuntiBonus(atletaId); } //
============================================================ // BADGE //
============================================================ function
badgeGara(gara) { const map = { decathlon: ['deca', 'Decathlon (M)'], decathlon_f: ['deca_f',
'Decathlon (F)'], eptathlon: ['epta', 'Eptathlon'], }; const [cls, label] = map[gara] || ['epta', gara];
return `${label}`; } //
============================================================ // NAV //
============================================================ function
showPage(id) { document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
document.getElementById('page-' + id).classList.add('active');
event.target.classList.add('active'); if (id === 'dashboard') aggiornaDashboard(); if (id === 'atleti')
aggiornaSelectSquadre('at-squadra'); if (id === 'risultati') aggiornaSelectAtleti(); if (id ===
'classifica') mostraClassifica('tutti'); } //
============================================================ // DASHBOARD
// ============================================================ function
aggiornaDashboard() { const nSq = DB.squadre.length; const nAt = DB.atleti.length; const nRis
= Object.keys(DB.risultati).length; const pts = DB.atleti.reduce((acc, at) => acc +
getPuntiTotali(at.id), 0); document.getElementById('stats-bar').innerHTML = `
${nSq}
Squadre
${nAt}
Atleti
${nRis}
Con Risultati
${pts}
Punti Totali
`; const top5 = [...DB.atleti] .map(at => ({ ...at, punti: getPuntiTotali(at.id) })) .sort((a, b) => b.punti
- a.punti).slice(0, 5); const tbody = document.getElementById('top5-body'); if (!top5.length) {
tbody.innerHTML = `
🏅
Nessun risultato ancora inserito`; return; } tbody.innerHTML = top5.map((at, i) => { const sq =
DB.squadre.find(s => s.id === at.squadraId); const rank = ['🥇','🥈','🥉','4','5'][i]; return `
${rank}${at.nome} ${at.cognome} ${sq ? `${sq.nome}` : '—'} ${badgeGara(at.gara)} ${at.punti} `;
}).join(''); } // ============================================================ //
SQUADRE // ============================================================
function aggiungiSquadra() { const nome = document.getElementById('sq-nome').value.trim();
const colore = document.getElementById('sq-colore').value; if (!nome) { showAlert('alert-sq',
'Inserisci il nome della squadra', 'error'); return; } if (DB.squadre.find(s => s.nome.toLowerCase()
=== nome.toLowerCase())) { showAlert('alert-sq', 'Squadra già esistente', 'error'); return; }
DB.squadre.push({ id: genId(), nome, colore }); salvaDati(DB); renderSquadre();
document.getElementById('sq-nome').value = ''; showAlert('alert-sq', `Squadra "${nome}"
aggiunta`, 'success'); } function eliminaSquadra(id) { if (!confirm('Eliminare questa squadra?'))
return; DB.squadre = DB.squadre.filter(s => s.id !== id); DB.atleti.forEach(at => { if (at.squadraId
=== id) at.squadraId = null; }); salvaDati(DB); renderSquadre(); } function renderSquadre() {
const tbody = document.getElementById('squadre-tbody'); if (!DB.squadre.length) {
tbody.innerHTML = `
🏆
Nessuna squadra registrata`; return; } tbody.innerHTML = DB.squadre.map(sq => { const n =
DB.atleti.filter(a => a.squadraId === sq.id).length; return ` ${sq.nome}${n} Elimina `; }).join(''); }
// ============================================================ // ATLETI //
============================================================ function
aggiungiAtleta() { const nome = document.getElementById('at-nome').value.trim(); const
cognome = document.getElementById('at-cognome').value.trim(); const squadraId =
document.getElementById('at-squadra').value; const gara = document.getElementById('atgara').value; if (!nome || !cognome) { showAlert('alert-at', 'Inserisci nome e cognome', 'error');
return; } if (!squadraId) { showAlert('alert-at', 'Seleziona una squadra', 'error'); return; }
DB.atleti.push({ id: genId(), nome, cognome, squadraId, gara }); salvaDati(DB); renderAtleti();
document.getElementById('at-nome').value = ''; document.getElementById('at-cognome').value
= ''; showAlert('alert-at', `Atleta "${nome} ${cognome}" aggiunto`, 'success'); } function
eliminaAtleta(id) { if (!confirm('Eliminare questo atleta e tutti i suoi risultati?')) return; DB.atleti =
DB.atleti.filter(a => a.id !== id); delete DB.risultati[id]; salvaDati(DB); renderAtleti(); } function
renderAtleti() { const tbody = document.getElementById('atleti-tbody'); if (!DB.atleti.length) {
tbody.innerHTML = `
👤
Nessun atleta registrato`; return; } tbody.innerHTML = DB.atleti.map(at => { const sq =
DB.squadre.find(s => s.id === at.squadraId); const punti = getPuntiTotali(at.id); return `
${at.nome}${at.cognome} ${sq ? `${sq.nome}` : '—'} ${badgeGara(at.gara)} ${punti > 0 ? punti :
'—'} Elimina `; }).join(''); } function aggiornaSelectSquadre(selectId) { const sel =
document.getElementById(selectId); const val = sel.value; sel.innerHTML = '
— Seleziona —
' + DB.squadre.map(s => `
${s.nome}
`).join(''); if (val) sel.value = val; } //
============================================================ // RISULTATI //
============================================================ function
aggiornaSelectAtleti() { const sel = document.getElementById('ris-atleta'); const val = sel.value;
sel.innerHTML = '
— Seleziona atleta —
' + DB.atleti.map(at => { const sq = DB.squadre.find(s => s.id === at.squadraId); return `
${at.nome} ${at.cognome} (${sq ? sq.nome : '—'} / ${at.gara})
`; }).join(''); if (val) { sel.value = val; caricaFormRisultati(); } else document.getElementById('formrisultati-container').style.display = 'none'; } function caricaFormRisultati() { const atletaId =
document.getElementById('ris-atleta').value; if (!atletaId) { document.getElementById('formrisultati-container').style.display = 'none'; return; } const atleta = DB.atleti.find(a => a.id ===
atletaId); if (!atleta) return; const disc = getDiscipline(atleta.gara); const existing =
DB.risultati[atletaId] || {}; const exBonus = existing._bonus || {}; document.getElementById('formrisultati-container').style.display = 'block'; document.getElementById('ris-card-title').textContent =
`// ${atleta.nome} ${atleta.cognome} — ${atleta.gara}`; document.getElementById('punti-
preview').style.display = 'none'; document.getElementById('discipline-inputs').innerHTML =
disc.map(d => { const val = existing[d.id] ?? ''; return `
${d.nome} (${getHint(d)}) —
`; }).join(''); const bonusHtml = BONUS_LIST.map(b => { const checked = exBonus[b.id] ?
'checked' : ''; const ptsLabel = b.perc !== null ? `+${b.perc}% pt` : b.range ?
`${b.range[0]}/${b.range[1]} pt` : `+${b.punti} pt`; const rangeEl = b.range ? ` ${v} pt ` : ''; return
`
${b.label} ${ptsLabel} ${rangeEl}
`; }).join(''); const malusHtml = MALUS_LIST.map(m => { const checked = exBonus[m.id] ?
'checked' : ''; const ptsLabel = m.perc !== null ? `${m.perc}% pt` : `${m.punti} pt`; return `
${m.label} ${ptsLabel}
`; }).join(''); document.getElementById('bonus-malus-section').innerHTML = `
⬆ BONUS
${bonusHtml}
⬇ MALUS
${malusHtml}
`; } function salvaRisultati() { const atletaId = document.getElementById('ris-atleta').value; if
(!atletaId) return; const atleta = DB.atleti.find(a => a.id === atletaId); const disc =
getDiscipline(atleta.gara); const ris = {}; disc.forEach(d => { const v =
document.getElementById('disc-' + d.id)?.value; if (v !== '' && v !== undefined) ris[d.id] =
parseFloat(v); }); ris._bonus = leggiBonus(); DB.risultati[atletaId] = ris; salvaDati(DB);
showAlert('alert-ris', 'Risultati salvati', 'success'); calcolaPunti(); } function calcolaPunti() { const
atletaId = document.getElementById('ris-atleta').value; if (!atletaId) return; const atleta =
DB.atleti.find(a => a.id === atletaId); const disc = getDiscipline(atleta.gara); let base = 0; const
dettaglio = disc.map(d => { const v = document.getElementById('disc-' + d.id)?.value ?? ''; const
p = calcolaIAAF(d.id, v); base += p; return `${d.nome}: ${p}`; }).join(' | '); const bonusObj =
leggiBonus(); const bonusExtra = calcolaBonus(bonusObj, base); const totale = base +
bonusExtra; const bonusDet = [...BONUS_LIST, ...MALUS_LIST] .filter(item =>
bonusObj[item.id]) .map(item => { if (item.perc !== null) return `${item.label}: ${Math.round(base
* item.perc / 100)} pt`; if (item.range) return `${item.label}: ${bonusObj[item.id]} pt`; return
`${item.label}: ${item.punti} pt`; }).join(' | '); const el = document.getElementById('punti-preview');
el.style.display = 'block'; el.innerHTML = `
${dettaglio}
Base IAAF: ${base} pt
${bonusDet ? `
Bonus/Malus: ${bonusExtra >= 0 ? '+' : ''}${bonusExtra} pt — ${bonusDet}
` : ''}
TOTALE ${totale} pt
`; } // ============================================================ //
CLASSIFICA // ============================================================
function mostraClassifica(filtro) { ['tutti','deca','deca_f','epta'].forEach(f => { const btn =
document.getElementById('cf-' + f); if (btn) btn.style.borderColor = ''; }); const map = { tutti: 'tutti',
decathlon: 'deca', decathlon_f: 'deca_f', eptathlon: 'epta' }; const btn =
document.getElementById('cf-' + (map[filtro] || 'tutti')); if (btn) btn.style.borderColor = 'var(--
accent)'; let atleti = DB.atleti; if (filtro !== 'tutti') atleti = atleti.filter(a => a.gara === filtro); const
ranked = [...atleti] .map(at => ({ ...at, punti: getPuntiTotali(at.id) })) .sort((a, b) => b.punti -
a.punti); const tbody = document.getElementById('classifica-individuale'); if (!ranked.length) {
tbody.innerHTML = `
🏁
Nessun dato disponibile`; } else { tbody.innerHTML = ranked.map((at, i) => { const sq =
DB.squadre.find(s => s.id === at.squadraId); const cls = ['rank-1','rank-2','rank-3'][i] || ''; return `
${i + 1}${at.nome} ${at.cognome} ${sq ? `${sq.nome}` : '—'} ${badgeGara(at.gara)} ${at.punti >
0 ? at.punti : '—'} `; }).join(''); } const squadrePunti = DB.squadre.map(sq => { const atlSq =
atleti.filter(a => a.squadraId === sq.id); const punti = atlSq.reduce((acc, at) => acc +
getPuntiTotali(at.id), 0); return { ...sq, punti, n: atlSq.length }; }).sort((a, b) => b.punti - a.punti);
const tsq = document.getElementById('classifica-squadre'); if (!squadrePunti.length) {
tsq.innerHTML = `
🏆
Nessuna squadra`; } else { tsq.innerHTML = squadrePunti.map((sq, i) => { const cls = ['rank1','rank-2','rank-3'][i] || ''; return ` ${i + 1} ${sq.nome} ${sq.n} ${sq.punti > 0 ? sq.punti : '—'} `;
}).join(''); } } // ============================================================ //
UTILS // ============================================================
function genId() { return Math.random().toString(36).substr(2, 9) + Date.now().toString(36); }
function showAlert(id, msg, tipo) { const el = document.getElementById(id); el.textContent =
msg; el.className = `alert alert-${tipo} show`; setTimeout(() => el.classList.remove('show'),
3000); } // ============================================================ // INIT
// ============================================================
renderSquadre(); renderAtleti(); aggiornaSelectSquadre('at-squadra'); aggiornaSelectAtleti();
aggiornaDashboard();