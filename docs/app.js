'use strict';

/* =====================================================================
   Thrive — horas, plata y gym. Todo se guarda en este teléfono.
   ===================================================================== */

// ---------- Utilidades ----------
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const num = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
const sum = (arr, f) => arr.reduce((a, x) => a + (f ? f(x) : x), 0);
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const pad = (n) => String(n).padStart(2, '0');
function iso(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function parse(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function todayIso() { return iso(new Date()); }
function addDays(s, n) { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
function lastDay(y, m) { return new Date(y, m, 0).getDate(); }
function daysBetween(a, b) { return Math.round((parse(b) - parse(a)) / 86400000); }
function isWeekend(s) { const g = parse(s).getDay(); return g === 0 || g === 6; }

const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESL = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DOWL = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const fmtShort = (s) => { const d = parse(s); return `${d.getDate()} ${MES[d.getMonth()]}`; };
const fmtLong = (s) => { const d = parse(s); return `${DOWL[d.getDay()]} ${d.getDate()} de ${MESL[d.getMonth()]}`; };

const copFmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0, minimumFractionDigits: 0 });
const money = (n) => copFmt.format(Math.round(n || 0));
const numFmt = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });
const fmtH = (h) => `${numFmt.format(Math.round(h * 100) / 100)} h`;

// ---------- Íconos ----------
const I = {
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  alert: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5M12 16.5v.5"/><circle cx="12" cy="12" r="9"/></svg>',
  info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  camera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/></svg>',
  dumbbell: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
  upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M7 9l5-5 5 5M5 20h14"/></svg>',
  flame: '<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="fg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff5a1f"/><stop offset="1" stop-color="#ffc24a"/></linearGradient></defs><path fill="url(#fg)" d="M12 22c4.3 0 7.5-2.9 7.5-7 0-3.4-2-6-4.3-8.3-.3 1.9-1.2 3.2-2.6 3.9.3-3.7-1.4-7-4.7-9.6.2 3.5-1.7 5.8-3.2 7.8C3.6 10.4 4.5 12.4 4.5 15c0 4.1 3.2 7 7.5 7z"/><path fill="#ffe7a3" d="M12 22c-2 0-3.5-1.4-3.5-3.4 0-1.7 1.2-2.8 2.2-3.9.2 1 .8 1.6 1.5 1.9.1-1.5.7-2.7 1.8-3.6.2 1.8 1.5 3 1.5 5.4 0 2.1-1.5 3.6-3.5 3.6z"/></svg>'
};

// ---------- Almacenamiento (IndexedDB) ----------
const DB_NAME = 'thrive';
const STORE = 'kv';
let dbPromise = null;
function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((res, rej) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  return dbPromise;
}
async function kvGet(k) {
  const db = await openDb();
  return new Promise((res, rej) => {
    const q = db.transaction(STORE).objectStore(STORE).get(k);
    q.onsuccess = () => res(q.result);
    q.onerror = () => rej(q.error);
  });
}
async function kvSet(k, v) {
  const db = await openDb();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(v, k);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

// ---------- Estado ----------
const DEFAULT_STATE = () => ({
  v: 1,
  settings: {
    rateUsd: 5, fx: 3100, breakMin: 5, typicalHours: 30,
    mode: 'hourly',          // 'hourly' (por horas) | 'salary' (sueldo fijo)
    salary: 0,               // sueldo mensual en pesos
    salaryFreq: 'biweekly',  // 'biweekly' (mitad el 15 y mitad el 30) | 'monthly' (todo el 30)
    salaryStart: ''          // desde cuándo aplica el sueldo fijo
  },
  work: {},        // 'YYYY-MM-DD' -> { shift, noShift, breaks }
  received: {},    // clave de quincena trabajada (o 'sal-' + quincena) -> monto que realmente llegó
  incomes: [],     // ingresos extra: { id, date, desc, amount, src }
  expenses: [],    // { id, date, desc, amount, cat }
  debts: [],       // { id, name, installment, nextDate, freq, remaining, anchor, paid: [{ due, date, amount }] }
  routines: [],    // { id, name, focus, color, items: [{ exId, sets, reps, weight }] }
  exercises: {},   // id -> { id, name, muscle, img, custom }
  gym: {}          // 'YYYY-MM-DD' -> id de rutina o 'libre'
});
let S = DEFAULT_STATE();
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    kvSet('state', S).catch(() => {
      try { localStorage.setItem('thrive-state', JSON.stringify(S)); } catch { toast('No se pudo guardar'); }
    });
  }, 200);
}
function hydrate(saved) {
  const d = DEFAULT_STATE();
  return Object.assign(d, saved || {}, { settings: Object.assign(d.settings, (saved && saved.settings) || {}) });
}

const today0 = todayIso();
const ui = {
  tab: 'trabajo',
  workDate: today0,
  period: null,
  cal: { y: parse(today0).getFullYear(), m: parse(today0).getMonth() + 1 },
  routineId: null,
  pickerTab: 'lib',
  libGroup: '',
  libQuery: ''
};

// ---------- Quincenas ----------
function periodOf(s) { const d = parse(s); return { y: d.getFullYear(), m: d.getMonth() + 1, h: d.getDate() <= 15 ? 1 : 2 }; }
const pkey = (p) => `${p.y}-${pad(p.m)}-${p.h}`;
const pStart = (p) => `${p.y}-${pad(p.m)}-${p.h === 1 ? '01' : '16'}`;
const pEnd = (p) => `${p.y}-${pad(p.m)}-${p.h === 1 ? '15' : pad(lastDay(p.y, p.m))}`;
const pPrev = (p) => (p.h === 2 ? { y: p.y, m: p.m, h: 1 } : p.m === 1 ? { y: p.y - 1, m: 12, h: 2 } : { y: p.y, m: p.m - 1, h: 2 });
const pNext = (p) => (p.h === 1 ? { y: p.y, m: p.m, h: 2 } : p.m === 12 ? { y: p.y + 1, m: 1, h: 1 } : { y: p.y, m: p.m + 1, h: 1 });
const pCmp = (a, b) => (pkey(a) < pkey(b) ? -1 : pkey(a) > pkey(b) ? 1 : 0);
const pFromKey = (k) => { const [y, m, h] = k.split('-').map(Number); return { y, m, h }; };
const pLabel = (p) => `${p.h === 1 ? 1 : 16}–${p.h === 1 ? 15 : lastDay(p.y, p.m)} ${MES[p.m - 1]}`;
const inRange = (s, p) => s >= pStart(p) && s <= pEnd(p);
// Lo trabajado del 1 al 15 se paga el 30 (o el último día del mes);
// lo del 16 al fin de mes se paga el 15 del mes siguiente.
function payDate(p) {
  if (p.h === 1) return `${p.y}-${pad(p.m)}-${pad(Math.min(30, lastDay(p.y, p.m)))}`;
  return p.m === 12 ? `${p.y + 1}-01-15` : `${p.y}-${pad(p.m + 1)}-15`;
}
ui.period = periodOf(today0);

// ---------- Cálculos de trabajo ----------
const rateCop = () => S.settings.rateUsd * S.settings.fx;
function dayCalc(w) {
  w = w || {};
  const r = rateCop();
  const shift = num(w.shift), ns = num(w.noShift), br = num(w.breaks);
  const brH = (br * S.settings.breakMin) / 60;
  const hours = shift + ns;
  const paidHours = Math.max(0, hours - brH);
  return { shift, ns, br, brH, hours, paidHours, pay: paidHours * r, shiftPay: shift * r, nsPay: ns * r, brPay: brH * r };
}
function periodWork(p) {
  const t = { shift: 0, ns: 0, br: 0, brH: 0, hours: 0, paidHours: 0, pay: 0, shiftPay: 0, nsPay: 0, brPay: 0, days: 0 };
  for (const [d, w] of Object.entries(S.work)) {
    if (!inRange(d, p)) continue;
    const c = dayCalc(w);
    for (const k of Object.keys(c)) t[k] += c[k];
    if (c.hours > 0) t.days++;
  }
  return t;
}
function paidVerdict(p) {
  const pw = periodWork(p);
  const rec = S.received[pkey(p)];
  if (rec == null || rec === '') return { state: 'none', pw };
  const diff = num(rec) - pw.pay;
  if (diff >= -500) return { state: 'ok', pw, diff };
  const missingNs = pw.nsPay > 0 && -diff >= pw.nsPay * 0.85;
  return { state: 'bad', pw, diff, missingNs };
}

// ---------- Cálculos de plata ----------
function stepDate(s, freq, anchor) {
  const d = parse(s);
  let y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
  if (freq === 'monthly') {
    m++; if (m > 12) { m = 1; y++; }
    return `${y}-${pad(m)}-${pad(Math.min(anchor || day, lastDay(y, m)))}`;
  }
  if (freq === 'biweekly') {
    if (day <= 15) return `${y}-${pad(m)}-${pad(Math.min(day + 15, lastDay(y, m)))}`;
    m++; if (m > 12) { m = 1; y++; }
    return `${y}-${pad(m)}-${pad(Math.max(1, Math.min(day - 15, lastDay(y, m))))}`;
  }
  return null;
}
function occurrences(debt, from, to) {
  const out = [];
  let d = debt.nextDate, n = debt.remaining;
  while (d && n > 0 && d <= to) {
    if (d >= from) out.push(d);
    if (debt.freq === 'once') break;
    d = stepDate(d, debt.freq, debt.anchor);
    n--;
  }
  return out;
}
// ---------- Sueldo fijo ----------
const isSalaryMode = () => S.settings.mode === 'salary';
const salaryStartP = () => periodOf(S.settings.salaryStart || todayIso());
const salaryActive = (p) => isSalaryMode() && pCmp(p, salaryStartP()) >= 0;
// El trabajo por horas sigue contando para las quincenas antes de empezar el sueldo fijo.
const hourlyActiveFor = (worked) => !isSalaryMode() || pCmp(worked, salaryStartP()) < 0;
const endPay = (p) => `${p.y}-${pad(p.m)}-${pad(Math.min(30, lastDay(p.y, p.m)))}`;
function salaryPayDate(p) { return S.settings.salaryFreq === 'monthly' || p.h === 2 ? endPay(p) : `${p.y}-${pad(p.m)}-15`; }
function salaryFor(p) {
  const s = num(S.settings.salary);
  if (S.settings.salaryFreq === 'monthly') return p.h === 2 ? s : 0;
  return s / 2;
}

// Todo lo que entra en una quincena: pago por horas (quincena vencida), sueldo y extras.
function incomeFor(p, forProjection) {
  const cur = periodOf(todayIso());
  const parts = [];

  // 1) Pago por horas: llega en esta quincena lo trabajado en la anterior.
  const worked = pPrev(p);
  const hk = pkey(worked);
  const real = S.received[hk];
  const hasReal = real != null && real !== '';
  const earned = periodWork(worked).pay;
  const hourlyOn = hourlyActiveFor(worked);
  const estimate = S.settings.typicalHours * rateCop();
  if (hourlyOn || earned > 0 || hasReal) {
    let amount, tag;
    if (hasReal) { amount = num(real); tag = 'real'; }
    else if (pCmp(worked, cur) < 0) { amount = earned; tag = 'calculado'; }
    else if (pCmp(worked, cur) === 0) {
      if (forProjection && hourlyOn && earned < estimate) { amount = estimate; tag = 'estimado'; }
      else { amount = earned; tag = 'en curso'; }
    } else { amount = hourlyOn ? estimate : earned; tag = hourlyOn ? 'estimado' : 'calculado'; }
    parts.push({
      kind: 'hourly', key: hk, amount, tag, worked, payOn: payDate(worked), label: 'Pago por horas',
      note: `Pago del ${fmtShort(payDate(worked))} por lo trabajado del ${pLabel(worked)}`
    });
  }

  // 2) Sueldo fijo.
  if (salaryActive(p)) {
    const sk = 'sal-' + pkey(p);
    const r2 = S.received[sk];
    const has2 = r2 != null && r2 !== '';
    const base = salaryFor(p);
    if (base > 0 || has2) {
      parts.push({
        kind: 'salary', key: sk, amount: has2 ? num(r2) : base, tag: has2 ? 'real' : 'sueldo', payOn: salaryPayDate(p), label: 'Sueldo',
        note: `Pago del ${fmtShort(salaryPayDate(p))} · ${S.settings.salaryFreq === 'monthly' ? 'sueldo del mes' : 'mitad del sueldo'}`
      });
    }
  }

  // 3) Ingresos extra (familia, tutorías, trabajos…).
  const extras = (S.incomes || []).filter((x) => inRange(x.date, p)).sort((a, b) => (a.date < b.date ? 1 : -1));
  const extraT = sum(extras, (x) => num(x.amount));
  return { parts, extras, extraT, total: sum(parts, (x) => x.amount) + extraT, estimated: parts.some((x) => x.tag === 'estimado') };
}
function nextPayments() {
  const t = todayIso();
  const cur = periodOf(t);
  const out = [];
  for (const p of [cur, pNext(cur)]) for (const x of incomeFor(p, false).parts) if (x.payOn >= t) out.push(x);
  return out.sort((a, b) => (a.payOn < b.payOn ? -1 : 1)).slice(0, 3);
}
function periodMoney(p, forProjection) {
  const inc = incomeFor(p, forProjection);
  const exp = S.expenses.filter((x) => inRange(x.date, p)).sort((a, b) => (a.date < b.date ? 1 : -1));
  const expT = sum(exp, (x) => num(x.amount));
  const debtItems = [];
  for (const d of S.debts) {
    for (const pay of d.paid || []) if (inRange(pay.due, p)) debtItems.push({ debt: d, date: pay.due, amount: num(pay.amount), paid: true });
    for (const o of occurrences(d, pStart(p), pEnd(p))) debtItems.push({ debt: d, date: o, amount: num(d.installment), paid: false });
  }
  debtItems.sort((a, b) => (a.date < b.date ? -1 : 1));
  const debtT = sum(debtItems, (x) => x.amount);
  return { inc, exp, expT, debtItems, debtT, out: expT + debtT, net: inc.total - expT - debtT };
}

// ---------- Gym ----------
const ROUTINE_COLORS = ['#ff8a3d', '#60a5fa', '#4ade80', '#c4a1ff', '#f9a8d4', '#facc15'];
const routineById = (id) => S.routines.find((r) => r.id === id);
const routineTag = (r) => (r ? (r.name.replace(/^rutina\s+/i, '').trim()[0] || 'R').toUpperCase() : '•');
function streak() {
  let d = todayIso();
  if (!S.gym[d]) d = addDays(d, -1); // hoy todavía cuenta como pendiente
  let n = 0, guard = 0;
  while (guard++ < 5000) {
    if (S.gym[d]) { n++; d = addDays(d, -1); continue; }
    if (isWeekend(d)) { d = addDays(d, -1); continue; }
    break;
  }
  return n;
}
function bestStreak() {
  const dates = Object.keys(S.gym).sort();
  if (!dates.length) return 0;
  const t = todayIso();
  let d = dates[0], cur = 0, best = 0, guard = 0;
  while (d <= t && guard++ < 5000) {
    if (S.gym[d]) cur++;
    else if (!isWeekend(d) && d !== t) cur = 0;
    best = Math.max(best, cur);
    d = addDays(d, 1);
  }
  return best;
}

// Biblioteca abierta de ejercicios con fotos (free-exercise-db, dominio público).
const LIB_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const LIB_IMG = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const MUSCLE_ES = {
  abdominals: 'Abdomen', abductors: 'Abductores', adductors: 'Aductores', biceps: 'Bíceps', calves: 'Pantorrillas',
  chest: 'Pecho', forearms: 'Antebrazos', glutes: 'Glúteos', hamstrings: 'Femorales', lats: 'Dorsales',
  'lower back': 'Espalda baja', 'middle back': 'Espalda media', neck: 'Cuello', quadriceps: 'Cuádriceps',
  shoulders: 'Hombros', traps: 'Trapecios', triceps: 'Tríceps'
};
const GROUPS = [
  { id: 'pierna', label: 'Pierna', m: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors'] },
  { id: 'brazo', label: 'Brazo', m: ['biceps', 'triceps', 'forearms'] },
  { id: 'pecho', label: 'Pecho', m: ['chest'] },
  { id: 'espalda', label: 'Espalda', m: ['lats', 'middle back', 'lower back', 'traps'] },
  { id: 'hombro', label: 'Hombro', m: ['shoulders'] },
  { id: 'abdomen', label: 'Abdomen', m: ['abdominals'] }
];
const MUSCLE_OPTIONS = ['Pierna', 'Glúteos', 'Cuádriceps', 'Femorales', 'Pantorrillas', 'Brazo', 'Bíceps', 'Tríceps', 'Pecho', 'Espalda', 'Hombros', 'Abdomen', 'Cardio', 'Otro'];
// Palabras en español → inglés para poder buscar en español.
const ES_EN = {
  sentadilla: 'squat', sentadillas: 'squat', 'peso muerto': 'deadlift', remo: 'row', dominada: 'pull', dominadas: 'pull',
  flexion: 'push-up', flexiones: 'push-up', zancada: 'lunge', zancadas: 'lunge', estocada: 'lunge', plancha: 'plank',
  prensa: 'leg press', jalon: 'pulldown', fondos: 'dip', fondo: 'dip', abdominal: 'crunch', abdominales: 'crunch',
  banca: 'bench', banco: 'bench', hombro: 'shoulder', hombros: 'shoulder', pantorrilla: 'calf', gemelo: 'calf', gemelos: 'calf',
  femoral: 'leg curl', cuadriceps: 'leg extension', extension: 'extension', elevacion: 'raise', elevaciones: 'raise',
  lateral: 'lateral', mancuerna: 'dumbbell', mancuernas: 'dumbbell', barra: 'barbell', polea: 'cable', maquina: 'machine',
  pecho: 'chest', triceps: 'triceps', biceps: 'curl', curl: 'curl', martillo: 'hammer', gluteo: 'glute', gluteos: 'glute',
  'hip thrust': 'hip thrust', puente: 'bridge', aperturas: 'fly', apertura: 'fly', inclinado: 'incline', declinado: 'decline',
  militar: 'military', frontal: 'front', trasera: 'rear', aductor: 'adduct', abductor: 'abduct', saltos: 'jump', cuerda: 'rope'
};
let LIB = null;
let libLoading = null;
async function loadLib() {
  if (LIB) return LIB;
  if (libLoading) return libLoading;
  libLoading = (async () => {
    try { const cached = await kvGet('lib'); if (Array.isArray(cached) && cached.length) { LIB = cached; return LIB; } } catch {}
    const r = await fetch(LIB_URL);
    if (!r.ok) throw new Error('lib');
    const data = await r.json();
    LIB = data.map((e) => ({
      id: e.id,
      name: e.name,
      m: (e.primaryMuscles || [])[0] || '',
      img: e.images && e.images[0] ? LIB_IMG + e.images[0] : ''
    }));
    kvSet('lib', LIB).catch(() => {});
    return LIB;
  })();
  try { return await libLoading; } finally { libLoading = null; }
}
function searchLib(q, groupId) {
  if (!LIB) return [];
  let terms = [];
  let nq = norm(q).trim();
  for (const [es, en] of Object.entries(ES_EN)) {
    if (es.includes(' ') && nq.includes(es)) { terms.push([es, en]); nq = nq.replace(es, ' '); }
  }
  for (const w of nq.split(/\s+/).filter(Boolean)) terms.push([w, ES_EN[w] || null]);
  const group = GROUPS.find((g) => g.id === groupId);
  const out = [];
  for (const e of LIB) {
    if (group && !group.m.includes(e.m)) continue;
    const n = norm(e.name);
    if (terms.every(([a, b]) => n.includes(a) || (b && n.includes(b)))) out.push(e);
    if (out.length >= 40) break;
  }
  return out;
}

// ---------- Fotos ----------
function resizeImage(file, max) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.78));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('img')); };
    img.src = url;
  });
}
function pickPhoto() {
  return new Promise((resolve) => {
    const inp = $('#photoInput');
    inp.value = '';
    inp.onchange = async () => {
      const f = inp.files && inp.files[0];
      if (!f) return resolve(null);
      try { resolve(await resizeImage(f, 720)); } catch { toast('No se pudo leer la foto'); resolve(null); }
    };
    inp.click();
  });
}
// ---------- Selector de fecha propio ----------
const CAL_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>';
// extra: atributos para el input oculto (ej. data-change para guardar al elegir)
function dateField(name, label, value, extra) {
  value = value || todayIso();
  return `<div class="field datefield">
    <span>${label}</span>
    <input type="hidden" name="${name}" value="${esc(value)}" ${extra || ''}>
    <button type="button" class="date-btn" data-act="toggleDate" aria-expanded="false">${CAL_ICON}<span class="date-txt">${fmtLong(value)}</span></button>
    <div class="dp" hidden></div>
  </div>`;
}
function dpHtml(box) {
  const val = box.querySelector('input').value;
  const y = +box.dataset.y, m = +box.dataset.m;
  const t = todayIso();
  const first = new Date(y, m - 1, 1);
  const offset = (first.getDay() + 6) % 7;
  const cells = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((l) => `<div class="dp-dow" aria-hidden="true">${l}</div>`);
  for (let i = 0; i < offset; i++) cells.push('<div></div>');
  for (let day = 1; day <= lastDay(y, m); day++) {
    const d = `${y}-${pad(m)}-${pad(day)}`;
    const cls = ['dp-day', d === val ? 'sel' : '', d === t ? 'today' : '', isWeekend(d) ? 'we' : ''].join(' ');
    cells.push(`<button type="button" class="${cls}" data-act="dpPick" data-date="${d}" aria-label="${fmtLong(d)}"${d === val ? ' aria-pressed="true"' : ''}>${day}</button>`);
  }
  const d15 = `${y}-${pad(m)}-15`;
  const d30 = `${y}-${pad(m)}-${pad(Math.min(30, lastDay(y, m)))}`;
  return `<div class="dp-head">
      <button type="button" class="icon-btn" data-act="dpMove" data-dir="-1" aria-label="Mes anterior">${I.left}</button>
      <div class="dp-title">${MESL[m - 1]} ${y}</div>
      <button type="button" class="icon-btn" data-act="dpMove" data-dir="1" aria-label="Mes siguiente">${I.right}</button>
    </div>
    <div class="dp-grid">${cells.join('')}</div>
    <div class="chips dp-quick">
      <button type="button" class="chip" data-act="dpPick" data-date="${t}">Hoy</button>
      <button type="button" class="chip" data-act="dpPick" data-date="${d15}">15 ${MES[m - 1]}</button>
      <button type="button" class="chip" data-act="dpPick" data-date="${d30}">${parse(d30).getDate()} ${MES[m - 1]}</button>
    </div>`;
}

const imgOrPh = (src, alt) => (src ? `<img src="${esc(src)}" alt="${esc(alt || '')}" loading="lazy">` : I.dumbbell);

// ---------- Interfaz: utilidades ----------
let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
let sheetOpen = false;
let sheetCtx = {};
function openSheet(html, ctx) {
  sheetCtx = ctx || {};
  $('#sheetBody').innerHTML = html;
  const w = $('#sheet');
  w.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => w.classList.add('open')));
  if (!sheetOpen) history.pushState({ sheet: 1 }, '');
  sheetOpen = true;
}
// replaceWith: en vez de volver atrás, convierte la entrada del formulario en otra pantalla.
function closeSheet(fromPop, replaceWith) {
  if (!sheetOpen) return;
  sheetOpen = false;
  const w = $('#sheet');
  w.classList.remove('open');
  setTimeout(() => { if (!sheetOpen) { w.hidden = true; $('#sheetBody').innerHTML = ''; } }, 220);
  if (fromPop) return;
  if (replaceWith) history.replaceState(replaceWith, '');
  else if (history.state && history.state.sheet) history.back();
}
function pnav(label, sub, prevAct, nextAct) {
  return `<div class="pnav">
    <button type="button" class="icon-btn" data-act="${prevAct}" aria-label="Anterior">${I.left}</button>
    <div class="mid"><div class="eyebrow">${sub}</div><div class="title">${label}</div></div>
    <button type="button" class="icon-btn" data-act="${nextAct}" aria-label="Siguiente">${I.right}</button>
  </div>`;
}

/* =====================================================================
   VISTA: TRABAJO
   ===================================================================== */
function stepper(label, hint, field, display) {
  return `<div class="stepper">
    <div class="st-label"><span>${label}</span>${hint ? `<small>${hint}</small>` : ''}</div>
    <div class="st-ctrl">
      <button type="button" class="st-btn" data-act="step" data-field="${field}" data-dir="-1" aria-label="Restar ${label}">−</button>
      <output class="st-val">${display}</output>
      <button type="button" class="st-btn plus" data-act="step" data-field="${field}" data-dir="1" aria-label="Sumar ${label}">+</button>
    </div>
  </div>`;
}

function viewTrabajo() {
  const s = S.settings;
  const r = rateCop();
  const d = ui.workDate;
  const c = dayCalc(S.work[d]);
  const p = ui.period;
  const pw = periodWork(p);
  const t = todayIso();
  const pd = payDate(p);
  let status;
  if (t < pStart(p)) status = 'Todavía no empieza';
  else if (t <= pEnd(p)) status = 'En curso';
  else if (t < pd) status = `Por cobrar · faltan ${daysBetween(t, pd)} días`;
  else status = 'Ya debió llegar';

  const isToday = d === t;
  const dayLabel = isToday ? 'Hoy' : d === addDays(t, -1) ? 'Ayer' : fmtLong(d);

  // Días registrados en la quincena
  const days = Object.keys(S.work).filter((k) => inRange(k, p)).sort().reverse();
  const dayRows = days.map((k) => {
    const x = dayCalc(S.work[k]);
    const parts = [];
    if (x.shift) parts.push(`${fmtH(x.shift)} turno`);
    if (x.ns) parts.push(`${fmtH(x.ns)} sin turno`);
    if (x.br) parts.push(`${x.br} break${x.br > 1 ? 's' : ''}`);
    return `<button type="button" class="li" data-act="pickDay" data-date="${k}">
      <div class="li-main"><b>${fmtLong(k)}</b><small>${parts.join(' · ') || 'Sin horas'}</small></div>
      <span class="amt">${money(x.pay)}</span>
    </button>`;
  }).join('');

  // Verificación del pago
  const v = paidVerdict(p);
  const recVal = S.received[pkey(p)];
  let verdict = '';
  if (v.state === 'ok') verdict = `<div class="verdict ok">${I.check}<div>Te pagaron completo${v.pw.ns ? ', incluidas las horas sin turno' : ''}.</div></div>`;
  else if (v.state === 'bad') verdict = `<div class="verdict bad">${I.alert}<div>Te faltan <b>${money(-v.diff)}</b>.${v.missingNs ? ` Coincide con tus <b>${fmtH(v.pw.ns)}</b> sin turno: parece que no te las pagaron.` : ''}</div></div>`;

  // Historial de horas sin turno
  const nsByP = {};
  for (const [k, w] of Object.entries(S.work)) {
    const ns = num(w.noShift);
    if (!ns) continue;
    const key = pkey(periodOf(k));
    nsByP[key] = (nsByP[key] || 0) + ns;
  }
  const nsKeys = Object.keys(nsByP).sort().reverse();
  const nsTotal = sum(nsKeys, (k) => nsByP[k]);
  const nsRows = nsKeys.map((k) => {
    const pp = pFromKey(k);
    const vv = paidVerdict(pp);
    const badge = vv.state === 'ok' ? '<span class="badge ok">Pagadas</span>'
      : vv.state === 'bad' ? `<span class="badge late">Faltan ${money(-vv.diff)}</span>`
      : '<span class="badge">Sin confirmar</span>';
    return `<div class="li"><div class="li-main"><b>Quincena ${pLabel(pp)}</b><small>${fmtH(nsByP[k])} · ${money(nsByP[k] * r)}</small></div>${badge}</div>`;
  }).join('');

  // Próximos pagos (quincena vencida: lo de esta quincena llega en la siguiente)
  const nextRows = nextPayments().map((x) => `<button type="button" class="li" data-act="goMoney" data-date="${x.payOn}" aria-label="Ver el pago del ${fmtLong(x.payOn)} en Dinero">
      <div class="li-main"><b>${fmtLong(x.payOn)}</b><small>${x.kind === 'salary' ? 'Sueldo' : `Por lo trabajado del ${pLabel(x.worked)}${x.tag === 'en curso' ? ' · sigue en curso' : ''}`}</small></div>
      <span class="amt in">${money(x.amount)}</span><span class="chev" aria-hidden="true">${I.right}</span></button>`).join('');

  const salaryView = salaryActive(p);
  const salaryCard = `<section class="card" aria-label="Sueldo de la quincena">
    ${pnav(pLabel(p) + ' ' + p.y, 'Quincena', 'pPrev', 'pNext')}
    <div>
      <div class="big">${money(salaryFor(p))}</div>
      <div class="muted small">${S.settings.salaryFreq === 'monthly' ? (p.h === 2 ? 'Sueldo del mes' : 'En esta quincena no hay pago: el sueldo llega a fin de mes') : 'Mitad del sueldo'} · se paga el <b>${fmtShort(salaryPayDate(p))}</b></div>
    </div>
    <p class="muted small">Sueldo fijo desde el ${fmtLong(S.settings.salaryStart || todayIso())}. Si vas a quincenas anteriores verás las horas de tu trabajo por horas.</p>
  </section>`;

  return `
  <header class="top">
    <div><h1>Trabajo</h1><p class="sub">${isSalaryMode() ? `Sueldo fijo: ${money(s.salary)} al mes` : `${money(r)} por hora · ${numFmt.format(s.rateUsd)} USD × ${money(s.fx)}`}</p></div>
  </header>

  ${nextRows ? `<section class="card" aria-label="Próximos pagos" style="gap:6px">
    <div class="eyebrow">Próximos pagos</div>
    <div class="list">${nextRows}</div>
  </section>` : ''}

  ${salaryView ? salaryCard : `<section class="card" aria-label="Registro del día">
    ${pnav(dayLabel, isToday ? fmtLong(d) : 'Registro del día', 'dayPrev', 'dayNext')}
    <div>
      ${stepper('Horas con turno', 'De media en media hora', 'shift', fmtH(c.shift).replace(' h', ''))}
      ${stepper('Horas sin turno', 'Se cuentan aparte', 'noShift', fmtH(c.ns).replace(' h', ''))}
      ${stepper('Breaks', `${s.breakMin} min cada uno · se descuentan`, 'breaks', c.br)}
    </div>
    <div class="day-total">
      <div class="col"><div class="muted small">${isToday ? 'Hoy ganas' : 'Ese día ganaste'}</div><div class="faint small">${fmtH(c.paidHours)} pagadas${c.br ? ` · −${Math.round(c.brH * 60)} min de breaks` : ''}</div></div>
      <strong class="num">${money(c.pay)}</strong>
    </div>
    ${isToday ? '' : '<button type="button" class="btn ghost" data-act="goToday">Volver a hoy</button>'}
  </section>

  <section class="card" aria-label="Quincena">
    ${pnav(pLabel(p) + ' ' + p.y, 'Quincena', 'pPrev', 'pNext')}
    <div>
      <div class="big">${money(pw.pay)}</div>
      <div class="muted small">Te lo pagan el <b>${fmtShort(pd)}</b> (quincena vencida) · ${status}</div>
    </div>
    <div class="stats">
      <div class="stat"><span>Con turno</span><b>${fmtH(pw.shift)}</b><small>${money(pw.shiftPay)}</small></div>
      <div class="stat"><span>Sin turno</span><b>${fmtH(pw.ns)}</b><small>${money(pw.nsPay)}</small></div>
      <div class="stat"><span>Breaks</span><b>${pw.br}</b><small>−${Math.round(pw.brH * 60)} min · −${money(pw.brPay)}</small></div>
      <div class="stat"><span>Días trabajados</span><b>${pw.days}</b><small>${fmtH(pw.paidHours)} pagadas</small></div>
    </div>
    <div class="row">
      ${t >= pd && recVal == null && pw.pay > 0 ? `<button type="button" class="btn grow" data-act="confirmPay" data-key="${pkey(p)}" data-amount="${Math.round(pw.pay)}">${I.check} Ya me llegó</button>` : ''}
      <button type="button" class="btn ghost grow" data-act="goMoney" data-date="${pd}">Ver en Dinero ${I.right}</button>
    </div>
    <label class="field">
      <span>¿Cuánto te llegó realmente? (opcional)</span>
      <div class="money-input"><input type="number" inputmode="numeric" min="0" step="1" placeholder="Escribe lo que te consignaron" data-change="received" data-key="${pkey(p)}" value="${recVal != null ? esc(recVal) : ''}"></div>
    </label>
    ${verdict}
  </section>

  <section class="card" aria-label="Días de la quincena">
    <div class="sec-head"><h2>Días de esta quincena</h2></div>
    ${dayRows ? `<div class="list">${dayRows}</div>` : '<p class="empty">Aún no hay horas registradas en esta quincena.</p>'}
  </section>`}

  <section class="card" aria-label="Horas sin turno">
    <div class="sec-head"><h2>Horas sin turno</h2><span class="amt">${fmtH(nsTotal)}</span></div>
    <p class="muted small">Escribe arriba cuánto te llegó en cada quincena y aquí verás si te las pagaron.</p>
    ${nsRows ? `<div class="list">${nsRows}</div>` : '<p class="empty">Todavía no has registrado horas sin turno.</p>'}
  </section>`;
}

/* =====================================================================
   VISTA: DINERO
   ===================================================================== */
const EXPENSE_CATS = ['Comida', 'Transporte', 'Hogar', 'Servicios', 'Salidas', 'Salud', 'Estudio', 'Otros'];
const FREQ_LABEL = { once: 'Pago único', biweekly: 'Quincenal', monthly: 'Mensual' };

function debtBadge(debt) {
  if (!debt.remaining || !debt.nextDate) return '<span class="badge ok">Pagada</span>';
  const n = daysBetween(todayIso(), debt.nextDate);
  if (n < 0) return `<span class="badge late">Vencida hace ${-n} día${-n === 1 ? '' : 's'}</span>`;
  if (n === 0) return '<span class="badge late">Vence hoy</span>';
  if (n <= 5) return `<span class="badge soon">Vence en ${n} día${n === 1 ? '' : 's'}</span>`;
  return `<span class="badge">En ${n} días</span>`;
}

function viewDinero() {
  const p = ui.period;
  const m = periodMoney(p, false);
  const inc = m.inc;
  const incLines = inc.parts.map((x) => `<div class="flow-sub"><span>${x.label}</span><b class="num">${money(x.amount)}</b></div>
      <div class="flow-note">${x.note} <span class="tag">${x.tag}</span></div>`).join('')
    + (inc.extraT ? `<div class="flow-sub"><span>Ingresos extra</span><b class="num">${money(inc.extraT)}</b></div>
      <div class="flow-note">${inc.extras.length} ingreso${inc.extras.length === 1 ? '' : 's'} en esta quincena</div>` : '');
  const recFields = inc.parts.map((x) => `<label class="field">
      <span>¿Cuánto te llegó el ${fmtShort(x.payOn)}${x.kind === 'salary' ? ' de sueldo' : ''}? (opcional)</span>
      <div class="money-input"><input type="number" inputmode="numeric" min="0" step="1" placeholder="Si lo escribes, se usa en vez del cálculo" data-change="received" data-key="${x.key}" value="${S.received[x.key] != null ? esc(S.received[x.key]) : ''}"></div>
    </label>`).join('');
  const total = Math.max(inc.total, m.out, 1);
  const outPct = Math.min(100, (m.out / total) * 100);
  const netPct = Math.max(0, ((inc.total - m.out) / total) * 100);
  const incRows = inc.extras.map((x) => `<button type="button" class="li" data-act="editIncome" data-id="${x.id}">
      <div class="li-main"><b>${esc(x.desc || x.src)}</b><small>${esc(x.src)} · ${fmtShort(x.date)}</small></div>
      <span class="amt in">+${money(x.amount)}</span></button>`).join('');

  const debtLines = m.debtItems.map((x) => `<div class="li">
      <div class="li-main"><b>${esc(x.debt.name)}</b><small>${fmtShort(x.date)} · ${x.paid ? 'pagada' : 'pendiente'}</small></div>
      <span class="amt out">−${money(x.amount)}</span></div>`).join('');

  const expRows = m.exp.map((x) => `<button type="button" class="li" data-act="editExpense" data-id="${x.id}">
      <div class="li-main"><b>${esc(x.desc || x.cat)}</b><small>${esc(x.cat)} · ${fmtShort(x.date)}</small></div>
      <span class="amt out">−${money(x.amount)}</span></button>`).join('');

  const active = S.debts.filter((d) => d.remaining > 0).sort((a, b) => (a.nextDate < b.nextDate ? -1 : 1));
  const done = S.debts.filter((d) => !(d.remaining > 0));
  const debtCard = (d) => `<div class="debt${d.remaining > 0 ? '' : ' done'}">
      <div class="debt-top"><div><b>${esc(d.name)}</b><small>Cuota ${money(d.installment)} · ${FREQ_LABEL[d.freq]}</small></div>${debtBadge(d)}</div>
      ${d.remaining > 0 ? `<div class="debt-meta">Próximo pago: <b>${fmtLong(d.nextDate)}</b><br>${d.freq === 'once' ? 'Pago único' : `Faltan ${d.remaining} cuota${d.remaining === 1 ? '' : 's'}`} · Total pendiente <b>${money(d.remaining * num(d.installment))}</b></div>` : ''}
      <div class="debt-actions">
        ${d.remaining > 0 ? `<button type="button" class="btn-sm accent" data-act="payDebt" data-id="${d.id}">${I.check} Ya pagué</button>` : ''}
        <button type="button" class="btn-sm" data-act="editDebt" data-id="${d.id}">${I.edit} Editar</button>
      </div></div>`;

  // Proyección de las próximas quincenas, como en tu Excel
  const cur = periodOf(todayIso());
  let pp = cur;
  const projRows = [];
  for (let i = 0; i < 8; i++) {
    const mm = periodMoney(pp, true);
    const est = mm.inc.estimated;
    const pays = [...new Set(mm.inc.parts.filter((x) => x.amount > 0).map((x) => fmtShort(x.payOn)))].join(' y ');
    projRows.push(`<tr class="${i === 0 ? 'current' : ''}">
      <td>${pLabel(pp)}${pays ? `<br><span class="est">pago ${pays}</span>` : ''}</td>
      <td class="in">${money(mm.inc.total)}${est ? '<br><span class="est">estimado</span>' : ''}</td>
      <td class="out">${mm.out ? '−' + money(mm.out) : '—'}</td>
      <td><b>${money(mm.net)}</b></td></tr>`);
    pp = pNext(pp);
  }

  return `
  <header class="top"><div><h1>Dinero</h1><p class="sub">Lo que entra y sale en cada quincena</p></div></header>

  <section class="card" aria-label="Resumen de la quincena">
    ${pnav(pLabel(p) + ' ' + p.y, 'Quincena', 'pPrev', 'pNext')}
    <div class="flow">
      <div class="flow-row"><span>Entra</span><b class="in">+${money(inc.total)}</b></div>
      ${incLines || '<div class="flow-note">Sin ingresos en esta quincena</div>'}
      <div class="flow-row"><span>Sale</span><b class="out">−${money(m.out)}</b></div>
      <div class="flow-note">Gastos ${money(m.expT)} · Deudas ${money(m.debtT)}</div>
      <div class="bar" aria-hidden="true"><i style="width:${outPct}%;background:var(--out)"></i><i style="width:${netPct}%;background:var(--in)"></i></div>
      <div class="flow-row flow-net"><span>Te queda</span><b class="${m.net < 0 ? 'out' : ''}">${money(m.net)}</b></div>
    </div>
    ${debtLines ? `<div><div class="eyebrow" style="margin-bottom:4px">Cuotas en esta quincena</div><div class="list">${debtLines}</div></div>` : ''}
    ${recFields}
  </section>

  <section class="card" aria-label="Ingresos extra">
    <div class="sec-head"><h2>Ingresos extra</h2><button type="button" class="btn-sm accent" data-act="addIncome">${I.plus} Agregar</button></div>
    ${incRows ? `<div class="list">${incRows}</div>` : '<p class="empty">Plata de tu mamá, tutorías, trabajos de la U… anótala aquí.</p>'}
  </section>

  <section class="card" aria-label="Gastos">
    <div class="sec-head"><h2>Gastos</h2><button type="button" class="btn-sm accent" data-act="addExpense">${I.plus} Agregar</button></div>
    ${expRows ? `<div class="list">${expRows}</div>` : '<p class="empty">Sin gastos en esta quincena.</p>'}
  </section>

  <section class="card" aria-label="Deudas">
    <div class="sec-head"><h2>Deudas</h2><button type="button" class="btn-sm accent" data-act="addDebt">${I.plus} Agregar</button></div>
    ${active.length ? active.map(debtCard).join('') : '<p class="empty">No tienes deudas registradas.</p>'}
    ${done.length ? `<details><summary class="muted small" style="min-height:44px;display:flex;align-items:center;cursor:pointer">Deudas pagadas (${done.length})</summary><div style="display:flex;flex-direction:column;gap:10px">${done.map(debtCard).join('')}</div></details>` : ''}
  </section>

  <section class="card" aria-label="Próximas quincenas">
    <div class="sec-head"><h2>Próximas quincenas</h2></div>
    <p class="muted small">${isSalaryMode() ? 'Incluye tu sueldo fijo, el último pago por horas y los ingresos extra que ya anotaste.' : `Si aún no registras las horas, se estima con ${fmtH(S.settings.typicalHours)} por quincena (lo cambias en Ajustes).`}</p>
    <div class="table-box"><table>
      <thead><tr><th>Quincena</th><th>Entra</th><th>Sale</th><th>Neto</th></tr></thead>
      <tbody>${projRows.join('')}</tbody>
    </table></div>
  </section>`;
}

function expenseForm(x) {
  const isNew = !x;
  x = x || { date: inRange(todayIso(), ui.period) ? todayIso() : pStart(ui.period), cat: 'Comida', amount: '', desc: '' };
  return `<form data-submit="saveExpense" data-id="${x.id || ''}" style="display:flex;flex-direction:column;gap:14px">
    <h2>${isNew ? 'Nuevo gasto' : 'Editar gasto'}</h2>
    <label class="field"><span>Valor</span><div class="money-input"><input name="amount" type="number" inputmode="numeric" min="0" step="1" required value="${esc(x.amount)}" placeholder="0"></div></label>
    <label class="field"><span>Descripción</span><input name="desc" type="text" maxlength="60" value="${esc(x.desc)}" placeholder="Ej. almuerzo, bus, recibo de luz"></label>
    <div class="field"><span>Categoría</span><div class="chips" role="group" aria-label="Categoría">
      ${EXPENSE_CATS.map((c) => `<button type="button" class="chip" data-act="chip" data-name="cat" data-val="${c}" aria-pressed="${c === x.cat}">${c}</button>`).join('')}
    </div><input type="hidden" name="cat" value="${esc(x.cat)}"></div>
    ${dateField('date', 'Fecha', x.date)}
    <div class="sheet-actions">
      <button type="submit" class="btn wide">Guardar</button>
      ${isNew ? '' : `<button type="button" class="btn danger wide" data-act="deleteExpense" data-id="${x.id}">${I.trash} Borrar gasto</button>`}
    </div>
  </form>`;
}

const INCOME_SRC = ['Familia', 'Tutorías', 'Trabajos', 'Ventas', 'Regalo', 'Otro'];
function incomeForm(x) {
  const isNew = !x;
  x = x || { date: inRange(todayIso(), ui.period) ? todayIso() : pStart(ui.period), src: 'Familia', amount: '', desc: '' };
  return `<form data-submit="saveIncome" data-id="${x.id || ''}" style="display:flex;flex-direction:column;gap:14px">
    <h2>${isNew ? 'Nuevo ingreso extra' : 'Editar ingreso'}</h2>
    <label class="field"><span>Valor</span><div class="money-input"><input name="amount" type="number" inputmode="numeric" min="0" step="1" required value="${esc(x.amount)}" placeholder="0"></div></label>
    <label class="field"><span>Descripción</span><input name="desc" type="text" maxlength="60" value="${esc(x.desc)}" placeholder="Ej. mi mamá para el bus, tutoría de cálculo"></label>
    <div class="field"><span>De dónde viene</span><div class="chips" role="group" aria-label="De dónde viene">
      ${INCOME_SRC.map((c) => `<button type="button" class="chip" data-act="chip" data-name="src" data-val="${c}" aria-pressed="${c === x.src}">${c}</button>`).join('')}
    </div><input type="hidden" name="src" value="${esc(x.src)}"></div>
    ${dateField('date', 'Fecha en que te llegó', x.date)}
    <div class="sheet-actions">
      <button type="submit" class="btn wide">Guardar</button>
      ${isNew ? '' : `<button type="button" class="btn danger wide" data-act="deleteIncome" data-id="${x.id}">${I.trash} Borrar ingreso</button>`}
    </div>
  </form>`;
}

function debtForm(d) {
  const isNew = !d;
  d = d || { name: '', installment: '', nextDate: payDate(pPrev(periodOf(todayIso()))) >= todayIso() ? payDate(pPrev(periodOf(todayIso()))) : payDate(periodOf(todayIso())), freq: 'once', remaining: 1 };
  return `<form data-submit="saveDebt" data-id="${d.id || ''}" style="display:flex;flex-direction:column;gap:14px">
    <h2>${isNew ? 'Nueva deuda' : 'Editar deuda'}</h2>
    <label class="field"><span>¿A quién le debes?</span><input name="name" type="text" maxlength="40" required value="${esc(d.name)}" placeholder="Ej. Banco, tarjeta, un amigo"></label>
    <label class="field"><span>Valor de cada pago</span><div class="money-input"><input name="installment" type="number" inputmode="numeric" min="0" step="1" required value="${esc(d.installment)}" placeholder="0"></div></label>
    ${dateField('nextDate', 'Fecha del próximo pago', d.nextDate || todayIso())}
    <div class="fields-2">
      <label class="field"><span>Cada cuánto</span><select name="freq">
        ${Object.entries(FREQ_LABEL).map(([k, v]) => `<option value="${k}"${k === d.freq ? ' selected' : ''}>${v}</option>`).join('')}
      </select></label>
      <label class="field"><span>Pagos que faltan</span><input name="remaining" type="number" inputmode="numeric" min="0" step="1" value="${esc(d.remaining)}"></label>
    </div>
    <div class="sheet-actions">
      <button type="submit" class="btn wide">Guardar</button>
      ${!isNew && d.paid && d.paid.length ? `<button type="button" class="btn ghost wide" data-act="undoPay" data-id="${d.id}">Deshacer el último pago</button>` : ''}
      ${isNew ? '' : `<button type="button" class="btn danger wide" data-act="deleteDebt" data-id="${d.id}">${I.trash} Borrar deuda</button>`}
    </div>
  </form>`;
}

/* =====================================================================
   VISTA: GYM
   ===================================================================== */
function viewGym() {
  if (ui.routineId && routineById(ui.routineId)) return viewRoutine(routineById(ui.routineId));
  const t = todayIso();
  const st = streak();
  const best = bestStreak();
  const todayR = S.gym[t];

  // Semana actual (lunes a domingo)
  const dt = parse(t);
  const monday = addDays(t, -((dt.getDay() + 6) % 7));
  const L = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const week = L.map((l, i) => {
    const d = addDays(monday, i);
    const went = S.gym[d];
    const r = went && routineById(went);
    const cls = ['wd', went ? 'done' : '', !went && d < t && i < 5 ? 'miss' : '', d === t ? 'today' : '', i >= 5 ? 'weekend' : ''].join(' ');
    return `<div class="${cls}"><span>${l}</span><i>${went ? routineTag(r) : ''}</i></div>`;
  }).join('');

  // Calendario del mes
  const { y, m } = ui.cal;
  const first = new Date(y, m - 1, 1);
  const offset = (first.getDay() + 6) % 7;
  const cells = [];
  ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach((l) => cells.push(`<div class="dow" aria-hidden="true">${l}</div>`));
  for (let i = 0; i < offset; i++) cells.push('<div></div>');
  let monthCount = 0;
  for (let day = 1; day <= lastDay(y, m); day++) {
    const d = `${y}-${pad(m)}-${pad(day)}`;
    const went = S.gym[d];
    const r = went && routineById(went);
    if (went) monthCount++;
    const style = went ? ` style="background:${r ? r.color : '#a3abb9'}"` : '';
    const cls = ['cal-day', isWeekend(d) ? 'weekend' : '', went ? 'went' : '', d === t ? 'today' : '', d > t ? 'future' : ''].join(' ');
    const lbl = `${fmtLong(d)}${went ? ', fuiste: ' + (r ? r.name : 'entreno libre') : ''}`;
    cells.push(`<button type="button" class="${cls}"${style} data-act="gymDay" data-date="${d}" aria-label="${esc(lbl)}"${d > t ? ' disabled' : ''}>${day}${went ? `<span class="tagl">${routineTag(r)}</span>` : ''}</button>`);
  }
  const legend = S.routines.map((r) => `<span><i style="background:${r.color}"></i>${esc(r.name)}</span>`).join('');

  const routines = S.routines.map((r) => {
    const thumbs = r.items.slice(0, 4).map((it) => {
      const ex = S.exercises[it.exId];
      return ex && ex.img ? `<img src="${esc(ex.img)}" alt="" loading="lazy">` : '<span class="ph"></span>';
    }).join('');
    return `<button type="button" class="routine" data-act="openRoutine" data-id="${r.id}">
      <span class="r-badge" style="background:${r.color}">${routineTag(r)}</span>
      <span class="li-main"><b>${esc(r.name)}</b><small>${esc(r.focus || 'Sin enfoque')} · ${r.items.length} ejercicio${r.items.length === 1 ? '' : 's'}</small></span>
      <span class="thumbs" aria-hidden="true">${thumbs}</span>
    </button>`;
  }).join('');

  const todayBtn = todayR
    ? `<button type="button" class="btn ghost wide" data-act="gymDay" data-date="${t}">${I.check} Hoy: ${esc(todayR === 'libre' ? 'entreno libre' : (routineById(todayR) || {}).name || 'entreno')}</button>`
    : `<button type="button" class="btn wide" data-act="gymDay" data-date="${t}">Registrar que fui hoy</button>`;

  return `
  <header class="top"><div><h1>Gym</h1><p class="sub">${isWeekend(t) ? 'Fin de semana: tu racha está a salvo' : 'De lunes a viernes; el finde no rompe la racha'}</p></div></header>

  <section class="card" aria-label="Racha">
    <div class="streak">
      <div class="flame${st ? '' : ' off'}">${I.flame}</div>
      <div>
        <div class="streak-n">${st} <small>día${st === 1 ? '' : 's'} de racha</small></div>
        <div class="muted small">${st ? (todayR || isWeekend(t) ? '¡Vas con toda!' : 'Ve hoy para mantenerla') : 'Ve hoy y enciende el fueguito'} · Mejor racha: ${best}</div>
      </div>
    </div>
    <div class="week">${week}</div>
    ${todayBtn}
  </section>

  <section class="card" aria-label="Calendario">
    ${pnav(`${MESL[m - 1][0].toUpperCase() + MESL[m - 1].slice(1)} ${y}`, `${monthCount} día${monthCount === 1 ? '' : 's'} de gym`, 'calPrev', 'calNext')}
    <div class="cal">${cells.join('')}</div>
    ${legend ? `<div class="legend">${legend}</div>` : ''}
  </section>

  <section class="card" aria-label="Rutinas">
    <div class="sec-head"><h2>Rutinas</h2><button type="button" class="btn-sm accent" data-act="addRoutine">${I.plus} Nueva</button></div>
    ${routines || '<p class="empty">Crea tu primera rutina, por ejemplo «Rutina A · Pierna».</p>'}
  </section>`;
}

function viewRoutine(r) {
  const items = r.items.map((it, i) => {
    const ex = S.exercises[it.exId] || { name: 'Ejercicio', muscle: '' };
    return `<div class="ex">
      <div class="ex-head">
        <button type="button" class="ex-img" data-act="exPhoto" data-ex="${esc(it.exId)}" aria-label="Cambiar foto de ${esc(ex.name)}">${imgOrPh(ex.img, ex.name)}</button>
        <div class="grow">
          <div class="ex-name">${esc(ex.name)}</div>
          <div class="muted small">${esc(ex.muscle || '')}${ex.custom ? ' · propio' : ''}</div>
        </div>
        <button type="button" class="icon-btn" data-act="editEx" data-i="${i}" aria-label="Editar ${esc(ex.name)}">${I.edit}</button>
      </div>
      <div class="fields-3">
        <label class="field"><span>Series</span><input type="number" inputmode="numeric" min="0" value="${esc(it.sets)}" data-change="item" data-i="${i}" data-k="sets"></label>
        <label class="field"><span>Reps</span><input type="text" inputmode="text" maxlength="8" value="${esc(it.reps)}" data-change="item" data-i="${i}" data-k="reps"></label>
        <label class="field"><span>Peso (kg)</span><input type="number" inputmode="decimal" min="0" step="0.5" value="${esc(it.weight)}" data-change="item" data-i="${i}" data-k="weight"></label>
      </div>
    </div>`;
  }).join('');
  return `
  <div><button type="button" class="back" data-act="closeRoutine">${I.back} Rutinas</button></div>
  <header class="top">
    <div class="row">
      <span class="r-badge" style="background:${r.color}">${routineTag(r)}</span>
      <div><h1>${esc(r.name)}</h1><p class="sub">${esc(r.focus || 'Sin enfoque')} · ${r.items.length} ejercicio${r.items.length === 1 ? '' : 's'}</p></div>
    </div>
    <button type="button" class="icon-btn" data-act="editRoutine" aria-label="Editar rutina">${I.edit}</button>
  </header>
  ${items || '<section class="card"><p class="empty">Agrega ejercicios desde la biblioteca o crea los tuyos con tu propia foto.</p></section>'}
  <button type="button" class="btn wide" data-act="addExercise">${I.plus} Agregar ejercicio</button>`;
}

function routineForm(r) {
  const isNew = !r;
  const letter = String.fromCharCode(65 + (S.routines.length % 26));
  r = r || { name: `Rutina ${letter}`, focus: '', color: ROUTINE_COLORS[S.routines.length % ROUTINE_COLORS.length] };
  return `<form data-submit="saveRoutine" data-id="${r.id || ''}" style="display:flex;flex-direction:column;gap:14px">
    <h2>${isNew ? 'Nueva rutina' : 'Editar rutina'}</h2>
    <label class="field"><span>Nombre</span><input name="name" type="text" maxlength="30" required value="${esc(r.name)}"></label>
    <label class="field"><span>Enfoque</span><input name="focus" type="text" maxlength="40" value="${esc(r.focus)}" placeholder="Ej. Pierna, Brazo, Pecho y hombro"></label>
    <div class="field"><span>Color</span><div class="swatches" role="group" aria-label="Color">
      ${ROUTINE_COLORS.map((c) => `<button type="button" class="swatch" style="background:${c}" data-act="chip" data-name="color" data-val="${c}" aria-pressed="${c === r.color}" aria-label="Color ${c}"></button>`).join('')}
    </div><input type="hidden" name="color" value="${esc(r.color)}"></div>
    <div class="sheet-actions">
      <button type="submit" class="btn wide">Guardar</button>
      ${isNew ? '' : `<button type="button" class="btn danger wide" data-act="deleteRoutine" data-id="${r.id}">${I.trash} Borrar rutina</button>`}
    </div>
  </form>`;
}

function gymDaySheet(d) {
  const cur = S.gym[d];
  const opts = S.routines.map((r) => `<button type="button" class="routine" data-act="setGym" data-date="${d}" data-val="${r.id}" aria-pressed="${cur === r.id}">
      <span class="r-badge" style="background:${r.color}">${routineTag(r)}</span>
      <span class="li-main"><b>${esc(r.name)}</b><small>${esc(r.focus || '')}</small></span>
      ${cur === r.id ? `<span class="in">${I.check}</span>` : ''}
    </button>`).join('');
  return `<h2>${d === todayIso() ? '¿Qué entrenaste hoy?' : '¿Qué entrenaste el ' + fmtLong(d) + '?'}</h2>
    ${opts || '<p class="muted small">Aún no tienes rutinas. Puedes registrar un entreno libre o crear una rutina primero.</p>'}
    <button type="button" class="routine" data-act="setGym" data-date="${d}" data-val="libre">
      <span class="r-badge" style="background:#a3abb9">•</span>
      <span class="li-main"><b>Entreno libre</b><small>Sin rutina específica</small></span>
      ${cur === 'libre' ? `<span class="in">${I.check}</span>` : ''}
    </button>
    ${cur ? `<button type="button" class="btn danger wide" data-act="setGym" data-date="${d}" data-val="">No fui ese día</button>` : ''}`;
}

function pickerSheet() {
  const mine = Object.values(S.exercises).sort((a, b) => a.name.localeCompare(b.name));
  const tabs = `<div class="seg" role="group" aria-label="Origen">
    <button type="button" data-act="pickerTab" data-t="lib" aria-pressed="${ui.pickerTab === 'lib'}">Biblioteca</button>
    <button type="button" data-act="pickerTab" data-t="mine" aria-pressed="${ui.pickerTab === 'mine'}">Mis ejercicios (${mine.length})</button>
  </div>`;
  let body;
  if (ui.pickerTab === 'lib') {
    body = `<label class="field"><span>Buscar (en español o inglés)</span><input type="search" id="exSearch" value="${esc(ui.libQuery)}" placeholder="Ej. sentadilla, curl, press banca" autocomplete="off"></label>
      <div class="chips" role="group" aria-label="Grupo muscular">
        ${GROUPS.map((g) => `<button type="button" class="chip" data-act="libGroup" data-val="${g.id}" aria-pressed="${ui.libGroup === g.id}">${g.label}</button>`).join('')}
      </div>
      <div id="exResults" class="ex-grid"><p class="empty" style="grid-column:1/-1">Cargando biblioteca…</p></div>`;
  } else {
    body = mine.length
      ? `<div class="ex-grid">${mine.map((e) => exPickCard(e.id, e.name, e.muscle, e.img, 'pickMine')).join('')}</div>`
      : '<p class="empty">Aquí aparecen los ejercicios que ya usaste y los que crees tú.</p>';
  }
  return `<h2>Agregar ejercicio</h2>
    <button type="button" class="btn ghost wide" data-act="newCustomEx">${I.camera} Crear ejercicio propio con tu foto</button>
    ${tabs}${body}`;
}
function exPickCard(id, name, muscle, img, act) {
  return `<button type="button" class="ex-pick" data-act="${act}" data-id="${esc(id)}">
    <span class="img">${imgOrPh(img, '')}</span>
    <span class="t"><b>${esc(name)}</b><small>${esc(muscle || '')}</small></span>
  </button>`;
}
let searchTimer = null;
async function renderLibResults() {
  const box = $('#exResults');
  if (!box) return;
  try {
    await loadLib();
  } catch {
    box.innerHTML = '<p class="empty" style="grid-column:1/-1">No se pudo cargar la biblioteca. Revisa tu internet o crea un ejercicio propio.</p>';
    return;
  }
  if (!$('#exResults')) return;
  if (!ui.libQuery.trim() && !ui.libGroup) {
    box.innerHTML = '<p class="empty" style="grid-column:1/-1">Escribe un ejercicio o elige un grupo muscular. Hay más de 800 con foto.</p>';
    return;
  }
  const res = searchLib(ui.libQuery, ui.libGroup);
  box.innerHTML = res.length
    ? res.map((e) => exPickCard(e.id, e.name, MUSCLE_ES[e.m] || e.m, e.img, 'pickLib')).join('')
    : '<p class="empty" style="grid-column:1/-1">Nada por aquí. Prueba con otra palabra (en inglés suele encontrar más).</p>';
}

let draftPhoto = null;
function exerciseForm(ex, itemIndex) {
  const isNew = !ex;
  ex = ex || { name: '', muscle: 'Pierna', img: '' };
  draftPhoto = ex.img || null;
  const opts = MUSCLE_OPTIONS.includes(ex.muscle) || !ex.muscle ? MUSCLE_OPTIONS : [ex.muscle, ...MUSCLE_OPTIONS];
  return `<form data-submit="saveExercise" data-ex="${esc(ex.id || '')}" data-i="${itemIndex ?? ''}" style="display:flex;flex-direction:column;gap:14px">
    <h2>${isNew ? 'Ejercicio propio' : 'Editar ejercicio'}</h2>
    <div class="photo-pick">
      <button type="button" class="ex-img" id="draftImg" data-act="draftPhoto" aria-label="Elegir foto">${imgOrPh(draftPhoto, 'Foto del ejercicio')}</button>
      <div class="col" style="display:flex;flex-direction:column;gap:8px">
        <button type="button" class="btn-sm" data-act="draftPhoto">${I.camera} ${isNew ? 'Tomar o elegir foto' : 'Cambiar foto'}</button>
        <small class="muted">Desde la cámara o tu galería</small>
      </div>
    </div>
    <label class="field"><span>Nombre</span><input name="name" type="text" maxlength="50" required value="${esc(ex.name)}" placeholder="Ej. Sentadilla búlgara"></label>
    <label class="field"><span>Músculo</span><select name="muscle">${opts.map((o) => `<option${o === ex.muscle ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></label>
    <div class="sheet-actions">
      <button type="submit" class="btn wide">${isNew ? 'Crear y agregar a la rutina' : 'Guardar'}</button>
      ${itemIndex != null && itemIndex !== '' ? `<button type="button" class="btn danger wide" data-act="removeItem" data-i="${itemIndex}">${I.trash} Quitar de la rutina</button>` : ''}
    </div>
  </form>`;
}

/* =====================================================================
   VISTA: AJUSTES
   ===================================================================== */
function viewAjustes() {
  const s = S.settings;
  const field = (key, label, step, hint) => `<label class="field"><span>${label}</span>
    <input type="number" inputmode="decimal" min="0" step="${step}" value="${esc(s[key])}" data-change="setting" data-key="${key}">
    ${hint ? `<small class="faint">${hint}</small>` : ''}</label>`;
  const sal = isSalaryMode();
  return `
  <header class="top"><div><h1>Ajustes</h1><p class="sub">Cambia estos valores cuando suba el dólar o tu pago</p></div></header>
  <section class="card" aria-label="Tipo de trabajo">
    <div class="sec-head"><h2>Tipo de trabajo</h2></div>
    <div class="seg" role="group" aria-label="Tipo de trabajo">
      <button type="button" data-act="setMode" data-val="hourly" aria-pressed="${!sal}">Por horas</button>
      <button type="button" data-act="setMode" data-val="salary" aria-pressed="${sal}">Sueldo fijo</button>
    </div>
    ${sal ? `
    <label class="field"><span>Sueldo mensual (pesos)</span>
      <div class="money-input"><input type="number" inputmode="numeric" min="0" step="1" value="${esc(s.salary || '')}" placeholder="Escribe tu sueldo del mes" data-change="setting" data-key="salary"></div>
    </label>
    <label class="field"><span>¿Cómo te pagan?</span>
      <select data-change="setting" data-key="salaryFreq" data-type="str">
        <option value="biweekly"${s.salaryFreq !== 'monthly' ? ' selected' : ''}>Cada quincena: mitad el 15 y mitad el 30</option>
        <option value="monthly"${s.salaryFreq === 'monthly' ? ' selected' : ''}>Cada mes: todo el 30</option>
      </select>
    </label>
    ${dateField('salaryStart', 'Empiezas a recibir sueldo desde', s.salaryStart, 'data-change="setting" data-key="salaryStart" data-type="str"')}
    <p class="muted small">Tus horas de antes de esa fecha no se pierden: el último pago por horas te sigue apareciendo cuando llegue (quincena vencida).</p>`
    : '<p class="muted small">Cuando empieces las prácticas, cambia a «Sueldo fijo». Tus horas registradas se conservan.</p>'}
  </section>
  <section class="card" aria-label="Pago por horas">
    <div class="sec-head"><h2>${sal ? 'Trabajo por horas (anterior)' : 'Pago por horas'}</h2></div>
    <div class="fields-2">
      ${field('rateUsd', 'Pago por hora (USD)', '0.25')}
      ${field('fx', 'Dólar en pesos', '1')}
    </div>
    <div class="day-total"><span class="muted">Te pagan por hora</span><strong>${money(rateCop())}</strong></div>
    <div class="fields-2">
      ${field('breakMin', 'Minutos por break', '1')}
      ${field('typicalHours', 'Horas normales por quincena', '0.5', 'Para estimar quincenas futuras')}
    </div>
  </section>
  <section class="card" aria-label="Tus datos">
    <div class="sec-head"><h2>Tus datos</h2></div>
    <p class="muted small">Todo se guarda solo en este teléfono. Haz una copia de vez en cuando por si cambias de celular o borras el navegador.</p>
    <button type="button" class="btn ghost wide" data-act="exportData">${I.download} Descargar copia de seguridad</button>
    <button type="button" class="btn ghost wide" data-act="importData">${I.upload} Restaurar una copia</button>
    <button type="button" class="btn danger wide" data-act="resetData">${I.trash} Borrar todo</button>
  </section>
  <p class="faint small" style="text-align:center">Thrive · fotos de ejercicios de free-exercise-db (dominio público)</p>`;
}

/* =====================================================================
   Render y eventos
   ===================================================================== */
const VIEWS = { trabajo: viewTrabajo, dinero: viewDinero, gym: viewGym, ajustes: viewAjustes };
function render() {
  $('#view').innerHTML = VIEWS[ui.tab]();
  document.querySelectorAll('.tabbar button').forEach((b) => b.setAttribute('aria-current', b.dataset.tab === ui.tab ? 'page' : 'false'));
}
function setTab(t) {
  ui.tab = t;
  ui.routineId = null;
  history.replaceState(null, '', '#' + t);
  render();
  scrollTo(0, 0);
}
function currentRoutine() { return routineById(ui.routineId); }
// Al cambiar de quincena, el día que se edita queda dentro de esa quincena.
function syncWorkDate() {
  if (inRange(ui.workDate, ui.period)) return;
  const t = todayIso();
  ui.workDate = inRange(t, ui.period) ? t : pEnd(ui.period) < t ? pEnd(ui.period) : pStart(ui.period);
}

const ACT = {
  closeSheet: () => closeSheet(),
  // Selector de fecha
  toggleDate(el) {
    const box = el.closest('.datefield');
    const dp = box.querySelector('.dp');
    const open = dp.hidden;
    document.querySelectorAll('.datefield .dp').forEach((x) => { x.hidden = true; x.previousElementSibling.setAttribute('aria-expanded', 'false'); });
    if (!open) return;
    const v = parse(box.querySelector('input').value || todayIso());
    box.dataset.y = v.getFullYear(); box.dataset.m = v.getMonth() + 1;
    dp.innerHTML = dpHtml(box);
    dp.hidden = false;
    el.setAttribute('aria-expanded', 'true');
  },
  dpMove(el) {
    const box = el.closest('.datefield');
    let y = +box.dataset.y, m = +box.dataset.m + +el.dataset.dir;
    if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; }
    box.dataset.y = y; box.dataset.m = m;
    box.querySelector('.dp').innerHTML = dpHtml(box);
  },
  dpPick(el) {
    const box = el.closest('.datefield');
    const inp = box.querySelector('input');
    inp.value = el.dataset.date;
    box.querySelector('.date-txt').textContent = fmtLong(el.dataset.date);
    box.querySelector('.dp').hidden = true;
    box.querySelector('.date-btn').setAttribute('aria-expanded', 'false');
    inp.dispatchEvent(new Event('change', { bubbles: true }));
  },
  // Trabajo
  step(el) {
    const f = el.dataset.field, dir = +el.dataset.dir;
    const w = S.work[ui.workDate] || (S.work[ui.workDate] = { shift: 0, noShift: 0, breaks: 0 });
    const inc = f === 'breaks' ? 1 : 0.5;
    const max = f === 'breaks' ? 99 : 24;
    w[f] = Math.max(0, Math.min(max, num(w[f]) + dir * inc));
    if (!num(w.shift) && !num(w.noShift) && !num(w.breaks)) delete S.work[ui.workDate];
    save(); render();
  },
  dayPrev() { ui.workDate = addDays(ui.workDate, -1); ui.period = periodOf(ui.workDate); render(); },
  dayNext() { ui.workDate = addDays(ui.workDate, 1); ui.period = periodOf(ui.workDate); render(); },
  goToday() { ui.workDate = todayIso(); ui.period = periodOf(ui.workDate); render(); },
  pickDay(el) { ui.workDate = el.dataset.date; ui.period = periodOf(ui.workDate); render(); scrollTo({ top: 0, behavior: 'smooth' }); },
  // Lleva a Dinero, a la quincena en que llega ese pago.
  goMoney(el) { ui.period = periodOf(el.dataset.date); setTab('dinero'); },
  confirmPay(el) {
    S.received[el.dataset.key] = num(el.dataset.amount);
    save(); render(); toast('Pago registrado en Dinero');
  },
  pPrev() { ui.period = pPrev(ui.period); syncWorkDate(); render(); },
  pNext() { ui.period = pNext(ui.period); syncWorkDate(); render(); },
  // Dinero
  addExpense() { openSheet(expenseForm(null)); },
  editExpense(el) { const x = S.expenses.find((e) => e.id === el.dataset.id); if (x) openSheet(expenseForm(x)); },
  deleteExpense(el) {
    if (!confirm('¿Borrar este gasto?')) return;
    S.expenses = S.expenses.filter((e) => e.id !== el.dataset.id);
    save(); closeSheet(); render(); toast('Gasto borrado');
  },
  addIncome() { openSheet(incomeForm(null)); },
  editIncome(el) { const x = (S.incomes || []).find((e) => e.id === el.dataset.id); if (x) openSheet(incomeForm(x)); },
  deleteIncome(el) {
    if (!confirm('¿Borrar este ingreso?')) return;
    S.incomes = S.incomes.filter((e) => e.id !== el.dataset.id);
    save(); closeSheet(); render(); toast('Ingreso borrado');
  },
  addDebt() { openSheet(debtForm(null)); },
  editDebt(el) { const d = S.debts.find((x) => x.id === el.dataset.id); if (d) openSheet(debtForm(d)); },
  deleteDebt(el) {
    if (!confirm('¿Borrar esta deuda y su historial de pagos?')) return;
    S.debts = S.debts.filter((x) => x.id !== el.dataset.id);
    save(); closeSheet(); render(); toast('Deuda borrada');
  },
  payDebt(el) {
    const d = S.debts.find((x) => x.id === el.dataset.id);
    if (!d || !(d.remaining > 0)) return;
    d.paid = d.paid || [];
    d.paid.push({ due: d.nextDate, date: todayIso(), amount: num(d.installment) });
    d.remaining -= 1;
    d.nextDate = d.remaining > 0 ? stepDate(d.nextDate, d.freq, d.anchor) : null;
    save(); render();
    toast(d.remaining > 0 ? `Listo. Próximo pago: ${fmtShort(d.nextDate)}` : '¡Deuda pagada por completo!');
  },
  undoPay(el) {
    const d = S.debts.find((x) => x.id === el.dataset.id);
    if (!d || !d.paid || !d.paid.length) return;
    const last = d.paid.pop();
    d.remaining = (d.remaining || 0) + 1;
    d.nextDate = last.due;
    save(); closeSheet(); render(); toast('Pago deshecho');
  },
  chip(el) {
    const form = el.closest('form');
    form.querySelectorAll(`[data-name="${el.dataset.name}"]`).forEach((b) => b.setAttribute('aria-pressed', String(b === el)));
    form.querySelector(`input[name="${el.dataset.name}"]`).value = el.dataset.val;
  },
  // Gym
  calPrev() { let { y, m } = ui.cal; m--; if (m < 1) { m = 12; y--; } ui.cal = { y, m }; render(); },
  calNext() { let { y, m } = ui.cal; m++; if (m > 12) { m = 1; y++; } ui.cal = { y, m }; render(); },
  gymDay(el) { openSheet(gymDaySheet(el.dataset.date)); },
  setGym(el) {
    const d = el.dataset.date, v = el.dataset.val;
    const before = streak();
    if (v) S.gym[d] = v; else delete S.gym[d];
    save(); closeSheet(); render();
    const after = streak();
    if (v && after > before) toast(`Racha de ${after} día${after === 1 ? '' : 's'}`);
  },
  addRoutine() { openSheet(routineForm(null)); },
  editRoutine() { const r = currentRoutine(); if (r) openSheet(routineForm(r)); },
  deleteRoutine(el) {
    const r = routineById(el.dataset.id);
    if (!r || !confirm(`¿Borrar ${r.name}? Los días del calendario quedarán como entreno libre.`)) return;
    S.routines = S.routines.filter((x) => x.id !== r.id);
    for (const [d, v] of Object.entries(S.gym)) if (v === r.id) S.gym[d] = 'libre';
    save(); closeSheet();
    if (ui.routineId === r.id) ACT.closeRoutine(); else render();
    toast('Rutina borrada');
  },
  openRoutine(el) { ui.routineId = el.dataset.id; history.pushState({ routine: 1 }, ''); render(); scrollTo(0, 0); },
  closeRoutine() { if (history.state && history.state.routine) history.back(); else { ui.routineId = null; render(); } },
  addExercise() { openSheet(pickerSheet()); if (ui.pickerTab === 'lib') renderLibResults(); },
  pickerTab(el) { ui.pickerTab = el.dataset.t; $('#sheetBody').innerHTML = pickerSheet(); if (ui.pickerTab === 'lib') renderLibResults(); },
  libGroup(el) {
    ui.libGroup = ui.libGroup === el.dataset.val ? '' : el.dataset.val;
    document.querySelectorAll('[data-act="libGroup"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.val === ui.libGroup)));
    renderLibResults();
  },
  pickLib(el) {
    const e = LIB && LIB.find((x) => x.id === el.dataset.id);
    const r = currentRoutine();
    if (!e || !r) return;
    const id = 'db:' + e.id;
    if (!S.exercises[id]) S.exercises[id] = { id, name: e.name, muscle: MUSCLE_ES[e.m] || e.m, img: e.img, custom: false };
    r.items.push({ exId: id, sets: 3, reps: '10', weight: '' });
    save(); closeSheet(); render(); toast('Ejercicio agregado');
  },
  pickMine(el) {
    const r = currentRoutine();
    if (!r || !S.exercises[el.dataset.id]) return;
    r.items.push({ exId: el.dataset.id, sets: 3, reps: '10', weight: '' });
    save(); closeSheet(); render(); toast('Ejercicio agregado');
  },
  newCustomEx() { $('#sheetBody').innerHTML = exerciseForm(null); },
  editEx(el) {
    const r = currentRoutine();
    const it = r && r.items[+el.dataset.i];
    if (it) openSheet(exerciseForm(S.exercises[it.exId] || { id: it.exId, name: '', muscle: '' }, +el.dataset.i));
  },
  async draftPhoto() {
    const img = await pickPhoto();
    if (!img) return;
    draftPhoto = img;
    const box = $('#draftImg');
    if (box) box.innerHTML = imgOrPh(img, 'Foto del ejercicio');
  },
  async exPhoto(el) {
    const ex = S.exercises[el.dataset.ex];
    if (!ex) return;
    const img = await pickPhoto();
    if (!img) return;
    ex.img = img;
    save(); render(); toast('Foto actualizada');
  },
  removeItem(el) {
    const r = currentRoutine();
    if (!r) return;
    r.items.splice(+el.dataset.i, 1);
    save(); closeSheet(); render(); toast('Ejercicio quitado');
  },
  // Ajustes
  setMode(el) {
    const v = el.dataset.val;
    if (v === S.settings.mode) return;
    if (v === 'salary' && !S.settings.salaryStart) S.settings.salaryStart = pStart(pNext(periodOf(todayIso())));
    S.settings.mode = v;
    save(); render();
    toast(v === 'salary' ? 'Ahora calculas con sueldo fijo' : 'Ahora calculas por horas');
  },
  exportData() {
    const blob = new Blob([JSON.stringify(S)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `thrive-copia-${todayIso()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  },
  importData() {
    const inp = $('#importInput');
    inp.value = '';
    inp.onchange = async () => {
      const f = inp.files && inp.files[0];
      if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        if (!data || typeof data !== 'object' || !data.settings) throw new Error('formato');
        if (!confirm('Esto reemplaza todos los datos actuales por los de la copia. ¿Continuar?')) return;
        S = hydrate(data); save(); render(); toast('Copia restaurada');
      } catch { toast('Ese archivo no es una copia válida'); }
    };
    inp.click();
  },
  resetData() {
    if (!confirm('¿Borrar TODOS tus datos? No se puede deshacer.')) return;
    if (!confirm('Última confirmación: se borran horas, gastos, deudas y rutinas.')) return;
    S = DEFAULT_STATE(); save(); render(); toast('Datos borrados');
  }
};

const SUBMIT = {
  saveExpense(form, fd) {
    const id = form.dataset.id;
    const x = { id: id || uid(), amount: Math.round(num(fd.get('amount'))), desc: String(fd.get('desc') || '').trim(), cat: fd.get('cat') || 'Otros', date: fd.get('date') };
    if (!x.amount) return toast('Escribe el valor');
    if (id) S.expenses = S.expenses.map((e) => (e.id === id ? x : e)); else S.expenses.push(x);
    ui.period = periodOf(x.date);
    save(); closeSheet(); render(); toast(id ? 'Gasto actualizado' : 'Gasto agregado');
  },
  saveIncome(form, fd) {
    const id = form.dataset.id;
    const x = { id: id || uid(), amount: Math.round(num(fd.get('amount'))), desc: String(fd.get('desc') || '').trim(), src: fd.get('src') || 'Otro', date: fd.get('date') };
    if (!x.amount) return toast('Escribe el valor');
    S.incomes = S.incomes || [];
    if (id) S.incomes = S.incomes.map((e) => (e.id === id ? x : e)); else S.incomes.push(x);
    ui.period = periodOf(x.date);
    save(); closeSheet(); render(); toast(id ? 'Ingreso actualizado' : 'Ingreso agregado');
  },
  saveDebt(form, fd) {
    const id = form.dataset.id;
    const old = id && S.debts.find((d) => d.id === id);
    const freq = fd.get('freq');
    const nextDate = fd.get('nextDate');
    let remaining = Math.max(0, Math.round(num(fd.get('remaining'))));
    if (freq === 'once' && remaining > 1) remaining = 1;
    const d = Object.assign(old || { id: uid(), paid: [] }, {
      name: String(fd.get('name') || '').trim(),
      installment: Math.round(num(fd.get('installment'))),
      nextDate, freq, remaining,
      anchor: parse(nextDate).getDate()
    });
    if (!old) S.debts.push(d);
    save(); closeSheet(); render(); toast(old ? 'Deuda actualizada' : 'Deuda agregada');
  },
  saveRoutine(form, fd) {
    const id = form.dataset.id;
    const name = String(fd.get('name') || '').trim() || 'Rutina';
    const focus = String(fd.get('focus') || '').trim();
    const color = fd.get('color') || ROUTINE_COLORS[0];
    if (id) {
      Object.assign(routineById(id), { name, focus, color });
      save(); closeSheet(); render();
    } else {
      const r = { id: uid(), name, focus, color, items: [] };
      S.routines.push(r);
      save(); closeSheet(false, { routine: 1 });
      ui.routineId = r.id; render(); scrollTo(0, 0);
    }
  },
  saveExercise(form, fd) {
    const name = String(fd.get('name') || '').trim();
    if (!name) return toast('Ponle un nombre');
    const muscle = fd.get('muscle');
    const exId = form.dataset.ex;
    if (exId && S.exercises[exId]) {
      Object.assign(S.exercises[exId], { name, muscle, img: draftPhoto || S.exercises[exId].img });
      save(); closeSheet(); render(); toast('Ejercicio actualizado');
      return;
    }
    const id = 'c:' + uid();
    S.exercises[id] = { id, name, muscle, img: draftPhoto || '', custom: true };
    const r = currentRoutine();
    if (r) r.items.push({ exId: id, sets: 3, reps: '10', weight: '' });
    save(); closeSheet(); render(); toast('Ejercicio creado');
  }
};

const CHANGE = {
  received(el) {
    const k = el.dataset.key;
    if (el.value === '') delete S.received[k]; else S.received[k] = Math.round(num(el.value));
    save(); render();
  },
  setting(el) {
    const k = el.dataset.key;
    if (el.dataset.type === 'str') {
      if (!el.value) return;
      S.settings[k] = el.value;
    } else {
      const v = num(el.value);
      if (v < 0) return;
      S.settings[k] = v;
    }
    save(); render(); toast('Guardado');
  },
  item(el) {
    const r = currentRoutine();
    const it = r && r.items[+el.dataset.i];
    if (!it) return;
    it[el.dataset.k] = el.value;
    save();
  }
};

document.addEventListener('click', (e) => {
  const tab = e.target.closest('[data-tab]');
  if (tab) { setTab(tab.dataset.tab); return; }
  const el = e.target.closest('[data-act]');
  if (el && ACT[el.dataset.act]) ACT[el.dataset.act](el, e);
});
document.addEventListener('change', (e) => {
  const el = e.target.closest('[data-change]');
  if (el && CHANGE[el.dataset.change]) CHANGE[el.dataset.change](el, e);
});
document.addEventListener('submit', (e) => {
  const form = e.target.closest('form[data-submit]');
  if (!form) return;
  e.preventDefault();
  SUBMIT[form.dataset.submit](form, new FormData(form));
});
document.addEventListener('input', (e) => {
  if (e.target.id !== 'exSearch') return;
  ui.libQuery = e.target.value;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(renderLibResults, 200);
});
window.addEventListener('popstate', () => {
  if (sheetOpen) { closeSheet(true); return; }
  const st = history.state || {};
  if (ui.routineId && !st.routine && !st.sheet) { ui.routineId = null; render(); }
});

// ---------- Arranque ----------
(async function boot() {
  try {
    const saved = await kvGet('state');
    if (saved) S = hydrate(saved);
    else {
      const ls = localStorage.getItem('thrive-state');
      if (ls) S = hydrate(JSON.parse(ls));
    }
  } catch {
    try { const ls = localStorage.getItem('thrive-state'); if (ls) S = hydrate(JSON.parse(ls)); } catch {}
  }
  const t = location.hash.slice(1);
  if (VIEWS[t]) ui.tab = t;
  history.replaceState(null, '', '#' + ui.tab);
  render();
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
