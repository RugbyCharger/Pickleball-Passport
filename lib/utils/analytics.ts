/**
 * Client-side Analytics Tracking Utility (E13-S1)
 *
 * Provides methods for tracking user events and sessions on the client side.
 * Uses browser sessionStorage for session ID persistence.
 */

// ============================================================================
// TYPES
// ============================================================================

export type AnalyticsEventType =
  | 'PAGE_VIEW'
  | 'BUTTON_CLICK'
  | 'FUNNEL_STEP'
  | 'FORM_SUBMIT'
  | 'CONVERSION'
  | 'SEARCH'
  | 'FILTER'
  | 'ERROR';

export interface TrackEventOptions {
  eventType: AnalyticsEventType;
  properties?: Record<string, unknown>;
  pageUrl?: string;
}

export interface SessionData {
  sessionId: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  screenResolution?: string;
  landingPage?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// ============================================================================
// SESSION ID MANAGEMENT
// ============================================================================

const SESSION_ID_KEY = 'pbp_session_id';

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create session ID from sessionStorage
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    return generateSessionId();
  }

  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

// ============================================================================
// DEVICE DETECTION
// ============================================================================

/**
 * Detect device type from user agent
 */
export function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown';

  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|tablet/.test(ua)) {
    if (/tablet|ipad/.test(ua)) return 'tablet';
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Detect browser from user agent
 */
export function getBrowser(): string {
  if (typeof window === 'undefined') return 'unknown';

  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('chrome') && !ua.includes('edg')) return 'chrome';
  if (ua.includes('firefox')) return 'firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'safari';
  if (ua.includes('edg')) return 'edge';
  if (ua.includes('opera') || ua.includes('opr')) return 'opera';
  return 'other';
}

/**
 * Detect OS from user agent
 */
export function getOS(): string {
  if (typeof window === 'undefined') return 'unknown';

  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('win')) return 'windows';
  if (ua.includes('mac')) return 'macos';
  if (ua.includes('linux')) return 'linux';
  if (ua.includes('android')) return 'android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
  return 'other';
}

/**
 * Get screen resolution
 */
export function getScreenResolution(): string {
  if (typeof window === 'undefined') return 'unknown';
  return `${window.screen.width}x${window.screen.height}`;
}

// ============================================================================
// UTM PARAMETER EXTRACTION
// ============================================================================

/**
 * Extract UTM parameters from URL
 */
export function getUTMParams(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
  };
}

// ============================================================================
// ANALYTICS TRACKER CLASS
// ============================================================================

/**
 * Analytics tracker for client-side event tracking
 *
 * Usage:
 * ```
 * import { analytics } from '@/lib/utils/analytics';
 *
 * // Initialize session on app load
 * analytics.initSession();
 *
 * // Track page views
 * analytics.trackPageView('/packages/pure-play');
 *
 * // Track button clicks
 * analytics.trackClick('book-now-button', { location: 'hero-section' });
 *
 * // Track funnel steps
 * analytics.trackFunnelStep('CONFIGURATOR', { packageId: 'xxx' });
 *
 * // Track conversions
 * analytics.trackConversion('BOOKING_COMPLETED', { bookingId: 'xxx', value: 15000 });
 * ```
 */
class AnalyticsTracker {
  private initialized = false;
  private apiEndpoint = '/api/trpc';

  /**
   * Initialize the analytics session
   * Call this once when the app loads
   */
  async initSession(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (this.initialized) return;

    const sessionData: SessionData = {
      sessionId: getSessionId(),
      deviceType: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      screenResolution: getScreenResolution(),
      landingPage: window.location.pathname,
      referrer: document.referrer || undefined,
      ...getUTMParams(),
    };

    try {
      await this.callAPI('analytics.sessions.upsert', sessionData as unknown as Record<string, unknown>);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize analytics session:', error);
    }
  }

  /**
   * Track a generic event
   */
  async track(options: TrackEventOptions): Promise<void> {
    if (typeof window === 'undefined') return;

    const eventData = {
      eventType: options.eventType,
      sessionId: getSessionId(),
      properties: options.properties || {},
      pageUrl: options.pageUrl || window.location.href,
      userAgent: navigator.userAgent,
      ...getUTMParams(),
    };

    try {
      await this.callAPI('analytics.events.track', eventData);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Track a page view
   */
  async trackPageView(path?: string): Promise<void> {
    await this.track({
      eventType: 'PAGE_VIEW',
      properties: {
        path: path || window.location.pathname,
        referrer: document.referrer || undefined,
        title: document.title,
      },
    });
  }

  /**
   * Track a button/element click
   */
  async trackClick(elementId: string, properties?: Record<string, unknown>): Promise<void> {
    await this.track({
      eventType: 'BUTTON_CLICK',
      properties: {
        elementId,
        ...properties,
      },
    });
  }

  /**
   * Track a booking funnel step
   */
  async trackFunnelStep(
    step: string,
    properties?: Record<string, unknown>
  ): Promise<void> {
    await this.track({
      eventType: 'FUNNEL_STEP',
      properties: {
        step,
        ...properties,
      },
    });
  }

  /**
   * Track a form submission
   */
  async trackFormSubmit(formId: string, properties?: Record<string, unknown>): Promise<void> {
    await this.track({
      eventType: 'FORM_SUBMIT',
      properties: {
        formId,
        ...properties,
      },
    });
  }

  /**
   * Track a conversion event
   */
  async trackConversion(
    conversionType: string,
    properties?: Record<string, unknown>
  ): Promise<void> {
    await this.track({
      eventType: 'CONVERSION',
      properties: {
        type: conversionType,
        ...properties,
      },
    });
  }

  /**
   * Track a search event
   */
  async trackSearch(query: string, properties?: Record<string, unknown>): Promise<void> {
    await this.track({
      eventType: 'SEARCH',
      properties: {
        query,
        ...properties,
      },
    });
  }

  /**
   * Track a filter event
   */
  async trackFilter(filters: Record<string, unknown>): Promise<void> {
    await this.track({
      eventType: 'FILTER',
      properties: {
        filters,
      },
    });
  }

  /**
   * Track an error event
   */
  async trackError(
    errorMessage: string,
    properties?: Record<string, unknown>
  ): Promise<void> {
    await this.track({
      eventType: 'ERROR',
      properties: {
        errorMessage,
        ...properties,
      },
    });
  }

  /**
   * Call the tRPC API endpoint
   */
  private async callAPI(procedure: string, input: Record<string, unknown>): Promise<void> {
    // Use fetch directly to avoid circular dependencies with tRPC client
    const response = await fetch(`${this.apiEndpoint}/${procedure}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Analytics API call failed: ${response.statusText}`);
    }
  }
}

// Export singleton instance
export const analytics = new AnalyticsTracker();

// Export individual tracking functions for convenience
export const trackPageView = analytics.trackPageView.bind(analytics);
export const trackClick = analytics.trackClick.bind(analytics);
export const trackFunnelStep = analytics.trackFunnelStep.bind(analytics);
export const trackFormSubmit = analytics.trackFormSubmit.bind(analytics);
export const trackConversion = analytics.trackConversion.bind(analytics);
export const trackSearch = analytics.trackSearch.bind(analytics);
export const trackFilter = analytics.trackFilter.bind(analytics);
export const trackError = analytics.trackError.bind(analytics);
export const initSession = analytics.initSession.bind(analytics);
