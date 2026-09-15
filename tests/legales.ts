/**
 * Documentos legales enlazados y casillas de destino de los formularios.
 */

import { existsSync } from "fs";
import path from "path";
import { DOCUMENTOS_LEGALES, TERMINOS_ACTUALIZADO } from "../lib/legal/documentos";
import { APARTADOS_MARCO_LEGAL, DOCUMENTOS_MARCO_LEGAL } from "../lib/legal/marco-legal";
import { destinoDe } from "../lib/email";
import { cierto, grupo, igual, prueba } from "./ayuda";

const enPublic = (ruta: string) => existsSync(path.join(process.cwd(), "public", ruta));

grupo("Documentos legales");

prueba("los PDF de Términos y Declaración jurada existen", () => {
  for (const ruta of Object.values(DOCUMENTOS_LEGALES)) {
    cierto(enPublic(ruta), "falta " + ruta);
  }
});

prueba("la fecha de los Términos es la que figura en el PDF de SGP", () => {
  igual(TERMINOS_ACTUALIZADO, "8 de setiembre de 2026");
});

prueba("el Marco Legal conserva sus tres apartados y sus diez documentos", () => {
  igual(APARTADOS_MARCO_LEGAL.length, 3);
  igual(DOCUMENTOS_MARCO_LEGAL.length, 10);
  for (const d of DOCUMENTOS_MARCO_LEGAL) {
    cierto(enPublic(`docs/marco-legal/${d.archivo}`), "falta el archivo " + d.archivo);
  }
});

grupo("Casillas de destino");

prueba("cada formulario va a la casilla que indicó SGP", () => {
  igual(destinoDe("consultas"), "operaciones@sgp.com.py");
  igual(destinoDe("isrc"), "isrc@sgp.com.py");
  igual(destinoDe("licencias"), "licencias@sgp.com.py");
  igual(destinoDe("devoluciones"), "administracionsgp@sgp.com.py");
});

prueba("una variable de entorno reemplaza la casilla sin tocar código", () => {
  process.env.EMAIL_ISRC = "otra@sgp.com.py";
  try {
    igual(destinoDe("isrc"), "otra@sgp.com.py");
  } finally {
    delete process.env.EMAIL_ISRC;
  }
});
