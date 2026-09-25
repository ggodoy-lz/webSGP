/**
 * Autenticación de los paneles de administración. Solo servidor.
 *
 * Antes cada ruta repetía la comprobación y, si no había variable de entorno,
 * caía a una contraseña escrita en el código. Como el repositorio es público,
 * esa contraseña era de conocimiento general: sin `ADMIN_PASSWORD` definida en
 * el servidor, cualquiera podía entrar. Ahora, si falta la variable, no se
 * autoriza a nadie.
 */

import { createHash, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { estaBloqueado, excedeLimite, identificar, LIMITE_INGRESO } from "./limite-peticiones";

/*
 * Las respuestas se crean en cada llamada: el cuerpo de una Response se consume
 * una sola vez, así que devolver la misma instancia a dos peticiones puede
 * dejar la segunda sin cuerpo.
 */

function noAutorizado(): NextResponse {
  return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
}

function demasiadosIntentos(): NextResponse {
  return NextResponse.json(
    { error: "Demasiados intentos fallidos. Probá de nuevo en unos minutos." },
    { status: 429 },
  );
}

function sinConfigurar(): NextResponse {
  return NextResponse.json(
    { error: "El panel no está configurado. Falta definir ADMIN_PASSWORD en el servidor." },
    { status: 503 },
  );
}

/**
 * Compara sin filtrar por tiempo. Una comparación normal corta en el primer
 * carácter distinto, lo que permite deducir la contraseña midiendo demoras. Se
 * comparan los resúmenes y no el texto porque tienen siempre el mismo largo:
 * así tampoco se filtra la longitud de la contraseña.
 */
function igualdadSegura(a: string, b: string): boolean {
  const resumen = (s: string) => createHash("sha256").update(s, "utf8").digest();
  return timingSafeEqual(resumen(a), resumen(b));
}

/**
 * Devuelve `null` si la petición está autorizada, o la respuesta de error que
 * la ruta debe retornar.
 *
 * Se devuelve la respuesta en vez de lanzar para que cada ruta decida dónde
 * cortar, y para distinguir "contraseña incorrecta" de "panel sin configurar":
 * al operador le sirve saber cuál de las dos es.
 *
 * Los fallos cuentan para el tope de intentos en cualquier método. Antes solo
 * se limitaba la carga inicial del panel (GET), y la contraseña se podía probar
 * a repetición por PUT, POST o DELETE. Los aciertos no cuentan, para que quien
 * edita y guarda seguido no quede bloqueado.
 */
export function verificarAdmin(req: Request): NextResponse | null {
  const esperada = process.env.ADMIN_PASSWORD;

  if (!esperada) {
    console.error(
      "[admin] ADMIN_PASSWORD no está definida: se rechaza el acceso al panel.",
    );
    return sinConfigurar();
  }

  const clave = `admin:${identificar(req)}`;
  if (estaBloqueado(clave, LIMITE_INGRESO)) return demasiadosIntentos();

  const recibida = req.headers.get("x-admin-password");
  if (!recibida || !igualdadSegura(recibida, esperada)) {
    excedeLimite(clave, LIMITE_INGRESO);
    return noAutorizado();
  }

  return null;
}
