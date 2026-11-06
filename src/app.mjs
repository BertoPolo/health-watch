import { analyse, POLICY } from '../lib/analysis.mjs';
import { scenarioOptions, buildScenario } from '../lib/scenarios.mjs';
const el = id => document.getElementById(id);
const now = new Date();
const select = el('scenario');
for (const option of scenarioOptions) { const node = document.createElement('option'); node.value = option.id; node.textContent = option.label; select.append(node); }
select.value = 'no-watch';
const diaryKey = 'health-watch-demo-journal-v1';
function setText(id, text) { el(id).textContent = String(text); }
function ageText(n) { return n === null ? 'No disponible' : (n < 1 ? Math.round(n*60)+' minutos' : Math.round(n)+' horas')+' atrás'; }
function renderCheck(parent, ok, text) { const d = document.createElement('div');d.className='check'+(ok?'':' bad');const i=document.createElement('i');i.textContent=ok?'✓':'!';const span=document.createElement('span');span.textContent=text;d.append(i,span);parent.append(d); }
function renderAudit(result) {
  const checks = el('quality-checks');checks.replaceChildren();
  renderCheck(checks,result.syncAgeHours!==null && result.syncAgeHours<=POLICY.maxSyncAgeHours,'Sincronización reciente (máximo 24 h)');
  renderCheck(checks,!!result.last && result.last.wearCoverage>=POLICY.minCoverage,'Cobertura de uso conocida ≥ 80 %');
  renderCheck(checks,!!result.last && result.last.valid,'Duración, WASO y coherencia del registro');
  renderCheck(checks,result.validCount>=4,'Historial de comparación disponible');
  const audit=el('audit');audit.replaceChildren();
  const steps=[
    ['Fuente','Simulador, nunca un reloj real',true],
    ['Frescura','Última sincronización: '+ageText(result.syncAgeHours),result.syncAgeHours!==null&&result.syncAgeHours<=24],
    ['Última noche', result.last ? result.last.date+' · '+(result.last.valid?'datos aptos':result.last.issues.join('; ')):'Sin registro',!!result.last?.valid],
    ['Referencia',result.baselineMinutes===null?'No calculable con las condiciones actuales':result.baselineMinutes+' min WASO (mediana histórica)',result.baselineMinutes!==null],
    ['Decisión',result.reasons[0] || result.title,result.kind==='pattern'||result.kind==='stable']
  ];
  for(const [title,body,ok] of steps){const box=document.createElement('div');box.className='audit-item'+(ok?'':' blocked');const badge=document.createElement('div');badge.className='status';badge.textContent=(ok?'✓':'○')+' '+title.toUpperCase();const p=document.createElement('p');p.textContent=body;box.append(badge,p);audit.append(box);}
}
function renderBars(result){
 const root=el('bars');root.replaceChildren();
 const nights=result.nights.slice(-11);
 for(const night of nights){const column=document.createElement('div');column.className='bar-col'+(night.valid?'':' invalid');const bar=document.createElement('div');bar.className='bar';const minutes=typeof night.wasoMinutes==='number' && Number.isFinite(night.wasoMinutes)?night.wasoMinutes:0;bar.style.height=Math.max(3,Math.min(100,minutes/90*100))+'%';bar.title=night.date+': '+(night.valid?night.wasoMinutes+' min':'registro excluido');const val=document.createElement('span');val.className='value';val.textContent=night.valid?Math.round(minutes):'—';const tick=document.createElement('small');tick.textContent=night.date.slice(-2);column.append(bar,val,tick);root.append(column);}
}
function render(){
 const choice=select.value, data=buildScenario(choice,now), result=analyse(data,now);
 const option=scenarioOptions.find(x=>x.id===choice);
 setText('scenario-description',option.description);setText('phone-date',new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'long',year:'numeric'}).format(now));
 setText('insight-title',result.title);setText('insight-detail',result.detail);setText('insight-advice',result.recommendation);
 setText('insight-grade',result.kind==='pattern'?'PATRÓN · REVISIÓN RECOMENDADA':result.grade==='sin-datos'?'NO CONCLUYENTE · NO GENERAR ALERTA':'INFORMACIÓN · SIN ALARMA');
 // Nunca mostrar valores históricos o parciales como si fueran una medición válida de anoche.
 const last=result.last, allowed=last?.valid && !['stale','stale-night','invalid'].includes(result.kind);
 setText('sleep-val',allowed?(last.sleepMinutes/60).toFixed(1).replace('.',',')+' h':'—');
 setText('waso-val',allowed?Math.round(last.wasoMinutes)+' min':'—');
 setText('last-sync',ageText(result.syncAgeHours));setText('valid-nights',result.validCount+'/'+result.nights.length);
 setText('baseline',result.baselineMinutes===null?'No disponible':Math.round(result.baselineMinutes)+' min');
 renderCheck;renderBars(result);renderAudit(result);
}
select.addEventListener('change',render);
document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',()=>{const name=tab.dataset.tab;document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===tab));document.querySelectorAll('.phone-view').forEach(v=>v.classList.toggle('active',v.id==='view-'+name));}));
function loadNotes(){try{const obj=JSON.parse(localStorage.getItem(diaryKey)||'[]');return Array.isArray(obj)?obj.filter(x=>x&&typeof x.text==='string'&&typeof x.createdAt==='string').slice(-20):[]}catch{return []}}
let notes=loadNotes();
function showNotes(){const node=el('journal-entries');node.replaceChildren();for(const item of notes.slice().reverse()){const card=document.createElement('div');card.className='entry';const small=document.createElement('small');small.textContent=new Date(item.createdAt).toLocaleString('es-ES');const body=document.createElement('div');body.textContent=item.text;card.append(small,body);node.append(card)}}
el('journal-form').addEventListener('submit',evt=>{evt.preventDefault();const text=el('journal-note').value.trim();if(!text)return;const updated=[...notes,{text:text.slice(0,500),createdAt:new Date().toISOString()}].slice(-20);try{localStorage.setItem(diaryKey,JSON.stringify(updated));notes=updated;el('journal-note').value='';setText('journal-status','Nota guardada únicamente en este navegador.');showNotes()}catch{setText('journal-status','Error: no se ha podido guardar la nota.');}});
render();showNotes();
