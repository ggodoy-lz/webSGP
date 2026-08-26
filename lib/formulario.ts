/**
 * Respuesta compartida por los tres formularios del sitio (contacto, ISRC y
 * presupuesto). Solo servidor.
 *
 * La normalización de los campos vive en `validacion.ts`.
 */

import { NextResponse } from "next/server";
import { enviarAviso, type Aviso } from "./email";

export const FALTAN_CAMPOS = NextResponse.json(
  { error: "Faltan campos requeridos" },
  { status: 400 },
);

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
