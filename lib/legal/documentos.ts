/**
 * Documentos legales de SGP.
 *
 * Se publican en PDF tal cual los entregó SGP, igual que en el sitio actual de
 * sgp.com.py, sin transcribirlos a la página.
 */

/**
 * Fecha de la versión vigente de los Términos, como figura en el PDF. Los
 * formularios la registran como la versión aceptada: si SGP envía un PDF nuevo,
 * hay que reemplazar el archivo y actualizar esta fecha.
 */
export const TERMINOS_ACTUALIZADO = "8 de setiembre de 2026";

export const DOCUMENTOS_LEGALES = {
  terminos: "/docs/legal/terminos-y-condiciones-de-uso.pdf",
  declaracionJurada: "/docs/legal/declaracion-jurada-solicitud-de-licencia.pdf",
} as const;
