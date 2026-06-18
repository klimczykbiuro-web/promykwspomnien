"use client";

export function DeleteAssignmentButton({ lotCode }: { lotCode: string }) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        const confirmed = window.confirm(
          `Czy na pewno usunąć przypisanie lotu ${lotCode} do tego partnera? QR, profile i płatności nie zostaną usunięte.`
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
      title="Usuwa tylko przypisanie lotu do partnera. QR i profile nie są usuwane."
    >
      Usuń
    </button>
  );
}
