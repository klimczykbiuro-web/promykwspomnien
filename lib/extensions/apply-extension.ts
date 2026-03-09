import { prisma } from "@/lib/prisma";
import { addYearsToDate } from "@/lib/extensions/date";

export async function applyExtension(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { profile: true, extension: true },
  });

  if (!payment) throw new Error("Payment not found.");
  if (payment.status !== "paid") return { skipped: true, reason: "payment_not_paid" };
  if (payment.extension) return { skipped: true, reason: "extension_already_applied" };

  const oldExpiresAt = payment.profile.expiresAt;
  const newExpiresAt = addYearsToDate(oldExpiresAt, payment.yearsToAdd);

  const extension = await prisma.$transaction(async (tx) => {
    const created = await tx.extension.create({
      data: {
        profileId: payment.profileId,
        paymentId: payment.id,
        yearsAdded: payment.yearsToAdd,
        oldExpiresAt,
        newExpiresAt,
      },
    });

    await tx.profile.update({
      where: { id: payment.profileId },
      data: { expiresAt: newExpiresAt },
    });

    return created;
  });

  return { skipped: false, extension };
}
