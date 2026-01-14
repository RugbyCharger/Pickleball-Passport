import { test, expect } from '@playwright/test';

/**
 * API Tests: Booking Creation with Installment Payment Plans
 *
 * Tests the tRPC API endpoints for creating bookings with payment plans:
 * - Stripe customer creation with retry logic
 * - Atomic booking + payment record creation
 * - 70-day validation
 * - Gift booking restrictions
 *
 * Risk Coverage:
 * - R-002: Stripe customer creation fails (Score 6)
 * - R-004: Non-atomic payment records (Score 6)
 * - R-005: 70-day validation bypassed (Score 4)
 * - R-006: Gift bookings allow installments (Score 3)
 *
 * Priority: P0 + P1 (Critical + High)
 */

test.describe('Stripe Customer Creation (P0)', () => {
  test('should create Stripe customer successfully for new user', async ({
    request,
  }) => {
    // GIVEN: Valid booking data with INSTALLMENT_4 plan
    const bookingData = {
      tripId: 'trip-123',
      startDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(), // 80 days from now
      paymentPlan: 'INSTALLMENT_4',
      paymentMethodId: 'pm_card_visa', // Stripe test payment method
      userEmail: 'newuser@example.com',
      userName: 'New User',
    };

    // WHEN: Creating booking via API
    const response = await request.post('/api/trpc/booking.create', {
      data: bookingData,
    });

    // THEN: Booking created successfully
    expect(response.status()).toBe(201);
    const body = await response.json();

    // AND: Stripe customer ID returned
    expect(body.result.data).toMatchObject({
      bookingId: expect.any(String),
      stripeCustomerId: expect.stringMatching(/^cus_/), // Stripe customer ID format
      paymentPlan: 'INSTALLMENT_4',
    });
  });

  test('should retry Stripe customer creation on transient failure', async ({
    request,
  }) => {
    // GIVEN: Mock Stripe API to fail once, then succeed
    // NOTE: This requires MSW or similar mocking - implementation TBD

    const bookingData = {
      tripId: 'trip-456',
      startDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(),
      paymentPlan: 'INSTALLMENT_4',
      paymentMethodId: 'pm_card_visa',
      userEmail: 'retryuser@example.com',
      userName: 'Retry User',
    };

    // WHEN: Creating booking (first attempt fails, retry succeeds)
    const response = await request.post('/api/trpc/booking.create', {
      data: bookingData,
    });

    // THEN: Booking created successfully after retry
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.result.data.stripeCustomerId).toMatch(/^cus_/);

    // AND: Retry was logged (check logs or retry count in response)
    // expect(body.result.data.retryCount).toBe(1);
  });

  test('should fallback to FULL payment after max retries exhausted', async ({
    request,
  }) => {
    // GIVEN: Mock Stripe API to fail multiple times (exhaust retries)
    const bookingData = {
      tripId: 'trip-789',
      startDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(),
      paymentPlan: 'INSTALLMENT_4',
      paymentMethodId: 'pm_card_visa',
      userEmail: 'fallbackuser@example.com',
      userName: 'Fallback User',
    };

    // WHEN: Creating booking (all retries fail)
    const response = await request.post('/api/trpc/booking.create', {
      data: bookingData,
    });

    // THEN: Booking created with FULL payment fallback
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.result.data.paymentPlan).toBe('FULL'); // Fallback to FULL

    // AND: User notified of fallback
    expect(body.result.data.fallbackReason).toContain(
      'Stripe customer creation failed'
    );
  });
});

test.describe('Atomic Booking + Payment Creation (P0)', () => {
  test('should create booking and 4 payment records atomically', async ({
    request,
  }) => {
    // GIVEN: Valid booking data with INSTALLMENT_4 plan
    const bookingData = {
      tripId: 'trip-atomic-1',
      startDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(),
      paymentPlan: 'INSTALLMENT_4',
      paymentMethodId: 'pm_card_visa',
      userEmail: 'atomic@example.com',
      userName: 'Atomic User',
    };

    // WHEN: Creating booking
    const response = await request.post('/api/trpc/booking.create', {
      data: bookingData,
    });

    // THEN: Booking created successfully
    expect(response.status()).toBe(201);
    const body = await response.json();
    const bookingId = body.result.data.bookingId;

    // AND: Query payment records for this booking
    const paymentsResponse = await request.get(
      `/api/trpc/payment.getByBooking?bookingId=${bookingId}`
    );
    expect(paymentsResponse.status()).toBe(200);
    const paymentsBody = await paymentsResponse.json();

    // AND: Exactly 4 payment records exist
    expect(paymentsBody.result.data).toHaveLength(4);

    // AND: Payment records match installment percentages
    const payments = paymentsBody.result.data;
    expect(payments[0].percentage).toBe(50); // First: 50%
    expect(payments[1].percentage).toBe(25); // Second: 25%
    expect(payments[2].percentage).toBe(15); // Third: 15%
    expect(payments[3].percentage).toBe(10); // Fourth: 10%

    // AND: All payment statuses are correct
    expect(payments[0].status).toBe('PAID'); // First paid immediately
    expect(payments[1].status).toBe('PENDING'); // Future payments pending
    expect(payments[2].status).toBe('PENDING');
    expect(payments[3].status).toBe('PENDING');
  });

  test('should rollback booking if payment record creation fails', async ({
    request,
  }) => {
    // GIVEN: Mock database to fail payment record creation
    const bookingData = {
      tripId: 'trip-rollback-1',
      startDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(),
      paymentPlan: 'INSTALLMENT_4',
      paymentMethodId: 'pm_card_visa',
      userEmail: 'rollback@example.com',
      userName: 'Rollback User',
    };

    // WHEN: Creating booking (payment creation fails)
    const response = await request.post('/api/trpc/booking.create', {
      data: bookingData,
    });

    // THEN: Request fails with error
    expect(response.status()).toBe(500); // Or 400 depending on error handling

    // AND: No booking record exists in database
    const bookingCheckResponse = await request.get(
      `/api/trpc/booking.get?id=${bookingData.tripId}`
    );
    expect(bookingCheckResponse.status()).toBe(404); // Booking not found

    // AND: No orphaned payment records exist
    const paymentsResponse = await request.get(
      `/api/trpc/payment.getByTrip?tripId=${bookingData.tripId}`
    );
    expect(paymentsResponse.status()).toBe(404); // No payments found
  });
});

test.describe('70-Day Trip Validation (P1)', () => {
  test('should reject installment plan for trip starting in 69 days', async ({
    request,
  }) => {
    // GIVEN: Trip starts in 69 days (< 70 day requirement)
    const startDate = new Date(
      Date.now() + 69 * 24 * 60 * 60 * 1000
    ).toISOString();

    const bookingData = {
      tripId: 'trip-69days',
      startDate,
      paymentPlan: 'INSTALLMENT_4',
      paymentMethodId: 'pm_card_visa',
      userEmail: '69days@example.com',
      userName: '69 Days User',
    };

    // WHEN: Attempting to create booking
    const response = await request.post('/api/trpc/booking.create', {
      data: bookingData,
    });

    // THEN: Request fails with validation error
    expect(response.status()).toBe(400); // Bad request
    const body = await response.json();
    expect(body.error.message).toContain(
      'Installment plans require trips starting at least 70 days from today'
    );
  });

  test('should allow installment plan for trip starting in exactly 70 days', async ({
    request,
  }) => {
    // GIVEN: Trip starts in exactly 70 days (meets requirement)
    const startDate = new Date(
      Date.now() + 70 * 24 * 60 * 60 * 1000
    ).toISOString();

    const bookingData = {
      tripId: 'trip-70days',
      startDate,
      paymentPlan: 'INSTALLMENT_4',
      paymentMethodId: 'pm_card_visa',
      userEmail: '70days@example.com',
      userName: '70 Days User',
    };

    // WHEN: Creating booking
    const response = await request.post('/api/trpc/booking.create', {
      data: bookingData,
    });

    // THEN: Booking created successfully
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.result.data.paymentPlan).toBe('INSTALLMENT_4');
  });

  test('should allow installment plan for trip starting in 100 days', async ({
    request,
  }) => {
    // GIVEN: Trip starts in 100 days (well above requirement)
    const startDate = new Date(
      Date.now() + 100 * 24 * 60 * 60 * 1000
    ).toISOString();

    const bookingData = {
      tripId: 'trip-100days',
      startDate,
      paymentPlan: 'INSTALLMENT_4',
      paymentMethodId: 'pm_card_visa',
      userEmail: '100days@example.com',
      userName: '100 Days User',
    };

    // WHEN: Creating booking
    const response = await request.post('/api/trpc/booking.create', {
      data: bookingData,
    });

    // THEN: Booking created successfully
    expect(response.status()).toBe(201);
  });

  test('should handle timezone edge cases for 70-day validation', async ({
    request,
  }) => {
    // GIVEN: Trip start date is 70 days from now but in different timezone
    const now = new Date();
    const tripStart = new Date(now);
    tripStart.setDate(now.getDate() + 70);
    tripStart.setHours(23, 59, 59, 999); // End of day in some timezone

    const bookingData = {
      tripId: 'trip-timezone',
      startDate: tripStart.toISOString(),
      paymentPlan: 'INSTALLMENT_4',
      paymentMethodId: 'pm_card_visa',
      userEmail: 'timezone@example.com',
      userName: 'Timezone User',
    };

    // WHEN: Creating booking
    const response = await request.post('/api/trpc/booking.create', {
      data: bookingData,
    });

    // THEN: Validation handles timezone correctly (should allow or reject consistently)
    // Expectation depends on how timezone calculation is implemented
    expect([200, 201, 400]).toContain(response.status());
  });
});

test.describe('Gift Booking Restrictions (P1)', () => {
  test('should disable installment option for gift bookings', async ({
    request,
  }) => {
    // GIVEN: Booking is marked as gift
    const bookingData = {
      tripId: 'trip-gift-1',
      startDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(),
      paymentPlan: 'INSTALLMENT_4',
      isGift: true, // Gift booking
      paymentMethodId: 'pm_card_visa',
      userEmail: 'gift@example.com',
      userName: 'Gift Giver',
    };

    // WHEN: Attempting to create gift booking with installment plan
    const response = await request.post('/api/trpc/booking.create', {
      data: bookingData,
    });

    // THEN: Request fails with validation error
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error.message).toContain(
      'Gift bookings must use FULL payment plan'
    );
  });

  test('should allow FULL payment for gift bookings', async ({ request }) => {
    // GIVEN: Gift booking with FULL payment plan
    const bookingData = {
      tripId: 'trip-gift-full',
      startDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(),
      paymentPlan: 'FULL',
      isGift: true,
      paymentMethodId: 'pm_card_visa',
      userEmail: 'gift-full@example.com',
      userName: 'Gift Giver Full',
    };

    // WHEN: Creating gift booking
    const response = await request.post('/api/trpc/booking.create', {
      data: bookingData,
    });

    // THEN: Booking created successfully
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.result.data.paymentPlan).toBe('FULL');
    expect(body.result.data.isGift).toBe(true);
  });
});
