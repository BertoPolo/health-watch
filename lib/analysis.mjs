// Motor puro y sin dependencias. Umbrales de demostración, no validados clínicamente.
export const POLICY = Object.freeze({ maxSyncAgeHours: 24, minCoverage: 0.80, minRecordedMinutes: 240, minSleepMinutes: 120, minBaselineNights: 3, minWasoMinutes: 45, minWasoIncreaseMinutes: 20, minWasoMultiplier: 1.5 });

const validNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const median = (values) => { const s = [...values].sort((a,b)=>a-b); return s.length % 2 ? s[(s.length-1)/2] : (s[s.length/2-1]+s[s.length/2])/2; };
const hoursSince = (when, now) => {
  const time = new Date(when).getTime();
  return !Number.isFinite(time) || time > now.getTime() ? null : (now.getTime()-time)/3600000;
};

export function inspectNight(night) {
  const issues = [];
  if (!night || !/^\d{4}-\d{2}-\d{2}$/.test(night.date || '')) issues.push('Fecha inválida');
  if (night?.worn === false) issues.push('Reloj no utilizado (declarado)');
  if (night?.wearCoverage === null || night?.wearCoverage === undefined) issues.push('Cobertura de uso desconocida');
  else if (!validNumber(night.wearCoverage) || night.wearCoverage < POLICY.minCoverage || night.wearCoverage > 1) issues.push('Cobertura de uso insuficiente o inválida');
  if (!validNumber(night?.recordedMinutes) || night.recordedMinutes < POLICY.minRecordedMinutes || night.recordedMinutes > 960) issues.push('Registro nocturno insuficiente o inválido');
  if (!validNumber(night?.sleepMinutes) || night.sleepMinutes < POLICY.minSleepMinutes || night.sleepMinutes > 960) issues.push('Sueño registrado insuficiente o inválido');
  if (!validNumber(night?.wasoMinutes) || night.wasoMinutes < 0 || night.wasoMinutes > 960) issues.push('WASO no disponible o inválido');
  if (validNumber(night?.recordedMinutes) && validNumber(night?.sleepMinutes) && validNumber(night?.wasoMinutes) && night.sleepMinutes + night.wasoMinutes > night.recordedMinutes + 30) issues.push('Minutos de sueño y WASO incoherentes');
  return { ...night, valid: issues.length === 0, issues };
}

export function analyse(report, now = new Date()) {
  const nights = (Array.isArray(report?.nights) ? report.nights : []).map(inspectNight).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  const last = nights[nights.length - 1] ?? null;
  const syncAge = report?.lastSyncAt ? hoursSince(report.lastSyncAt, now) : null;
  const validNights = nights.filter(n=>n.valid);
  const base = { nights, last, syncAgeHours: syncAge, validCount: validNights.length, baselineMinutes: null, kind: 'indeterminate', grade: 'sin-datos', title: 'No hay datos suficientes', detail: '', recommendation: 'Comprueba el estado de la conexión y vuelve a registrar una noche completa.', reasons: [] };
  if (syncAge === null || syncAge > POLICY.maxSyncAgeHours) return { ...base, kind: 'stale', title: 'Datos no actualizados', detail: 'La última sincronización es antigua o desconocida. No analizamos cambios de sueño con datos desactualizados.', reasons: ['Sincronización fuera del intervalo de 24 horas'] };
  if (!last || !last.valid) return { ...base, kind: 'invalid', title: 'Noche sin datos fiables', detail: 'No calculamos anomalías cuando falta la medición o no se puede verificar su calidad.', reasons: last?.issues ?? ['No hay noches registradas'] };
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
  const nightLabel = [yesterday.getFullYear(),String(yesterday.getMonth()+1).padStart(2,'0'),String(yesterday.getDate()).padStart(2,'0')].join('-');
  if (last.date !== nightLabel) return { ...base, kind: 'stale-night', title: 'No hay registro de anoche', detail: 'Aunque el reloj esté sincronizado, falta una noche reciente y no se generan alertas.', reasons: ['Última noche registrada: '+last.date] };
  const history = validNights.filter(n => n.date < last.date);
  if (history.length < POLICY.minBaselineNights) return { ...base, kind: 'baseline', grade:'informacion', title:'Aún falta una referencia personal', detail:'Necesitamos al menos tres noches anteriores válidas antes de interpretar el WASO.', reasons: ['Solo '+history.length+' noches anteriores aptas'] };
  // Los últimos dos puntos previos NO forman parte de la referencia cuando hay historial suficiente.
  const reference = history.length >= 5 ? history.slice(0,-2) : history;
  const baseline = median(reference.map(n=>n.wasoMinutes));
  const elevated = n => n.wasoMinutes >= POLICY.minWasoMinutes && n.wasoMinutes >= baseline * POLICY.minWasoMultiplier && n.wasoMinutes - baseline >= POLICY.minWasoIncreaseMinutes;
  const lastThree = validNights.slice(-3);
  const repeated = lastThree.filter(n=>elevated(n)).length >= 2;
  if (elevated(last) && repeated) return { ...base, kind: 'pattern', grade:'observacion', baselineMinutes: baseline, title:'Varias noches con WASO elevado', detail:'Se observa una diferencia repetida frente a tus noches de referencia. No prueba una enfermedad ni una causa concreta.', recommendation:'Revisa horarios, interrupciones y sensación al despertar. Si el problema persiste o hay somnolencia importante, consulta a un profesional.', reasons:['2 o más de las últimas 3 noches válidas superan la referencia experimental'] };
  if (elevated(last)) return { ...base, kind: 'single', grade:'informacion', baselineMinutes: baseline, title:'Cambio puntual de WASO', detail:'La última noche fue distinta, pero todavía no hay un patrón consistente.', recommendation:'Añade una nota sobre la noche y observa las siguientes mediciones antes de sacar conclusiones.', reasons:['Un episodio aislado no equivale a una tendencia'] };
  return { ...base, kind:'stable', grade:'informacion', baselineMinutes: baseline, title:'Sin cambio repetido de WASO', detail:'No aparece una elevación repetida en las noches comparables disponibles.', recommendation:'Continúa registrando el descanso y cómo te sientes. La ausencia de alerta no garantiza una buena calidad del sueño.', reasons:['Comparación realizada solo con noches que superan los filtros de calidad'] };
}
