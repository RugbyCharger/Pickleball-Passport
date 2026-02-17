/**
 * Marketing Materials Data
 * E9-S4: Marketing Materials Library
 *
 * Defines all available marketing materials for partners to download
 */

export type MaterialCategory = 'email' | 'flyer' | 'social' | 'presentation';

export interface MarketingMaterial {
  id: string;
  category: MaterialCategory;
  title: string;
  description: string;
  previewUrl?: string;
  downloadUrl: string;
  fileFormat: string;
  fileSize?: string;
  tags?: string[];
}

export const MARKETING_MATERIALS: MarketingMaterial[] = [
  // Email Templates
  {
    id: 'email-1',
    category: 'email',
    title: 'Email Template - Introduction',
    description: 'Professional introduction email to introduce The Pickleball Passport to your club members. Includes personalization tokens for club name and director name.',
    downloadUrl: '/partner-materials/email-templates/introduction.html',
    fileFormat: 'HTML + Plain Text',
    fileSize: '5 KB',
    tags: ['introduction', 'welcome'],
  },
  {
    id: 'email-2',
    category: 'email',
    title: 'Email Template - Special Offer',
    description: 'Promotional email template highlighting special offers and limited-time deals. Perfect for seasonal campaigns.',
    downloadUrl: '/partner-materials/email-templates/special-offer.html',
    fileFormat: 'HTML + Plain Text',
    fileSize: '6 KB',
    tags: ['promotion', 'offer'],
  },
  {
    id: 'email-3',
    category: 'email',
    title: 'Email Template - Testimonial',
    description: 'Email template featuring success stories and testimonials from past guests. Builds trust and social proof.',
    downloadUrl: '/partner-materials/email-templates/testimonial.html',
    fileFormat: 'HTML + Plain Text',
    fileSize: '7 KB',
    tags: ['testimonial', 'social-proof'],
  },

  // Flyers
  {
    id: 'flyer-1',
    category: 'flyer',
    title: 'Flyer - Standard (8.5x11")',
    description: 'Single-page flyer perfect for club bulletin boards, newsletters, and handouts. Print-ready PDF format.',
    previewUrl: '/partner-materials/flyers/standard-preview.jpg',
    downloadUrl: '/partner-materials/flyers/standard-8.5x11.pdf',
    fileFormat: 'PDF',
    fileSize: '2.5 MB',
    tags: ['print', 'bulletin-board'],
  },
  {
    id: 'flyer-2',
    category: 'flyer',
    title: 'Flyer - Large Format (11x17")',
    description: 'Large format poster for prominent display at club facilities. Eye-catching design with key benefits highlighted.',
    previewUrl: '/partner-materials/flyers/large-preview.jpg',
    downloadUrl: '/partner-materials/flyers/large-11x17.pdf',
    fileFormat: 'PDF',
    fileSize: '3.2 MB',
    tags: ['poster', 'large-format'],
  },
  {
    id: 'flyer-3',
    category: 'flyer',
    title: 'Rack Card (4x9")',
    description: 'Compact rack card perfect for display at front desks, information kiosks, and take-home materials.',
    previewUrl: '/partner-materials/flyers/rack-card-preview.jpg',
    downloadUrl: '/partner-materials/flyers/rack-card-4x9.pdf',
    fileFormat: 'PDF',
    fileSize: '1.8 MB',
    tags: ['rack-card', 'compact'],
  },

  // Social Media
  {
    id: 'social-1',
    category: 'social',
    title: 'Facebook Post - Introduction',
    description: 'Square image (1080x1080) with caption for Facebook. Perfect for introducing The Pickleball Passport to your club community.',
    previewUrl: '/partner-materials/social-media/facebook-intro-preview.jpg',
    downloadUrl: '/partner-materials/social-media/facebook-intro.jpg',
    fileFormat: 'JPG',
    fileSize: '450 KB',
    tags: ['facebook', 'introduction'],
  },
  {
    id: 'social-2',
    category: 'social',
    title: 'Instagram Post - Transformation',
    description: 'Square image (1080x1080) with Instagram caption. Highlights the transformation journey aspect.',
    previewUrl: '/partner-materials/social-media/instagram-transformation-preview.jpg',
    downloadUrl: '/partner-materials/social-media/instagram-transformation.jpg',
    fileFormat: 'JPG',
    fileSize: '520 KB',
    tags: ['instagram', 'transformation'],
  },
  {
    id: 'social-3',
    category: 'social',
    title: 'LinkedIn Post - Professional',
    description: 'Professional LinkedIn post image (1200x627) with caption. Targets club directors and facility managers.',
    previewUrl: '/partner-materials/social-media/linkedin-professional-preview.jpg',
    downloadUrl: '/partner-materials/social-media/linkedin-professional.jpg',
    fileFormat: 'JPG',
    fileSize: '380 KB',
    tags: ['linkedin', 'professional'],
  },
  {
    id: 'social-4',
    category: 'social',
    title: 'Instagram Story Template',
    description: 'Vertical story template (1080x1920) with multiple slides. Ready to customize with your club branding.',
    previewUrl: '/partner-materials/social-media/instagram-story-preview.jpg',
    downloadUrl: '/partner-materials/social-media/instagram-story.jpg',
    fileFormat: 'JPG',
    fileSize: '680 KB',
    tags: ['instagram', 'story'],
  },

  // Presentations
  {
    id: 'presentation-1',
    category: 'presentation',
    title: 'Presentation Deck - Full Overview',
    description: 'Complete PowerPoint presentation (20 slides) covering all aspects of The Pickleball Passport. Perfect for club meetings and preview events.',
    previewUrl: '/partner-materials/presentations/overview-preview.jpg',
    downloadUrl: '/partner-materials/presentations/pickleball-passport-overview.pptx',
    fileFormat: 'PowerPoint',
    fileSize: '12.5 MB',
    tags: ['presentation', 'overview'],
  },
  {
    id: 'presentation-2',
    category: 'presentation',
    title: 'Presentation Deck - Quick Pitch',
    description: 'Condensed 10-slide presentation for quick introductions. Focuses on key benefits and value proposition.',
    previewUrl: '/partner-materials/presentations/quick-pitch-preview.jpg',
    downloadUrl: '/partner-materials/presentations/quick-pitch.pptx',
    fileFormat: 'PowerPoint',
    fileSize: '8.2 MB',
    tags: ['presentation', 'quick-pitch'],
  },
];

export const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  email: 'Email Templates',
  flyer: 'Flyers & Print Materials',
  social: 'Social Media Content',
  presentation: 'Presentation Decks',
};

export const CATEGORY_DESCRIPTIONS: Record<MaterialCategory, string> = {
  email: 'Ready-to-use email templates with personalization tokens',
  flyer: 'Print-ready PDFs for bulletin boards and handouts',
  social: 'Images and captions for Facebook, Instagram, and LinkedIn',
  presentation: 'PowerPoint decks for club meetings and events',
};
