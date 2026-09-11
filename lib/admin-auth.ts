/**
 * Autenticación de los paneles de administración. Solo servidor.
 *
 * Antes cada ruta repetía la comprobación y, si no había variable de entorno,
 * caía a una contraseña escrita en el código. Como el repositorio es público,
 * esa contraseña era de conocimiento general: sin `ADMIN_PASSWORD` definida en
 * el servidor, cualquiera podía entrar. Ahora, si falta la variable, no se
 * autoriza a nadie.
 */

import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const NO_AUTORIZADO = NextResponse.json({ error: "No autorizado" }, { status: 401 });

const SIN_CONFIGURAR = NextResponse.json(
  { error: "El panel no está configurado. Falta definir ADMIN_PASSWORD en el servidor." },
  { status: 503 },
);

/**
 * Compara sin filtrar por tiempo. Una comparación normal corta en el primer
 * carácter distinto, lo que permite deducir la contraseña midiendo demoras.
 */
function igualdadSegura(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  // timingSafeEqual exige longitudes iguales; comparar los largos aparte no
  // filtra nada útil más allá de la longitud.
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * Devuelve `null` si la petición está autorizada, o la respuesta de error que
 * la ruta debe retornar.
 *
 * Se devuelve la respuesta en vez de lanzar para que cada ruta decida dónde
 * cortar, y para distinguir "contraseña incorrecta" de "panel sin configurar":
 * al operador le sirve saber cuál de las dos es.
 */
export function verificarAdmin(req: NextRequest): NextResponse | null {
  const esperada = process.env.ADMIN_PASSWORD;

  if (!esperada) {
    console.error(
      "[admin] ADMIN_PASSWORD no está definida: se rechaza el acceso al panel.",
    );
    return SIN_CONFIGURAR;
  }

  const recibida = req.headers.get("x-admin-password");
  if (!recibida || !igualdadSegura(recibida, esperada)) return NO_AUTORIZADO;

  return null;
}
