export type Przelewy24Payload = {
  sessionId: string;
  amount: number;
  email: string;
  description: string;
};

export async function createPrzelewy24Transaction(payload: Przelewy24Payload) {
  return {
    redirectUrl: `/payment/mock-p24?sessionId=${encodeURIComponent(payload.sessionId)}`,
  };
}
