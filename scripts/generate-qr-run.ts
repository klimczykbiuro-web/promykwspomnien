import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import * as QRCode from "qrcode";

loadEnvConfig(process.cwd());

type MaterialPreset = "standard" | "gloss";

type Args = {
  name: string;
  count: number;
  notes: string | null;
  preset: MaterialPreset;
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

type MaterialPresetConfig = {
  label: MaterialPreset;
  layout: PlaqueLayout;
  errorCorrectionLevel: QRCode.QRCodeErrorCorrectionLevel;
  quietZoneModules: number;
};

type BoxGroup = {
  runCode: string;
  runName: string;
  materialPreset: MaterialPreset;
  lotId: string;
  lotCode: string;
  boxNoInLot: number;
  boxCode: string;
  quantity: number;
  sheetFrom: number;
  sheetTo: number;
  firstSheetRow: number;
  firstSheetCol: number;
  lastSheetRow: number;
  lastSheetCol: number;
};

const SHEET_COLS = 5;
const SHEET_ROWS = 5;
const PLAQUES_PER_SHEET = SHEET_COLS * SHEET_ROWS;
const BOX_SIZE = 100;
const PLAQUE_SIZE_MM = 60;
const SHEET_GAP_MM = 0;
const QR_TEXT_TOP_1 = "Zeskanuj kod";
const QR_TEXT_TOP_2 = "telefonem";
const QR_TEXT_BOTTOM = "promykwspomnien.pl";

const MATERIAL_PRESETS: Record<MaterialPreset, MaterialPresetConfig> = {
  standard: {
    label: "standard",
    errorCorrectionLevel: "M",
    quietZoneModules: 2,
    layout: {
      widthMm: PLAQUE_SIZE_MM,
      heightMm: PLAQUE_SIZE_MM,
      qrSizeMm: 28,
      qrX: 16,
      qrY: 18,
      topLine1Y: 8.4,
      topLine2Y: 13.1,
      bottomLineY: 53.0,
      topFontSize: 4.25,
      bottomFontSize: 4.05,
    },
  },
  gloss: {
    label: "gloss",
    // Na błyszczących/metalizowanych blaszkach zostawiamy korekcję M,
    // a QR upraszczamy krótszym tokenem w lib/qr/tokens.ts.
    errorCorrectionLevel: "M",
    quietZoneModules: 2,
    layout: {
      widthMm: PLAQUE_SIZE_MM,
      heightMm: PLAQUE_SIZE_MM,
      qrSizeMm: 28,
      qrX: 16,
      qrY: 18,
      topLine1Y: 8.4,
      topLine2Y: 13.1,
      bottomLineY: 53.0,
      topFontSize: 4.25,
      bottomFontSize: 4.05,
    },
  },
};

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const presetConfig = MATERIAL_PRESETS[args.preset];

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
    tokenPreset: args.preset,
  });

  const outputRoot = path.join(process.cwd(), "output", "qr", result.runCode);
  const singleDir = path.join(outputRoot, "single");
  const sheetsDir = path.join(outputRoot, "sheets");
  const labelsDir = path.join(outputRoot, "labels");

  await mkdir(singleDir, { recursive: true });
  await mkdir(sheetsDir, { recursive: true });
  await mkdir(labelsDir, { recursive: true });

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
      presetConfig,
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
      presetConfig,
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

  const boxGroups = buildBoxGroups({
    runCode: result.runCode,
    runName: args.name,
    materialPreset: args.preset,
    qrRecords: result.qrRecords as QrRecord[],
    lotCodeById,
  });

  const boxLabelsSvg = buildBoxLabelsSvg(boxGroups);
  const boxLabelsPath = path.join(labelsDir, "box-labels.svg");
  await writeFile(boxLabelsPath, boxLabelsSvg, "utf8");

  const boxManifest = buildBoxManifestCsv(boxGroups);
  await writeFile(path.join(outputRoot, "box-manifest.csv"), boxManifest, "utf8");

  const manifest = buildManifestCsv({
    appUrl,
    runCode: result.runCode,
    runName: args.name,
    materialPreset: args.preset,
    qrRecords: result.qrRecords as QrRecord[],
    lotCodeById,
    sheetPathByNo,
    boxGroups,
  });

  const manifestPath = path.join(outputRoot, "manifest.csv");
  await writeFile(manifestPath, manifest, "utf8");

  console.log("");
  console.log("Run wygenerowany poprawnie.");
  console.log(`runCode: ${result.runCode}`);
  console.log(`runName: ${args.name}`);
  console.log(`preset: ${args.preset}`);
  console.log(`count: ${args.count}`);
  console.log(`lots: ${result.lots.map((lot) => lot.lotCode).join(", ")}`);
  console.log(`paczki po ${BOX_SIZE} szt.: ${boxGroups.length}`);
  console.log(`etykiety paczek: ${boxLabelsPath}`);
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
  const presetArg = argv.find((item) => item.startsWith("--preset="));

  const name = nameArg?.slice("--name=".length).trim();
  const countValue = countArg?.slice("--count=".length).trim();
  const presetValue = presetArg?.slice("--preset=".length).trim() || "standard";

  if (!name) {
    throw new Error('Brakuje parametru --name="nazwa-runu"');
  }

  if (!countValue) {
    throw new Error("Brakuje parametru --count=liczba");
  }

  if (presetValue !== "standard" && presetValue !== "gloss") {
    throw new Error('Parametr --preset musi mieć wartość "standard" albo "gloss".');
  }

  const count = Number.parseInt(countValue, 10);

  if (!Number.isFinite(count) || count < 1 || count > 10000) {
    throw new Error("Parametr --count musi być liczbą od 1 do 10000.");
  }

  if (count % PLAQUES_PER_SHEET !== 0) {
    throw new Error(
      `Parametr --count musi być wielokrotnością ${PLAQUES_PER_SHEET}, bo arkusz ma układ ${SHEET_COLS}x${SHEET_ROWS}.`
    );
  }

  return {
    name,
    count,
    notes: notesArg?.slice("--notes=".length).trim() || null,
    preset: presetValue,
  };
}

async function buildSinglePlaqueSvg(input: {
  activationUrl: string;
  presetConfig: MaterialPresetConfig;
}) {
  const layout = input.presetConfig.layout;

  const qrFragment = await buildQrRectFragment({
    value: input.activationUrl,
    x: layout.qrX,
    y: layout.qrY,
    sizeMm: layout.qrSizeMm,
    errorCorrectionLevel: input.presetConfig.errorCorrectionLevel,
    quietZoneModules: input.presetConfig.quietZoneModules,
  });

  return [
    `<?xml version="1.0" encoding="UTF-8" standalone="no"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.widthMm}mm" height="${layout.heightMm}mm" viewBox="0 0 ${layout.widthMm} ${layout.heightMm}">`,
    `<rect x="0" y="0" width="${layout.widthMm}" height="${layout.heightMm}" fill="#FFFFFF" />`,
    buildTextLine({
      text: QR_TEXT_TOP_1,
      x: layout.widthMm / 2,
      y: layout.topLine1Y,
      fontSize: layout.topFontSize,
    }),
    buildTextLine({
      text: QR_TEXT_TOP_2,
      x: layout.widthMm / 2,
      y: layout.topLine2Y,
      fontSize: layout.topFontSize,
    }),
    qrFragment,
    buildTextLine({
      text: QR_TEXT_BOTTOM,
      x: layout.widthMm / 2,
      y: layout.bottomLineY,
      fontSize: layout.bottomFontSize,
    }),
    `</svg>`,
  ].join("\n");
}

async function buildSheetSvg(input: {
  appUrl: string;
  qrRecords: QrRecord[];
  presetConfig: MaterialPresetConfig;
}) {
  const layout = input.presetConfig.layout;
  const pageWidthMm = SHEET_COLS * PLAQUE_SIZE_MM + (SHEET_COLS - 1) * SHEET_GAP_MM;
  const pageHeightMm = SHEET_ROWS * PLAQUE_SIZE_MM + (SHEET_ROWS - 1) * SHEET_GAP_MM;

  const items = await Promise.all(
    input.qrRecords.map(async (qr) => {
      const activationUrl = `${input.appUrl.replace(/\/+$/, "")}/q/${qr.rawToken}`;
      const offsetX = (qr.sheetCol - 1) * (PLAQUE_SIZE_MM + SHEET_GAP_MM);
      const offsetY = (qr.sheetRow - 1) * (PLAQUE_SIZE_MM + SHEET_GAP_MM);

      const qrFragment = await buildQrRectFragment({
        value: activationUrl,
        x: offsetX + layout.qrX,
        y: offsetY + layout.qrY,
        sizeMm: layout.qrSizeMm,
        errorCorrectionLevel: input.presetConfig.errorCorrectionLevel,
        quietZoneModules: input.presetConfig.quietZoneModules,
      });

      return [
        `<g id="qr-${escapeXml(qr.id)}">`,
        `<rect x="${offsetX.toFixed(4)}" y="${offsetY.toFixed(4)}" width="${PLAQUE_SIZE_MM}" height="${PLAQUE_SIZE_MM}" fill="#FFFFFF" />`,
        buildTextLine({
          text: QR_TEXT_TOP_1,
          x: offsetX + PLAQUE_SIZE_MM / 2,
          y: offsetY + layout.topLine1Y,
          fontSize: layout.topFontSize,
        }),
        buildTextLine({
          text: QR_TEXT_TOP_2,
          x: offsetX + PLAQUE_SIZE_MM / 2,
          y: offsetY + layout.topLine2Y,
          fontSize: layout.topFontSize,
        }),
        qrFragment,
        buildTextLine({
          text: QR_TEXT_BOTTOM,
          x: offsetX + PLAQUE_SIZE_MM / 2,
          y: offsetY + layout.bottomLineY,
          fontSize: layout.bottomFontSize,
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
  errorCorrectionLevel: QRCode.QRCodeErrorCorrectionLevel;
  quietZoneModules: number;
}) {
  const qr = QRCode.create(input.value, {
    errorCorrectionLevel: input.errorCorrectionLevel,
  });

  const moduleCount = qr.modules.size;
  const totalModules = moduleCount + input.quietZoneModules * 2;
  const moduleSize = input.sizeMm / totalModules;
  const parts: string[] = [];

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      if (!qr.modules.get(row, col)) {
        continue;
      }

      const x = input.x + (col + input.quietZoneModules) * moduleSize;
      const y = input.y + (row + input.quietZoneModules) * moduleSize;

      parts.push(
        `<rect x="${x.toFixed(4)}" y="${y.toFixed(4)}" width="${moduleSize.toFixed(4)}" height="${moduleSize.toFixed(4)}" fill="#000000" />`
      );
    }
  }

  return parts.join("\n");
}

function buildBoxGroups(input: {
  runCode: string;
  runName: string;
  materialPreset: MaterialPreset;
  qrRecords: QrRecord[];
  lotCodeById: Map<string, string>;
}): BoxGroup[] {
  const byLot = new Map<string, QrRecord[]>();

  for (const qr of input.qrRecords) {
    const current = byLot.get(qr.lotId) ?? [];
    current.push(qr);
    byLot.set(qr.lotId, current);
  }

  const groups: BoxGroup[] = [];

  for (const [lotId, records] of byLot.entries()) {
    const sorted = [...records].sort((a, b) => {
      if (a.sheetNo !== b.sheetNo) return a.sheetNo - b.sheetNo;
      if (a.sheetRow !== b.sheetRow) return a.sheetRow - b.sheetRow;
      return a.sheetCol - b.sheetCol;
    });

    const lotCode = input.lotCodeById.get(lotId) ?? "UNKN";

    for (let start = 0; start < sorted.length; start += BOX_SIZE) {
      const chunk = sorted.slice(start, start + BOX_SIZE);
      const first = chunk[0];
      const last = chunk[chunk.length - 1];
      const boxNoInLot = Math.floor(start / BOX_SIZE) + 1;

      groups.push({
        runCode: input.runCode,
        runName: input.runName,
        materialPreset: input.materialPreset,
        lotId,
        lotCode,
        boxNoInLot,
        boxCode: `${lotCode}-${pad(boxNoInLot, 2)}`,
        quantity: chunk.length,
        sheetFrom: first.sheetNo,
        sheetTo: last.sheetNo,
        firstSheetRow: first.sheetRow,
        firstSheetCol: first.sheetCol,
        lastSheetRow: last.sheetRow,
        lastSheetCol: last.sheetCol,
      });
    }
  }

  return groups;
}

function findBoxForQr(qr: QrRecord, boxGroups: BoxGroup[]) {
  return boxGroups.find((box) => {
    if (box.lotId !== qr.lotId) return false;
    if (qr.sheetNo < box.sheetFrom || qr.sheetNo > box.sheetTo) return false;

    const qrAbsolutePosition = (qr.sheetNo - 1) * PLAQUES_PER_SHEET + (qr.sheetRow - 1) * SHEET_COLS + qr.sheetCol;
    const boxStartAbsolutePosition =
      (box.sheetFrom - 1) * PLAQUES_PER_SHEET + (box.firstSheetRow - 1) * SHEET_COLS + box.firstSheetCol;
    const boxEndAbsolutePosition =
      (box.sheetTo - 1) * PLAQUES_PER_SHEET + (box.lastSheetRow - 1) * SHEET_COLS + box.lastSheetCol;

    return qrAbsolutePosition >= boxStartAbsolutePosition && qrAbsolutePosition <= boxEndAbsolutePosition;
  });
}

function buildBoxLabelsSvg(boxGroups: BoxGroup[]) {
  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 10;
  const marginY = 10;
  const gapX = 6;
  const gapY = 6;
  const cols = 2;
  const labelWidth = (pageWidth - marginX * 2 - gapX) / cols;
  const labelHeight = 51.5;

  const pages = Math.ceil(boxGroups.length / 10);
  const pageParts: string[] = [];

  for (let page = 0; page < pages; page += 1) {
    const pageGroups = boxGroups.slice(page * 10, page * 10 + 10);
    const pageOffsetY = page * pageHeight;

    pageParts.push(`<g id="labels-page-${page + 1}">`);
    pageParts.push(`<rect x="0" y="${pageOffsetY}" width="${pageWidth}" height="${pageHeight}" fill="#FFFFFF" />`);

    pageGroups.forEach((box, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = marginX + col * (labelWidth + gapX);
      const y = pageOffsetY + marginY + row * (labelHeight + gapY);

      pageParts.push(buildBoxLabel({
        box,
        x,
        y,
        width: labelWidth,
        height: labelHeight,
      }));
    });

    pageParts.push(`</g>`);
  }

  const totalHeight = Math.max(pageHeight, pages * pageHeight);

  return [
    `<?xml version="1.0" encoding="UTF-8" standalone="no"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}mm" height="${totalHeight}mm" viewBox="0 0 ${pageWidth} ${totalHeight}">`,
    pageParts.join("\n"),
    `</svg>`,
  ].join("\n");
}

function buildBoxLabel(input: {
  box: BoxGroup;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const { box, x, y, width, height } = input;
  const sheetRange = box.sheetFrom === box.sheetTo
    ? `Arkusz ${pad(box.sheetFrom, 3)}`
    : `Arkusze ${pad(box.sheetFrom, 3)}–${pad(box.sheetTo, 3)}`;

  return [
    `<g id="box-label-${escapeXml(box.boxCode)}">`,
    `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${width.toFixed(2)}" height="${height.toFixed(2)}" rx="3" ry="3" fill="#FFFFFF" stroke="#000000" stroke-width="0.35" />`,
    `<text x="${(x + 5).toFixed(2)}" y="${(y + 8).toFixed(2)}" font-family="Arial, Helvetica, sans-serif" font-size="4.2" font-weight="700" fill="#000000">Promyk Wspomnień</text>`,
    `<text x="${(x + width - 5).toFixed(2)}" y="${(y + 8).toFixed(2)}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="3.2" fill="#000000">${escapeXml(box.materialPreset.toUpperCase())}</text>`,

    `<text x="${(x + 5).toFixed(2)}" y="${(y + 18).toFixed(2)}" font-family="Arial, Helvetica, sans-serif" font-size="8" font-weight="700" fill="#000000">${escapeXml(box.boxCode)}</text>`,
    `<text x="${(x + 5).toFixed(2)}" y="${(y + 26).toFixed(2)}" font-family="Arial, Helvetica, sans-serif" font-size="4" fill="#000000">Seria 1000: ${escapeXml(box.lotCode)}</text>`,
    `<text x="${(x + 5).toFixed(2)}" y="${(y + 33).toFixed(2)}" font-family="Arial, Helvetica, sans-serif" font-size="4" fill="#000000">Paczka: ${box.boxNoInLot}/10 • Ilość: ${box.quantity} szt.</text>`,
    `<text x="${(x + 5).toFixed(2)}" y="${(y + 40).toFixed(2)}" font-family="Arial, Helvetica, sans-serif" font-size="4" fill="#000000">${escapeXml(sheetRange)}</text>`,
    `<text x="${(x + 5).toFixed(2)}" y="${(y + 47).toFixed(2)}" font-family="Arial, Helvetica, sans-serif" font-size="3.4" fill="#000000">Run: ${escapeXml(box.runCode)} • ${escapeXml(box.runName)}</text>`,
    `</g>`,
  ].join("\n");
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
  materialPreset: MaterialPreset;
  qrRecords: QrRecord[];
  lotCodeById: Map<string, string>;
  sheetPathByNo: Map<number, string>;
  boxGroups: BoxGroup[];
}) {
  const header = [
    "run_code",
    "run_name",
    "material_preset",
    "lot_code",
    "box_code",
    "box_no_in_lot",
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
    const box = findBoxForQr(qr, input.boxGroups);
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
      input.materialPreset,
      lotCode,
      box?.boxCode ?? "",
      box ? String(box.boxNoInLot) : "",
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

function buildBoxManifestCsv(boxGroups: BoxGroup[]) {
  const header = [
    "run_code",
    "run_name",
    "material_preset",
    "lot_code",
    "box_code",
    "box_no_in_lot",
    "quantity",
    "sheet_from",
    "sheet_to",
  ];

  const rows = boxGroups.map((box) => [
    box.runCode,
    box.runName,
    box.materialPreset,
    box.lotCode,
    box.boxCode,
    String(box.boxNoInLot),
    String(box.quantity),
    String(box.sheetFrom),
    String(box.sheetTo),
  ].map(csvEscape));

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
