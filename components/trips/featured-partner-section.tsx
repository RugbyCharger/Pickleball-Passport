import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface FeaturedPartnerSectionProps {
  name: string;
  title: string;
  bio: string;
  siteUrl?: string;
  siteName?: string;
  photoSrc?: string;
  photoAlt?: string;
}

export function FeaturedPartnerSection({
  name,
  title,
  bio,
  siteUrl,
  siteName,
  photoSrc,
  photoAlt,
}: FeaturedPartnerSectionProps) {
  return (
    <section className="bg-[#FDF8F3] border-b border-[#B08D55]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="max-w-3xl flex items-start gap-5 sm:gap-6">
          {/* Photo */}
          <div className="flex-shrink-0">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt={photoAlt ?? name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover object-top border-2 border-[#B08D55]/30"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#1D2D44] to-[#495F87] flex items-center justify-center border-2 border-[#B08D55]/30">
                <span className="text-white font-serif font-bold text-xl">BK</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#B08D55] mb-1">
              Featured Partner
            </p>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1D2D44] leading-tight">
              {name}
            </h3>
            <p className="text-sm font-medium text-[#1D2D44]/50 mb-2">{title}</p>
            <p className="text-sm text-[#1D2D44]/70 leading-relaxed mb-3">{bio}</p>
            {siteUrl && (
              <Link
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B08D55] hover:text-[#8D7144] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {siteName ?? siteUrl}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
