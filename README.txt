Fabrixo3D V4 – ekte Stripe Checkout + Sales AI

Inneholder:
- index.html med ekte produktbilder, riktig pris og riktig Payment Link som backup.
- Ekte handlekurv med antall, fjern/legg til og totalpris.
- Stripe Checkout Session via server.js for samlet betaling av flere produkter.
- Price IDs ferdig lagt inn for alle 9 produkter.
- Sales AI demo + valgfri OpenAI-backend.
- Formspree custom-skjema: https://formspree.io/f/xeedjvdo

Kjør lokalt:
1. Installer Node.js 18+
2. Åpne terminal i denne mappen
3. Kjør: npm install
4. Kopier .env.example til .env
5. Legg inn STRIPE_SECRET_KEY fra Stripe Dashboard
6. Kjør: npm start
7. Åpne: http://localhost:3000

Viktig:
- Ikke del STRIPE_SECRET_KEY offentlig.
- Checkout-knappen bruker /create-checkout-session og krever at server.js kjører.
- Produktknappen "Kjøp med Stripe" bruker fortsatt Payment Link som backup hvis server ikke kjører.
