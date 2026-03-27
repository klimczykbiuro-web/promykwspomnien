import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { applyReportAction } from "@/lib/admin/repository";

export const runtime = "nodejs";

type ActionType = "keep" | "hide" | "restore" | "remove";

function isValidAction(value: string): value is ActionType {
  return (
    value === "keep" ||
    value === "hide" ||
    value === "restore" ||
    value === "remove"
  );
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const action = String(body.action || "");

    if (!isValidAction(action)) {
      return NextResponse.json(
        { error: "Nieprawidłowa akcja." },
        { status: 400 }
      );
    }

    await applyReportAction(id, action);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nie udało się wykonać akcji.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}