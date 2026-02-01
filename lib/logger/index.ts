/**
 * Structured Logging Module
 * 
 * Uses Pino for high-performance, JSON-based structured logging.
 * Replaces console.log/error/warn statements throughout the codebase.
 * 
 * Features:
 * - Environment-aware log levels
 * - Structured JSON output for production (easy to parse)
 * - Pretty printing for development
 * - Context-aware child loggers for different modules
 * - Automatic redaction of sensitive fields
 */

import pino from 'pino'

/**
 * Log levels:
 * - fatal: System is unusable
 * - error: Error conditions
 * - warn: Warning conditions
 * - info: Normal but significant events
 * - debug: Debug-level messages
 * - trace: Very detailed debugging
 */
const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

/**
 * Fields that should be redacted from logs
 */
const redactPaths = [
  'password',
  'token',
  'secret',
  'apiKey',
  'stripeSecretKey',
  'clientSecret',
  'accessToken',
  'refreshToken',
  '*.password',
  '*.token',
  '*.secret',
  '*.apiKey',
  // PII fields - prevent accidental logging of user data
  'email',
  'phone',
  'phoneNumber',
  'accountNumber',
  'routingNumber',
  'ssn',
  'bankAccount',
  'cardNumber',
  'cvv',
  '*.email',
  '*.phone',
  '*.phoneNumber',
  '*.accountNumber',
  '*.routingNumber',
  '*.ssn',
  '*.bankAccount',
  '*.cardNumber',
  'user.email',
  'guest.email',
  'customer.email',
  'recipient.email',
]

/**
 * Base logger configuration
 */
const baseConfig: pino.LoggerOptions = {
  level,
  redact: redactPaths,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() }
    },
  },
  base: {
    env: process.env.NODE_ENV || 'development',
    service: 'pickleball-passport',
  },
}

/**
 * Development transport configuration (pretty printing)
 * Only used in development for human-readable output
 */
const devTransport: pino.TransportSingleOptions = {
  target: 'pino/file',
  options: { destination: 1 }, // stdout
}

/**
 * Create the main logger instance
 */
const logger = pino(baseConfig)

/**
 * Create a child logger with additional context
 * 
 * @param name - Module or component name
 * @param context - Additional context to include in all logs
 * @returns Child logger instance
 * 
 * @example
 * const stripeLogger = createLogger('stripe', { customerId: 'cus_123' })
 * stripeLogger.info({ amount: 5000 }, 'Processing payment')
 */
export function createLogger(name: string, context?: Record<string, unknown>) {
  return logger.child({ module: name, ...context })
}

// Pre-configured loggers for common modules
export const stripeLogger = createLogger('stripe')
export const emailLogger = createLogger('email')
export const bookingLogger = createLogger('booking')
export const authLogger = createLogger('auth')
export const dbLogger = createLogger('database')
export const apiLogger = createLogger('api')
export const webhookLogger = createLogger('webhook')
export const paymentLogger = createLogger('payment')
export const giftLogger = createLogger('gift')
export const partnerLogger = createLogger('partner')
export const storageLogger = createLogger('storage')
export const cronLogger = createLogger('cron')
export const muxLogger = createLogger('mux')
export const pdfLogger = createLogger('pdf')
export const rateLimitLogger = createLogger('rateLimit')
export const notificationLogger = createLogger('notification')
export const whatsappLogger = createLogger('whatsapp')

/**
 * Log an error with stack trace and additional context
 * 
 * @param logger - Logger instance
 * @param error - Error object
 * @param message - Log message
 * @param context - Additional context
 */
export function logError(
  log: pino.Logger,
  error: unknown,
  message: string,
  context?: Record<string, unknown>
) {
  if (error instanceof Error) {
    log.error(
      {
        err: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        ...context,
      },
      message
    )
  } else {
    log.error({ err: error, ...context }, message)
  }
}

/**
 * Log a Stripe error with structured metadata
 */
export function logStripeError(
  error: unknown,
  message: string,
  context?: Record<string, unknown>
) {
  const stripeError = error as {
    type?: string
    code?: string
    decline_code?: string
    param?: string
    message?: string
  }

  stripeLogger.error(
    {
      stripeErrorType: stripeError?.type,
      stripeErrorCode: stripeError?.code,
      stripeDeclineCode: stripeError?.decline_code,
      stripeParam: stripeError?.param,
      stripeMessage: stripeError?.message,
      ...context,
    },
    message
  )
}

/**
 * Log a database operation
 */
export function logDbOperation(
  operation: 'create' | 'read' | 'update' | 'delete' | 'transaction',
  model: string,
  context?: Record<string, unknown>
) {
  dbLogger.debug({ operation, model, ...context }, `Database ${operation} on ${model}`)
}

/**
 * Log an API request
 */
export function logApiRequest(
  method: string,
  path: string,
  context?: Record<string, unknown>
) {
  apiLogger.info({ method, path, ...context }, `${method} ${path}`)
}

/**
 * Log a payment event
 */
export function logPaymentEvent(
  event: string,
  bookingId?: string,
  amount?: number,
  context?: Record<string, unknown>
) {
  paymentLogger.info(
    {
      event,
      bookingId,
      amountCents: amount,
      amountDollars: amount ? (amount / 100).toFixed(2) : undefined,
      ...context,
    },
    event
  )
}

// Export the base logger as default
export default logger
