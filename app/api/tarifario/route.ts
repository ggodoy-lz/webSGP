import { NextRequest, NextResponse } from "next/server";
import { calcularTarifa, type TarifarioInput } from "@/lib/tarifario-engine";
import { GRUPOS, type GrupoId } from "@/lib/tarifario-config";

const VALID_GRUPOS = GRUPOS.map((g) => g.id);

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TarifarioInput;

    if (!body.grupo || !VALID_GRUPOS.includes(body.grupo as GrupoId)) {
      return NextResponse.json(
        { error: "Grupo de rubro inválido" },
        { status: 400 },
      );
    }

    const result = calcularTarifa(body);

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Error interno al calcular la tarifa" },
      { status: 500 },
    );
  }
}
