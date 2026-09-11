/**
 * Motor de Eventos contra los ejemplos de SGP.
 *
 * Fuente: hoja EJEMPLOS de "Calculo de tarifas - para web.xlsx", que es la
 * última planilla de SGP con los totales calculados.
 *
 * Los casos de parque están marcados como sin confirmar. El motor aplica el
 * mínimo de APA por persona (2.940) que introdujo la planilla posterior,
 * `Calculadora_Web.xlsx`, y eso da distinto de los totales de arriba. Esa
 * planilla nueva no sirve para verificar: su columna de totales quedó con
 * errores de referencia al quitarse la columna de APA. Hasta que SGP mande una
 * con los totales sanos, estos números no están validados.
 */

import { calcularEventos, type EventosInput } from "../lib/eventos-engine";
import { cierto, grupo, igual, prueba, pruebaPendienteDeConfirmar } from "./ayuda";

const BASE: EventosInput = {
  tipo: "deportivo",
  variante: null,
  zona: "capital",
  personas: 0,
  conIngresos: true,
  precioEntrada: 0,
  filas: [],
  conBaile: false,
  cortesias: 0,
  aforo: 0,
  funciones: 1,
  usos: [],
};

function total(input: Partial<EventosInput>): number {
  const res = calcularEventos({ ...BASE, ...input } as EventosInput);
  if (res.estado !== "ok") throw new Error("se derivó a ejecutivo: " + res.motivo);
  return res.total;
}

grupo("Eventos deportivos (planilla de SGP)");

prueba("CASO 1: manda el mínimo de SGP, más 5% de APA", () => {
  igual(
    total({
      cortesias: 1,
      filas: [
        { etiqueta: "Generales", personas: 501, precioEntrada: 150_000 },
        { etiqueta: "Niños", personas: 10, precioEntrada: 80_000 },
      ],
    }),
    5_603_640,
  );
});

prueba("CASO 2: manda el 0,5% de SGP, más 5% de APA", () => {
  igual(
    total({
      cortesias: 1,
      filas: [
        { etiqueta: "Generales", personas: 500, precioEntrada: 1_000_000 },
        { etiqueta: "Niños", personas: 100, precioEntrada: 800_000 },
      ],
    }),
    31_902_940,
  );
});

prueba("CASO 3: sin ingresos, mínimos de ambas partes", () => {
  igual(
    total({
      conIngresos: false,
      personas: 900,
      filas: [{ etiqueta: "Generales", personas: 900, precioEntrada: 0 }],
    }),
    4_449_200,
  );
});

prueba("los sectores comparten un solo mínimo, no uno cada uno", () => {
  const juntos = total({
    filas: [
      { personas: 300, precioEntrada: 10_000 },
      { personas: 300, precioEntrada: 10_000 },
    ],
  });
  const separados =
    total({ filas: [{ personas: 300, precioEntrada: 10_000 }] }) +
    total({ filas: [{ personas: 300, precioEntrada: 10_000 }] });
  cierto(
    juntos < separados,
    "calcular los sectores por separado cobraría de más: el mínimo es uno solo",
  );
});

grupo("Parque de diversiones");

pruebaPendienteDeConfirmar("CASO 1: un mes con ingresos", () => {
  // La planilla vieja dice 3.176.000; con el mínimo de APA por persona da esto.
  igual(total({ tipo: "parqueDiversiones", filas: [{ personas: 2000, precioEntrada: 20_000 }] }), 7_056_000);
});

pruebaPendienteDeConfirmar("CASO 2: cuatro meses, cada uno con su mínimo", () => {
  // La planilla vieja dice 24.256.000.
  igual(
    total({
      tipo: "parqueDiversiones",
      filas: [
        { etiqueta: "Julio", personas: 1600, precioEntrada: 80_000 },
        { etiqueta: "Agosto", personas: 1500, precioEntrada: 80_000 },
        { etiqueta: "Septiembre", personas: 1500, precioEntrada: 80_000 },
        { etiqueta: "Octubre", personas: 1000, precioEntrada: 20_000 },
      ],
    }),
    26_196_000,
  );
});

prueba("cada fecha se liquida entera: separarlas da lo mismo que juntarlas", () => {
  const filas = [
    { personas: 1600, precioEntrada: 80_000 },
    { personas: 1500, precioEntrada: 80_000 },
  ];
  const juntas = total({ tipo: "parqueDiversiones", filas });
  const sumadas = filas.reduce(
    (acc, f) => acc + total({ tipo: "parqueDiversiones", filas: [f] }),
    0,
  );
  igual(juntas, sumadas, "en el eje de fechas, el mínimo es por fecha");
});

grupo("Derivación a un ejecutivo");

prueba("un concierto no se cotiza en la web", () => {
  const res = calcularEventos({ ...BASE, tipo: "concierto" });
  igual(res.estado, "ejecutivo");
});

prueba("un tipo de evento inexistente no rompe el cálculo", () => {
  const res = calcularEventos({ ...BASE, tipo: "no-existe" });
  igual(res.estado, "ejecutivo");
});
