# Email Service Documentation

This directory contains the email service implementation using SendGrid.

## Setup

### 1. Get SendGrid API Key

1. Sign up for a SendGrid account at https://sendgrid.com
2. Navigate to Settings → API Keys
3. Create a new API key with "Mail Send" permissions
4. Copy the API key

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
SENDGRID_API_KEY="your_api_key_here"
SENDGRID_FROM_EMAIL="hello@pickleballpassport.com"
```

**Important:** You must verify the sender email in SendGrid before sending emails.

### 3. Verify Sender Email

1. In SendGrid dashboard, go to Settings → Sender Authentication
2. Verify a single sender email (e.g., `hello@pickleballpassport.com`)
3. Follow the verification email instructions

## Architecture

### Core Files

- **`sendgrid.ts`** - SendGrid client and core email sending functions
- **`templates/base.ts`** - Base HTML email template with responsive design
- **`templates/welcome.ts`** - Welcome email template
- **`templates/booking-confirmation.ts`** - Booking confirmation email template

### tRPC Integration

Email router available at `/lib/trpc/server/routers/email.ts`:

```typescript
// Check if SendGrid is configured
const { data } = trpc.email.isConfigured.useQuery();

// Send test email (admin only)
const mutation = trpc.email.sendTest.useMutation();
await mutation.mutateAsync({
  to: 'user@example.com',
  subject: 'Test',
  message: 'Hello!'
});

// Send welcome email
const welcome = trpc.email.sendWelcome.useMutation();
await welcome.mutateAsync({
  email: 'newuser@example.com',
  firstName: 'John'
});

// Send booking confirmation email
const bookingConfirmation = trpc.email.sendBookingConfirmation.useMutation();
await bookingConfirmation.mutateAsync({
  email: 'guest@example.com',
  firstName: 'Jane',
  bookingReference: 'PP-2025-001234',
  packageName: 'Total Transformation Package',
  duration: 14,
  accommodationTier: 'Ultra-Luxury',
  tripStartDate: '2025-03-15',
  tripEndDate: '2025-03-29',
  destination: 'Chiang Mai, Thailand',
  basePrice: 449900, // in cents
  accommodationPrice: 200000,
  addOnsTotal: 89900,
  totalPrice: 739800,
  addOns: [
    {
      name: 'Full Set of Porcelain Veneers',
      quantity: 1,
      price: 59900
    }
  ]
});
```

## Usage

### Sending a Simple Email

```typescript
import { sendEmail } from '@/lib/email/sendgrid';

await sendEmail({
  to: 'user@example.com',
  subject: 'Your Subject',
  html: '<h1>Hello</h1><p>Email content</p>',
  text: 'Hello - Email content',
});
```

### Using Templates

```typescript
import { generateWelcomeEmail } from '@/lib/email/templates/welcome';
import { sendEmail } from '@/lib/email/sendgrid';

const emailContent = generateWelcomeEmail({
  email: 'user@example.com',
  firstName: 'John',
});

await sendEmail({
  to: 'user@example.com',
  subject: emailContent.subject,
  html: emailContent.html,
  text: emailContent.text,
});
```

### Creating New Templates

1. Create a new file in `templates/` (e.g., `booking-confirmation.ts`)
2. Import `baseEmailTemplate` and `generatePlainText`
3. Define your template interface and generator function
4. Return `{ html, text, subject }`

Example:

```typescript
import { baseEmailTemplate, generatePlainText } from './base';

export interface BookingEmailData {
  guestName: string;
  bookingId: string;
  // ... other fields
}

export function generateBookingEmail(data: BookingEmailData) {
  const content = `
    <h1>Booking Confirmed!</h1>
    <p>Hi ${data.guestName},</p>
    <p>Your booking #${data.bookingId} is confirmed.</p>
  `;

  const html = baseEmailTemplate({
    title: 'Booking Confirmation',
    content,
    preheader: 'Your booking has been confirmed!',
  });

  return {
    html,
    text: generatePlainText(content),
    subject: 'Booking Confirmation #' + data.bookingId,
  };
}
```

## Testing

### Admin Test Page

Visit `/admin/test-email` to:
- Check SendGrid configuration status
- Send test emails to verify delivery
- Test booking confirmation emails with mock data
- Preview email formatting and content

### Development Testing

When `SENDGRID_API_KEY` is not set, the email service will:
- Log warnings to console
- Return without throwing errors
- Allow development to continue

## Email Templates

All emails use a consistent base template with:
- Responsive design (mobile-friendly)
- Brand colors (emerald/blue gradient)
- Professional typography
- Accessible HTML structure
- Plain text fallback

### Customization

Modify `templates/base.ts` to update:
- Logo and branding
- Color scheme
- Footer content
- Layout structure

## Best Practices

1. **Always include text version** - Some email clients don't support HTML
2. **Test on multiple clients** - Gmail, Outlook, Apple Mail, etc.
3. **Keep HTML simple** - Email clients have limited CSS support
4. **Use inline styles** - External CSS is not well-supported
5. **Optimize images** - Use CDN links, not attachments
6. **Include unsubscribe link** - Required for compliance (add in future)

## Troubleshooting

### Email not sending

1. Check `SENDGRID_API_KEY` is set correctly
2. Verify sender email is authenticated in SendGrid
3. Check SendGrid dashboard for delivery errors
4. Review server logs for error messages

### Email goes to spam

1. Authenticate your domain (DKIM, SPF, DMARC)
2. Warm up your sender reputation gradually
3. Avoid spam trigger words in subject/content
4. Include a physical address in footer (compliance)

### API Rate Limits

- Free tier: 100 emails/day
- Paid plans: Higher limits
- Implement queueing for batch emails in production

## Future Enhancements

- [ ] Email queueing system (Bull/BullMQ)
- [ ] Email analytics and tracking
- [ ] A/B testing templates
- [ ] Unsubscribe management
- [ ] Email preferences per user
- [ ] Transactional email monitoring
- [ ] Webhook handler for delivery status
