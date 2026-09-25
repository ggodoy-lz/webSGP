import { NextRequest, NextResponse } from "next/server";
import { verificarAdmin } from "@/lib/admin-auth";
import {
  CATEGORIA_DEFAULT,
  DESCUENTO_AFORO,
  INCIDENCIAS,
  MEDIOS_DE_USO,
  UDA,
} from "@/lib/tarifario-config";

/**
 * Solo lectura, a propósito.
 *
 * Antes esta ruta también escribía `data/tarifario.json`, un archivo que
 * ninguna parte del sitio leía: las calculadoras toman los valores de
 * `lib/tarifario-config.ts`. El panel confirmaba "Guardado" y no cambiaba
 * ninguna tarifa, lo que invitaba a creer lo contrario. Ahora devuelve lo que
 * el motor usa de verdad y no acepta escrituras.
 */
export async function GET(req: NextRequest) {
  const rechazo = verificarAdmin(req);
  if (rechazo) return rechazo;

  return NextResponse.json({
    uda: UDA,
    incidencias: INCIDENCIAS,
    categoriaDefault: CATEGORIA_DEFAULT,
    medios: MEDIOS_DE_USO,
    descuentoAforo: DESCUENTO_AFORO,
    soloLectura: true,
  });
}
