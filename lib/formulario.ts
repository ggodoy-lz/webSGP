/**
 * Respuesta compartida por los tres formularios del sitio (contacto, ISRC y
 * presupuesto). Solo servidor.
 *
 * La normalización de los campos vive en `validacion.ts`.
 */

import { NextRequest, NextResponse } from "next/server";
import { enviarAviso, type Aviso } from "./email";
import { excedeLimite, identificar, LIMITE_FORMULARIO } from "./limite-peticiones";

export const FALTAN_CAMPOS = NextResponse.json(
  { error: "Faltan campos requeridos" },
  { status: 400 },
);

/**
 * Frena el envío repetido desde una misma IP. Son endpoints públicos que ahora
 * mandan correo: sin tope, alcanza un script para inundar la casilla de SGP.
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
      { error: "No pudimos enviar tu mensaje. Escribinos a sgp@sgp.com.py." },
      { status: 502 },
    );
  }
}
