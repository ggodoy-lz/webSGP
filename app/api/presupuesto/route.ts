import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const {
      tipoNegocio,
      aforo,
      superficie,
      nombre,
      empresa,
      email,
      telefono,
      mensaje,
      estimado,
    } = data;

    // Validate required fields
    if (!nombre || !email || !tipoNegocio) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Log the request internally (in production, send email/CRM notification)
    console.log("[SGP Presupuesto Request]", {
      timestamp: new Date().toISOString(),
      tipoNegocio,
      aforo,
      superficie,
      nombre,
      empresa,
      email,
      telefono,
      mensaje,
      estimado,
    });

    // TODO: Connect to email service (e.g., Resend, SendGrid) or CRM
    // Example with fetch to an email service:
    //
    // await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     from: 'web@sgp.com.py',
    //     to: 'comercial@sgp.com.py',
    //     subject: `Nueva solicitud de presupuesto - ${nombre}`,
    //     html: `<p>Tipo: ${tipoNegocio}</p><p>Estimado: ${estimado}</p>...`
    //   })
    // });

    return NextResponse.json(
      { success: true, message: "Presupuesto recibido" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
