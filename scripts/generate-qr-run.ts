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
    const svg = await QRCode.toString(activationUrl, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 0,
      width: 512,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    const lotCode = lotCodeById.get(qr.lotId) ?? "UNKN";
    const singleFileName = `${lotCode}-sheet-${pad(qr.sheetNo, 3)}-r${qr.sheetRow}-c${qr.sheetCol}.svg`;
    const singleRelativePath = toPosix(
      path.relative(process.cwd(), path.join(singleDir, singleFileName))
    );

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

  return {
    name,
    count,
    notes: notesArg?.slice("--notes=".length).trim() || null,
  };
}

async function buildSheetSvg(input: {
  appUrl: string;
  qrRecords: QrRecord[];
}) {
  const pageSizeMm = 210;
  const marginMm = 5;
  const cellSizeMm = 40;
  const qrSizeMm = 28;

  const items = await Promise.all(
    input.qrRecords.map(async (qr) => {
      const activationUrl = `${input.appUrl.replace(/\/+$/, "")}/q/${qr.rawToken}`;
      const svg = await QRCode.toString(activationUrl, {
        type: "svg",
        errorCorrectionLevel: "M",
        margin: 0,
        width: 512,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      return {
        qr,
        fragment: svgToNestedFragment(svg, {
          x: marginMm + (qr.sheetCol - 1) * cellSizeMm + (cellSizeMm - qrSizeMm) / 2,
          y: marginMm + (qr.sheetRow - 1) * cellSizeMm + (cellSizeMm - qrSizeMm) / 2,
          size: qrSizeMm,
        }),
      };
    })
  );

  const content = items.map((item) => item.fragment).join("\n");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pageSizeMm}mm" height="${pageSizeMm}mm" viewBox="0 0 ${pageSizeMm} ${pageSizeMm}">`,
    `<rect x="0" y="0" width="${pageSizeMm}" height="${pageSizeMm}" fill="#FFFFFF" />`,
    content,
    `</svg>`,
  ].join("\n");
}

function svgToNestedFragment(
  svg: string,
  input: { x: number; y: number; size: number }
) {
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/i);
  const innerMatch = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);

  if (!viewBoxMatch || !innerMatch) {
    throw new Error("Nie udało się sparsować SVG QR.");
  }

  const viewBox = viewBoxMatch[1];
  const inner = innerMatch[1];

  return [
    `<svg`,
    ` x="${input.x}"`,
    ` y="${input.y}"`,
    ` width="${input.size}"`,
    ` height="${input.size}"`,
    ` viewBox="${viewBox}"`,
    ` shape-rendering="crispEdges"`,
    ` xmlns="http://www.w3.org/2000/svg">`,
    inner,
    `</svg>`,
  ].join("");
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

main().catch((error) => {
  console.error("");
  console.error("Generator runu zakończył się błędem.");
  console.error(error);
  console.error("");
  process.exit(1);
});