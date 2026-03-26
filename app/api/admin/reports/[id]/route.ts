import { NextRequest, NextResponse } from "next/server";
import { applyReportAction } from "@/lib/admin/repository";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const contentType = request.headers.get("content-type") || "";

    let action = "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      action = String(body.action || "").trim();
    } else {
      const form = await request.formData();
      action = String(form.get("action") || "").trim();
    }

    if (!["keep", "hide", "remove", "restore"].includes(action)) {
      return NextResponse.json({ error: "Nieprawidłowa akcja." }, { status: 400 });
    }

    await applyReportAction({
      reportId: id,
      action: action as "keep" | "hide" | "remove" | "restore",
    });

    if (!contentType.includes("application/json")) {
      return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
