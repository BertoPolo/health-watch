# Primera prueba de Bluetooth desde Windows (sin Mac ni iPhone)

Esta prueba es opcional y **no sustituye a Zepp**. Sirve para saber si tu ordenador ve el Amazfit Active 2 por Bluetooth de bajo consumo (**BLE**). No necesitamos datos personales para realizarla.

1. Comprueba en **Configuración de Windows → Bluetooth** que tu ordenador tenga adaptador compatible con Bluetooth LE. Si no, sería necesario un adaptador USB BLE.
2. Instala Python si no lo tienes (con el lanzador `py`).
3. Abre PowerShell en la carpeta de `health-watch` y ejecuta:

   ```powershell
   py -m pip install "bleak>=1.0,<4"
   py tools/scan_watch.py
   ```

4. Mantén el reloj encendido cerca del ordenador. Se mostrarán los dispositivos descubiertos con su señal y parte del identificador oculto.
5. Solo cuando el escaneo funcione, puedes intentar una **enumeración de servicios**, que es un paso técnico adicional:

   ```powershell
   py tools/scan_watch.py --inspect
   ```

   Selecciona TU reloj por su número y escribe `SI` cuando se solicite. **Esto puede interrumpir momentáneamente la conexión con Zepp; no hace escrituras.**

**No desvincules el reloj de Zepp ni restablezcas el reloj.** Si no aparece en el escaneo, eso no confirma incompatibilidad: puede no estar anunciándose por BLE en ese momento o Windows puede tener limitaciones con el adaptador.

Puedes compartir conmigo el texto de errores y los nombres de servicios y características, pero **oculta las direcciones/identificadores completos** y nunca envíes tokens, claves de emparejamiento ni datos personales.

La inspección GATT no supone que el protocolo cifrado esté resuelto. El siguiente paso será determinar qué intercambio requiere la autenticación Zepp OS.

Referencias: https://bleak.readthedocs.io/en/latest/api/scanner.html y https://bleak.readthedocs.io/en/latest/api/client.html
