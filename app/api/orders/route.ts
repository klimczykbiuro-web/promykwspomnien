import { NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

const ORDER_AMOUNT = 6000;
const ORDER_YEARS = 1;

type Payload = {
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  memorialName?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  notes?: string;
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/orders",
    hasStripe: Boolean(process.env.STRIPE_SECRET_KEY),
    hasSiteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    hasDatabase:
      Boolean(process.env.DATABASE_URL) ||
      Boolean(process.env.DATABASE_URL_UNPOOLED),
  });
}

export async function POST(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Brakuje STRIPE_SECRET_KEY." },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      return NextResponse.json(
        { error: "Brakuje NEXT_PUBLIC_SITE_URL." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as Payload;

    const buyerName = clean(body.buyerName);
    const buyerEmail = clean(body.buyerEmail);
    const buyerPhone = clean(body.buyerPhone);
    const memorialName = clean(body.memorialName);
    const street = clean(body.street);
    const postalCode = clean(body.postalCode);
    const city = clean(body.city);
    const notes = clean(body.notes);

    if (
      !buyerName ||
      !buyerEmail ||
      !buyerPhone ||
      !memorialName ||
      !street ||
      !postalCode ||
      !city
    ) {
      return NextResponse.json(
        { error: "Wypełnij wszystkie wymagane pola." },
        { status: 400 }
      );
    }

    const orderNumber = `PWP-${Date.now()}`;

    const insertResult = await pool.query(
      `
        insert into orders (
          order_number,
          status,
          buyer_name,
          buyer_email,
          buyer_phone,
          memorial_name,
          street,
          postal_code,
          city,
          notes,
          amount,
          currency,
          subscription_years
        )
        values (
          $1, 'pending', $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pln', $11
        )
        returning id, order_number
      `,
      [
        orderNumber,
        buyerName,
        buyerEmail,
        buyerPhone,
        memorialName,
        street,
        postalCode,
        city,
        notes || null,
        ORDER_AMOUNT,
        ORDER_YEARS,
      ]
    );

    const order = insertResult.rows[0] as {
      id: string;
      order_number: string;
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: buyerEmail,
      client_reference_id: order.id,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/zamow/sukces?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/zamow/anulowano`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "pln",
            unit_amount: ORDER_AMOUNT,
            product_data: {
              name: "Tabliczka QR + 1 rok subskrypcji",
              description:
                "Zakup tabliczki QR wraz z roczną aktywacją profilu pamięci.",
            },
          },
        },
      ],
      metadata: {
        order_type: "plaque_purchase",
        order_id: order.id,
        order_number: order.order_number,
      },
    });

    await pool.query(
      `
        update orders
        set stripe_session_id = $2, updated_at = now()
        where id = $1
      `,
      [order.id, session.id]
    );

    return NextResponse.json({
      ok: true,
      redirectUrl: session.url,
      orderNumber: order.order_number,
    });
  } catch (error) {
    console.error("create-checkout error", error);

    const detail =
      error instanceof Error ? error.message : "Nieznany błąd serwera";

    return NextResponse.json(
      {
        error: "Nie udało się utworzyć płatności.",
        detail,
      },
      { status: 500 }
    );
  }
}