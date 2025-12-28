/**
 * CSV Export Utility
 * Handles CSV generation and download functionality
 */

export interface CSVData {
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Convert CSV data to CSV string
 */
export function generateCSV(data: CSVData): string {
  const { headers, rows } = data;

  // Escape and quote CSV values
  const escapeCSVValue = (value: string | number): string => {
    const stringValue = String(value);
    // If value contains comma, newline, or double quote, wrap in quotes and escape quotes
    if (
      stringValue.includes(',') ||
      stringValue.includes('\n') ||
      stringValue.includes('"')
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Build CSV string
  const headerRow = headers.map(escapeCSVValue).join(',');
  const dataRows = rows.map((row) => row.map(escapeCSVValue).join(','));

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download CSV file to user's browser
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Create blob with CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up URL object
  URL.revokeObjectURL(url);
}

/**
 * Generate and download CSV in one step
 */
export function exportToCSV(data: CSVData, filename: string): void {
  const csvContent = generateCSV(data);
  downloadCSV(csvContent, filename);
}

/**
 * Format current date for filename
 */
export function getDateForFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate CSV filename with date
 */
export function generateFilename(reportType: string): string {
  const date = getDateForFilename();
  return `pickleball-passport-${reportType}-${date}.csv`;
}
