import {
  ArrowRight,
  Award,
  Compass,
  CreditCard,
  Layers,
  Percent,
  Plane,
  Scale,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  CARD_ARCHETYPES,
  CATEGORY_HUBS,
  CATEGORY_IMAGES,
  VALUATION_INDEX,
} from '../data/seedPublication';
import { Link } from '../lib/router';
import { Article, CategorySlug } from '../types/publication';

interface HomePageProps {
  articles: Article[];
}

const CATEGORY_TABS: { id: 'all' | CategorySlug; label: string }[] = [
  { id: 'all', label: 'All Archetypes' },
  { id: 'zero-apr', label: '0% APR' },
  { id: 'credit-building', label: 'Credit Building' },
  { id: 'cashback', label: 'Cashback' },
  { id: 'points-miles', label: 'Points & Miles' },
  { id: 'travel-rewards', label: 'Travel Perks' },
];

const PILLAR_ICONS: Record<CategorySlug, React.ComponentType<{ className?: string }>> = {
  'zero-apr': Percent,
  'credit-building': TrendingUp,
  cashback: Layers,
  'points-miles': Compass,
  'travel-rewards': Plane,
};

export function HomePage({ articles }: HomePageProps) {
  const [archetypeFilter, setArchetypeFilter] = useState<'all' | CategorySlug>('all');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('0% APR & Credit Strategy');
  const [subStatus, setSubStatus] = useState<{
    type: 'idle' | 'submitting' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  const secondaryArticles = articles.slice(0, 3);
  const briefingArticles = articles.slice(3, 6);

  const visibleArchetypes =
    archetypeFilter === 'all'
      ? CARD_ARCHETYPES
      : CARD_ARCHETYPES.filter((a) => a.category === archetypeFilter);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setSubStatus({ type: 'error', message: 'Please provide a valid email address.' });
      return;
    }
    setSubStatus({ type: 'submitting', message: '' });
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, interest }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubStatus({ type: 'error', message: data.error || 'Subscription failed.' });
      } else {
        setSubStatus({ type: 'success', message: data.message });
        setEmail('');
      }
    } catch {
      setSubStatus({ type: 'error', message: 'Network error. Please try again.' });
    }
  }

  return (
    <div>
      {/* Full-Bleed Atmospheric Hero Banner */}
      <section className="relative bg-[#0F1B29] text-white overflow-hidden">
        <img
          src={CATEGORY_IMAGES['travel-rewards']}
          alt="Serene airport lounge overlooking tarmac at dawn"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0F1B29]/92 via-[#0F1B29]/72 to-[#0F1B29]/25"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#0F1B29]/75 via-transparent to-[#0F1B29]/30"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 lg:py-36">
          <div className="max-w-2xl space-y-6">
            <div className="text-xs sm:text-sm font-semibold tracking-wide text-[#34D399]">
              Financial Education · Travel Rewards
            </div>

            <h1
              className="font-sans font-bold leading-[1.08] tracking-tight text-white"
              style={{ fontSize: 'clamp(2.4rem, 4.8vw, 3.85rem)' }}
            >
              Make Every Point, Mile &amp; Dollar Count.
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-xl">
              Clear financial education, practical calculators, and unbiased rewards guidance built to support confident money decisions.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/journal"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold text-white bg-[#108A65] hover:bg-[#0D7555] transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                <span>Explore Financial Guides</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/category/points-miles"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold text-white border border-white/30 bg-white/5 hover:bg-white/15 backdrop-blur-xs transition-colors whitespace-nowrap shrink-0"
              >
                <span>Discover Travel Rewards</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Overlapping 3-Card Focus Strip (Inspired by Prosperum Reference) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-elevated p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#0B192C] text-[#E5C17B] flex items-center justify-center shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <h2 className="font-serif text-lg font-semibold text-[#0B192C]">
                  0% APR Debt Strategy
                </h2>
              </div>
              <p className="mt-3.5 text-sm text-[#475569] leading-relaxed">
                Model 12 to 21-month introductory windows, balance transfer fee break-evens, and safe N − 1 payoff timelines.
              </p>
            </div>
            <div className="mt-5 pt-3.5 border-t border-[#F1F5F9]">
              <Link
                to="/category/zero-apr"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B192C] hover:text-[#9A6F22] transition-colors"
              >
                <span>Explore 0% APR Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="card-elevated p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#C49645]/15 text-[#9A6F22] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h2 className="font-serif text-lg font-semibold text-[#0B192C]">
                  Credit Score Engineering
                </h2>
              </div>
              <p className="mt-3.5 text-sm text-[#475569] leading-relaxed">
                Master the five bureau scoring pillars, statement closing date timing, and sub-9% utilization thresholds.
              </p>
            </div>
            <div className="mt-5 pt-3.5 border-t border-[#F1F5F9]">
              <Link
                to="/category/credit-building"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B192C] hover:text-[#9A6F22] transition-colors"
              >
                <span>Explore Credit Building</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="card-elevated p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#0B192C] text-[#E5C17B] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="font-serif text-lg font-semibold text-[#0B192C]">
                  Cashback &amp; Travel Yield
                </h2>
              </div>
              <p className="mt-3.5 text-sm text-[#475569] leading-relaxed">
                Compare uncapped 2% cash floors against 1:1 airline transfer sweet spots and primary travel protections.
              </p>
            </div>
            <div className="mt-5 pt-3.5 border-t border-[#F1F5F9]">
              <Link
                to="/category/points-miles"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B192C] hover:text-[#9A6F22] transition-colors"
              >
                <span>Explore Rewards Math</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Column Comprehensive Educational Pillars (Inspired by FinanceCo) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-semibold text-[#9A6F22] mb-2">
            Core Curriculum
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B192C]">
            Comprehensive Credit &amp; Rewards Education
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-[#475569]">
            Five structured research hubs covering every phase of personal borrowing, score optimization, and travel loyalty.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {(Object.keys(CATEGORY_HUBS) as CategorySlug[]).map((slug) => {
            const hub = CATEGORY_HUBS[slug];
            const Icon = PILLAR_ICONS[slug];
            return (
              <Link
                key={slug}
                to={`/category/${slug}`}
                className="group bg-white border border-[#E4E7EC] rounded-xl p-6 flex flex-col justify-between hover:border-[#C49645] hover:shadow-md transition-all"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl border border-[#C49645]/35 bg-[#C49645]/10 text-[#9A6F22] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#0B192C] group-hover:text-[#9A6F22] transition-colors">
                    {hub.shortTitle}
                  </h3>
                  <p className="mt-2 text-xs text-[#475569] leading-relaxed">
                    {hub.summary}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#F1F5F9] inline-flex items-center gap-1 text-xs font-semibold text-[#0B192C] group-hover:text-[#9A6F22]">
                  <span>Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Dark Navy 4-Column Industry Benchmark Bar (Inspired by FinanceCo) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-[#0B192C] text-white rounded-2xl p-8 sm:p-10 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x divide-white/15 shadow-lg">
          <div className="lg:px-8 first:lg:pl-2">
            <Compass className="w-5 h-5 text-[#E5C17B] mb-3" />
            <div className="font-mono text-2xl sm:text-3xl font-semibold tabular-nums">
              1.85¢
            </div>
            <div className="text-xs text-slate-300 mt-1">
              Tier-1 Transferable Point Baseline
            </div>
          </div>
          <div className="lg:px-8">
            <Percent className="w-5 h-5 text-[#E5C17B] mb-3" />
            <div className="font-mono text-2xl sm:text-3xl font-semibold tabular-nums">
              15–21 mo
            </div>
            <div className="text-xs text-slate-300 mt-1">
              Standard 0% Intro APR Horizon
            </div>
          </div>
          <div className="lg:px-8">
            <CreditCard className="w-5 h-5 text-[#E5C17B] mb-3" />
            <div className="font-mono text-2xl sm:text-3xl font-semibold tabular-nums">
              &lt; 9.0%
            </div>
            <div className="text-xs text-slate-300 mt-1">
              Optimal Statement Utilization Ceiling
            </div>
          </div>
          <div className="lg:px-8">
            <Award className="w-5 h-5 text-[#E5C17B] mb-3" />
            <div className="font-mono text-2xl sm:text-3xl font-semibold tabular-nums">
              2.00%
            </div>
            <div className="text-xs text-slate-300 mt-1">
              Uncapped $0-Fee Cashback Floor
            </div>
          </div>
        </div>
      </section>

      {/* Tier 2 Photo Guides with Circular Medallions (Inspired by Prosperum) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-[#9A6F22] mb-1.5">
              Featured Briefings
            </div>
            <h2 className="font-serif text-3xl font-semibold text-[#0B192C]">
              Essential Credit &amp; Travel Guides
            </h2>
          </div>
          <Link
            to="/journal"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E4E7EC] bg-white text-xs font-semibold text-[#0B192C] hover:border-[#C49645] transition-colors whitespace-nowrap shrink-0"
          >
            <span>View All {articles.length} Articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {secondaryArticles.map((article, idx) => {
            const Icon = PILLAR_ICONS[article.category];
            return (
              <article
                key={article.slug}
                className="card-elevated overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="relative">
                    <Link to={`/article/${article.slug}`} className="block overflow-hidden">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        referrerPolicy="no-referrer"
                        className="w-full aspect-[16/10] object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    </Link>
                    {/* Overlapping Circular Medallion Badge */}
                    <div
                      className={`absolute -bottom-5 right-5 w-11 h-11 rounded-full flex items-center justify-center shadow-md border-2 border-white ${
                        idx === 1
                          ? 'bg-[#C49645] text-[#0B192C]'
                          : 'bg-[#0B192C] text-[#E5C17B]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-6 pt-8">
                    <div className="flex items-center gap-2 text-xs text-[#475569]">
                      <Link
                        to={`/category/${article.category}`}
                        className="font-semibold text-[#9A6F22] hover:underline"
                      >
                        {article.categoryLabel}
                      </Link>
                      <span aria-hidden="true">·</span>
                      <span>{article.readTimeMinutes} min read</span>
                    </div>
                    <h3 className="mt-2.5 font-serif text-xl font-semibold text-[#0B192C] leading-snug group-hover:text-[#9A6F22] transition-colors">
                      <Link to={`/article/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <p className="mt-2.5 text-sm text-[#475569] leading-relaxed line-clamp-2">
                      {article.deck}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-[#F1F5F9]">
                  <span className="text-xs text-[#475569]">{article.author}</span>
                  <Link
                    to={`/article/${article.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#C49645] hover:bg-[#B38637] transition-colors"
                  >
                    <span>Read Guide</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* Tier 3: Spacious 3-Card Additional Research Row */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {briefingArticles.map((article) => (
            <article
              key={article.slug}
              className="card-elevated p-6 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-[#475569]">
                  <Link
                    to={`/category/${article.category}`}
                    className="font-semibold text-[#9A6F22] hover:underline"
                  >
                    {article.categoryLabel}
                  </Link>
                  <span aria-hidden="true">·</span>
                  <span>{article.readTimeMinutes} min read</span>
                </div>
                <h4 className="mt-2.5 font-serif text-lg font-semibold text-[#0B192C] leading-snug group-hover:text-[#9A6F22] transition-colors">
                  <Link to={`/article/${article.slug}`}>{article.title}</Link>
                </h4>
                <p className="mt-2 text-sm text-[#475569] leading-relaxed line-clamp-2">
                  {article.deck}
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                <span className="text-[#475569]">{article.publishedAt}</span>
                <Link
                  to={`/article/${article.slug}`}
                  className="inline-flex items-center gap-1 font-semibold text-[#0B192C] group-hover:text-[#9A6F22]"
                >
                  <span>Read Briefing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Card Archetype Comparison Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col items-start gap-5 mb-8">
          <div>
            <div className="text-xs font-semibold text-[#9A6F22] mb-1.5">
              Issuer-Neutral Matrix
            </div>
            <h2 className="font-serif text-3xl font-semibold text-[#0B192C]">
              Card Archetype Comparison
            </h2>
            <p className="text-sm text-[#475569] mt-1.5 max-w-2xl">
              Evaluate credit card structures strictly on promotional APR windows, fee break-evens, and points flexibility—without named bank bias.
            </p>
          </div>

          <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-white border border-[#E4E7EC] rounded-xl">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setArchetypeFilter(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  archetypeFilter === tab.id
                    ? 'bg-[#0B192C] text-white'
                    : 'text-[#475569] hover:text-[#0B192C]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {visibleArchetypes.map((item) => (
            <div
              key={item.id}
              className="card-elevated p-5 sm:p-6 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#0B192C]">
                  {item.name}
                </h3>
                <p className="mt-2 text-sm text-[#475569] leading-relaxed">
                  {item.coreMechanism}
                </p>

                <dl className="mt-4 pt-3.5 border-t border-[#F1F5F9] grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <dt className="text-[#475569]">Typical Annual Fee</dt>
                    <dd className="font-mono font-semibold text-[#0B192C] tabular-nums mt-0.5">
                      {item.typicalAnnualFee}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#475569]">Standard APR Profile</dt>
                    <dd className="font-mono font-semibold text-[#0B192C] tabular-nums mt-0.5">
                      {item.typicalAprRange}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-4 pt-3.5 border-t border-[#F1F5F9] flex items-center justify-between">
                <Link
                  to={`/article/${item.guideSlug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B192C] hover:text-[#9A6F22]"
                >
                  <span>Read Strategy Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/tools"
                  className="text-xs font-medium text-[#475569] hover:text-[#0B192C]"
                >
                  Model Numbers
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Valuation Index Preview + Calculators Split */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 card-elevated overflow-hidden flex flex-col">
            <div className="p-6 pb-4 border-b border-[#E4E7EC] flex items-baseline justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#0B192C]">
                  Monthly Points &amp; Miles Valuations
                </h2>
                <p className="text-xs text-[#475569] mt-1">
                  Editorial cents-per-point (CPP) benchmarks across program tiers.
                </p>
              </div>
              <Link
                to="/valuations"
                className="text-xs font-semibold text-[#9A6F22] hover:underline whitespace-nowrap shrink-0"
              >
                Full Index
              </Link>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E4E7EC] text-xs text-[#475569] bg-[#F7F8FA]">
                    <th className="py-3 px-5 font-medium">Program Archetype</th>
                    <th className="py-3 px-4 font-medium text-right">Baseline</th>
                    <th className="py-3 px-4 font-medium text-right">Sweet Spot</th>
                    <th className="py-3 px-5 font-medium text-right">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-sm">
                  {VALUATION_INDEX.slice(0, 5).map((entry) => (
                    <tr key={entry.id} className="hover:bg-[#F7F8FA]">
                      <td className="py-3.5 px-5 font-medium text-[#0B192C]">
                        {entry.programArchetype}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-right tabular-nums text-[#0B192C]">
                        {entry.baselineCpp.toFixed(2)}¢
                      </td>
                      <td className="py-3.5 px-4 font-mono text-right tabular-nums text-[#9A6F22] font-semibold">
                        {entry.sweetSpotCpp.toFixed(2)}¢
                      </td>
                      <td className="py-3.5 px-5 text-right text-xs text-[#475569]">
                        {entry.trend}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-5 card-elevated p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-[#9A6F22]">
                Analytical Suite
              </div>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-[#0B192C]">
                Precision Financial Calculators
              </h2>
              <p className="mt-2 text-sm text-[#475569] leading-relaxed">
                Run exact math before transferring a balance, applying for a new line, or moving points to a travel partner.
              </p>

              <ul className="mt-6 space-y-3 border-t border-[#E4E7EC] pt-5 text-sm">
                <li className="flex items-center justify-between py-1">
                  <span className="font-medium text-[#0B192C]">0% APR Balance Transfer Planner</span>
                  <Link to="/tools?tool=zero-apr" className="text-xs font-semibold text-[#9A6F22] hover:underline">
                    Launch
                  </Link>
                </li>
                <li className="flex items-center justify-between py-1">
                  <span className="font-medium text-[#0B192C]">Points &amp; Miles CPP Calculator</span>
                  <Link to="/tools?tool=valuations" className="text-xs font-semibold text-[#9A6F22] hover:underline">
                    Launch
                  </Link>
                </li>
                <li className="flex items-center justify-between py-1">
                  <span className="font-medium text-[#0B192C]">Credit Utilization Simulator</span>
                  <Link to="/tools?tool=utilization" className="text-xs font-semibold text-[#9A6F22] hover:underline">
                    Launch
                  </Link>
                </li>
                <li className="flex items-center justify-between py-1">
                  <span className="font-medium text-[#0B192C]">Annual Fee Break-Even Optimizer</span>
                  <Link to="/tools?tool=optimizer" className="text-xs font-semibold text-[#9A6F22] hover:underline">
                    Launch
                  </Link>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link
                to="/tools"
                className="block w-full text-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#0B192C] hover:bg-[#132844] transition-colors"
              >
                Open All Four Calculators
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How Our Framework Works + Dark Navy Briefing Form Split (Inspired by Prosperum) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-6 py-4 flex flex-col justify-center">
            <div className="text-xs font-semibold text-[#9A6F22] mb-2">
              Our Editorial Method
            </div>
            <h2 className="font-serif text-3xl font-semibold text-[#0B192C]">
              How We Research &amp; Verify Every Guide
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#475569] leading-relaxed max-w-xl">
              Every publication dispatch passes through quantitative verification and issuer-neutral compliance checks before reaching readers.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="w-11 h-11 rounded-full bg-[#0B192C]/10 text-[#0B192C] flex items-center justify-center font-mono text-sm font-semibold">
                  01
                </div>
                <h3 className="mt-3 font-serif text-base font-semibold text-[#0B192C]">
                  Baseline Audit
                </h3>
                <p className="mt-1.5 text-xs text-[#475569] leading-relaxed">
                  Benchmark current APR norms, credit bureau weights, and program award tables.
                </p>
              </div>
              <div>
                <div className="w-11 h-11 rounded-full bg-[#C49645]/20 text-[#9A6F22] flex items-center justify-center font-mono text-sm font-semibold">
                  02
                </div>
                <h3 className="mt-3 font-serif text-base font-semibold text-[#0B192C]">
                  Fee &amp; Yield Math
                </h3>
                <p className="mt-1.5 text-xs text-[#475569] leading-relaxed">
                  Model realistic household budgets net of annual fees, transfer charges, and taxes.
                </p>
              </div>
              <div>
                <div className="w-11 h-11 rounded-full bg-[#0B192C] text-[#E5C17B] flex items-center justify-center font-mono text-sm font-semibold">
                  03
                </div>
                <h3 className="mt-3 font-serif text-base font-semibold text-[#0B192C]">
                  Compliance Gate
                </h3>
                <p className="mt-1.5 text-xs text-[#475569] leading-relaxed">
                  Audit copy automatically to eliminate specific bank, issuer, or card trademarks.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#0B192C] text-white rounded-2xl p-8 sm:p-10 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
                Subscribe to the Weekly MyPointsPro Briefing
              </h2>
              <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
                Receive Friday dispatches covering updated points valuations, 0% APR benchmarks, and consumer credit strategies.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="mt-6 space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  aria-label="Email address"
                  className="px-4 py-3 rounded-lg text-sm bg-[#132844] border border-white/15 text-white placeholder:text-slate-400"
                />
                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  aria-label="Primary topic focus"
                  className="px-4 py-3 rounded-lg text-sm bg-[#132844] border border-white/15 text-white"
                >
                  <option>0% APR &amp; Credit Strategy</option>
                  <option>Points &amp; Miles Valuations</option>
                  <option>Cashback Optimization</option>
                  <option>All Topics</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <button
                  type="submit"
                  disabled={subStatus.type === 'submitting'}
                  className="px-6 py-3 rounded-lg text-sm font-semibold text-[#0B192C] bg-[#C49645] hover:bg-[#D5A756] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {subStatus.type === 'submitting' ? 'Confirming...' : 'Subscribe Now'}
                </button>

                {subStatus.message && (
                  <p
                    role="status"
                    className={`text-xs font-medium ${
                      subStatus.type === 'error' ? 'text-amber-300' : 'text-[#E5C17B]'
                    }`}
                  >
                    {subStatus.message}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Full-Width Dark Navy CTA Banner (Inspired by FinanceCo & Veridian) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-[#10233D] text-white rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10 shadow-lg">
          <div className="max-w-xl">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
              Ready to Automate Continuous Financial Research?
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Launch the Editorial Studio to research live industry benchmarks, draft humanized articles, and audit compliance automatically.
            </p>
          </div>
          <Link
            to="/studio"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold text-[#0B192C] bg-[#C49645] hover:bg-[#D5A756] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Open Editorial Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
