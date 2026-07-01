/* ── Cotización USD del Banco Central del Paraguay (BCP) ──────────────────────
 *
 * El RTG establece que los montos en USD (Simulcasting, Webcasting, Ambientación
 * Web) se liquidan al tipo de cambio del BCP del último día hábil del mes
 * anterior. Esta función hace un scrape de la planilla oficial de cotizaciones
 * del BCP (HTML renderizado en servidor) y extrae el valor ₲/USD.
 *
 * Se cachea con revalidación de 12 h. Si el scrape falla, se usa un valor de
 * respaldo para no romper la calculadora.
 */

const BCP_URL = "https://www.bcp.gov.py/webapps/web/cotizacion/monedas";

// Valor de respaldo (Gs. por USD) usado solo si el scrape del BCP falla.
export const TIPO_CAMBIO_FALLBACK = 7300;

export interface CotizacionUSD {
  /** Guaraníes por 1 USD */
  usd: number;
  /** Fecha de la planilla del BCP (texto tal cual la publica) */
  fecha: string;
  /** Origen del valor: scrape exitoso del BCP o valor de respaldo */
  fuente: "bcp" | "fallback";
}

export async function getCotizacionUSD(): Promise<CotizacionUSD> {
  try {
    const res = await fetch(BCP_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      },
      // Cachea la respuesta 12 h; el BCP publica una vez por día hábil.
      next: { revalidate: 43200 },
    });
    if (!res.ok) throw new Error(`BCP status ${res.status}`);

    const html = await res.text();

    // Fila del dólar: <td>USD</td><td>1,0000</td><td>6.082,35</td>
    // La tercera celda (₲ / ME) es el valor en guaraníes por USD.
    const m = html.match(
      />USD<\/td>\s*<td[^>]*>[\d.,]+<\/td>\s*<td[^>]*>([\d.,]+)<\/td>/i,
    );
    if (!m) throw new Error("No se encontró la fila USD");

    const usd = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(usd) || usd <= 0) throw new Error("Valor USD inválido");

    const fm = html.match(/PLANILLA DE COTIZACIONES AL ([^<]+)</i);
    const fecha = fm ? fm[1].trim() : new Date().toLocaleDateString("es-PY");

    return { usd, fecha, fuente: "bcp" };
  } catch {
    return { usd: TIPO_CAMBIO_FALLBACK, fecha: "", fuente: "fallback" };
  }
}
