import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.profile.upsert({
    where: { slug: "maria-kowalska" },
    update: {},
    create: {
      slug: "maria-kowalska",
      fullName: "Maria Kowalska",
      birthYear: 1948,
      deathYear: 2024,
      quote: "Pozostaje po nas dobro, które daliśmy innym.",
      biography: "Maria była osobą ciepłą, spokojną i zawsze gotową pomóc.",
      heroImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
      expiresAt: new Date("2030-03-12T00:00:00.000Z"),
      qrToken: "demo-qr-token",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
