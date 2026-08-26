/**
 * Prepara una imagen en el navegador antes de subirla. Solo cliente.
 *
 * Se hace acá y no en el servidor por dos motivos: evita sumar una dependencia
 * de procesamiento de imágenes, y lo que viaja por la red es el archivo ya
 * reducido en vez del original de la cámara, que puede pesar varios MB.
 */

/** Ancho al que se guardan las portadas. Se muestran a 420 px como máximo. */
const ANCHO = 1280;
const CALIDAD = 0.8;

export type ImagenPreparada = {
  blob: Blob;
  ancho: number;
  alto: number;
};

export async function prepararImagen(archivo: File): Promise<ImagenPreparada> {
  const bitmap = await createImageBitmap(archivo);

  // Nunca se agranda: una imagen chica se sube tal cual está.
  const escala = Math.min(1, ANCHO / bitmap.width);
  const ancho = Math.max(1, Math.round(bitmap.width * escala));
  const alto = Math.max(1, Math.round(bitmap.height * escala));

  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;

  const ctx = lienzo.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("No se pudo procesar la imagen en este navegador");
  }

  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    lienzo.toBlob(resolve, "image/webp", CALIDAD),
  );
  if (!blob) throw new Error("No se pudo convertir la imagen");

  return { blob, ancho, alto };
}
