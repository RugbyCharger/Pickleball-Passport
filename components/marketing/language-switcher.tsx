'use client';

import { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const languages = [
  { code: '',      label: 'English',           short: 'EN',  flag: '🇺🇸' },
  { code: 'th',   label: 'ภาษาไทย',            short: 'TH',  flag: '🇹🇭' },
  { code: 'zh-CN',label: '中文 (简体)',          short: '中文', flag: '🇨🇳' },
  { code: 'zh-TW',label: '中文 (繁體)',          short: '繁中', flag: '🇹🇼' },
  { code: 'id',   label: 'Bahasa Indonesia',   short: 'ID',  flag: '🇮🇩' },
  { code: 'ms',   label: 'Bahasa Melayu',      short: 'MY',  flag: '🇲🇾' },
  { code: 'tl',   label: 'Filipino',           short: 'FIL', flag: '🇵🇭' },
  { code: 'vi',   label: 'Tiếng Việt',         short: 'VI',  flag: '🇻🇳' },
  { code: 'ja',   label: '日本語',              short: 'JA',  flag: '🇯🇵' },
  { code: 'ko',   label: '한국어',              short: 'KO',  flag: '🇰🇷' },
  { code: 'hi',   label: 'हिन्दी',               short: 'HI',  flag: '🇮🇳' },
  { code: 'ta',   label: 'தமிழ்',               short: 'TA',  flag: '🇮🇳' },
  { code: 'es',   label: 'Español',            short: 'ES',  flag: '🇪🇸' },
  { code: 'fr',   label: 'Français',           short: 'FR',  flag: '🇫🇷' },
  { code: 'de',   label: 'Deutsch',            short: 'DE',  flag: '🇩🇪' },
  { code: 'pt',   label: 'Português',          short: 'PT',  flag: '🇧🇷' },
  { code: 'ar',   label: 'العربية',             short: 'AR',  flag: '🇸🇦' },
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

    // If already on translate.goog, reuse the hostname directly — don't re-mangle it
    const hostname = window.location.hostname;
    const translateHost = hostname.endsWith('.translate.goog')
      ? hostname
      : hostname.replace(/\./g, '-') + '.translate.goog';
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
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-xs font-semibold tracking-wide">{current.short}</span>
        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#B08D55]/15 py-1.5 z-[200] max-h-80 overflow-y-auto">
          {languages.map((lang) => (
            <button
              key={lang.code || 'en'}
              onClick={() => switchLanguage(lang)}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                current.code === lang.code
                  ? 'text-[#B08D55] font-semibold bg-[#F5E6D3]/30'
                  : 'text-[#1D2D44]/80 hover:bg-[#F5E6D3]/40 hover:text-[#1D2D44]'
              }`}
            >
              <span className="text-base w-6 shrink-0">{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
