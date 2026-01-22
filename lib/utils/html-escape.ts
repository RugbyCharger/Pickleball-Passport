/**
 * HTML Escape Utility
 *
 * Prevents XSS attacks by escaping special HTML characters in user-provided content.
 * Essential for any user input that will be rendered in HTML (emails, web pages, etc.)
 */

/**
 * Escape special HTML characters to prevent XSS
 *
 * @param str - The string to escape
 * @returns The escaped string safe for HTML insertion
 *
 * @example
 * escapeHtml('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 */
export function escapeHtml(str: string | null | undefined): string {
  if (str === null || str === undefined) {
    return '';
  }

  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escape for use in HTML attributes (more strict)
 * Use this when placing content inside HTML attributes like href, src, etc.
 *
 * @param str - The string to escape
 * @returns The escaped string safe for HTML attribute insertion
 */
export function escapeHtmlAttr(str: string | null | undefined): string {
  if (str === null || str === undefined) {
    return '';
  }

  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#96;')
    .replace(/=/g, '&#61;');
}
