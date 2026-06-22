"use client";

export function CancelPayoutButton({
  amount,
  payoutDate,
}: {
  amount: string;
  payoutDate: string;
}) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        const confirmed = window.confirm(
          `Anulować wypłatę ${amount} z dnia ${payoutDate}?\n\nHistoria zostanie, ale ta wypłata nie będzie już liczona jako wypłacona.`
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
      style={{
        border: "1px solid #fecaca",
        borderRadius: 10,
        background: "#fef2f2",
        color: "#991b1b",
        padding: "8px 12px",
        fontSize: 14,
        fontWeight: 800,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      Anuluj
    </button>
  );
}
