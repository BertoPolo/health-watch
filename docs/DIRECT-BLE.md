# Objetivo: sincronización directa Amazfit Active 2 Round → iPhone

## Viabilidad
- Bluetooth Low Energy (BLE, «Bluetooth de bajo consumo») disponible en iOS mediante Core Bluetooth.
- Gadgetbridge **sí admite el Active 2** pero es un proyecto Android; su código sirve de referencia de protocolo, NO es una librería iOS directamente utilizable.
- Las sesiones BLE Zepp OS requieren autenticación/clave Huami; normalmente se adquiere tras el emparejamiento inicial con Zepp. Recuperar la clave del **propio reloj/cuenta** sin filtrarla será una tarea separada y requiere pruebas.
- Algunas funciones avanzadas pueden usar Bluetooth clásico; **no suponer** que el iPhone puede implementar cualquier perfil clásico propietario. BLE directo para métricas debe validarse primero.
- iOS impone restricciones a escaneo, ejecución en segundo plano y notificaciones; la viabilidad de sustituir todas las funciones de Zepp no está garantizada.
- Safari/PWA (aplicación web instalable) **no ofrece una solución fiable de conexión Bluetooth directa a este reloj en iOS**.
- Compilar/probar binarios iOS sin Mac local requiere un servicio de compilación y, para instalar en iPhone, normalmente cuenta de desarrollador de Apple con firma. El simulador web no requiere cuenta Apple.

## Fases con criterios de aceptación
1. **Simulador:** calidad de muestras, cobertura, ausencia de reloj, WASO, historial y pruebas (actual).
2. **Protocolo:** estudiar adaptador Zepp OS de Gadgetbridge y documentar servicios/características GATT relevantes, cifrado, tipos de datos y si el Active 2 aporta muestras crudas vs resúmenes. No publicar claves.
3. **Prueba física controlada iOS:** compilar cliente Core Bluetooth usando infraestructura macOS en la nube; conectar con autenticación válida; enumerar servicios, leer un dato de prueba. No desvincular Zepp hasta lograrlo.
4. **Sincronización:** conservar marca temporal de lectura, marca temporal de medida, unidad, fuente, calidad, cambios de reloj, zonas horarias y deduplicación. Persistencia cifrada en iOS.
5. **Funciones sustitutas:** sincronización en segundo plano, alarmas y notificaciones, actualización de ajustes del reloj, GPS/rutas y otros solo tras comprobar cada función.
6. **Desinstalar Zepp:** únicamente cuando emparejamiento, recuperación y sincronización funcionen con estabilidad en el iPhone real.

## Contrato de datos para motor analítico
```json
{
  "lastSyncAt": "fecha ISO o null",
  "nights": [
    {
      "date": "YYYY-MM-DD",
      "worn": true,
      "wearCoverage": 0.96,
      "recordedMinutes": 447,
      "sleepMinutes": 390,
      "wasoMinutes": 51
    }
  ]
}
```
`worn` solo puede ser `true`/`false` cuando se sabe, no se deduce automáticamente de una ausencia de datos. `wearCoverage` ha de venir de un origen de datos que proporcione realmente esa métrica o de una inferencia explícita y etiquetada; de lo contrario usar `null`.

## Referencias verificadas
- https://gadgetbridge.org/gadgets/wearables/amazfit/
- https://gadgetbridge.org/basics/topics/zeppos/
- https://gadgetbridge.org/basics/pairing/huami-xiaomi-server/
- https://developer.apple.com/documentation/corebluetooth
- https://expo.dev/articles/testing-and-previewing/test-ios-app-without-mac
- https://devopen.zepp.com/docs/getting-started/introduction

**No es un clon de Zepp ni usa sus marcas, diseños o códigos propietarios.** Se trata de un cliente interoperable experimental para dispositivos propios.
