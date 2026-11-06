#!/usr/bin/env python3
"""Exploración Bluetooth LE de lectura solamente para el Amazfit propio.

No lee datos personales, no escribe características GATT, no solicita claves,
no modifica configuraciones del dispositivo. La exploración opcional de servicios
requiere confirmación en consola y puede interrumpir la sincronización con Zepp.
"""
import argparse
import asyncio

try:
    from bleak import BleakClient, BleakScanner
except ImportError:
    raise SystemExit(
        "Falta Bleak. Instálalo con: py -m pip install 'bleak>=1.0,<4'"
    )


def obscure(identifier: str) -> str:
    """Mostrar identificadores parcialmente ocultos para compartir capturas."""
    return "…" + identifier[-5:] if len(identifier) > 5 else "…"


async def main(inspect: bool) -> None:
    print("Buscando dispositivos Bluetooth LE cercanos durante 12 segundos…")
    try:
        found = await BleakScanner.discover(timeout=12, return_adv=True)
    except Exception as error:
        print(f"Error de exploración: {error}")
        print("Revisa que tu PC tenga Bluetooth LE y esté habilitado.")
        return

    entries = sorted(
        [value for value in found.values()],
        key=lambda pair: (pair[1].local_name or pair[0].name or "").lower(),
    )
    if not entries:
        print("No se han detectado dispositivos. La ausencia no prueba incompatibilidad.")
        print("Comprueba Bluetooth de Windows, distancia, alimentación y si el reloj anuncia BLE.")
        return

    print(f"Detectados: {len(entries)} dispositivos. Los identificadores están ocultos.")
    for idx, (device, advert) in enumerate(entries, start=1):
        name = advert.local_name or device.name or "Sin nombre"
        print(f"  {idx:2}. {name[:45]} | ID {obscure(str(device.address))} | señal {advert.rssi} dBm")

    if not inspect:
        print("\nExploración terminada: sin conectar ni interactuar con ningún dispositivo.")
        print("Para enumerar servicios GATT (solo después de leer las advertencias):")
        print("  py tools/scan_watch.py --inspect")
        return

    print("\nATENCIÓN: conectar desde Windows podría desconectar temporalmente Zepp.")
    print("No desvincules el reloj ni restablezcas su configuración.")
    selected = input("Número del dispositivo que es TU reloj (0 = cancelar): ").strip()
    if not selected.isdigit() or not 1 <= int(selected) <= len(entries):
        print("Cancelado.")
        return
    response = input("¿Conectar solo para enumerar servicios GATT? Escribe SI: ").strip().upper()
    if response != "SI":
        print("Cancelado.")
        return
    device = entries[int(selected) - 1][0]
    try:
        async with BleakClient(device, timeout=18) as client:
            print("Conexión establecida. Servicios disponibles:")
            for service in client.services:
                print(f"  Servicio {service.uuid}: {service.description}")
                for characteristic in service.characteristics:
                    props = ", ".join(characteristic.properties)
                    print(f"    Característica {characteristic.uuid} [{props}]")
            print("Enumeración terminada. No se han leído ni escrito valores.")
    except Exception as error:
        print(f"No se pudo enumerar: {error}")
        print("Puede deberse a cifrado, emparejamiento, falta de anuncios, o conexión con Zepp.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Explorar Bluetooth LE sin modificar el Amazfit")
    parser.add_argument("--inspect", action="store_true", help="Pedir permiso para conectar y enumerar servicios GATT")
    args = parser.parse_args()
    asyncio.run(main(args.inspect))
