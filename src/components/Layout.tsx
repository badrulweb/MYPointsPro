import { ChevronDown, Menu, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { CATEGORY_HUBS } from '../data/seedPublication';
import { Link, useRouter } from '../lib/router';
import { CategorySlug } from '../types/publication';
import { DemoChatbot } from './DemoChatbot';

const CATEGORY_ORDER: CategorySlug[] = [
  'zero-apr',
  'credit-building',
  'cashback',
  'points-miles',
  'travel-rewards',
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { path } = useRouter();
  const [guidesOpen, setGuidesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGuidesOpen(false);
    setMobileOpen(false);
  }, [path]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setGuidesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const isActive = (target: string) =>
    path === target || (target !== '/' && path.startsWith(target));

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#0F172A]">
      {/* Top Bar Contract: Strict 3 Zones (Wordmark | 5 Single-Line Nav Links | 1 Primary CTA) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4E7EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <Link
            to="/"
            className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#0B192C] whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity"
          >
            MyPointsPro
          </Link>

          {/* Zone 2: 5 Clean Single-Line Nav Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#475569]"
          >
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setGuidesOpen((v) => !v)}
                aria-expanded={guidesOpen}
                className={`inline-flex items-center gap-1 py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  path.startsWith('/category')
                    ? 'text-[#0B192C] font-semibold'
                    : 'hover:text-[#0B192C]'
                }`}
              >
                <span>Guides</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    guidesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {guidesOpen && (
                <div className="absolute left-0 top-full mt-3 w-80 bg-white border border-[#E4E7EC] rounded-xl shadow-lg py-2 z-50">
                  {CATEGORY_ORDER.map((slug) => {
                    const hub = CATEGORY_HUBS[slug];
                    return (
                      <Link
                        key={slug}
                        to={`/category/${slug}`}
                        className={`block px-4 py-2.5 mx-1.5 rounded-lg transition-colors hover:bg-[#F7F8FA] ${
                          path === `/category/${slug}` ? 'bg-[#F7F8FA]' : ''
                        }`}
                      >
                        <div className="text-sm font-semibold text-[#0B192C]">
                          {hub.title}
                        </div>
                        <div className="text-xs text-[#475569] mt-0.5 line-clamp-1">
                          {hub.kicker}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              to="/valuations"
              className={`py-1 whitespace-nowrap shrink-0 transition-colors ${
                isActive('/valuations')
                  ? 'text-[#0B192C] font-semibold border-b-2 border-[#C49645]'
                  : 'hover:text-[#0B192C]'
              }`}
            >
              Valuations
            </Link>

            <Link
              to="/tools"
              className={`py-1 whitespace-nowrap shrink-0 transition-colors ${
                isActive('/tools')
                  ? 'text-[#0B192C] font-semibold border-b-2 border-[#C49645]'
                  : 'hover:text-[#0B192C]'
              }`}
            >
              Calculators
            </Link>

            <Link
              to="/journal"
              className={`py-1 whitespace-nowrap shrink-0 transition-colors ${
                isActive('/journal') || isActive('/article')
                  ? 'text-[#0B192C] font-semibold border-b-2 border-[#C49645]'
                  : 'hover:text-[#0B192C]'
              }`}
            >
              Journal
            </Link>

            <Link
              to="/about"
              className={`py-1 whitespace-nowrap shrink-0 transition-colors ${
                isActive('/about')
                  ? 'text-[#0B192C] font-semibold border-b-2 border-[#C49645]'
                  : 'hover:text-[#0B192C]'
              }`}
            >
              Methodology
            </Link>
          </nav>

          {/* Zone 3: Single Primary Action + Mobile Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/studio"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#0B192C] hover:bg-[#132844] transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              Editorial Studio
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#E4E7EC] bg-white text-[#0B192C] cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[#E4E7EC] bg-white px-4 py-5 space-y-4 shadow-lg">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#9A6F22] pb-1">
                Educational Hubs
              </div>
              {CATEGORY_ORDER.map((slug) => (
                <Link
                  key={slug}
                  to={`/category/${slug}`}
                  className="block py-2 text-sm font-medium text-[#0B192C] border-b border-[#F1F5F9]"
                >
                  {CATEGORY_HUBS[slug].title}
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link to="/valuations" className="py-2.5 px-3 rounded-lg text-sm font-medium bg-[#F7F8FA] border border-[#E4E7EC] text-[#0B192C]">
                Valuations
              </Link>
              <Link to="/tools" className="py-2.5 px-3 rounded-lg text-sm font-medium bg-[#F7F8FA] border border-[#E4E7EC] text-[#0B192C]">
                Calculators
              </Link>
              <Link to="/journal" className="py-2.5 px-3 rounded-lg text-sm font-medium bg-[#F7F8FA] border border-[#E4E7EC] text-[#0B192C]">
                Journal
              </Link>
              <Link to="/about" className="py-2.5 px-3 rounded-lg text-sm font-medium bg-[#F7F8FA] border border-[#E4E7EC] text-[#0B192C]">
                Methodology
              </Link>
            </div>

            <Link
              to="/studio"
              className="block w-full text-center py-3 rounded-lg text-sm font-semibold text-white bg-[#0B192C]"
            >
              Open Editorial Studio
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Deep Midnight Navy Institutional Footer */}
      <footer className="bg-[#0B192C] text-slate-300 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-5 sm:pt-12 sm:pb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-white/10">
            <div className="md:col-span-4 space-y-3.5">
              <Link to="/" className="font-serif text-2xl font-bold text-white inline-block">
                MyPointsPro
              </Link>
              <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                Independent financial publication dedicated to credit education, zero-interest financing, cashback math, and travel loyalty economics.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                Issuer-Neutral Standard: All educational comparisons analyze card archetypes and fee mathematics without promoting specific banks or named card issuers.
              </p>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h3 className="text-xs font-semibold tracking-wide text-[#E5C17B]">
                Core Education
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-300">
                {CATEGORY_ORDER.map((slug) => (
                  <li key={slug}>
                    <Link
                      to={`/category/${slug}`}
                      className="hover:text-white transition-colors"
                    >
                      {CATEGORY_HUBS[slug].title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h3 className="text-xs font-semibold tracking-wide text-[#E5C17B]">
                Publication
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li>
                  <Link to="/valuations" className="hover:text-white transition-colors">
                    Valuation Index
                  </Link>
                </li>
                <li>
                  <Link to="/tools" className="hover:text-white transition-colors">
                    Financial Calculators
                  </Link>
                </li>
                <li>
                  <Link to="/journal" className="hover:text-white transition-colors">
                    Editorial Journal
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    Methodology
                  </Link>
                </li>
                <li>
                  <Link to="/studio" className="hover:text-white transition-colors">
                    AI Content Studio
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h3 className="text-xs font-semibold tracking-wide text-[#E5C17B]">
                Legal &amp; Disclosures
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li>
                  <Link
                    to="/legal/advertiser-disclosure"
                    className="hover:text-white transition-colors"
                  >
                    Advertiser &amp; Affiliate Disclosure
                  </Link>
                </li>
                <li>
                  <Link
                    to="/legal/editorial-policy"
                    className="hover:text-white transition-colors"
                  >
                    Editorial &amp; AI Transparency Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/legal/privacy-policy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/legal/terms"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Use &amp; Financial Disclaimer
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
            <p>
              © {new Date().getFullYear()} MyPointsPro Media Group. Educational modeling only; not individualized financial or tax advice.
            </p>
            <p className="shrink-0 text-[#E5C17B]">
              Issuer-Neutral Compliance Standard
            </p>
          </div>
        </div>
      </footer>

      <DemoChatbot />
    </div>
  );
}
