# health-watch / Pulso

Proyecto experimental para sustituir progresivamente Zepp en un Amazfit Active 2 Round usado con iPhone 11.

## Estado (6 noviembre de 2026)
- **Disponible:** simulador web interactivo con métricas sintéticas, escenarios de fallo, diagnóstico de calidad de datos, análisis WASO experimental y diario local.
- **Pendiente:** acceso BLE directo, sincronización real, emparejamiento, notificaciones del reloj, instalación nativa iOS y validación de los algoritmos con datos reales.
- **Importante:** **nada de lo que muestra el simulador procede de tu reloj**; no son consejos clínicos ni diagnósticos.

## Cómo ejecutar en Windows
Con Node.js instalado, dentro del repositorio:

```bash
npx --yes serve . -l 4173
```

Abre http://localhost:4173 en Chrome o Edge y cambia los escenarios desde el selector. En DevTools (F12 → Ctrl+Shift+M), usa una pantalla de 390 × 844 para simular un iPhone 11. También puedes abrir `index.html` mediante un servidor estático de VS Code («Live Server»). No hace falta tener un Mac ni conectar el reloj.

Para comprobar el motor:
```bash
node --test tests/analysis.test.mjs
```

## Arquitectura
- `lib/analysis.mjs`: análisis puro e independiente de la interfaz o del origen de datos; comprueba frescura, cobertura, validez y referencias.
- `lib/scenarios.mjs`: escenarios sintéticos reproducibles para el simulador.
- `src/app.mjs`: interfaz y diario local.
- `docs/DIRECT-BLE.md`: hoja de ruta para sustituir Zepp por Bluetooth nativo iOS.
- `tests/analysis.test.mjs`: pruebas de regresión para alertas WASO y falta de datos.

La lectura real del reloj deberá implementarse como adaptador que produzca el modelo de datos definido. No se necesita Apple Salud para el motor analítico.

## Seguridad y privacidad
El simulador no utiliza cuentas, analytics, librerías externas ni backend. El diario usa `localStorage`: **no es almacenamiento cifrado**, no lo utilices para información clínica sensible. La página se distribuye públicamente; los datos sintéticos del repositorio no contienen información personal.

Nunca subas a GitHub tokens Huami, exportaciones privadas de salud, certificados de firma o credenciales Apple. No desvincules el Amazfit de Zepp mientras investigamos la autenticación.

**Limitaciones:** los umbrales de WASO y calidad son heurísticas de demostración, no están validados clínicamente. Un reloj no puede confirmar por sí solo el sueño ni distinguir siempre ausencia de uso de fallos de sincronización.
