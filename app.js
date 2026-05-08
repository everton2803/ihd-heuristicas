/* FaltaFácil v1 — Gestão de Faltas (estático)
   - Dados fictícios
   - LocalStorage
   - Registro por turma + data
   - Relatório por período + export CSV/JSON
*/

const STORAGE_KEY = "faltafacil_absences_v1";

const fakeDB = {
  turmas: [
    {
      id: "1A",
      nome: "1º Ano A",
      alunos: [
        { id: "A01", nome: "Ana Souza" },
        { id: "A02", nome: "Bruno Lima" },
        { id: "A03", nome: "Carla Mendes" },
        { id: "A04", nome: "Diego Santos" },
        { id: "A05", nome: "Elisa Rocha" }
      ]
    },
    {
      id: "2B",
      nome: "2º Ano B",
      alunos: [
        { id: "B01", nome: "Felipe Alves" },
        { id: "B02", nome: "Giovana Pereira" },
        { id: "B03", nome: "Heitor Costa" },
        { id: "B04", nome: "Isabela Nunes" },
        { id: "B05", nome: "João Batista" }
      ]
    }
  ]
};

// ---------- helpers ----------
function $(sel) { return document.querySelector(sel); }
function $$ (sel) { return document.querySelectorAll(sel); }

function todayISO(){
  const d = new Date();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function toast(msg){
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => el.classList.remove("show"), 2200);
}

function loadAll(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  }catch{
    return [];
  }
}
function saveAll(records){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// Estrutura de registro:
// { turmaId, dateISO, studentId, absent: true, justification: "..." }
function upsertRecordsForDay(turmaId, dateISO, dayRecords){
  const all = loadAll();
  // remove registros antigos daquele dia/turma
  const filtered = all.filter(r => !(r.turmaId===turmaId && r.dateISO===dateISO));
  // adiciona novos (apenas faltas marcadas)
  const toInsert = dayRecords.filter(r => r.absent);
  saveAll([...filtered, ...toInsert]);
}

function getRecordsForDay(turmaId, dateISO){
  return loadAll().filter(r => r.turmaId===turmaId && r.dateISO===dateISO);
}

function getTurmaById(id){
  return fakeDB.turmas.find(t => t.id === id);
}

function downloadText(filename, content, mime="text/plain;charset=utf-8"){
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---------- UI refs ----------
const turmaSelect = $("#turmaSelect");
const dataInput = $("#dataInput");
const btnCarregar = $("#btnCarregar");
const btnLimpar = $("#btnLimpar");
const formRegistro = $("#form-registro");
const alunosTbody = $("#alunosTable tbody");

const turmaRelSelect = $("#turmaRelSelect");
const inicioRel = $("#inicioRel");
const fimRel = $("#fimRel");
const btnGerarRel = $("#btnGerarRel");
const btnExportCSV = $("#btnExportCSV");
const btnExportJSON = $("#btnExportJSON");
const relTbody = $("#relTable tbody");

const kpiFaltas = $("#kpiFaltas");
const kpiAlunos = $("#kpiAlunos");
const kpiTaxa = $("#kpiTaxa");

const btnReset = $("#btnReset");

// ---------- navigation ----------
function showView(viewName){
  const map = {
    registro: "#view-registro",
    relatorios: "#view-relatorios",
    ajuda: "#view-ajuda"
  };
  Object.values(map).forEach(id => $(id).classList.add("is-hidden"));
  $(map[viewName]).classList.remove("is-hidden");

  $$(".tab").forEach(b => b.classList.remove("is-active"));
  const active = document.querySelector(`.tab[data-view="${viewName}"]`);
  active.classList.add("is-active");
  $$(".tab").forEach(b => b.removeAttribute("aria-current"));
  active.setAttribute("aria-current","page");
}

$$(".tab").forEach(btn => {
  btn.addEventListener("click", () => showView(btn.dataset.view));
});

// ---------- init selects ----------
function fillTurmas(){
  turmaSelect.innerHTML = "";
  turmaRelSelect.innerHTML = "";
  fakeDB.turmas.forEach(t => {
    const opt1 = document.createElement("option");
    opt1.value = t.id;
    opt1.textContent = `${t.nome} (${t.id})`;
    turmaSelect.appendChild(opt1);

    const opt2 = opt1.cloneNode(true);
    turmaRelSelect.appendChild(opt2);
  });
}

// ---------- registro table ----------
function renderAlunosTable(turmaId, dateISO){
  const turma = getTurmaById(turmaId);
  const records = getRecordsForDay(turmaId, dateISO);
  const recordMap = new Map(records.map(r => [r.studentId, r]));

  alunosTbody.innerHTML = "";

  turma.alunos.forEach(aluno => {
    const saved = recordMap.get(aluno.id);
    const tr = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = aluno.nome;

    const tdChk = document.createElement("td");
    tdChk.className = "col-small";
    tdChk.innerHTML = `
      <label class="chk">
        <input type="checkbox" data-student="${aluno.id}" class="absentChk" ${saved?.absent ? "checked" : ""} />
        <span>Sim</span>
      </label>
    `;

    const tdJust = document.createElement("td");
    tdJust.innerHTML = `
      <textarea
        class="justTxt"
        data-student="${aluno.id}"
        placeholder="Ex.: consulta médica, transporte, etc."
      >${saved?.justification ? escapeHTML(saved.justification) : ""}</textarea>
    `;

    tr.appendChild(tdNome);
    tr.appendChild(tdChk);
    tr.appendChild(tdJust);
    alunosTbody.appendChild(tr);
  });
}

function escapeHTML(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function validateRegistro(){
  if(!turmaSelect.value){
    toast("Selecione uma turma.");
    turmaSelect.focus();
    return false;
  }
  if(!dataInput.value){
    toast("Selecione uma data.");
    dataInput.focus();
    return false;
  }
  return true;
}

btnCarregar.addEventListener("click", () => {
  if(!validateRegistro()) return;
  renderAlunosTable(turmaSelect.value, dataInput.value);
  toast("Registros carregados.");
});

btnLimpar.addEventListener("click", () => {
  $$(".absentChk").forEach(chk => chk.checked = false);
  $$(".justTxt").forEach(t => t.value = "");
  toast("Marcações limpas (não apagou o histórico).");
});

formRegistro.addEventListener("submit", (e) => {
  e.preventDefault();
  if(!validateRegistro()) return;

  const turmaId = turmaSelect.value;
  const dateISO = dataInput.value;

  const dayRecords = [];
  $$(".absentChk").forEach(chk => {
    const studentId = chk.dataset.student;
    const absent = chk.checked;
    const justification = document.querySelector(`.justTxt[data-student="${studentId}"]`)?.value?.trim() || "";
    dayRecords.push({ turmaId, dateISO, studentId, absent, justification });
  });

  upsertRecordsForDay(turmaId, dateISO, dayRecords);
  toast("Faltas salvas com sucesso.");
});

// ---------- relatórios ----------
let lastReport = {
  turmaId: null,
  inicio: null,
  fim: null,
  rows: [],
  faltasTotal: 0,
  alunosComFalta: 0,
  taxaMedia: 0,
  diasComRegistro: 0
};

function inRange(dateISO, startISO, endISO){
  if(startISO && dateISO < startISO) return false;
  if(endISO && dateISO > endISO) return false;
  return true;
}

function generateReport(){
  const turmaId = turmaRelSelect.value;
  const turma = getTurmaById(turmaId);
  const start = inicioRel.value || null;
  const end = fimRel.value || null;

  const all = loadAll().filter(r => r.turmaId === turmaId);
  const filtered = all.filter(r => inRange(r.dateISO, start, end));

  // dias únicos com registro
  const days = new Set(filtered.map(r => r.dateISO));
  const diasComRegistro = days.size;

  // contar por aluno
  const counts = new Map();
  const lastJust = new Map();

  filtered.forEach(r => {
    counts.set(r.studentId, (counts.get(r.studentId)||0) + 1);
    if(r.justification) lastJust.set(r.studentId, r.justification);
  });

  const rows = turma.alunos.map(a => ({
    studentId: a.id,
    nome: a.nome,
    faltas: counts.get(a.id) || 0,
    justificativa: lastJust.get(a.id) || ""
  })).sort((a,b) => b.faltas - a.faltas || a.nome.localeCompare(b.nome));

  const faltasTotal = filtered.length;
  const alunosComFalta = rows.filter(r => r.faltas > 0).length;

  // taxa média aproximada
  const denom = turma.alunos.length * (diasComRegistro || 1);
  const taxaMedia = denom ? (faltasTotal / denom) : 0;

  lastReport = { turmaId, inicio: start, fim: end, rows, faltasTotal, alunosComFalta, taxaMedia, diasComRegistro };

  renderReport();
  toast("Relatório gerado.");
}

function renderReport(){
  kpiFaltas.textContent = String(lastReport.faltasTotal);
  kpiAlunos.textContent = String(lastReport.alunosComFalta);
  kpiTaxa.textContent = `${Math.round(lastReport.taxaMedia * 100)}%`;

  relTbody.innerHTML = "";
  lastReport.rows.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHTML(r.nome)}</td>
      <td class="col-small"><strong>${r.faltas}</strong></td>
      <td>${escapeHTML(r.justificativa || "")}</td>
    `;
    relTbody.appendChild(tr);
  });
}

btnGerarRel.addEventListener("click", generateReport);

btnExportCSV.addEventListener("click", () => {
  if(!lastReport?.rows?.length){
    toast("Gere um relatório antes de exportar.");
    return;
  }
  const turma = getTurmaById(lastReport.turmaId);
  const header = ["Turma","PeriodoInicio","PeriodoFim","Aluno","Faltas","Justificativa"];
  const lines = [header.join(",")];

  lastReport.rows.forEach(r => {
    const row = [
      `"${turma.nome}"`,
      `"${lastReport.inicio || ""}"`,
      `"${lastReport.fim || ""}"`,
      `"${r.nome.replaceAll('"','""')}"`,
      r.faltas,
      `"${(r.justificativa||"").replaceAll('"','""')}"`
    ];
    lines.push(row.join(","));
  });

  downloadText("relatorio_faltas.csv", lines.join("\n"), "text/csv;charset=utf-8");
  toast("CSV exportado.");
});

btnExportJSON.addEventListener("click", () => {
  if(!lastReport?.rows?.length){
    toast("Gere um relatório antes de exportar.");
    return;
  }
  const payload = {
    meta: {
      turmaId: lastReport.turmaId,
      inicio: lastReport.inicio,
      fim: lastReport.fim,
      geradoEm: new Date().toISOString()
    },
    kpis: {
      faltasTotal: lastReport.faltasTotal,
      alunosComFalta: lastReport.alunosComFalta,
      taxaMedia: lastReport.taxaMedia,
      diasComRegistro: lastReport.diasComRegistro
    },
    rows: lastReport.rows
  };
  downloadText("relatorio_faltas.json", JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  toast("JSON exportado.");
});

// ---------- reset ----------
btnReset.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  toast("Dados resetados (LocalStorage limpo).");
});

// ---------- boot ----------
function boot(){
  fillTurmas();
  dataInput.value = todayISO();
  renderAlunosTable(turmaSelect.value, dataInput.value);

  // defaults rel
  inicioRel.value = "";
  fimRel.value = "";
  generateReport();
}

boot();