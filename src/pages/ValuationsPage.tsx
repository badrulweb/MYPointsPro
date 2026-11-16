import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import { VALUATION_INDEX } from '../data/seedPublication';
import { Link } from '../lib/router';
import { ValuationEntry } from '../types/publication';

type TierFilter = 'All' | ValuationEntry['tier'];

export function ValuationsPage() {
  const [tier, setTier] = useState<TierFilter>('All');
  const [sortBy, setSortBy] = useState<'baseline' | 'sweet'>('baseline');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  const filtered = VALUATION_INDEX.filter((item) =>
    tier === 'All' ? true : item.tier === tier
  ).sort((a, b) => {
    const valA = sortBy === 'baseline' ? a.baselineCpp : a.sweetSpotCpp;
    const valB = sortBy === 'baseline' ? b.baselineCpp : b.sweetSpotCpp;
    return sortDir === 'desc' ? valB - valA : valA - valB;
  });

  function toggleSort(col: 'baseline' | 'sweet') {
    if (sortBy === col) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
      <div className="pb-8 border-b border-[#E4E7EC]">
        <div className="text-xs font-semibold text-[#9A6F22] mb-2">
          November 2026 Valuation Index
        </div>
        <h1
          className="font-serif font-semibold text-[#0B192C]"
          style={{ fontSize: 'clamp(2rem, 3.4vw, 2.85rem)' }}
        >
          Points &amp; Miles Valuation Index
        </h1>
        <p className="mt-3 text-base text-[#475569] max-w-2xl leading-relaxed">
          Monthly cents-per-point (CPP) benchmarks across loyalty program archetypes. Baseline figures reflect realistic economy and mid-tier redemptions; sweet spots measure verified partner award-chart ceilings.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex flex-wrap gap-1 p-1 bg-white border border-[#E4E7EC] rounded-xl">
            {(['All', 'Transferable', 'Airline', 'Hotel', 'Fixed Cashback'] as TierFilter[]).map(
              (t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    tier === t
                      ? 'bg-[#0B192C] text-white'
                      : 'text-[#475569] hover:text-[#0B192C]'
                  }`}
                >
                  {t}
                </button>
              )
            )}
          </div>

          <Link
            to="/tools?tool=valuations"
            className="text-xs font-semibold text-[#9A6F22] hover:underline"
          >
            Test Your Own Redemption in CPP Calculator
          </Link>
        </div>
      </div>

      <div className="mt-8 card-elevated overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E4E7EC] bg-[#0B192C] text-xs text-slate-300">
              <th className="py-4 px-5 font-medium">Program Archetype</th>
              <th className="py-4 px-4 font-medium">Category</th>
              <th className="py-4 px-4 font-medium text-right">
                <button
                  type="button"
                  onClick={() => toggleSort('baseline')}
                  className="inline-flex items-center gap-1 font-medium text-white cursor-pointer"
                >
                  <span>Baseline CPP</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#E5C17B]" />
                </button>
              </th>
              <th className="py-4 px-4 font-medium text-right">
                <button
                  type="button"
                  onClick={() => toggleSort('sweet')}
                  className="inline-flex items-center gap-1 font-medium text-white cursor-pointer"
                >
                  <span>Sweet-Spot CPP</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#E5C17B]" />
                </button>
              </th>
              <th className="py-4 px-4 font-medium">Flexibility</th>
              <th className="py-4 px-4 font-medium">Trend</th>
              <th className="py-4 px-5 font-medium">Editorial Commentary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9] text-sm">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-[#F7F8FA] align-top">
                <td className="py-4 px-5 font-medium text-[#0B192C]">
                  {row.programArchetype}
                </td>
                <td className="py-4 px-4 text-xs text-[#475569] whitespace-nowrap">
                  {row.tier}
                </td>
                <td className="py-4 px-4 font-mono text-right tabular-nums font-medium text-[#0B192C]">
                  {row.baselineCpp.toFixed(2)}¢
                </td>
                <td className="py-4 px-4 font-mono text-right tabular-nums font-semibold text-[#9A6F22]">
                  {row.sweetSpotCpp.toFixed(2)}¢
                </td>
                <td className="py-4 px-4 text-xs text-[#475569]">{row.flexibility}</td>
                <td className="py-4 px-4 text-xs font-medium text-[#0B192C]">
                  {row.trend}
                </td>
                <td className="py-4 px-5 text-xs text-[#475569] leading-relaxed max-w-md">
                  {row.analystNote}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-[#E4E7EC]">
        <div>
          <h2 className="font-serif text-xl font-semibold text-[#0B192C]">
            How We Calculate Program Valuations
          </h2>
          <p className="mt-2.5 text-sm text-[#475569] leading-relaxed">
            Every valuation applies a conservative replacement-cost formula: (Realistic Cash Fare − Award Taxes &amp; Carrier Fees) ÷ Points Required. We exclude ultra-rare aspirational first-class tickets that most travelers cannot book reliably, weighting baseline averages toward real-world economy, domestic peak, and business-saver availability.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-[#0B192C]">
            Related Loyalty Guides
          </h2>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li>
              <Link
                to="/article/transferable-points-versus-fixed-portals"
                className="text-[#9A6F22] font-semibold hover:underline"
              >
                Transferable Points vs. Fixed Travel Portals: Measuring Cents Per Point
              </Link>
            </li>
            <li>
              <Link
                to="/article/award-sweet-spots-and-devaluation-hedging"
                className="text-[#9A6F22] font-semibold hover:underline"
              >
                Hedging Against Loyalty Devaluations: Why Earn-and-Burn Beats Hoarding
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
