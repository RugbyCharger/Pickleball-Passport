# Stripe Integration Documentation

This directory contains the Stripe payment processing integration for Pickleball Passport.

## Setup Instructions

### 1. Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and sign up
2. Complete the account verification process
3. Enable both **Test Mode** and **Live Mode**

### 2. Get API Keys

#### Test Mode (Development)
1. In the Stripe Dashboard, go to **Developers** → **API keys**
2. Copy the **Publishable key** (starts with `pk_test_`)
3. Copy the **Secret key** (starts with `sk_test_`)

#### Live Mode (Production)
1. Switch to **Live Mode** in the dashboard
2. Copy the **Publishable key** (starts with `pk_live_`)
3. Copy the **Secret key** (starts with `sk_live_`)

### 3. Configure Environment Variables

Add the following to your `.env` file:

```bash
# Stripe (Test Mode for Development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY_HERE"
STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET_HERE"
```

### 4. Set Up Webhook Endpoint

#### For Development (using Stripe CLI)

1. Install the Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Copy the webhook signing secret (starts with `whsec_`) and add it to `.env`

#### For Production (Stripe Dashboard)

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Copy the **Signing secret** and add to production `.env`

## Architecture

### Files

- **`stripe-service.ts`** - Server-side Stripe utilities
  - Payment intent creation
  - Refund processing
  - Webhook verification
  - Amount formatting helpers

- **`/app/api/webhooks/stripe/route.ts`** - Webhook handler
  - Receives Stripe events
  - Verifies signatures
  - Updates database on payment success/failure
  - Sends confirmation emails
  - Awards partner points

### Payment Flow

1. **Guest configures booking** → Booking created with status `DRAFT`
2. **Guest proceeds to payment** → Payment intent created on Stripe
3. **Guest enters card details** → Frontend submits to Stripe
4. **Stripe processes payment** → Sends webhook to `/api/webhooks/stripe`
5. **Webhook handler** → Updates booking to `CONFIRMED`, sends email

### Database Schema

```prisma
model Payment {
  id                    String        @id @default(cuid())
  bookingId             String
  booking               Booking       @relation(...)

  amount                Int           // Amount in cents
  status                PaymentStatus @default(PENDING)

  stripePaymentIntentId String?       @unique
  stripeCustomerId      String?

  isInstallment         Boolean       @default(false)
  installmentNumber     Int?
  scheduledDate         DateTime?

  failureReason         String?
  receiptUrl            String?

  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}
```

## Testing

### Test Cards

Stripe provides test card numbers for different scenarios:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure required:** `4000 0025 0000 3155`

Use any future expiration date and any 3-digit CVC.

### Testing Webhooks

1. Start the Stripe CLI listener:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. Trigger a test payment:
   ```bash
   stripe trigger payment_intent.succeeded
   ```

3. Check your local logs to see the webhook processing

## Security Best Practices

✅ **DO:**
- Always verify webhook signatures
- Use environment variables for API keys
- Never commit API keys to git
- Use HTTPS in production
- Validate amounts on the server side

❌ **DON'T:**
- Store card numbers in your database
- Trust client-side amount calculations
- Skip webhook signature verification
- Use test keys in production

## Monitoring

### Stripe Dashboard

Monitor payments in real-time:
- **Payments** → View all transactions
- **Events** → See webhook deliveries
- **Logs** → Debug API requests

### Error Handling

All Stripe operations include try-catch blocks and log errors:
```typescript
try {
  const paymentIntent = await createPaymentIntent(params);
} catch (error) {
  console.error('Stripe error:', error);
  // Handle error gracefully
}
```

## Support

- **Stripe Docs:** https://stripe.com/docs
- **API Reference:** https://stripe.com/docs/api
- **Testing Guide:** https://stripe.com/docs/testing
- **Webhooks:** https://stripe.com/docs/webhooks

## Troubleshooting

### "Invalid API Key"
- Check that `STRIPE_SECRET_KEY` is set correctly in `.env`
- Verify you're using the correct key for test/live mode

### "Webhook signature verification failed"
- Ensure `STRIPE_WEBHOOK_SECRET` matches your endpoint secret
- Check that the raw request body is passed to verification

### "Payment intent not found"
- Verify the payment intent ID is correct
- Check if you're in the right mode (test vs live)

### "Amount must be at least $0.50"
- Stripe requires minimum amounts
- Check your amount calculation (should be in cents)
