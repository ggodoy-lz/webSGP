/**
 * Validación de lo que se guarda desde los paneles y de lo que llega por los
 * formularios públicos.
 */

import { normalizarLista } from "../lib/news-store";
import { normalizarContenido } from "../lib/galardones-store";
import { formatearStreams, galardonesVisibles, nivelDe } from "../lib/galardones-data";
import { campo, emailValido } from "../lib/validacion";
import {
  excedeLimite,
  reiniciarLimites,
  type Limite,
} from "../lib/limite-peticiones";
import { cierto, grupo, igual, prueba } from "./ayuda";

const nota = (extra: Record<string, unknown> = {}) => ({
  id: "n",
  slug: "una-nota",
  category: "SGP",
  estado: "publicado",
  fecha: "2026-08-20",
  imagen: "",
  titleEs: "Título",
  titleEn: "",
  excerptEs: "",
  excerptEn: "",
  contentEs: "Cuerpo.",
  contentEn: "",
  ...extra,
});

grupo("Noticias");

prueba("descarta una fila sin título", () => {
  igual(normalizarLista([nota({ titleEs: "  ", titleEn: "" })]).length, 0);
});

prueba("desambigua slugs repetidos para que una nota no tape a la otra", () => {
  const r = normalizarLista([nota({ id: "a" }), nota({ id: "b" })]);
  igual(r.length, 2);
  cierto(r[0].slug !== r[1].slug, "los dos slugs quedaron iguales");
});

prueba("corrige una categoría inventada", () => {
  igual(normalizarLista([nota({ category: "Inventada" })])[0].category, "SGP");
});

prueba("una fecha inválida no rompe el listado", () => {
  const f = normalizarLista([nota({ fecha: "no-es-fecha" })])[0].fecha;
  cierto(/^\d{4}-\d{2}-\d{2}$/.test(f), "la fecha quedó mal formada: " + f);
});

prueba("sin inglés, cae al español", () => {
  igual(normalizarLista([nota({ titleEs: "Hola", titleEn: "" })])[0].titleEn, "Hola");
});

prueba("rechaza una portada alojada en otro servidor", () => {
  igual(normalizarLista([nota({ imagen: "https://un-tercero.com/rastreador.png" })])[0].imagen, "");
});

prueba("rechaza una portada que intente salir de su carpeta", () => {
  igual(normalizarLista([nota({ imagen: "/img/noticias/../../etc/passwd" })])[0].imagen, "");
});

prueba("acepta una portada subida desde el panel", () => {
  const url = "/img/noticias/abc.webp";
  igual(normalizarLista([nota({ imagen: url })])[0].imagen, url);
});

grupo("Galardones");

prueba("el nivel sale de los mismos umbrales que muestra la página", () => {
  igual(nivelDe(99_999), null);
  igual(nivelDe(100_000), "Oro");
  igual(nivelDe(499_999), "Oro");
  igual(nivelDe(500_000), "Platino");
  igual(nivelDe(999_999), "Platino");
  igual(nivelDe(1_000_000), "Diamante");
});

prueba("la cifra se muestra como en la tabla", () => {
  igual(formatearStreams(1_200_000), "1.2M");
  igual(formatearStreams(2_000_000), "2M");
  igual(formatearStreams(650_000), "650K");
  igual(formatearStreams(980), "980");
});

prueba("solo se ven los publicados que llegan al mínimo, de mayor a menor", () => {
  const lista = [
    { id: "a", artista: "A", obra: "x", streams: 210_000, publicado: true },
    { id: "b", artista: "B", obra: "x", streams: 1_200_000, publicado: true },
    { id: "c", artista: "C", obra: "x", streams: 900_000, publicado: false },
    { id: "d", artista: "D", obra: "x", streams: 5_000, publicado: true },
  ];
  igual(galardonesVisibles(lista).map((g) => g.id).join(","), "b,a");
});

prueba("descarta una fila sin artista ni obra, y una categoría vacía", () => {
  const c = normalizarContenido({
    galardones: [{ id: "x", artista: "", obra: "", streams: 999 }],
    categoriasPropya: ["Producción del Año", "   "],
  });
  igual(c.galardones.length, 0);
  igual(c.categoriasPropya.length, 1);
});

grupo("Formularios públicos");

prueba("recorta y limita el texto", () => {
  igual(campo("  hola  "), "hola");
  igual(campo("x".repeat(999), 10).length, 10);
  igual(campo(12345), "");
  igual(campo(null), "");
});

prueba("valida el correo del lado del servidor", () => {
  for (const v of ["a@b.co", "nombre.apellido+tag@sub.dominio.com.py"]) {
    cierto(emailValido(v), "debería aceptar " + v);
  }
  for (const v of ["", "sin-arroba", "a@b", "a b@c.com", "x".repeat(250) + "@b.com"]) {
    cierto(!emailValido(v), "debería rechazar " + JSON.stringify(v));
  }
});

grupo("Límite de peticiones");

prueba("deja pasar hasta el tope y después corta", () => {
  reiniciarLimites();
  const limite: Limite = { maximo: 3, ventanaMs: 60_000 };
  igual(excedeLimite("ip", limite), false);
  igual(excedeLimite("ip", limite), false);
  igual(excedeLimite("ip", limite), false);
  igual(excedeLimite("ip", limite), true, "el cuarto intento debería cortarse");
});

prueba("cada origen cuenta por separado", () => {
  reiniciarLimites();
  const limite: Limite = { maximo: 1, ventanaMs: 60_000 };
  igual(excedeLimite("ip-a", limite), false);
  igual(excedeLimite("ip-b", limite), false, "una IP no debería consumir el cupo de otra");
});

prueba("la ventana se libera al vencer", () => {
  reiniciarLimites();
  const limite: Limite = { maximo: 1, ventanaMs: 1 };
  excedeLimite("ip", limite);
  const hasta = Date.now() + 5;
  while (Date.now() < hasta) {
    /* espera breve a que venza la ventana */
  }
  igual(excedeLimite("ip", limite), false);
});
