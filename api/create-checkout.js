import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  basic:   { amount: 4900,  name: "DEPRO Plan Básico",   description: "Plan mensual completo + acceso al panel privado" },
  premium: { amount: 11900, name: "DEPRO Plan Premium",  description: "Plan revisado por el preparador + seguimiento continuo" },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { planId, formData, origin } = req.body;
  const price = PRICES[planId];

  if (!price) {
    return res.status(400).json({ error: "Plan no válido" });
  }

  // Aplicar descuento de club si hay código (15%)
  const hasDiscount = !!formData?.clubCode;
  const finalAmount = hasDiscount ? Math.round(price.amount * 0.85) : price.amount;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: finalAmount,
            recurring: { interval: "month" },
            product_data: {
              name: price.name,
              description: price.description,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: formData?.email || undefined,
      metadata: {
        plan:      planId,
        name:      formData?.name      || "",
        email:     formData?.email     || "",
        edad:      formData?.edad      || "",
        posicion:  formData?.posicion  || "",
        nivel:     formData?.nivel     || "",
        frecuencia: formData?.frecuencia || "",
        clubCode:  formData?.clubCode  || "",
        objetivos: (formData?.objetivos || []).join(", "),
        lesiones:  formData?.lesiones  || "",
      },
      success_url: `${origin}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/comprar?cancelled=1`,
      locale: "es",
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
