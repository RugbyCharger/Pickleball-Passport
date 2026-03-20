import { Playfair_Display, Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Users, Globe2, Trophy } from "lucide-react";
import Link from "next/link";

const playfair = Playfair_Display({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

export default function DirectorFlyer() {
  return (
    <div className={`min-h-screen bg-white text-slate-900 ${inter.className} p-8 md:p-16 flex justify-center`}>
      <div className="max-w-4xl w-full border border-slate-100 shadow-2xl relative overflow-hidden bg-white">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-slate-50 rounded-full -ml-32 -mt-32 blur-3xl opacity-50" />
        
        <div className="p-12 space-y-16">
          {/* Header */}
          <header className="space-y-6">
            <div className="inline-block border-l-4 border-emerald-600 pl-4 uppercase tracking-[0.3em] text-xs font-semibold text-slate-500">
              Executive Partnership
            </div>
            <h1 className={`${playfair.className} text-6xl md:text-7xl leading-tight`}>
              The New Standard <br />
              <span className="italic text-emerald-600">in Club Loyalty</span>
            </h1>
            <p className="text-xl font-light text-slate-500 max-w-2xl italic">
              "Give your members an experience that changes their lives, and your club's legacy."
            </p>
          </header>

          {/* Value Proposition */}
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <p className="text-slate-600 leading-relaxed text-lg">
                The Pickleball Passport is the first premier transformation travel platform.
                We partner with select Club Directors to offer their members exclusive access
                to curated travel experiences in Thailand that combine the sport they love with
                exceptional wellness and adventure.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <BarChart3 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Retention Reimagined</h4>
                    <p className="text-sm text-slate-500">Create "sticky" members who bond through once-in-a-lifetime shared travel.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Trophy className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Premier Differentiation</h4>
                    <p className="text-sm text-slate-500">Stand out from other clubs by offering an exclusive international perk.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Users className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Zero Effort Delivery</h4>
                    <p className="text-sm text-slate-500">We handle 100% of the logistics, from transportation to premium courts and hotels.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 space-y-8 border border-slate-100">
              <h3 className={`${playfair.className} text-2xl`}>The "Thailand" Effect</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm text-slate-600 italic">
                  <Globe2 className="w-4 h-4 text-emerald-500" /> 
                  "My members aren't just playing; they're evolving."
                </li>
                <li className="pt-4 text-slate-600 leading-relaxed">
                  Imagine your members returning with brand-new smiles, improved mobility, 
                  and a deeper commitment to your club's community.
                </li>
              </ul>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Director Benefit</p>
                <p className="text-sm font-medium text-slate-900">Generous referral commissions + Hosted travel opportunities for active directors.</p>
              </div>
            </div>
          </div>

          {/* Partnerships Section */}
          <div className="text-center space-y-8 py-12 border-y border-slate-100">
            <h2 className={`${playfair.className} text-3xl`}>Become an Inaugural Partner</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              We are currently accepting a limited number of partner clubs for our 2026 season. 
              Secure your club's placement on the waitlist today.
            </p>
            <div className="flex justify-center gap-6">
              <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700 transition-colors px-10 py-7 text-lg uppercase tracking-widest font-medium">
                <Link href="#">
                  Join the Waitlist
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Footer Meta */}
          <footer className="flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] text-slate-400">
            <div>The Pickleball Passport | Executive Relations</div>
            <div className="mt-4 md:mt-0">[yourwebsite.com/partners] | [partners@yourwebsite.com]</div>
          </footer>
        </div>
      </div>
    </div>
  );
}
