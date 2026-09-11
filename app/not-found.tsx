import Link from "next/link";

/**
 * 404 de una URL que no coincide con ninguna ruta.
 *
 * Va en la raíz y no dentro de `[locale]` porque a este punto todavía no se
 * resolvió el idioma: el de `[locale]` solo atiende los `notFound()` que se
 * llaman desde adentro, por ejemplo al pedir una nota sin publicar. Como el
 * layout raíz no trae `<html>`, se declara acá, y por lo mismo no hay
 * traducciones disponibles: el texto va en los dos idiomas.
 */
export default function NoEncontrado() {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          backgroundColor: "#feffff",
          color: "#212226",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 640, padding: "0 24px", margin: "0 auto" }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#f0552f",
              margin: "0 0 16px",
            }}
          >
            404
          </p>
          <div style={{ width: 40, height: 3, backgroundColor: "#f0552f", marginBottom: 24 }} />
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 12px", lineHeight: 1.15 }}>
            No encontramos esta página
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(33,34,38,0.55)", margin: "0 0 4px" }}>
            Puede que el enlace esté desactualizado o que la página se haya movido.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(33,34,38,0.4)", margin: "0 0 32px" }}>
            We could not find this page. The link may be out of date, or the page may have moved.
          </p>
          <Link
            href="/es"
            style={{
              display: "inline-block",
              backgroundColor: "#212226",
              color: "#fff",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "16px 32px",
            }}
          >
            Ir al inicio
          </Link>
        </div>
      </body>
    </html>
  );
}
