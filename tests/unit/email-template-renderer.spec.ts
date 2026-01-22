import { test, expect } from '@playwright/test';
import {
  renderTemplateContent,
  generatePlainText,
  extractTemplateVariables,
  validateTemplateVariables,
  getSampleDataForCategory,
} from '../../lib/email/template-renderer';

/**
 * Unit Tests: Email Template Renderer
 * Story 11-11: Email Template Management
 *
 * Tests the core template rendering functionality:
 * - Handlebars variable substitution
 * - Helper functions (currency, date, etc.)
 * - Plain text generation
 * - Variable extraction
 * - Sample data retrieval
 *
 * Priority: P1 (High) - Run on every commit
 */

test.describe('Email Template Renderer - Variable Substitution', () => {
  test('should substitute simple variables', async () => {
    // GIVEN: Template with simple variables
    const template = {
      htmlContent: '<p>Hello {{name}}, welcome to {{destination}}!</p>',
      textContent: 'Hello {{name}}, welcome to {{destination}}!',
      subjectLine: 'Welcome {{name}}!',
    };
    const variables = { name: 'John', destination: 'Thailand' };

    // WHEN: Rendering the template
    const result = renderTemplateContent(template, variables);

    // THEN: Variables are substituted correctly
    expect(result.html).toContain('Hello John, welcome to Thailand!');
    expect(result.text).toContain('Hello John, welcome to Thailand!');
    expect(result.subject).toBe('Welcome John!');
  });

  test('should handle missing variables gracefully', async () => {
    // GIVEN: Template with a variable that is not provided
    const template = {
      htmlContent: '<p>Hello {{name}}, your code is {{code}}.</p>',
      textContent: 'Hello {{name}}, your code is {{code}}.',
      subjectLine: 'Hello {{name}}',
    };
    const variables = { name: 'John' }; // 'code' is missing

    // WHEN: Rendering the template
    const result = renderTemplateContent(template, variables);

    // THEN: Missing variable renders as empty string
    expect(result.html).toContain('Hello John, your code is .');
    expect(result.subject).toBe('Hello John');
  });

  test('should handle nested object access', async () => {
    // GIVEN: Template with nested variable access
    const template = {
      htmlContent: '<p>Booking: {{booking.reference}}</p>',
      textContent: 'Booking: {{booking.reference}}',
      subjectLine: 'Booking {{booking.reference}}',
    };
    const variables = { booking: { reference: 'PBP-12345' } };

    // WHEN: Rendering the template
    const result = renderTemplateContent(template, variables);

    // THEN: Nested variable is substituted
    expect(result.html).toContain('Booking: PBP-12345');
    expect(result.subject).toBe('Booking PBP-12345');
  });
});

test.describe('Email Template Renderer - Handlebars Helpers', () => {
  test('should format currency with currency helper', async () => {
    // GIVEN: Template using currency helper
    const template = {
      htmlContent: '<p>Total: {{currency amount}}</p>',
      textContent: 'Total: {{currency amount}}',
      subjectLine: 'Payment: {{currency amount}}',
    };
    const variables = { amount: 15000 }; // $15,000

    // WHEN: Rendering the template
    const result = renderTemplateContent(template, variables);

    // THEN: Currency is formatted correctly
    expect(result.html).toContain('Total: $15,000.00');
    expect(result.subject).toBe('Payment: $15,000.00');
  });

  test('should format date with date helper', async () => {
    // GIVEN: Template using date helper
    const template = {
      htmlContent: '<p>Trip date: {{date tripDate}}</p>',
      textContent: 'Trip date: {{date tripDate}}',
      subjectLine: 'Trip on {{date tripDate}}',
    };
    const variables = { tripDate: '2026-03-15T00:00:00Z' };

    // WHEN: Rendering the template
    const result = renderTemplateContent(template, variables);

    // THEN: Date is formatted correctly (Month Day, Year format)
    expect(result.html).toContain('March 15, 2026');
  });

  test('should convert to uppercase with uppercase helper', async () => {
    // GIVEN: Template using uppercase helper
    const template = {
      htmlContent: '<p>Status: {{uppercase status}}</p>',
      textContent: 'Status: {{uppercase status}}',
      subjectLine: '{{uppercase status}}',
    };
    const variables = { status: 'confirmed' };

    // WHEN: Rendering the template
    const result = renderTemplateContent(template, variables);

    // THEN: Text is converted to uppercase
    expect(result.html).toContain('Status: CONFIRMED');
    expect(result.subject).toBe('CONFIRMED');
  });

  test('should convert to lowercase with lowercase helper', async () => {
    // GIVEN: Template using lowercase helper
    const template = {
      htmlContent: '<p>Code: {{lowercase code}}</p>',
      textContent: 'Code: {{lowercase code}}',
      subjectLine: '{{lowercase code}}',
    };
    const variables = { code: 'ABC123' };

    // WHEN: Rendering the template
    const result = renderTemplateContent(template, variables);

    // THEN: Text is converted to lowercase
    expect(result.html).toContain('Code: abc123');
  });

  test('should handle pluralize helper', async () => {
    // GIVEN: Template using pluralize helper
    const templateSingular = {
      htmlContent: '<p>{{count}} {{pluralize count "day" "days"}}</p>',
      textContent: '{{count}} {{pluralize count "day" "days"}}',
      subjectLine: '{{count}} {{pluralize count "day" "days"}}',
    };

    // WHEN: Rendering with count = 1
    const resultSingular = renderTemplateContent(templateSingular, { count: 1 });

    // THEN: Singular form is used
    expect(resultSingular.html).toContain('1 day');

    // WHEN: Rendering with count = 5
    const resultPlural = renderTemplateContent(templateSingular, { count: 5 });

    // THEN: Plural form is used
    expect(resultPlural.html).toContain('5 days');
  });

  test('should handle eq helper for conditionals', async () => {
    // GIVEN: Template using eq helper
    const template = {
      htmlContent: '{{#if (eq status "active")}}Active{{else}}Inactive{{/if}}',
      textContent: '{{#if (eq status "active")}}Active{{else}}Inactive{{/if}}',
      subjectLine: 'Status',
    };

    // WHEN: Status is active
    const resultActive = renderTemplateContent(template, { status: 'active' });
    expect(resultActive.html).toBe('Active');

    // WHEN: Status is not active
    const resultInactive = renderTemplateContent(template, { status: 'draft' });
    expect(resultInactive.html).toBe('Inactive');
  });

  test('should handle gt and lt helpers for comparisons', async () => {
    // GIVEN: Template using gt helper
    const templateGt = {
      htmlContent: '{{#if (gt count 10)}}Many{{else}}Few{{/if}}',
      textContent: '{{#if (gt count 10)}}Many{{else}}Few{{/if}}',
      subjectLine: 'Count',
    };

    // WHEN: Count is greater than 10
    const resultMany = renderTemplateContent(templateGt, { count: 15 });
    expect(resultMany.html).toBe('Many');

    // WHEN: Count is less than 10
    const resultFew = renderTemplateContent(templateGt, { count: 5 });
    expect(resultFew.html).toBe('Few');
  });
});

test.describe('Email Template Renderer - Conditional Blocks', () => {
  test('should handle if block with truthy value', async () => {
    // GIVEN: Template with if block
    const template = {
      htmlContent: '{{#if showWelcome}}<h1>Welcome!</h1>{{/if}}',
      textContent: '{{#if showWelcome}}Welcome!{{/if}}',
      subjectLine: 'Subject',
    };

    // WHEN: Variable is truthy
    const result = renderTemplateContent(template, { showWelcome: true });

    // THEN: Content inside if block is rendered
    expect(result.html).toContain('Welcome!');
  });

  test('should handle if block with falsy value', async () => {
    // GIVEN: Template with if block
    const template = {
      htmlContent: '{{#if showWelcome}}<h1>Welcome!</h1>{{/if}}<p>Content</p>',
      textContent: '{{#if showWelcome}}Welcome!{{/if}}Content',
      subjectLine: 'Subject',
    };

    // WHEN: Variable is falsy
    const result = renderTemplateContent(template, { showWelcome: false });

    // THEN: Content inside if block is NOT rendered
    expect(result.html).not.toContain('Welcome!');
    expect(result.html).toContain('Content');
  });

  test('should handle if-else blocks', async () => {
    // GIVEN: Template with if-else block
    const template = {
      htmlContent: '{{#if isPremium}}Premium User{{else}}Standard User{{/if}}',
      textContent: '{{#if isPremium}}Premium User{{else}}Standard User{{/if}}',
      subjectLine: 'Subject',
    };

    // WHEN: isPremium is true
    const resultPremium = renderTemplateContent(template, { isPremium: true });
    expect(resultPremium.html).toBe('Premium User');

    // WHEN: isPremium is false
    const resultStandard = renderTemplateContent(template, { isPremium: false });
    expect(resultStandard.html).toBe('Standard User');
  });
});

test.describe('Email Template Renderer - Each Loops', () => {
  test('should iterate over array with each block', async () => {
    // GIVEN: Template with each block
    const template = {
      htmlContent: '<ul>{{#each items}}<li>{{this}}</li>{{/each}}</ul>',
      textContent: '{{#each items}}- {{this}}\n{{/each}}',
      subjectLine: 'Items',
    };
    const variables = { items: ['Apple', 'Banana', 'Cherry'] };

    // WHEN: Rendering the template
    const result = renderTemplateContent(template, variables);

    // THEN: Each item is rendered
    expect(result.html).toContain('<li>Apple</li>');
    expect(result.html).toContain('<li>Banana</li>');
    expect(result.html).toContain('<li>Cherry</li>');
  });

  test('should iterate over array of objects with each block', async () => {
    // GIVEN: Template with each block accessing object properties
    const template = {
      htmlContent: '{{#each addOns}}<p>{{name}}: {{price}}</p>{{/each}}',
      textContent: '{{#each addOns}}{{name}}: {{price}}\n{{/each}}',
      subjectLine: 'Add-ons',
    };
    const variables = {
      addOns: [
        { name: 'Massage', price: '$50' },
        { name: 'Yoga Class', price: '$30' },
      ],
    };

    // WHEN: Rendering the template
    const result = renderTemplateContent(template, variables);

    // THEN: Each item's properties are rendered
    expect(result.html).toContain('Massage: $50');
    expect(result.html).toContain('Yoga Class: $30');
  });

  test('should handle empty array in each block', async () => {
    // GIVEN: Template with each block but empty array
    const template = {
      htmlContent: '{{#each items}}<li>{{this}}</li>{{/each}}',
      textContent: '{{#each items}}- {{this}}\n{{/each}}',
      subjectLine: 'Items',
    };
    const variables = { items: [] };

    // WHEN: Rendering the template
    const result = renderTemplateContent(template, variables);

    // THEN: No items rendered, no errors
    expect(result.html).toBe('');
  });
});

test.describe('Plain Text Generation', () => {
  test('should convert basic HTML to plain text', async () => {
    // GIVEN: HTML content
    const html = '<h1>Hello World</h1><p>Welcome to our site.</p>';

    // WHEN: Generating plain text
    const text = generatePlainText(html);

    // THEN: HTML tags are removed (h1 is converted to uppercase by html-to-text)
    expect(text.toUpperCase()).toContain('HELLO WORLD');
    expect(text).toContain('Welcome to our site');
    expect(text).not.toContain('<h1>');
    expect(text).not.toContain('<p>');
  });

  test('should handle links in HTML', async () => {
    // GIVEN: HTML with links
    const html = '<p>Visit <a href="https://example.com">our site</a> for more info.</p>';

    // WHEN: Generating plain text
    const text = generatePlainText(html);

    // THEN: Link text is preserved
    expect(text).toContain('our site');
    expect(text).toContain('Visit');
  });

  test('should skip images', async () => {
    // GIVEN: HTML with images
    const html = '<p>Here is an image:</p><img src="logo.png" alt="Logo"><p>Nice!</p>';

    // WHEN: Generating plain text
    const text = generatePlainText(html);

    // THEN: Image is removed, surrounding text preserved
    expect(text).toContain('Here is an image');
    expect(text).toContain('Nice');
    expect(text).not.toContain('logo.png');
  });

  test('should handle nested HTML structures', async () => {
    // GIVEN: Complex nested HTML
    const html = `
      <div>
        <h1>Title</h1>
        <div>
          <p>Paragraph 1</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      </div>
    `;

    // WHEN: Generating plain text
    const text = generatePlainText(html);

    // THEN: All text content is extracted (h1 becomes uppercase)
    expect(text.toUpperCase()).toContain('TITLE');
    expect(text).toContain('Paragraph 1');
    expect(text).toContain('Item 1');
    expect(text).toContain('Item 2');
  });
});

test.describe('Variable Extraction', () => {
  test('should extract simple variables from content', async () => {
    // GIVEN: Content with simple variables
    const content = 'Hello {{name}}, your booking reference is {{bookingRef}}.';

    // WHEN: Extracting variables
    const variables = extractTemplateVariables(content);

    // THEN: Variables are extracted
    expect(variables).toContain('name');
    expect(variables).toContain('bookingRef');
    expect(variables.length).toBe(2);
  });

  test('should extract variables from helper expressions', async () => {
    // GIVEN: Content with helper expressions
    const content = 'Total: {{currency amount}}. Date: {{date tripDate}}.';

    // WHEN: Extracting variables
    const variables = extractTemplateVariables(content);

    // THEN: Variable names (not helpers) are extracted
    expect(variables).toContain('amount');
    expect(variables).toContain('tripDate');
    expect(variables).not.toContain('currency');
    expect(variables).not.toContain('date');
  });

  test('should not extract block helpers as variables', async () => {
    // GIVEN: Content with block helpers
    const content = '{{#if showSection}}Content{{/if}}{{#each items}}{{this}}{{/each}}';

    // WHEN: Extracting variables
    const variables = extractTemplateVariables(content);

    // THEN: Block helpers are not extracted
    expect(variables).not.toContain('#if');
    expect(variables).not.toContain('/if');
    expect(variables).not.toContain('#each');
    expect(variables).not.toContain('/each');
  });

  test('should deduplicate repeated variables', async () => {
    // GIVEN: Content with repeated variables
    const content = 'Hello {{name}}, {{name}}, {{name}}!';

    // WHEN: Extracting variables
    const variables = extractTemplateVariables(content);

    // THEN: Variable appears only once
    expect(variables.filter((v) => v === 'name').length).toBe(1);
  });
});

test.describe('Variable Validation', () => {
  test('should validate when all required variables are provided', async () => {
    // GIVEN: Required variables and provided variables
    const required = ['name', 'email', 'amount'];
    const provided = { name: 'John', email: 'john@example.com', amount: 100 };

    // WHEN: Validating
    const result = validateTemplateVariables(required, provided);

    // THEN: Validation passes
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  test('should identify missing required variables', async () => {
    // GIVEN: Required variables with some missing
    const required = ['name', 'email', 'amount'];
    const provided = { name: 'John' };

    // WHEN: Validating
    const result = validateTemplateVariables(required, provided);

    // THEN: Validation fails with missing variables
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('email');
    expect(result.missing).toContain('amount');
    expect(result.missing).not.toContain('name');
  });

  test('should treat undefined values as missing', async () => {
    // GIVEN: Variables with undefined value
    const required = ['name', 'email'];
    const provided = { name: 'John', email: undefined };

    // WHEN: Validating
    const result = validateTemplateVariables(required, provided);

    // THEN: Undefined is treated as missing
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('email');
  });
});

test.describe('Sample Data Retrieval', () => {
  test('should return sample data for TRANSACTIONAL category', async () => {
    // WHEN: Getting sample data for TRANSACTIONAL
    const data = getSampleDataForCategory('TRANSACTIONAL');

    // THEN: Contains expected transactional variables
    expect(data).toHaveProperty('guestName');
    expect(data).toHaveProperty('bookingReference');
    expect(data).toHaveProperty('tripName');
  });

  test('should return sample data for MARKETING category', async () => {
    // WHEN: Getting sample data for MARKETING
    const data = getSampleDataForCategory('MARKETING');

    // THEN: Contains expected marketing variables
    expect(data).toHaveProperty('guestName');
    expect(data).toHaveProperty('tripCountdown');
  });

  test('should return sample data for NOTIFICATIONS category', async () => {
    // WHEN: Getting sample data for NOTIFICATIONS
    const data = getSampleDataForCategory('NOTIFICATIONS');

    // THEN: Contains expected notification variables
    expect(data).toHaveProperty('alertType');
    expect(data).toHaveProperty('guestName');
  });

  test('should return sample data for SYSTEM category', async () => {
    // WHEN: Getting sample data for SYSTEM
    const data = getSampleDataForCategory('SYSTEM');

    // THEN: Contains expected system variables
    expect(data).toHaveProperty('userName');
    expect(data).toHaveProperty('userEmail');
  });

  test('should fall back to TRANSACTIONAL for unknown category', async () => {
    // WHEN: Getting sample data for unknown category
    const data = getSampleDataForCategory('UNKNOWN');

    // THEN: Falls back to transactional data
    expect(data).toHaveProperty('guestName');
    expect(data).toHaveProperty('bookingReference');
  });
});

test.describe('Base Template Application', () => {
  test('should apply base template with content placeholder', async () => {
    // GIVEN: Template with base template
    const template = {
      htmlContent: '<p>This is the content.</p>',
      textContent: 'This is the content.',
      subjectLine: 'Test Subject',
      baseTemplate: {
        htmlContent: '<html><body>{{content}}</body></html>',
      },
    };
    const variables = {};

    // WHEN: Rendering the template
    const result = renderTemplateContent(template, variables);

    // THEN: Content is wrapped in base template
    expect(result.html).toContain('<html><body>');
    expect(result.html).toContain('<p>This is the content.</p>');
    expect(result.html).toContain('</body></html>');
  });

  test('should work without base template', async () => {
    // GIVEN: Template without base template
    const template = {
      htmlContent: '<p>Hello {{name}}</p>',
      textContent: 'Hello {{name}}',
      subjectLine: 'Hello',
    };
    const variables = { name: 'World' };

    // WHEN: Rendering the template
    const result = renderTemplateContent(template, variables);

    // THEN: Template renders correctly without base
    expect(result.html).toBe('<p>Hello World</p>');
  });
});
