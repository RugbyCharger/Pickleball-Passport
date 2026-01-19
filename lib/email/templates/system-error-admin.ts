/**
 * System Error Admin Alert
 * Story 11-8
 *
 * Sent to admin when critical system errors occur
 * Technical format with full error details for debugging
 */

import { baseEmailTemplate, generatePlainText } from './base';

export interface SystemErrorAdminData {
  errorType: 'payment' | 'email' | 'sms' | 'database' | 'api' | 'other';
  severity: 'critical' | 'high' | 'medium' | 'low';
  errorMessage: string;
  stackTrace?: string;
  context?: Record<string, unknown>;
  timestamp: string; // ISO date
  environment: string; // production, staging, development
  userId?: string;
  bookingId?: string;
}

/**
 * Format timestamp for display
 */
function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
}

/**
 * Get severity color
 */
function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return '#dc2626'; // Red
    case 'high':
      return '#ea580c'; // Orange
    case 'medium':
      return '#ca8a04'; // Yellow
    case 'low':
      return '#059669'; // Green
    default:
      return '#6b7280'; // Gray
  }
}

/**
 * Get error type icon
 */
function getErrorTypeIcon(errorType: string): string {
  switch (errorType) {
    case 'payment':
      return '💳';
    case 'email':
      return '📧';
    case 'sms':
      return '📱';
    case 'database':
      return '🗄️';
    case 'api':
      return '🔌';
    default:
      return '⚠️';
  }
}

export function generateSystemErrorAdminEmail(
  data: SystemErrorAdminData
): {
  html: string;
  text: string;
  subject: string;
} {
  const severityColor = getSeverityColor(data.severity);
  const errorIcon = getErrorTypeIcon(data.errorType);

  const content = `
    <h1>🚨 System Error Alert</h1>

    <p>
      A ${data.severity} severity error has been detected in the ${data.environment} environment.
      Immediate attention may be required.
    </p>

    <div style="margin: 32px 0; padding: 24px; background-color: ${data.severity === 'critical' ? '#fee2e2' : '#fef3c7'}; border-radius: 12px; border-left: 4px solid ${severityColor};">
      <p style="margin: 0 0 8px 0; color: ${data.severity === 'critical' ? '#991b1b' : '#92400e'}; font-weight: 600; font-size: 16px;">
        ${errorIcon} ${data.severity.toUpperCase()} - ${data.errorType.toUpperCase()} ERROR
      </p>
      <p style="margin: 0; color: ${data.severity === 'critical' ? '#991b1b' : '#92400e'}; font-size: 14px;">
        Environment: ${data.environment}
      </p>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">⏰ Error Details</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 30%;">Timestamp:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; font-family: monospace;">${formatTimestamp(data.timestamp)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Error Type:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-transform: uppercase;">${data.errorType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Severity:</td>
          <td style="padding: 8px 0; color: ${severityColor}; font-weight: bold; text-transform: uppercase;">${data.severity}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Environment:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-transform: uppercase;">${data.environment}</td>
        </tr>
        ${data.userId ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">User ID:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; font-family: monospace;">${data.userId}</td>
        </tr>
        ` : ''}
        ${data.bookingId ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Booking ID:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; font-family: monospace;">${data.bookingId}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">💬 Error Message</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #fee2e2; border-radius: 8px; border-left: 4px solid #dc2626;">
      <pre style="margin: 0; color: #991b1b; font-size: 14px; font-family: 'Courier New', monospace; white-space: pre-wrap; word-break: break-word;">${data.errorMessage}</pre>
    </div>

    ${data.stackTrace ? `
    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">📚 Stack Trace</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px; overflow-x: auto;">
      <pre style="margin: 0; color: #374151; font-size: 12px; font-family: 'Courier New', monospace; white-space: pre; line-height: 1.4;">${data.stackTrace}</pre>
    </div>
    ` : ''}

    ${data.context && Object.keys(data.context).length > 0 ? `
    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">🔍 Additional Context</h2>

    <div style="margin: 16px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <pre style="margin: 0; color: #374151; font-size: 13px; font-family: 'Courier New', monospace; white-space: pre-wrap; word-break: break-word;">${JSON.stringify(data.context, null, 2)}</pre>
    </div>
    ` : ''}

    <h2 style="color: #111827; font-size: 20px; margin: 32px 0 16px 0;">✅ Recommended Actions</h2>

    <ol style="color: #374151; font-size: 14px; line-height: 1.6;">
      ${data.severity === 'critical' ? `
      <li><strong>URGENT:</strong> Check system availability and user impact immediately</li>
      <li><strong>Incident Response:</strong> Escalate to on-call engineer if needed</li>
      ` : ''}
      <li><strong>Investigate Root Cause:</strong> Review logs and error context in monitoring dashboard</li>
      <li><strong>Check Service Status:</strong> Verify ${data.errorType} service is operational</li>
      ${data.errorType === 'payment' ? `
      <li><strong>Stripe Dashboard:</strong> Check Stripe dashboard for payment service status</li>
      ` : ''}
      ${data.errorType === 'email' ? `
      <li><strong>SendGrid Status:</strong> Verify SendGrid API status and email quota</li>
      ` : ''}
      ${data.errorType === 'sms' ? `
      <li><strong>Twilio Status:</strong> Check Twilio API status and SMS quota</li>
      ` : ''}
      ${data.errorType === 'database' ? `
      <li><strong>Database Health:</strong> Check database connections, queries, and performance</li>
      ` : ''}
      <li><strong>User Impact:</strong> Determine if users are experiencing issues${data.userId ? ' (User ID: ' + data.userId + ')' : ''}</li>
      <li><strong>Error Tracking:</strong> Review similar errors in error tracking system (Sentry, etc.)</li>
      <li><strong>Monitor Resolution:</strong> Track error rate to confirm fix is effective</li>
      <li><strong>Post-Mortem:</strong> Document issue and preventive measures if critical</li>
    </ol>

    <div style="margin: 32px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600;">
        💡 Severity Guide
      </p>
      <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.6;">
        <li><strong>Critical:</strong> System down or major functionality unavailable</li>
        <li><strong>High:</strong> Important feature broken, affecting multiple users</li>
        <li><strong>Medium:</strong> Non-critical feature issue, limited user impact</li>
        <li><strong>Low:</strong> Minor issue, minimal or no user impact</li>
      </ul>
    </div>

    <p>
      <strong>Pickleball Passport Admin System</strong> 🏓
    </p>
  `;

  const html = baseEmailTemplate({
    title: 'System Error Alert',
    content,
    preheader: `${data.severity.toUpperCase()} ${data.errorType} error in ${data.environment}`,
    footerText: 'This is an automated admin alert from Pickleball Passport.',
  });

  const text = generatePlainText(content);

  return {
    html,
    text,
    subject: `🚨 [${data.severity.toUpperCase()}] ${data.errorType.toUpperCase()} Error - ${data.environment}`,
  };
}
