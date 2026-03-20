import { Playfair_Display, Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Heart, Shield, Sparkles } from "lucide-react";
import Link from "next/link";

const playfair = Playfair_Display({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

export default function GuestFlyer() {
  return (
    <div className={`min-h-screen bg-white text-slate-900 ${inter.className} p-8 md:p-16 flex justify-center`}>
      <div className="max-w-4xl w-full border border-slate-100 shadow-2xl relative overflow-hidden bg-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />

        <div className="p-12 space-y-16">
          {/* Header */}
          <header className="space-y-6 text-center">
            <div className="inline-block border-y border-slate-200 py-2 px-6 uppercase tracking-[0.3em] text-xs font-semibold text-slate-500">
              The Art of Transformation
            </div>
            <h1 className={`${playfair.className} text-6xl md:text-7xl lg:text-8xl leading-tight`}>
              Pickleball <br />
              <span className="italic text-emerald-600">Passport</span>
            </h1>
            <p className="text-xl md:text-2xl font-light text-slate-500 max-w-2xl mx-auto italic">
              "A life upgrade, masterfully disguised as an unforgettable vacation."
            </p>
          </header>

          {/* Hero Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className={`${playfair.className} text-3xl md:text-4xl leading-snug`}>
                Return home with more than just memories.
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                Imagine a journey where the thrill of the court meets the pinnacle of self-care. 
                Stay in Thailand's most storied resorts, forge genuine friendships with fellow players, 
                and invest in your well-being with world-class wellness and unforgettable experiences.
              </p>
            </div>
            <div className="aspect-[4/5] relative overflow-hidden group">
              {/* Sunset Resort Mockup */}
              <div className="absolute inset-0 bg-gradient-to-b from-orange-300 via-rose-400 to-purple-600">
                {/* Sky gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-orange-200/30" />
                
                {/* Sun glow */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-80" />
                
                {/* Palm tree silhouettes */}
                <svg className="absolute bottom-0 left-0 w-full h-2/3 opacity-90" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
                  {/* Ground/court */}
                  <rect x="0" y="220" width="400" height="80" fill="#1a1a2e" />
                  
                  {/* Court lines */}
                  <rect x="80" y="230" width="240" height="50" fill="none" stroke="#4ade80" strokeWidth="2" opacity="0.6" />
                  <line x1="200" y1="230" x2="200" y2="280" stroke="#4ade80" strokeWidth="2" opacity="0.6" />
                  <line x1="80" y1="255" x2="320" y2="255" stroke="#4ade80" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                  
                  {/* Net */}
                  <line x1="200" y1="225" x2="200" y2="235" stroke="#ffffff" strokeWidth="3" />
                  <rect x="80" y="232" width="240" height="3" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.5" />
                  
                  {/* Palm tree left */}
                  <path d="M30 220 L35 120 L40 220" fill="#0f172a" />
                  <ellipse cx="35" cy="110" rx="45" ry="20" fill="#0f172a" transform="rotate(-30 35 110)" />
                  <ellipse cx="35" cy="110" rx="40" ry="18" fill="#0f172a" transform="rotate(20 35 110)" />
                  <ellipse cx="35" cy="110" rx="50" ry="15" fill="#0f172a" transform="rotate(-60 35 110)" />
                  <ellipse cx="35" cy="110" rx="45" ry="16" fill="#0f172a" transform="rotate(50 35 110)" />
                  
                  {/* Palm tree right */}
                  <path d="M360 220 L365 100 L370 220" fill="#0f172a" />
                  <ellipse cx="365" cy="90" rx="50" ry="22" fill="#0f172a" transform="rotate(30 365 90)" />
                  <ellipse cx="365" cy="90" rx="45" ry="20" fill="#0f172a" transform="rotate(-25 365 90)" />
                  <ellipse cx="365" cy="90" rx="55" ry="18" fill="#0f172a" transform="rotate(60 365 90)" />
                  <ellipse cx="365" cy="90" rx="48" ry="17" fill="#0f172a" transform="rotate(-50 365 90)" />
                  
                  {/* Small palm left background */}
                  <path d="M100 220 L103 160 L106 220" fill="#1e293b" />
                  <ellipse cx="103" cy="155" rx="25" ry="12" fill="#1e293b" transform="rotate(-20 103 155)" />
                  <ellipse cx="103" cy="155" rx="22" ry="10" fill="#1e293b" transform="rotate(35 103 155)" />
                  
                  {/* Resort building silhouette */}
                  <rect x="280" y="180" width="60" height="40" fill="#1e293b" />
                  <polygon points="280,180 310,160 340,180" fill="#1e293b" />
                  <rect x="290" y="190" width="10" height="15" fill="#fbbf24" opacity="0.7" />
                  <rect x="310" y="190" width="10" height="15" fill="#fbbf24" opacity="0.5" />
                </svg>
                
                {/* Reflection on court */}
                <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-orange-400/20 to-transparent" />
              </div>
              
              {/* Title overlay */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-4 text-center shadow-lg">
                <p className={`${playfair.className} text-lg tracking-wide text-slate-900`}>
                  Thailand <span className="text-emerald-600">|</span> 2026
                </p>
              </div>
            </div>
          </div>

          {/* The Pillars */}
          <div className="grid md:grid-cols-3 gap-8 border-t border-slate-100 pt-12">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className={`${playfair.className} text-xl`}>The Wellness</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Spa treatments, yoga, Thai massage, and holistic wellness woven into every day of your trip.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className={`${playfair.className} text-xl`}>The Community</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Connect with like-minded individuals through the sport you love. Transform surface-level social games into lifelong bonds.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className={`${playfair.className} text-xl`}>The Experience</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Resort living at the Four Seasons or Aman. Every detail curated, from your private villa to the perfect cross-court dink.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-slate-900 text-white p-12 text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />
            <h2 className={`${playfair.className} text-3xl md:text-4xl`}>
              Your next chapter starts with a paddle.
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Spaces for our inaugural 2026 Thailand transformation tours are strictly limited to 16 guests per trip.
            </p>
            <div className="pt-4">
              <Button asChild className="bg-white text-slate-900 hover:bg-emerald-50 transition-colors px-10 py-7 text-lg uppercase tracking-widest font-medium">
                <Link href="#">
                  Join the Waitlist
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
            <p className="text-xs text-slate-500 pt-4 font-mono tracking-tighter">
              [yourwebsite.com] | [Instagram: @pickleballpassport]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
