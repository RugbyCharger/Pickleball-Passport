import { db } from '@/lib/db';
import crypto from 'crypto';

const TOKEN_EXPIRY_DAYS = 90;

// Use environment variable for HMAC secret
const EMAIL_TOKEN_SECRET =
  process.env.EMAIL_TOKEN_SECRET || 'CHANGE_ME_IN_PRODUCTION';

if (EMAIL_TOKEN_SECRET === 'CHANGE_ME_IN_PRODUCTION') {
  console.warn(
    'WARNING: Using default EMAIL_TOKEN_SECRET. Set EMAIL_TOKEN_SECRET env var in production.'
  );
}

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
  await db.user.update({
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
  const user = await db.user.findFirst({
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
