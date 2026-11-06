// Los escenarios son enteramente ficticios y usan fechas relativas para probarse cualquier día.
const pad = n=>String(n).padStart(2,'0');
const dateOffset = (now, days) => { const d = new Date(now.getFullYear(),now.getMonth(),now.getDate(),12); d.setDate(d.getDate()+days); return [d.getFullYear(),pad(d.getMonth()+1),pad(d.getDate())].join('-'); };
export const scenarioOptions = [
  {id:'no-watch',label:'Sin reloj durante un día',description:'No lleva el reloj. El motor no debe llamar anomalía a la ausencia de datos.'},
  {id:'partial',label:'Noche registrada parcialmente',description:'Existe un valor de WASO llamativo pero el registro solo cubre una parte de la noche.'},
  {id:'single',label:'WASO alto una noche',description:'Una noche con muchos despertares después de noches habituales.'},
  {id:'pattern',label:'WASO alto tres noches',description:'Varias noches completas muestran una elevación consistente.'},
  {id:'stable',label:'Noche habitual',description:'Datos recientes y calidad suficiente, sin cambios llamativos.'},
  {id:'unknown',label:'Cobertura desconocida',description:'Hay minutos de sueño, pero no sabemos si se llevaba correctamente el reloj.'},
  {id:'no-sync',label:'Sincronización antigua',description:'Datos que pueden parecer completos pero llevan días sin actualizarse.'}
];
export function buildScenario(id, now = new Date()) {
  const historicalWaso = [23,17,22,20,25,18,21,24];
  const nights = historicalWaso.map((w,i)=>({date:dateOffset(now, i-11), worn:true, wearCoverage:0.96, recordedMinutes:447, sleepMinutes:403-w, wasoMinutes:w}));
  const lastThree = id==='pattern' ? [55,61,72] : id==='single' ? [20,21,71] : [21,25,22];
  for(let i=0;i<3;i++)nights.push({date:dateOffset(now,i-3),worn:true,wearCoverage:0.95,recordedMinutes:455,sleepMinutes:407-lastThree[i],wasoMinutes:lastThree[i]});
  if(id==='no-watch'){nights[nights.length-1]={date:dateOffset(now,-1),worn:false,wearCoverage:0,recordedMinutes:0,sleepMinutes:null,wasoMinutes:null};}
  if(id==='partial'){nights[nights.length-1]={date:dateOffset(now,-1),worn:true,wearCoverage:0.34,recordedMinutes:130,sleepMinutes:98,wasoMinutes:78};}
  if(id==='unknown'){nights[nights.length-1]={date:dateOffset(now,-1),worn:null,wearCoverage:null,recordedMinutes:431,sleepMinutes:367,wasoMinutes:64};}
  if(id==='no-sync'){nights.splice(-1,1);}
  const ageHours = id==='no-watch'?30 : id==='no-sync'?55:2;
  return {id, source:'SIMULACIÓN · DATOS FICTICIOS',lastSyncAt:new Date(now.getTime()-ageHours*3600000).toISOString(),nights};
}
