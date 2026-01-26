import { prisma } from '@/lib/db';
import crypto from 'crypto';

const TOKEN_EXPIRY_DAYS = 90;

/**
 * Get the email token secret, with strict validation in production.
 * SECURITY: In production, missing secret throws an error to prevent
 * token forgery attacks. In development, generates a random secret
 * per process (tokens won't persist across restarts).
 */
function getEmailTokenSecret(): string {
  const secret = process.env.EMAIL_TOKEN_SECRET;

  if (secret && secret.length >= 32) {
    return secret;
  }

  // In production, require a properly configured secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SECURITY ERROR: EMAIL_TOKEN_SECRET must be set in production. ' +
        'Generate a secure 32+ character secret and add it to your environment variables.'
    );
  }

  // In development, generate a random secret and warn
  const devSecret = crypto.randomBytes(32).toString('hex');
  console.warn(
    '[DEV ONLY] EMAIL_TOKEN_SECRET not configured. Using random secret. ' +
      'Email tokens will not persist across server restarts.'
  );
  return devSecret;
}

// Initialize secret at module load (fails fast in production if misconfigured)
const EMAIL_TOKEN_SECRET = getEmailTokenSecret();

/**
 * Generate a secure email token for preference management
 */
export async function generateEmailToken(userId: string): Promise<string> {
  // Generate random 32-byte token
  const token = crypto.randomBytes(32).toString('hex');

  // Hash token with HMAC-SHA256
  const hash = crypto
    .createHmac('sha256', EMAIL_TOKEN_SECRET)
    .update(token)
    .digest('hex');

  // Set expiry to 90 days from now
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + TOKEN_EXPIRY_DAYS);

  // Store hash in database
  await prisma.user.update({
    where: { id: userId },
    data: {
      preferenceEmailToken: hash,
      preferenceEmailTokenExpiry: expiry,
    },
  });

  // Return plain token (not stored in DB)
  return token;
}

/**
 * Verify email token and return userId if valid
 */
export async function verifyEmailToken(token: string): Promise<string | null> {
  // Hash the provided token
  const hash = crypto
    .createHmac('sha256', EMAIL_TOKEN_SECRET)
    .update(token)
    .digest('hex');

  // Find user with matching hash and non-expired token
  const user = await prisma.user.findFirst({
    where: {
      preferenceEmailToken: {
        not: null,
      },
      preferenceEmailTokenExpiry: {
        gte: new Date(),
      },
    },
    select: {
      id: true,
      preferenceEmailToken: true,
    },
  });

  if (!user || !user.preferenceEmailToken) {
    return null;
  }

  // Constant-time comparison to prevent timing attacks
  try {
    const isValid = crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(user.preferenceEmailToken)
    );
    return isValid ? user.id : null;
  } catch (error) {
    // timingSafeEqual throws if buffer lengths don't match
    return null;
  }
}
