/**
 * Controles de acceso del panel y de lo que se sube desde él.
 */

import { verificarAdmin } from "../lib/admin-auth";
import { coincideConTipo, esUrlDeImagenValida } from "../lib/imagenes";
import { reiniciarLimites } from "../lib/limite-peticiones";
import { normalizarLista } from "../lib/news-store";
import { cierto, grupo, igual, prueba } from "./ayuda";

const peticion = (clave?: string, ip = "203.0.113.7") =>
  new Request("http://localhost/api/admin/noticias", {
    method: "PUT",
    headers: {
      "x-forwarded-for": ip,
      ...(clave !== undefined ? { "x-admin-password": clave } : {}),
    },
  });

/** Corre `fn` con ADMIN_PASSWORD en `valor` y deja la variable como estaba. */
function conClave(valor: string | undefined, fn: () => void) {
  const antes = process.env.ADMIN_PASSWORD;
  if (valor === undefined) delete process.env.ADMIN_PASSWORD;
  else process.env.ADMIN_PASSWORD = valor;
  reiniciarLimites();
  try {
    fn();
  } finally {
    if (antes === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = antes;
    reiniciarLimites();
  }
}

grupo("Acceso al panel");

prueba("sin ADMIN_PASSWORD en el servidor no entra nadie", () => {
  conClave(undefined, () => igual(verificarAdmin(peticion("cualquiera"))?.status, 503));
});

prueba("rechaza una contraseña incorrecta o ausente", () => {
  conClave("clave-correcta", () => {
    igual(verificarAdmin(peticion("otra"))?.status, 401);
    igual(verificarAdmin(peticion())?.status, 401);
  });
});

prueba("acepta la contraseña correcta", () => {
  conClave("clave-correcta", () => igual(verificarAdmin(peticion("clave-correcta")), null));
});

prueba("tras diez fallos bloquea también los guardados, no solo el ingreso", () => {
  conClave("clave-correcta", () => {
    for (let i = 0; i < 10; i++) igual(verificarAdmin(peticion("mal"))?.status, 401);
    igual(verificarAdmin(peticion("mal"))?.status, 429);
    igual(verificarAdmin(peticion("clave-correcta"))?.status, 429, "debió seguir bloqueado");
    // Otra IP no queda afectada.
    igual(verificarAdmin(peticion("clave-correcta", "198.51.100.1")), null);
  });
});

prueba("los accesos correctos no gastan el cupo de intentos", () => {
  conClave("clave-correcta", () => {
    for (let i = 0; i < 30; i++) igual(verificarAdmin(peticion("clave-correcta")), null);
  });
});

grupo("Portadas de noticias");

const bytes = (...b: number[]) => new Uint8Array([...b, ...new Array(16).fill(0)]);
const PNG = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
const WEBP = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20,
]);
const HTML = new TextEncoder().encode("<html><script>alert(1)</script></html>");

prueba("acepta una imagen cuyo contenido coincide con el tipo", () => {
  cierto(coincideConTipo(PNG, "image/png"), "rechazó un PNG");
  cierto(coincideConTipo(WEBP, "image/webp"), "rechazó un WebP");
  cierto(coincideConTipo(bytes(0xff, 0xd8, 0xff, 0xe0), "image/jpeg"), "rechazó un JPG");
});

prueba("rechaza un HTML disfrazado de imagen", () => {
  cierto(!coincideConTipo(HTML, "image/png"), "aceptó HTML como PNG");
  cierto(!coincideConTipo(PNG, "image/webp"), "aceptó un PNG declarado como WebP");
  cierto(!coincideConTipo(PNG, "image/svg+xml"), "aceptó un tipo no permitido");
});

const BLOB = "https://abc123.public.blob.vercel-storage.com";

prueba("acepta una portada guardada en la carpeta de Blob", () => {
  cierto(esUrlDeImagenValida(`${BLOB}/noticias/imagenes/1f2e-3d.webp`), "rechazó una portada válida");
});

prueba("no deja apuntar al JSON de noticias ni a otra carpeta del almacén", () => {
  cierto(!esUrlDeImagenValida(`${BLOB}/noticias/noticias.json`), "aceptó el JSON de noticias");
  cierto(!esUrlDeImagenValida(`${BLOB}/galardones/galardones.json`), "aceptó el JSON de galardones");
  cierto(!esUrlDeImagenValida(`${BLOB}/noticias/imagenes/../noticias.json`), "aceptó una ruta con ..");
});

prueba("no acepta otro servidor ni otra forma de la ruta local", () => {
  cierto(!esUrlDeImagenValida("https://blob.vercel-storage.com.evil.com/noticias/imagenes/a.webp"), "aceptó otro dominio");
  cierto(!esUrlDeImagenValida("http://abc.public.blob.vercel-storage.com/noticias/imagenes/a.webp"), "aceptó http");
  cierto(!esUrlDeImagenValida("/img/noticias/..\..\secreto.webp"), "aceptó una barra invertida");
  cierto(!esUrlDeImagenValida("/img/noticias/a.svg"), "aceptó un SVG");
});

grupo("Enlaces de noticias");

prueba("un slug escrito a mano no puede salirse de /noticias", () => {
  const [n] = normalizarLista([
    { titleEs: "Nota", slug: "../../contacto?x=1#y", estado: "publicado", fecha: "2026-09-01" },
  ]);
  igual(n.slug, "contacto-x-1-y");
});

prueba("sin slug, se arma a partir del título", () => {
  const [n] = normalizarLista([{ titleEs: "Año récord en Asunción", slug: "", fecha: "2026-09-01" }]);
  igual(n.slug, "ano-record-en-asuncion");
});
