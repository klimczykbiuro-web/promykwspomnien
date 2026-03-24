import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

type Args = {
  limit: number;
  dryRun: boolean;
};

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const { pool } = await import("../lib/db");
  const { purgeExpiredProfiles } = await import("../lib/profiles/purge-expired");

  const result = await purgeExpiredProfiles({
    limit: args.limit,
    dryRun: args.dryRun,
  });

  console.log("");
  console.log(args.dryRun ? "DRY RUN cleanupu zakończony." : "Cleanup zakończony.");
  console.log(`Przeskanowano kandydatów: ${result.scanned}`);
  console.log(`Przetworzono profili: ${result.purged.length}`);
  console.log("");

  if (result.purged.length > 0) {
    for (const item of result.purged) {
      console.log(
        [
          `slug=${item.slug}`,
          `gallery_deleted=${item.deletedGalleryImages}`,
          `candles_deleted=${item.deletedCandles}`,
          `sessions_deleted=${item.deletedSessions}`,
          `qr_disabled=${item.qrDisabled ? "yes" : "no"}`,
        ].join(" | ")
      );
    }

    console.log("");
  }

  await pool.end();
}

function parseArgs(argv: string[]): Args {
  const limitArg = argv.find((item) => item.startsWith("--limit="));
  const dryRun = argv.includes("--dry-run");

  const limitValue = limitArg?.slice("--limit=".length).trim();
  const limit = limitValue ? Number.parseInt(limitValue, 10) : 100;

  if (!Number.isFinite(limit) || limit < 1 || limit > 5000) {
    throw new Error("Parametr --limit musi być liczbą od 1 do 5000.");
  }

  return {
    limit,
    dryRun,
  };
}

main().catch((error) => {
  console.error("");
  console.error("Cleanup zakończył się błędem.");
  console.error(error);
  console.error("");
  process.exit(1);
});