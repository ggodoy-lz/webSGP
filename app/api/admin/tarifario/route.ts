import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "tarifario.json");

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "sgp-admin-2026";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return auth === ADMIN_PASSWORD;
}

async function readConfig() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeConfig(data: unknown) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const config = await readConfig();
  if (!config) {
    return NextResponse.json({
      uda: 39200,
      incidencias: { secundaria: 0.33, necesaria: 0.60, indispensable: 1.00 },
      categoriaDefault: 0.24,
      medios: { parlante: 0.15, televisor: 0.12 },
      descuentoAforo: 0.60,
    });
  }

  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    await writeConfig(body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al guardar la configuración" },
      { status: 500 },
    );
  }
}
