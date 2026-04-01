import { PDFDocument } from "pdf-lib";

export async function mergePdfBase64Files(base64Files: string[]) {
  if (base64Files.length === 0) {
    return null;
  }

  if (base64Files.length === 1) {
    return base64Files[0];
  }

  const merged = await PDFDocument.create();

  for (const base64 of base64Files) {
    const source = await PDFDocument.load(Buffer.from(base64, "base64"));
    const copiedPages = await merged.copyPages(source, source.getPageIndices());
    copiedPages.forEach((page) => merged.addPage(page));
  }

  const bytes = await merged.save();
  return Buffer.from(bytes).toString("base64");
}
