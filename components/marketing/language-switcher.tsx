'use client';

import { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const languages = [
  { code: '',      label: 'English',           short: 'EN' },
  { code: 'th',   label: 'ภาษาไทย',            short: 'TH' },
  { code: 'zh-CN',label: '中文 (简体)',          short: '中文' },
  { code: 'zh-TW',label: '中文 (繁體)',          short: '繁中' },
  { code: 'id',   label: 'Bahasa Indonesia',   short: 'ID' },
  { code: 'ms',   label: 'Bahasa Melayu',      short: 'MY' },
  { code: 'ja',   label: '日本語',              short: 'JA' },
  { code: 'ko',   label: '한국어',              short: 'KO' },
  { code: 'es',   label: 'Español',            short: 'ES' },
  { code: 'fr',   label: 'Français',           short: 'FR' },
  { code: 'de',   label: 'Deutsch',            short: 'DE' },
];

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(languages[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function switchLanguage(lang: typeof languages[0]) {
    setOpen(false);
    setCurrent(lang);

    const path = window.location.pathname;

    if (!lang.code) {
      // Navigate back to the original domain
      window.location.href = `https://www.thepickleballpassport.org${path}`;
      return;
    }

    // Build the Google Translate proxy URL for this domain
    const translateHost = window.location.hostname.replace(/\./g, '-') + '.translate.goog';
    window.location.href = `https://${translateHost}${path}?_x_tr_sl=en&_x_tr_tl=${lang.code}&_x_tr_hl=en`;
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#1D2D44]/70 hover:text-[#1D2D44] hover:bg-[#F5E6D3]/30 transition-all"
        aria-label="Change language"
        aria-expanded={open}
      >
        <Globe className="w-4 h-4 shrink-0" />
        <span className="text-xs font-semibold tracking-wide">{current.short}</span>
        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#B08D55]/15 py-1.5 z-[200] max-h-80 overflow-y-auto">
          {languages.map((lang) => (
            <button
              key={lang.code || 'en'}
              onClick={() => switchLanguage(lang)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                current.code === lang.code
                  ? 'text-[#B08D55] font-semibold bg-[#F5E6D3]/30'
                  : 'text-[#1D2D44]/80 hover:bg-[#F5E6D3]/40 hover:text-[#1D2D44]'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
