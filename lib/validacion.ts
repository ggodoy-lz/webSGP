/**
 * Normalización y validación de lo que llega de los formularios públicos.
 *
 * Va aparte de `formulario.ts` para que no dependa de Next: así se puede probar
 * en aislamiento y no arrastra el runtime del framework.
 */

const ES_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Recorta y limita un campo de texto. Devuelve "" para cualquier cosa que no
 * sea texto; las rutas que esperan números lo resuelven aparte.
 */
export function campo(valor: unknown, maximo = 500): string {
  return typeof valor === "string" ? valor.trim().slice(0, maximo) : "";
}

export function emailValido(valor: string): boolean {
  return ES_EMAIL.test(valor) && valor.length <= 254;
}
