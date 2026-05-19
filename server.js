import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

// Node 18+ har fetch innebygget. Bruk Node 18 eller nyere.
dotenv.config();

const app = express();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static("."));

const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:${PORT}`;

const ALLOWED_PRICE_IDS = new Set([
  "price_1TvxWCAfQkuPhGQMCXQPdrep", // Henger
  "price_1TVxUVAfQkuPhGQMa46dZTQA", // Frukt
  "price_1TVxSvAfQkuPhGQMbUR4xDOx", // Nøkkel holder
  "price_1TVxRCAfQkuPhGQMpLbPYBjQ", // Figur
  "price_1TVxPMAfQkuPhGQMY9Zn7xx3", // Elegant Plantevase
  "price_1TVxGWAfQkuPhGQM5tORfuqp", // Egg-holder
  "price_1TVxD4AfQkuPhGQMe0O0RoNg", // Moderne Spiral Vase
  "price_1TVx8PAfQkuPhGQMIRNWs5X2", // Minimalist Loop Vase
  "price_1TVx7UAfQkuPhGQMt9Ax0UrR"  // Premium Design Vase
]);

app.post("/create-checkout-session", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "STRIPE_SECRET_KEY mangler i .env" });
    }

    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!items.length) {
      return res.status(400).json({ error: "Kurven er tom" });
    }

    const line_items = items.map((item) => {
      const priceId = String(item.priceId || "").trim();
      const quantity = Math.max(1, Math.min(99, Number(item.quantity || 1)));

      if (!ALLOWED_PRICE_IDS.has(priceId)) {
        throw new Error(`Ugyldig Price ID: ${priceId}`);
      }

      return { price: priceId, quantity };
    });

    const origin = req.headers.origin || FRONTEND_URL;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/index.html?checkout=cancelled`,
      billing_address_collection: "auto",
      allow_promotion_codes: true
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ error: err.message || "Checkout feilet" });
  }
});

const SYSTEM_PROMPT = `Du er Fabrixo3D sin AI-salgsassistent. Du svarer kort, konkret og selgende på norsk. Du anbefaler kun produkter fra produktlisten. Målet ditt er å hjelpe kunden til riktig valg og lede dem til Stripe-kjøp, WhatsApp-forespørsel eller custom print-skjema. Du er hyggelig, profesjonell og ikke masete.`;

app.post("/api/chat", async (req, res) => {
  try {
    const { message, products = [] } = req.body;
    if (!message) return res.status(400).json({ error: "Missing message" });

    const productText = products.map(p => `${p.name} – ${p.price} kr – ${p.description} – Stripe: ${p.stripeLink}`).join("\n");
    const prompt = `${SYSTEM_PROMPT}\n\nProduktliste:\n${productText}`;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(501).json({ error: "OPENAI_API_KEY missing" });
    }

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: message }
        ],
        temperature: 0.5,
        max_tokens: 350
      })
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(500).json({ error: text });
    }
    const data = await r.json();
    res.json({ reply: data.choices?.[0]?.message?.content || "Beklager, jeg fikk ikke svar akkurat nå." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Fabrixo3D V4 kjører på ${FRONTEND_URL}`));
