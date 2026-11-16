import { Link } from '../lib/router';

export type LegalDocType =
  | 'advertiser-disclosure'
  | 'editorial-policy'
  | 'privacy-policy'
  | 'terms';

interface LegalContent {
  kicker: string;
  title: string;
  updatedAt: string;
  lead: string;
  sections: { heading: string; body: string[] }[];
}

const LEGAL_DOCS: Record<LegalDocType, LegalContent> = {
  'advertiser-disclosure': {
    kicker: 'Compliance & Partnerships',
    title: 'Advertiser & Affiliate Disclosure',
    updatedAt: 'November 15, 2026',
    lead: 'Transparency regarding editorial independence, future affiliate network relationships, and how content is funded at MyPointsPro.',
    sections: [
      {
        heading: '1. Editorial Independence & Separation',
        body: [
          'MyPointsPro is an independent financial education publication. Our editorial analysis, calculator models, credit score frameworks, and points valuation tables are authored without commercial influence.',
          'At present, our educational guides and archetype tables operate strictly on an issuer-neutral basis and do not promote or name specific banks, lenders, or proprietary credit card products.',
        ],
      },
      {
        heading: '2. Future Affiliate & Network Relationships',
        body: [
          'As MyPointsPro establishes compliant partnerships with financial affiliate networks and consumer credit marketplaces, certain clearly labeled links or comparison modules may generate referral compensation if a reader chooses to explore an external offer.',
          'Compensation, if and when introduced, will never dictate our mathematical valuations, credit score education, or editorial conclusions. Any compensated placement will be explicitly labeled in accordance with Federal Trade Commission (FTC) endorsement guidelines.',
        ],
      },
      {
        heading: '3. Accuracy of Terms & Rates',
        body: [
          'All annual percentage rate (APR) ranges, balance transfer fee percentages, and loyalty redemption benchmarks published on this site represent typical industry ranges for educational modeling. Consumers should always verify final terms directly in official Truth in Lending disclosures prior to opening any financial account.',
        ],
      },
    ],
  },
  'editorial-policy': {
    kicker: 'Journalistic Governance',
    title: 'Editorial Standards & AI Transparency Policy',
    updatedAt: 'November 15, 2026',
    lead: 'Our standards for human editorial oversight, fact-checking, live search grounding, and automated content auditing.',
    sections: [
      {
        heading: '1. Fact Verification & Mathematical Rigor',
        body: [
          'Every financial scenario published on MyPointsPro—including amortization calculations, credit utilization timing rules, and cents-per-point award formulas—is structured around verifiable arithmetic. Where industry figures fluctuate, we cite conservative ranges rather than outlier promotional claims.',
        ],
      },
      {
        heading: '2. Responsible AI-Assisted Publishing',
        body: [
          'MyPointsPro utilizes an internal AI editorial pipeline to continuously research consumer credit benchmarks, structure educational outlines, and draft humanized guides. Articles produced through our automated publishing workflow are clearly marked as AI-Assisted Research Editions and pass through automated compliance screening before publication.',
        ],
      },
      {
        heading: '3. Issuer-Neutral Compliance Enforcement',
        body: [
          'To maintain regulatory clarity and prevent unintended product solicitation, all automated and staff-authored copy undergoes deterministic screening prohibiting the inclusion of named banks, card issuers, or branded card trademarks.',
        ],
      },
    ],
  },
  'privacy-policy': {
    kicker: 'Data Stewardship',
    title: 'Privacy Policy',
    updatedAt: 'November 15, 2026',
    lead: 'How MyPointsPro handles newsletter subscriptions, interactive calculator inputs, and reader privacy.',
    sections: [
      {
        heading: '1. Calculator & Simulator Privacy',
        body: [
          'All financial inputs entered into our interactive calculators—including revolving balances, APR assumptions, household spending categories, and credit line limits—are processed locally in your browser session. MyPointsPro does not collect, store, or transmit your personal debt balances or credit limits to external credit bureaus.',
        ],
      },
      {
        heading: '2. Briefing Email Subscriptions',
        body: [
          'If you voluntarily subscribe to The Weekly MyPointsPro Briefing, we store only your submitted email address and selected topic interest for the sole purpose of delivering editorial digests. We never sell, rent, or broker reader email lists to third-party lead aggregators.',
        ],
      },
      {
        heading: '3. Cookies & Essential Storage',
        body: [
          'MyPointsPro avoids intrusive behavioral tracking networks. Essential technical logs may record aggregate page availability and server health to maintain reliable publication delivery.',
        ],
      },
    ],
  },
  terms: {
    kicker: 'Legal Notice',
    title: 'Terms of Use & Financial Disclaimer',
    updatedAt: 'November 15, 2026',
    lead: 'Governing terms for accessing MyPointsPro educational guides, valuation tables, and analytical calculators.',
    sections: [
      {
        heading: '1. Educational & Informational Purpose Only',
        body: [
          'All content, calculators, charts, and valuation benchmarks on MyPointsPro are published strictly for general financial education and informational modeling. Nothing on this website constitutes personalized financial, legal, credit repair, or tax advice.',
        ],
      },
      {
        heading: '2. No Fiduciary or Advisory Relationship',
        body: [
          'Using our calculators or reading our editorial publications does not create an advisor-client relationship. Individual credit eligibility, approval odds, and borrowing costs depend on each consumer’s complete credit profile and lender underwriting criteria.',
        ],
      },
      {
        heading: '3. Limitation of Liability',
        body: [
          'While MyPointsPro strives to keep all educational formulas and benchmark tables current, we provide this publication on an "as-is" basis without warranties of any kind. Readers assume full responsibility for verifying financial decisions with qualified professionals or official account disclosures.',
        ],
      },
    ],
  },
};

export function LegalPage({ docType }: { docType: LegalDocType }) {
  const doc = LEGAL_DOCS[docType];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
      <div className="pb-8 border-b border-[#E4E7EC]">
        <div className="flex items-center gap-2 text-xs text-[#475569] mb-3">
          <span className="font-semibold text-[#9A6F22]">{doc.kicker}</span>
          <span aria-hidden="true">·</span>
          <span>Last Updated: {doc.updatedAt}</span>
        </div>
        <h1
          className="font-serif font-semibold text-[#0B192C] leading-tight"
          style={{ fontSize: 'clamp(2rem, 3.4vw, 2.75rem)' }}
        >
          {doc.title}
        </h1>
        <p className="mt-3 text-base text-[#475569] leading-relaxed">{doc.lead}</p>
      </div>

      <div className="mt-10 space-y-6 text-[15px] text-[#1E293B] leading-[1.78]">
        {doc.sections.map((sec) => (
          <section key={sec.heading} className="card-elevated p-6 sm:p-8">
            <h2 className="font-serif text-xl font-semibold text-[#0B192C] mb-3">
              {sec.heading}
            </h2>
            <div className="space-y-3">
              {sec.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-[#E4E7EC] flex flex-wrap gap-5 text-xs font-medium text-[#475569]">
        <Link to="/legal/advertiser-disclosure" className="hover:text-[#0B192C]">
          Advertiser Disclosure
        </Link>
        <Link to="/legal/editorial-policy" className="hover:text-[#0B192C]">
          Editorial &amp; AI Policy
        </Link>
        <Link to="/legal/privacy-policy" className="hover:text-[#0B192C]">
          Privacy Policy
        </Link>
        <Link to="/legal/terms" className="hover:text-[#0B192C]">
          Terms of Use
        </Link>
      </div>
    </div>
  );
}
