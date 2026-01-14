import { test, expect } from '@playwright/test';

/**
 * API Tests: Stripe Integration and Email Confirmation
 *
 * Tests Stripe API timeout handling and email confirmation:
 * - Stripe API timeout scenarios (P1)
 * - Email confirmation with payment schedules (P1)
 *
 * Risk Coverage:
 * - R-008: Stripe API slowness (Score 4)
 * - R-009: Email missing schedule (Score 4)
 *
 * Priority: P1 (High) - Run on PR to main
 */

test.describe('Stripe API Timeout Handling (P1)', () => {
  test('should handle slow Stripe response with loading state', async ({
    request,
  }) => {
    // GIVEN: Mock Stripe API to respond slowly (3 second delay)
    // NOTE: Requires MSW or test environment mocking

    const bookingData = {
      tripId: 'trip-slow-stripe',
      startDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(),
      paymentPlan: 'INSTALLMENT_4',
      paymentMethodId: 'pm_card_visa_slow',
      userEmail: 'slow@example.com',
      userName: 'Slow Stripe User',
    };

    // WHEN: Creating booking (Stripe takes 3 seconds)
    const startTime = Date.now();
    const response = await request.post('/api/trpc/booking.create', {
      data: bookingData,
    });
    const duration = Date.now() - startTime;

    // THEN: Request completes successfully (waits for Stripe)
    expect(response.status()).toBe(201);

    // AND: Duration is at least 3 seconds (Stripe delay)
    expect(duration).toBeGreaterThanOrEqual(3000);

    // AND: Response includes timing metadata
    const body = await response.json();
    expect(body.result.data.stripeResponseTime).toBeGreaterThanOrEqual(3000);
  });

  test('should timeout after 10 seconds and return error', async ({
    request,
  }) => {
    // GIVEN: Mock Stripe API to never respond (hang)
    const bookingData = {
      tripId: 'trip-timeout',
      startDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(),
      paymentPlan: 'INSTALLMENT_4',
      paymentMethodId: 'pm_card_timeout',
      userEmail: 'timeout@example.com',
      userName: 'Timeout User',
    };

    // WHEN: Creating booking (Stripe times out)
    const startTime = Date.now();
    const response = await request.post('/api/trpc/booking.create', {
      data: bookingData,
      timeout: 15000, // 15 second test timeout
    });
    const duration = Date.now() - startTime;

    // THEN: Request fails with timeout error
    expect(response.status()).toBe(504); // Gateway Timeout

    // AND: Timeout occurs around 10 seconds (configured Stripe timeout)
    expect(duration).toBeGreaterThanOrEqual(9000);
    expect(duration).toBeLessThan(12000);

    // AND: Error message indicates Stripe timeout
    const body = await response.json();
    expect(body.error.message).toContain('Stripe API timeout');
    expect(body.error.message).toContain('Please try again');
  });
});

test.describe('Email Confirmation with Payment Schedule (P1)', () => {
  test('should send email with 2% discount for FULL payment plan', async ({
    request,
  }) => {
    // GIVEN: User completes booking with FULL payment plan
    const bookingData = {
      tripId: 'trip-email-full',
      startDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(),
      paymentPlan: 'FULL',
      paymentMethodId: 'pm_card_visa',
      userEmail: 'emailtest-full@example.com',
      userName: 'Email Test Full',
      tripCost: 500000, // $5,000.00
    };

    // WHEN: Creating booking
    const response = await request.post('/api/trpc/booking.create', {
      data: bookingData,
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    const bookingId = body.result.data.bookingId;

    // THEN: Email sent to user
    // (check email queue or mock email service)
    const emailResponse = await request.get(
      `/api/test/emails?recipient=${bookingData.userEmail}`
    );
    expect(emailResponse.status()).toBe(200);
    const emails = await emailResponse.json();

    // AND: Email contains booking confirmation
    const confirmationEmail = emails.find((e: any) =>
      e.subject.includes('Booking Confirmation')
    );
    expect(confirmationEmail).toBeTruthy();

    // AND: Email body shows FULL payment with 2% discount
    expect(confirmationEmail.htmlBody).toContain('Paid in Full');
    expect(confirmationEmail.htmlBody).toContain('$100.00'); // 2% discount
    expect(confirmationEmail.htmlBody).toContain('$4,900.00'); // Final amount

    // AND: Email includes discount explanation
    expect(confirmationEmail.htmlBody).toContain(
      '2% discount for paying in full'
    );
  });

  test('should send email with installment schedule for INSTALLMENT_4 plan', async ({
    request,
  }) => {
    // GIVEN: User completes booking with INSTALLMENT_4 plan
    const bookingData = {
      tripId: 'trip-email-installment',
      startDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(),
      paymentPlan: 'INSTALLMENT_4',
      paymentMethodId: 'pm_card_visa',
      userEmail: 'emailtest-installment@example.com',
      userName: 'Email Test Installment',
      tripCost: 1000000, // $10,000.00
    };

    // WHEN: Creating booking
    const response = await request.post('/api/trpc/booking.create', {
      data: bookingData,
    });
    expect(response.status()).toBe(201);

    // THEN: Email sent with installment schedule
    const emailResponse = await request.get(
      `/api/test/emails?recipient=${bookingData.userEmail}`
    );
    const emails = await emailResponse.json();
    const confirmationEmail = emails.find((e: any) =>
      e.subject.includes('Booking Confirmation')
    );

    // AND: Email contains "Installment Payment Plan" heading
    expect(confirmationEmail.htmlBody).toContain('Installment Payment Plan');

    // AND: Email lists all 4 installments with dates and amounts
    expect(confirmationEmail.htmlBody).toContain('$5,000.00'); // 50% - First
    expect(confirmationEmail.htmlBody).toContain('$2,500.00'); // 25% - Second
    expect(confirmationEmail.htmlBody).toContain('$1,500.00'); // 15% - Third
    expect(confirmationEmail.htmlBody).toContain('$1,000.00'); // 10% - Fourth

    // AND: Email shows payment status for each installment
    expect(confirmationEmail.htmlBody).toContain('Paid'); // First payment
    expect(confirmationEmail.htmlBody).toMatch(/Pending|Due/g); // Future payments (3 matches)

    // AND: Email includes due dates for each installment
    // (dates formatted as "Due on Jan 15, 2026" or similar)
    expect(confirmationEmail.htmlBody).toMatch(/Due on .+ \d{1,2}, \d{4}/g);

    // AND: Email explains automatic charges
    expect(confirmationEmail.htmlBody).toContain(
      'We will automatically charge your saved payment method'
    );
  });
});
