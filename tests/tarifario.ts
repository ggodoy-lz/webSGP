/**
 * Motor de locales permanentes.
 *
 * El caso de Musculación es el que SGP validó el 5 de mayo de 2026 ("Web: Gs.
 * 128.756 | Excel: Gs. 128.756 ( OK )"). Los otros fijan valores que figuran
 * en las capturas que SGP envió el 21/09/2026, con la calculadora ya aprobada.
 */

import { calcularTarifa, type TarifarioInput } from "../lib/tarifario-engine";
import { DIAS_SEMANA, gimnasioPorSuperficie } from "../lib/tarifario-config";
import { cierto, grupo, igual, prueba } from "./ayuda";

const dias = (n: number) => DIAS_SEMANA.slice(0, n);
const gym = (tipoLocal: string, extra: Partial<TarifarioInput>) =>
  calcularTarifa({ grupo: "gimnasios", tipoLocal, medio: "parlante", dias: dias(6), ...extra }).tarifa;

grupo("Gimnasios");

prueba("Musculación, 20 máquinas, 144 h: el valor que validó SGP", () => {
  igual(gym("Musculación", { maquinas: 20 }), 128_756);
});

prueba("Funcional, 20 máquinas, 5 días: el valor de la captura de SGP", () => {
  igual(gym("Funcional", { maquinas: 20, dias: dias(5) }), 107_296);
});

prueba("Zumba, 20 m², 3 sesiones, 3 días: el valor de la captura de SGP", () => {
  igual(gym("Zumba", { metrosCuadrados: 20, sesionesPorDia: 3, dias: dias(3) }), 609_638);
});

prueba("solo el uso indispensable se declara por superficie", () => {
  cierto(gimnasioPorSuperficie("Zumba"), "Zumba se declara por m²");
  for (const tipo of ["Musculación", "Funcional", "CrossFit", "Máquinas", "Spinning"]) {
    cierto(!gimnasioPorSuperficie(tipo), tipo + " se declara por máquinas o estaciones");
  }
});
