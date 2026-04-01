import { createHmac } from "node:crypto";

const API_BASE = "https://www.apaczka.pl/api/v2";

type JsonRecord = Record<string, unknown>;

type ApaczkaEnvelope<T> = {
  status: number;
  message: string;
  response: T;
};

type ApaczkaOrderResponse = {
  order: {
    id: string | number;
    service_id: string | number;
    service_name: string;
    waybill_number: string;
    tracking_url: string;
    status: string;
  };
};

type WaybillResponse = {
  waybill: string;
  type: string;
};

type TurnInResponse = {
  turn_in: string;
};

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function getOptionalEnv(name: string, fallback = "") {
  return process.env[name] || fallback;
}

function getRouteName(endpoint: string) {
  return endpoint.replace(/^\//, "");
}

async function callApaczka<T>(endpoint: string, requestBody: JsonRecord): Promise<T> {
  const appId = getEnv("APACZKA_APP_ID");
  const appSecret = getEnv("APACZKA_APP_SECRET");
  const expires = String(Math.floor(Date.now() / 1000) + 15 * 60);
  const route = getRouteName(endpoint);
  const request = JSON.stringify(requestBody);
  const signature = createHmac("sha256", appSecret)
    .update(`${appId}:${route}:${request}:${expires}`)
    .digest("hex");

  const form = new URLSearchParams();
  form.set("app_id", appId);
  form.set("request", request);
  form.set("expires", expires);
  form.set("signature", signature);

  const response = await fetch(`${API_BASE}/${route}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: form.toString(),
    cache: "no-store",
  });

  const data = (await response.json()) as ApaczkaEnvelope<T>;

  if (!response.ok || data.status !== 200) {
    throw new Error(data?.message || `Apaczka error for ${route}`);
  }

  return data.response;
}

function buildSender() {
  return {
    country_code: getOptionalEnv("APACZKA_SENDER_COUNTRY_CODE", "PL"),
    name: getEnv("APACZKA_SENDER_NAME"),
    line1: getEnv("APACZKA_SENDER_LINE1"),
    line2: getOptionalEnv("APACZKA_SENDER_LINE2"),
    postal_code: getEnv("APACZKA_SENDER_POSTAL_CODE"),
    state_code: getOptionalEnv("APACZKA_SENDER_STATE_CODE"),
    city: getEnv("APACZKA_SENDER_CITY"),
    is_residential: Number(getOptionalEnv("APACZKA_SENDER_IS_RESIDENTIAL", "0")),
    contact_person: getOptionalEnv("APACZKA_SENDER_CONTACT_PERSON", getEnv("APACZKA_SENDER_NAME")),
    email: getEnv("APACZKA_SENDER_EMAIL"),
    phone: getEnv("APACZKA_SENDER_PHONE"),
    foreign_address_id: getOptionalEnv("APACZKA_SENDER_FOREIGN_ADDRESS_ID"),
  };
}

export type ShippingOrderInput = {
  orderId: string;
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  street: string;
  postalCode: string;
  city: string;
  notes: string | null;
};

export async function sendApaczkaOrder(input: ShippingOrderInput) {
  const serviceId = Number(getEnv("APACZKA_SERVICE_ID"));
  const weight = Number(getOptionalEnv("APACZKA_SHIPMENT_WEIGHT_KG", "0.2"));
  const dimension1 = Number(getOptionalEnv("APACZKA_SHIPMENT_DIMENSION1_CM", "20"));
  const dimension2 = Number(getOptionalEnv("APACZKA_SHIPMENT_DIMENSION2_CM", "15"));
  const dimension3 = Number(getOptionalEnv("APACZKA_SHIPMENT_DIMENSION3_CM", "2"));
  const pickupType = getOptionalEnv("APACZKA_PICKUP_TYPE", "SELF");
  const isZebra = Number(getOptionalEnv("APACZKA_IS_ZEBRA", "0"));

  const order = {
    service_id: serviceId,
    address: {
      sender: buildSender(),
      receiver: {
        country_code: "PL",
        name: input.buyerName,
        line1: input.street,
        line2: "",
        postal_code: input.postalCode,
        state_code: "",
        city: input.city,
        is_residential: 1,
        contact_person: input.buyerName,
        email: input.buyerEmail,
        phone: input.buyerPhone,
        foreign_address_id: "",
      },
    },
    option: {
      31: 1,
    },
    notification: {
      new: {
        isReceiverEmail: 1,
        isReceiverSms: 0,
        isSenderEmail: 1,
      },
      sent: {
        isReceiverEmail: 1,
        isReceiverSms: 1,
        isSenderEmail: 1,
        isSenderSms: 0,
      },
      exception: {
        isReceiverEmail: 1,
        isReceiverSms: 1,
        isSenderEmail: 1,
        isSenderSms: 0,
      },
      delivered: {
        isReceiverEmail: 1,
        isReceiverSms: 1,
        isSenderEmail: 1,
        isSenderSms: 0,
      },
    },
    shipment_value: 6000,
    shipment_currency: "PLN",
    pickup: {
      type: pickupType,
      date: "",
      hours_from: "",
      hours_to: "",
    },
    shipment: [
      {
        dimension1,
        dimension2,
        dimension3,
        weight,
        is_nstd: 0,
        shipment_type_code: getOptionalEnv("APACZKA_SHIPMENT_TYPE_CODE", "PACZKA"),
      },
    ],
    comment: input.notes || "",
    content: `Tabliczka QR | ${input.orderNumber}`,
    externalId: input.orderId,
    is_zebra: isZebra,
  };

  const response = await callApaczka<ApaczkaOrderResponse>("/order_send/", { order });

  return {
    apaczkaOrderId: String(response.order.id),
    serviceId: Number(response.order.service_id),
    serviceName: response.order.service_name,
    waybillNumber: response.order.waybill_number,
    trackingUrl: response.order.tracking_url,
    status: response.order.status,
  };
}

export async function getApaczkaWaybillBase64(apaczkaOrderId: string) {
  const response = await callApaczka<WaybillResponse>(`/waybill/${apaczkaOrderId}/`, {});
  return response.waybill;
}

export async function getApaczkaTurnInBase64(apaczkaOrderIds: string[]) {
  const numericIds = apaczkaOrderIds.map((value) => {
    const asNumber = Number(value);
    return Number.isFinite(asNumber) ? asNumber : value;
  });

  const response = await callApaczka<TurnInResponse>("/turn_in/", {
    order_ids: numericIds,
  });

  return response.turn_in;
}
