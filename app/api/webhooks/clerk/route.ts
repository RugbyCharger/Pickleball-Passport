import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { authLogger } from '@/lib/logger';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const body = await req.text();

  // Create a new Svix instance with your webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    authLogger.error('CLERK_WEBHOOK_SECRET is not set');
    return new NextResponse('Error: CLERK_WEBHOOK_SECRET not configured', {
      status: 500,
    });
  }

  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    authLogger.error({ err }, 'Error verifying Clerk webhook signature');
    return new NextResponse('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    try {
      // Create user in database
      await prisma.user.create({
        data: {
          id, // Use Clerk user ID as primary key
          email: email_addresses[0]?.email_address || '',
          role: 'GUEST', // Default role, will be updated in onboarding
        },
      });

      authLogger.info({ userId: id }, 'User created via Clerk webhook');

      // TODO: Send welcome email (E2-S2)
      // This will be implemented in Sprint 3 when SendGrid is set up (E11-S1)
      // Email should include:
      // - Welcome message
      // - Link to complete onboarding
      // - Brief overview of Pickleball Passport
      // - Contact information for support

      return new NextResponse('User created', { status: 200 });
    } catch (error) {
      authLogger.error({ err: error, userId: id }, 'Failed to create user in database from Clerk webhook');
      return new NextResponse('Error creating user', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses } = evt.data;

    try {
      // Update user in database
      await prisma.user.update({
        where: { id },
        data: {
          email: email_addresses[0]?.email_address || '',
        },
      });

      authLogger.info({ userId: id }, 'User updated via Clerk webhook');
      return new NextResponse('User updated', { status: 200 });
    } catch (error) {
      authLogger.error({ err: error, userId: id }, 'Failed to update user in database from Clerk webhook');
      return new NextResponse('Error updating user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      // Delete user from database (cascades to related records)
      await prisma.user.delete({
        where: { id },
      });

      authLogger.info({ userId: id }, 'User deleted via Clerk webhook');
      return new NextResponse('User deleted', { status: 200 });
    } catch (error) {
      authLogger.error({ err: error, userId: id }, 'Failed to delete user from database from Clerk webhook');
      return new NextResponse('Error deleting user', { status: 500 });
    }
  }

  return new NextResponse('Webhook received', { status: 200 });
}
