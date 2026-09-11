/**
 * Límite de peticiones por IP. Solo servidor.
 *
 * Cubre dos cosas distintas: que no se pueda probar contraseñas del panel a
 * repetición, y que los formularios públicos no se usen para inundar de correo
 * la casilla de SGP.
 *
 * Es en memoria, así que su alcance es una instancia del servidor: en Vercel,
 * con varias instancias activas, el tope efectivo se multiplica por la cantidad
 * de instancias, y se reinicia en cada despliegue. Frena lo que se ve en la
 * práctica —un script dándole a un endpoint— pero no es una defensa seria
 * contra un ataque distribuido. Para eso haría falta un almacén compartido.
 */

type Ventana = { hasta: number; intentos: number };

const registros = new Map<string, Ventana>();

/** Descarta lo vencido para que el Map no crezca sin control. */
function limpiar(ahora: number) {
  if (registros.size < 500) return;
  for (const [clave, v] of registros) {
    if (v.hasta <= ahora) registros.delete(clave);
  }
}

/**
 * Identifica al solicitante. En Vercel la IP real llega en `x-forwarded-for`;
 * el primer valor es el cliente y el resto son los proxies intermedios.
 */
export function identificar(req: Request): string {
  const reenviada = req.headers.get("x-forwarded-for");
  if (reenviada) return reenviada.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "desconocida";
}

export type Limite = { maximo: number; ventanaMs: number };

export const LIMITE_FORMULARIO: Limite = { maximo: 5, ventanaMs: 10 * 60 * 1000 };
export const LIMITE_INGRESO: Limite = { maximo: 10, ventanaMs: 10 * 60 * 1000 };

/**
 * Registra un intento. Devuelve `true` si se pasó del tope.
 *
 * El contador sigue subiendo aunque ya esté excedido: así, quien insiste
 * mientras está bloqueado no adelanta el momento en que se libera.
 */
export function excedeLimite(clave: string, limite: Limite): boolean {
  const ahora = Date.now();
  limpiar(ahora);

  const actual = registros.get(clave);
  if (!actual || actual.hasta <= ahora) {
    registros.set(clave, { hasta: ahora + limite.ventanaMs, intentos: 1 });
    return false;
  }

  actual.intentos += 1;
  return actual.intentos > limite.maximo;
}

/** Solo para las pruebas. */
export function reiniciarLimites() {
  registros.clear();
}

/** Respuesta estándar cuando se superó el tope. */
export function respuestaLimite(mensaje: string): Response {
  return Response.json({ error: mensaje }, { status: 429 });
}
