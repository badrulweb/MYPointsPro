import { ArrowRight } from 'lucide-react';
import { Link } from '../lib/router';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
      <div className="pb-8 border-b border-[#E4E7EC]">
        <div className="text-xs font-semibold text-[#9A6F22] mb-2">
          Editorial Charter &amp; Methodology
        </div>
        <h1
          className="font-serif font-semibold text-[#0B192C] leading-tight"
          style={{ fontSize: 'clamp(2rem, 3.4vw, 2.85rem)' }}
        >
          How MyPointsPro Evaluates Credit &amp; Travel Value
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#475569] leading-relaxed">
          Our publication is engineered for mathematical transparency. Every guide, valuation benchmark, and archetype comparison rests on verifiable consumer arithmetic rather than promotional headlines.
        </p>
      </div>

      <div className="mt-10 space-y-10 text-[16px] text-[#1E293B] leading-[1.78]">
        <section>
          <h2 className="font-serif text-2xl font-semibold text-[#0B192C] mb-3">
            01. Issuer-Neutral Educational Mandate
          </h2>
          <p>
            Unlike traditional comparison portals that lead with branded affiliate cards, MyPointsPro operates under an issuer-neutral educational standard. Across our guides, valuation tables, and analytical calculators, we analyze card archetypes—such as long-window 0% APR balance transfer accounts, graduating secured lines, 2% flat-rate cashback vehicles, and Tier-1 transferable points ecosystems—without naming specific banks or proprietary card trademarks.
          </p>
          <p className="mt-4">
            This structural separation ensures readers master the underlying financial mechanics—grace periods, statement closing dates, transfer fee break-evens, and cents-per-point yield—before evaluating any future commercial offer.
          </p>
        </section>

        <section className="pt-8 border-t border-[#E4E7EC]">
          <h2 className="font-serif text-2xl font-semibold text-[#0B192C] mb-3">
            02. Quantitative Valuation Rubric
          </h2>
          <p>
            Our monthly Points &amp; Miles Valuation Index applies three strict constraints:
          </p>
          <ul className="mt-4 space-y-3 text-sm text-[#475569]">
            <li className="p-5 card-elevated">
              <strong className="text-[#0B192C]">Realistic Replacement Value:</strong> We benchmark points against the lowest reasonable cash price a disciplined traveler would actually purchase, never inflated retail rack rates.
            </li>
            <li className="p-5 card-elevated">
              <strong className="text-[#0B192C]">Net of Taxes &amp; Surcharges:</strong> Carrier-imposed fuel surcharges and government award fees are deducted directly from cash ticket value before computing cents-per-point yield.
            </li>
            <li className="p-5 card-elevated">
              <strong className="text-[#0B192C]">Opportunity Cost Accounting:</strong> Every annual-fee card archetype is measured against an uncapped $0-fee 2% cashback floor rather than against zero rewards.
            </li>
          </ul>
        </section>

        <section className="pt-8 border-t border-[#E4E7EC]">
          <h2 className="font-serif text-2xl font-semibold text-[#0B192C] mb-3">
            03. AI-Assisted Research &amp; Humanization Standards
          </h2>
          <p>
            To maintain continuous coverage across evolving credit utilization guidelines, APR averages, and loyalty chart adjustments, MyPointsPro pairs editorial oversight with an automated multi-stage research pipeline. Every automated dispatch undergoes live search grounding, structured internal cross-linking, humanized journalistic drafting, and an automated issuer-neutrality audit prior to publication.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-[#E4E7EC] flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/legal/advertiser-disclosure"
          className="text-sm font-semibold text-[#9A6F22] hover:underline"
        >
          Read Full Advertiser &amp; Affiliate Disclosure
        </Link>
        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 px-5 py-3 rounded-lg text-sm font-semibold text-[#0B192C] bg-[#C49645] hover:bg-[#D5A756]"
        >
          <span>Explore Financial Calculators</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
