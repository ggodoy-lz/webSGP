/**
 * Corredor de pruebas mínimo.
 *
 * No se usa un framework a propósito: son pruebas de funciones puras y alcanza
 * con esto, que no agrega dependencias al proyecto más allá de `tsx`.
 */

let pasadas = 0;
let falladas = 0;
const pendientes: string[] = [];

export function grupo(nombre: string) {
  console.log("\n" + nombre);
}

export function prueba(nombre: string, fn: () => void) {
  try {
    fn();
    pasadas++;
    console.log("  ok    " + nombre);
  } catch (e) {
    falladas++;
    console.log("  FALLA " + nombre);
    console.log("        " + (e as Error).message);
  }
}

/**
 * Comportamiento que SGP todavía no confirmó con un ejemplo numérico. Se
 * verifica igual, para que un cambio no pase inadvertido, pero se informa
 * aparte: que pase no significa que el número sea el correcto.
 */
export function pruebaPendienteDeConfirmar(nombre: string, fn: () => void) {
  pendientes.push(nombre);
  prueba(nombre + "  [sin confirmar por SGP]", fn);
}

export function igual(obtenido: unknown, esperado: unknown, mensaje = "") {
  if (obtenido !== esperado) {
    throw new Error(
      `${mensaje}\n        esperado: ${String(esperado)}\n        obtenido: ${String(obtenido)}`,
    );
  }
}

export function cierto(condicion: boolean, mensaje: string) {
  if (!condicion) throw new Error(mensaje);
}

export function resumen() {
  console.log("\n" + "-".repeat(60));
  console.log(`  ${pasadas} pasaron, ${falladas} fallaron`);
  if (pendientes.length) {
    console.log(`\n  ${pendientes.length} verifican reglas que SGP no confirmó con un ejemplo:`);
    pendientes.forEach((p) => console.log("    · " + p));
  }
  if (falladas > 0) process.exitCode = 1;
}
