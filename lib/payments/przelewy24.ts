import crypto from "node:crypto";

type P24Config = {
  merchantId: number;
  posId: number;
  restApiKey: string;
  crc: string;
  sandbox: boolean;
};

export type Przelewy24RegisterPayload = {
  sessionId: string;
  amount: number; // grosze
  email: string;
  client: string;
  description: string;
  urlReturn: string;
  urlStatus: string;
};

export type Przelewy24VerifyPayload = {
  sessionId: string;
  orderId: number;
  amount: number; // grosze
  currency?: "PLN";
};

function getPrzelewy24Config(): P24Config {
  const merchantId = Number(process.env.P24_MERCHANT_ID);
  const posId = Number(process.env.P24_POS_ID || process.env.P24_MERCHANT_ID);
  const restApiKey = process.env.P24_REST_API_KEY;
  const crc = process.env.P24_CRC;
  const sandbox = process.env.P24_SANDBOX !== "false";

  if (!merchantId || !posId || !restApiKey || !crc) {
    throw new Error(
      "Brak konfiguracji Przelewy24. Ustaw P24_MERCHANT_ID, P24_POS_ID, P24_REST_API_KEY, P24_CRC i P24_SANDBOX."
    );
  }

  return {
    merchantId,
    posId,
    restApiKey,
    crc,
    sandbox,
  };
}

function getP24Host(sandbox: boolean) {
  return sandbox ? "https://sandbox.przelewy24.pl" : "https://secure.przelewy24.pl";
}

function makeSign(payload: Record<string, string | number>) {
  return crypto
    .createHash("sha384")
    .update(JSON.stringify(payload))
    .digest("hex");
}

function makeBasicAuth(posId: number, restApiKey: string) {
  return `Basic ${Buffer.from(`${posId}:${restApiKey}`).toString("base64")}`;
}

async function readP24Response(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export async function createPrzelewy24Transaction(
  payload: Przelewy24RegisterPayload
) {
  const config = getPrzelewy24Config();
  const host = getP24Host(config.sandbox);
  const currency = "PLN";

  const sign = makeSign({
    sessionId: payload.sessionId,
    merchantId: config.merchantId,
    amount: payload.amount,
    currency,
    crc: config.crc,
  });

  const body = {
    merchantId: config.merchantId,
    posId: config.posId,
    sessionId: payload.sessionId,
    amount: payload.amount,
    currency,
    description: payload.description,
    email: payload.email,
    client: payload.client,
    country: "PL",
    language: "pl",
    urlReturn: payload.urlReturn,
    urlStatus: payload.urlStatus,
    encoding: "UTF-8",
    sign,
  };

  const response = await fetch(`${host}/api/v1/transaction/register`, {
    method: "POST",
    headers: {
      "Authorization": makeBasicAuth(config.posId, config.restApiKey),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await readP24Response(response);

  if (!response.ok) {
    throw new Error(
      `Przelewy24 register error ${response.status}: ${JSON.stringify(data)}`
    );
  }

  const token =
    typeof data?.data?.token === "string"
      ? data.data.token
      : typeof data?.token === "string"
      ? data.token
      : null;

  if (!token) {
    throw new Error(`Przelewy24 nie zwróciło tokenu: ${JSON.stringify(data)}`);
  }

  return {
    token,
    redirectUrl: `${host}/trnRequest/${token}`,
    raw: data,
  };
}

export async function verifyPrzelewy24Transaction(
  payload: Przelewy24VerifyPayload
) {
  const config = getPrzelewy24Config();
  const host = getP24Host(config.sandbox);
  const currency = payload.currency ?? "PLN";

  const sign = makeSign({
    sessionId: payload.sessionId,
    orderId: payload.orderId,
    amount: payload.amount,
    currency,
    crc: config.crc,
  });

  const body = {
    merchantId: config.merchantId,
    posId: config.posId,
    sessionId: payload.sessionId,
    amount: payload.amount,
    currency,
    orderId: payload.orderId,
    sign,
  };

  const response = await fetch(`${host}/api/v1/transaction/verify`, {
    method: "PUT",
    headers: {
      "Authorization": makeBasicAuth(config.posId, config.restApiKey),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await readP24Response(response);

  if (!response.ok) {
    throw new Error(
      `Przelewy24 verify error ${response.status}: ${JSON.stringify(data)}`
    );
  }

  return data;
}
