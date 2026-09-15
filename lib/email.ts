/**
 * Envío de los avisos que generan los formularios del sitio. Solo servidor.
 *
 * Usa la API de Resend por HTTP, sin SDK: es una sola llamada y así no se suma
 * una dependencia.
 *
 * Si no está configurado, `enviarAviso` lanza. Eso es a propósito: las rutas
 * tienen que responder con error para que la persona vea que no se envió, en
 * vez de un "gracias" falso.
 */

const RESEND_URL = "https://api.resend.com/emails";

export type Casilla = "consultas" | "isrc" | "licencias" | "devoluciones";

/**
 * Casillas que indicó SGP para cada tipo de solicitud. Cada una se puede
 * reemplazar con su variable de entorno sin tocar código.
 *
 * `devoluciones` todavía no tiene formulario en el sitio: los Términos piden
 * que las solicitudes de reembolso se hagan por escrito a esa casilla, así que
 * queda definida para cuando se implemente.
 */
const CASILLAS: Record<Casilla, { variable: string; porDefecto: string }> = {
  consultas: { variable: "EMAIL_CONSULTAS", porDefecto: "operaciones@sgp.com.py" },
  isrc: { variable: "EMAIL_ISRC", porDefecto: "isrc@sgp.com.py" },
  licencias: { variable: "EMAIL_LICENCIAS", porDefecto: "licencias@sgp.com.py" },
  devoluciones: { variable: "EMAIL_DEVOLUCIONES", porDefecto: "administracionsgp@sgp.com.py" },
};

/**
 * Se lee en cada envío y no al cargar el módulo, para que un cambio de variable
 * no quede tapado por un valor leído antes.
 */
export function destinoDe(casilla: Casilla): string {
  const { variable, porDefecto } = CASILLAS[casilla];
  return process.env[variable] || porDefecto;
}

/**
 * Remitente. Tiene que ser un dominio verificado en Resend; si no, Resend
 * rechaza el envío.
 */
function remitente(): string {
  return process.env.EMAIL_REMITENTE || "SGP Web <web@sgp.com.py>";
}

export function emailConfigurado(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export type Aviso = {
  /** A qué casilla de SGP va el aviso. */
  casilla: Casilla;
  asunto: string;
  /** Pares etiqueta/valor que se listan en el cuerpo. */
  datos: [string, string | number | undefined | null][];
  /**
   * Correo de quien completó el formulario. Va como Reply-To para que SGP
   * pueda responderle directo desde el aviso.
   */
  responderA?: string;
};

function escapar(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cuerpos(aviso: Aviso): { html: string; text: string } {
  const filas = aviso.datos.filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "");

  const html = `<div style="font-family:system-ui,sans-serif;font-size:14px;color:#212226">
<h2 style="font-size:16px;margin:0 0 16px">${escapar(aviso.asunto)}</h2>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
${filas
  .map(
    ([etiqueta, valor]) =>
      `<tr><td style="padding:6px 16px 6px 0;color:#6b6c70;vertical-align:top;white-space:nowrap">${escapar(etiqueta)}</td><td style="padding:6px 0;white-space:pre-wrap">${escapar(String(valor))}</td></tr>`,
  )
  .join("\n")}
</table>
<p style="margin:24px 0 0;color:#9a9b9f;font-size:12px">Enviado desde el sitio web de SGP.</p>
</div>`;

  const text = [
    aviso.asunto,
    "",
    ...filas.map(([etiqueta, valor]) => `${etiqueta}: ${valor}`),
    "",
    "Enviado desde el sitio web de SGP.",
  ].join("\n");

  return { html, text };
}

/** Envía el aviso. Lanza si no está configurado o si Resend lo rechaza. */
export async function enviarAviso(aviso: Aviso): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Falta RESEND_API_KEY: el envío de correo no está configurado");
  }

  const { html, text } = cuerpos(aviso);

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: remitente(),
      to: [destinoDe(aviso.casilla)],
      subject: aviso.asunto,
      html,
      text,
      ...(aviso.responderA ? { reply_to: aviso.responderA } : {}),
    }),
  });

  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    throw new Error(`Resend respondió ${res.status}: ${detalle.slice(0, 300)}`);
  }
}
