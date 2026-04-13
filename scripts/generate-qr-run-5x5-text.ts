import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import * as QRCode from "qrcode";

loadEnvConfig(process.cwd());

type Args = {
  name: string;
  count: number;
  notes: string | null;
};

type QrRecord = {
  id: string;
  rawToken: string;
  tokenHash: string;
  tokenPrefix: string;
  lotId: string;
  sheetNo: number;
  sheetRow: number;
  sheetCol: number;
};

type PlaqueLayout = {
  widthMm: number;
  heightMm: number;
  qrSizeMm: number;
  qrX: number;
  qrY: number;
  topLine1Y: number;
  topLine2Y: number;
  bottomLineY: number;
  topFontSize: number;
  bottomFontSize: number;
};

const SHEET_COLS = 5;
const SHEET_ROWS = 5;
const PLAQUE_SIZE_MM = 60;
const SHEET_GAP_MM = 0;
const QR_TEXT_TOP_1 = "Zeskanuj kod";
const QR_TEXT_TOP_2 = "telefonem";
const QR_TEXT_BOTTOM = "promykwspomnien.pl";
const QR_ERROR_CORRECTION: QRCode.QRCodeErrorCorrectionLevel = "M";
const QR_QUIET_ZONE_MODULES = 2;

const PLAQUE_LAYOUT: PlaqueLayout = {
  widthMm: PLAQUE_SIZE_MM,
  heightMm: PLAQUE_SIZE_MM,
  qrSizeMm: 28,
  qrX: 16,
  qrY: 18,
  topLine1Y: 8.4,
  topLine2Y: 13.1,
  bottomLineY: 52.2,
  topFontSize: 4.25,
  bottomFontSize: 3.1,
};

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000";

  const { pool } = await import("../lib/db");
  const { createQrRunWithLots } = await import("../lib/qr/repository");

  const result = await createQrRunWithLots({
    runName: args.name,
    count: args.count,
    notes: args.notes,
  });

  const outputRoot = path.join(process.cwd(), "output", "qr", result.runCode);
  const singleDir = path.join(outputRoot, "single");
  const sheetsDir = path.join(outputRoot, "sheets");

  await mkdir(singleDir, { recursive: true });
  await mkdir(sheetsDir, { recursive: true });

  const lotCodeById = new Map(result.lots.map((lot) => [lot.id, lot.lotCode]));
  const sheetPathByNo = new Map<number, string>();
  const qrBySheet = new Map<number, QrRecord[]>();

  for (const qr of result.qrRecords as QrRecord[]) {
    const activationUrl = `${appUrl.replace(/\/+$/, "")}/q/${qr.rawToken}`;
    const lotCode = lotCodeById.get(qr.lotId) ?? "UNKN";
    const singleFileName = `${lotCode}-sheet-${pad(qr.sheetNo, 3)}-r${qr.sheetRow}-c${qr.sheetCol}.svg`;
    const singleRelativePath = toPosix(
      path.relative(process.cwd(), path.join(singleDir, singleFileName))
    );

    const svg = await buildSinglePlaqueSvg({
      activationUrl,
      serialLabel: lotCode,
    });

    await writeFile(path.join(singleDir, singleFileName), svg, "utf8");

    await pool.query(
      `
      UPDATE qr_codes
      SET
        single_svg_path = $2,
        updated_at = NOW()
      WHERE id = $1
      `,
      [qr.id, singleRelativePath]
    );

    const current = qrBySheet.get(qr.sheetNo) ?? [];
    current.push(qr);
    qrBySheet.set(qr.sheetNo, current);
  }

  for (const [sheetNo, sheetItems] of qrBySheet.entries()) {
    const sheetSvg = await buildSheetSvg({
      appUrl,
      qrRecords: sheetItems,
    });

    const sheetFileName = `sheet-${pad(sheetNo, 3)}.svg`;
    const sheetFullPath = path.join(sheetsDir, sheetFileName);
    const sheetRelativePath = toPosix(path.relative(process.cwd(), sheetFullPath));

    await writeFile(sheetFullPath, sheetSvg, "utf8");
    sheetPathByNo.set(sheetNo, sheetRelativePath);

    for (const qr of sheetItems) {
      await pool.query(
        `
        UPDATE qr_codes
        SET
          sheet_svg_path = $2,
          updated_at = NOW()
        WHERE id = $1
        `,
        [qr.id, sheetRelativePath]
      );
    }
  }

  const manifest = buildManifestCsv({
    appUrl,
    runCode: result.runCode,
    runName: args.name,
    qrRecords: result.qrRecords as QrRecord[],
    lotCodeById,
    sheetPathByNo,
  });

  const manifestPath = path.join(outputRoot, "manifest.csv");
  await writeFile(manifestPath, manifest, "utf8");

  console.log("");
  console.log("Run wygenerowany poprawnie.");
  console.log(`runCode: ${result.runCode}`);
  console.log(`runName: ${args.name}`);
  console.log(`count: ${args.count}`);
  console.log(`lots: ${result.lots.map((lot) => lot.lotCode).join(", ")}`);
  console.log(`układ arkusza: ${SHEET_COLS}x${SHEET_ROWS}`);
  console.log(`rozmiar tabliczki: ${PLAQUE_SIZE_MM}x${PLAQUE_SIZE_MM} mm`);
  console.log(`output: ${outputRoot}`);
  console.log("");

  await pool.end();
}

function parseArgs(argv: string[]): Args {
  const nameArg = argv.find((item) => item.startsWith("--name="));
  const countArg = argv.find((item) => item.startsWith("--count="));
  const notesArg = argv.find((item) => item.startsWith("--notes="));

  const name = nameArg?.slice("--name=".length).trim();
  const countValue = countArg?.slice("--count=".length).trim();

  if (!name) {
    throw new Error('Brakuje parametru --name="nazwa-runu"');
  }

  if (!countValue) {
    throw new Error("Brakuje parametru --count=liczba");
  }

  const count = Number.parseInt(countValue, 10);

  if (!Number.isFinite(count) || count < 1 || count > 10000) {
    throw new Error("Parametr --count musi być liczbą od 1 do 10000.");
  }

  if (count % (SHEET_COLS * SHEET_ROWS) !== 0) {
    throw new Error(
      `Parametr --count musi być wielokrotnością ${SHEET_COLS * SHEET_ROWS}, bo arkusz ma układ ${SHEET_COLS}x${SHEET_ROWS}.`
    );
  }

  return {
    name,
    count,
    notes: notesArg?.slice("--notes=".length).trim() || null,
  };
}

async function buildSinglePlaqueSvg(input: {
  activationUrl: string;
  serialLabel: string;
}) {
  const qrFragment = await buildQrRectFragment({
    value: input.activationUrl,
    x: PLAQUE_LAYOUT.qrX,
    y: PLAQUE_LAYOUT.qrY,
    sizeMm: PLAQUE_LAYOUT.qrSizeMm,
  });

  return [
    `<?xml version="1.0" encoding="UTF-8" standalone="no"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${PLAQUE_LAYOUT.widthMm}mm" height="${PLAQUE_LAYOUT.heightMm}mm" viewBox="0 0 ${PLAQUE_LAYOUT.widthMm} ${PLAQUE_LAYOUT.heightMm}">`,
    `<rect x="0" y="0" width="${PLAQUE_LAYOUT.widthMm}" height="${PLAQUE_LAYOUT.heightMm}" fill="#FFFFFF" />`,
    buildTextLine({
      text: QR_TEXT_TOP_1,
      x: PLAQUE_LAYOUT.widthMm / 2,
      y: PLAQUE_LAYOUT.topLine1Y,
      fontSize: PLAQUE_LAYOUT.topFontSize,
    }),
    buildTextLine({
      text: QR_TEXT_TOP_2,
      x: PLAQUE_LAYOUT.widthMm / 2,
      y: PLAQUE_LAYOUT.topLine2Y,
      fontSize: PLAQUE_LAYOUT.topFontSize,
    }),
    qrFragment,
    buildTextLine({
      text: QR_TEXT_BOTTOM,
      x: PLAQUE_LAYOUT.widthMm / 2,
      y: PLAQUE_LAYOUT.bottomLineY,
      fontSize: PLAQUE_LAYOUT.bottomFontSize,
    }),
    `</svg>`,
  ].join("\n");
}

async function buildSheetSvg(input: {
  appUrl: string;
  qrRecords: QrRecord[];
}) {
  const pageWidthMm = SHEET_COLS * PLAQUE_SIZE_MM + (SHEET_COLS - 1) * SHEET_GAP_MM;
  const pageHeightMm = SHEET_ROWS * PLAQUE_SIZE_MM + (SHEET_ROWS - 1) * SHEET_GAP_MM;

  const items = await Promise.all(
    input.qrRecords.map(async (qr) => {
      const activationUrl = `${input.appUrl.replace(/\/+$/, "")}/q/${qr.rawToken}`;
      const offsetX = (qr.sheetCol - 1) * (PLAQUE_SIZE_MM + SHEET_GAP_MM);
      const offsetY = (qr.sheetRow - 1) * (PLAQUE_SIZE_MM + SHEET_GAP_MM);

      const qrFragment = await buildQrRectFragment({
        value: activationUrl,
        x: offsetX + PLAQUE_LAYOUT.qrX,
        y: offsetY + PLAQUE_LAYOUT.qrY,
        sizeMm: PLAQUE_LAYOUT.qrSizeMm,
      });

      return [
        `<g id="qr-${escapeXml(qr.id)}">`,
        `<rect x="${offsetX.toFixed(4)}" y="${offsetY.toFixed(4)}" width="${PLAQUE_SIZE_MM}" height="${PLAQUE_SIZE_MM}" fill="#FFFFFF" />`,
        buildTextLine({
          text: QR_TEXT_TOP_1,
          x: offsetX + PLAQUE_SIZE_MM / 2,
          y: offsetY + PLAQUE_LAYOUT.topLine1Y,
          fontSize: PLAQUE_LAYOUT.topFontSize,
        }),
        buildTextLine({
          text: QR_TEXT_TOP_2,
          x: offsetX + PLAQUE_SIZE_MM / 2,
          y: offsetY + PLAQUE_LAYOUT.topLine2Y,
          fontSize: PLAQUE_LAYOUT.topFontSize,
        }),
        qrFragment,
        buildTextLine({
          text: QR_TEXT_BOTTOM,
          x: offsetX + PLAQUE_SIZE_MM / 2,
          y: offsetY + PLAQUE_LAYOUT.bottomLineY,
          fontSize: PLAQUE_LAYOUT.bottomFontSize,
        }),
        `</g>`,
      ].join("\n");
    })
  );

  return [
    `<?xml version="1.0" encoding="UTF-8" standalone="no"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidthMm}mm" height="${pageHeightMm}mm" viewBox="0 0 ${pageWidthMm} ${pageHeightMm}">`,
    `<rect x="0" y="0" width="${pageWidthMm}" height="${pageHeightMm}" fill="#FFFFFF" />`,
    items.join("\n"),
    `</svg>`,
  ].join("\n");
}

async function buildQrRectFragment(input: {
  value: string;
  x: number;
  y: number;
  sizeMm: number;
}) {
  const qr = QRCode.create(input.value, {
    errorCorrectionLevel: QR_ERROR_CORRECTION,
  });

  const moduleCount = qr.modules.size;
  const totalModules = moduleCount + QR_QUIET_ZONE_MODULES * 2;
  const moduleSize = input.sizeMm / totalModules;
  const parts: string[] = [];

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      if (!qr.modules.get(row, col)) {
        continue;
      }

      const x = input.x + (col + QR_QUIET_ZONE_MODULES) * moduleSize;
      const y = input.y + (row + QR_QUIET_ZONE_MODULES) * moduleSize;

      parts.push(
        `<rect x="${x.toFixed(4)}" y="${y.toFixed(4)}" width="${moduleSize.toFixed(4)}" height="${moduleSize.toFixed(4)}" fill="#000000" />`
      );
    }
  }

  return parts.join("\n");
}

function buildTextLine(input: {
  text: string;
  x: number;
  y: number;
  fontSize: number;
}) {
  return `<text x="${input.x.toFixed(4)}" y="${input.y.toFixed(4)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${input.fontSize}" fill="#000000">${escapeXml(input.text)}</text>`;
}

function buildManifestCsv(input: {
  appUrl: string;
  runCode: string;
  runName: string;
  qrRecords: QrRecord[];
  lotCodeById: Map<string, string>;
  sheetPathByNo: Map<number, string>;
}) {
  const header = [
    "run_code",
    "run_name",
    "lot_code",
    "qr_code_id",
    "token_prefix",
    "activation_url",
    "sheet_no",
    "sheet_row",
    "sheet_col",
    "single_svg_path",
    "sheet_svg_path",
  ];

  const rows = input.qrRecords.map((qr) => {
    const lotCode = input.lotCodeById.get(qr.lotId) ?? "";
    const activationUrl = `${input.appUrl.replace(/\/+$/, "")}/q/${qr.rawToken}`;
    const singleFileName = `${lotCode}-sheet-${pad(qr.sheetNo, 3)}-r${qr.sheetRow}-c${qr.sheetCol}.svg`;
    const singleRelativePath = toPosix(
      path.join("output", "qr", input.runCode, "single", singleFileName)
    );
    const sheetRelativePath =
      input.sheetPathByNo.get(qr.sheetNo) ??
      toPosix(path.join("output", "qr", input.runCode, "sheets", `sheet-${pad(qr.sheetNo, 3)}.svg`));

    return [
      input.runCode,
      input.runName,
      lotCode,
      qr.id,
      qr.tokenPrefix,
      activationUrl,
      String(qr.sheetNo),
      String(qr.sheetRow),
      String(qr.sheetCol),
      singleRelativePath,
      sheetRelativePath,
    ].map(csvEscape);
  });

  return [header.map(csvEscape).join(","), ...rows.map((row) => row.join(","))].join("\n");
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function pad(value: number, length: number) {
  return String(value).padStart(length, "0");
}

function toPosix(value: string) {
  return value.split(path.sep).join("/");
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

main().catch((error) => {
  console.error("");
  console.error("Generator runu zakończył się błędem.");
  console.error(error);
  console.error("");
  process.exit(1);
});
