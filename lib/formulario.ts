/**
 * Piezas compartidas por los formularios del sitio (contacto, ISRC y
 * solicitud de licencia). Solo servidor.
 *
 * La normalización de los campos vive en `validacion.ts`.
 */

import { NextRequest, NextResponse } from "next/server";
import { destinoDe, enviarAviso, type Aviso } from "./email";
import { excedeLimite, identificar, LIMITE_FORMULARIO } from "./limite-peticiones";
import { TERMINOS_ACTUALIZADO } from "./legal/documentos";

/*
 * Las respuestas se crean en cada llamada y no se reutiliza una constante: el
 * cuerpo de una Response se consume una sola vez, así que devolver la misma
 * instancia a dos peticiones puede dejar la segunda sin cuerpo.
 */

export function faltanCampos(): NextResponse {
  return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
}

/**
 * Los Términos de SGP exigen aceptación expresa antes de enviar una solicitud.
 * La casilla del formulario ya lo pide en el navegador, pero se vuelve a exigir
 * acá: una petición armada a mano la saltearía.
 */
export function aceptoTerminos(datos: Record<string, unknown>): boolean {
  return datos.aceptaTerminos === true;
}

export function noAceptoTerminos(): NextResponse {
  return NextResponse.json(
    { error: "Hay que aceptar los Términos y Condiciones para enviar el formulario" },
    { status: 400 },
  );
}

/**
 * Constancia de la aceptación para el aviso que recibe SGP. Los Términos prevén
 * conservar la versión aceptada y la fecha y hora de la operación.
 */
export function constanciaDeAceptacion(): [string, string] {
  const cuando = new Intl.DateTimeFormat("es-PY", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Asuncion",
  }).format(new Date());
  return [
    "Términos y Condiciones",
    `Aceptó la versión del ${TERMINOS_ACTUALIZADO}, el ${cuando} (hora de Asunción)`,
  ];
}

/**
 * Frena el envío repetido desde una misma IP. Son endpoints públicos que
 * mandan correo: sin tope, alcanza un script para inundar las casillas de SGP.
 *
 * Devuelve la respuesta a retornar, o `null` si puede seguir.
 */
export function excedeEnvios(req: NextRequest): NextResponse | null {
  if (!excedeLimite(`formulario:${identificar(req)}`, LIMITE_FORMULARIO)) return null;

  return NextResponse.json(
    { error: "Recibimos varios mensajes tuyos. Esperá unos minutos antes de enviar otro." },
    { status: 429 },
  );
}

/**
 * Envía el aviso y responde.
 *
 * Solo responde éxito si el correo salió. Antes estas rutas devolvían
 * `success: true` siempre y el contenido quedaba en un `console.log` que nadie
 * lee: la persona veía "enviado" y a SGP no le llegaba nada.
 */
export async function responderFormulario(
  etiqueta: string,
  aviso: Aviso,
  contenido: unknown,
): Promise<NextResponse> {
  try {
    await enviarAviso(aviso);
    return NextResponse.json({ success: true });
  } catch (error) {
    // Último recurso: dejarlo en los logs para poder recuperarlo a mano si
    // alguien escribió justo mientras el correo estaba caído.
    console.error(`[${etiqueta}] no se pudo enviar el aviso:`, error);
    console.error(`[${etiqueta}] contenido:`, JSON.stringify(contenido));

    return NextResponse.json(
      { error: `No pudimos enviar tu mensaje. Escribinos a ${destinoDe(aviso.casilla)}.` },
      { status: 502 },
    );
  }
}
