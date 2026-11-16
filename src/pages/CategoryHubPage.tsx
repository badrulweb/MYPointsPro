import { ArrowRight, Calculator } from 'lucide-react';
import { EditorialImage } from '../components/EditorialImage';
import { CARD_ARCHETYPES, CATEGORY_HUBS } from '../data/seedPublication';
import { Link } from '../lib/router';
import { Article, CategorySlug } from '../types/publication';

interface CategoryHubPageProps {
  slug: CategorySlug;
  articles: Article[];
}

export function CategoryHubPage({ slug, articles }: CategoryHubPageProps) {
  const hub = CATEGORY_HUBS[slug];
  const categoryArticles = articles.filter((a) => a.category === slug);
  const categoryArchetypes = CARD_ARCHETYPES.filter((c) => c.category === slug);
  const otherCategories = (Object.keys(CATEGORY_HUBS) as CategorySlug[]).filter(
    (k) => k !== slug
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#475569] mb-6">
        <Link to="/" className="hover:text-[#0B192C]">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#0B192C] font-medium">{hub.title}</span>
      </div>

      {/* Category Hero Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch pb-10 border-b border-[#E4E7EC]">
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-[#9A6F22] mb-3">
              {hub.kicker}
            </div>
            <h1
              className="font-serif font-semibold text-[#0B192C] leading-tight"
              style={{ fontSize: 'clamp(2rem, 3.6vw, 3rem)' }}
            >
              {hub.title}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#475569] leading-relaxed max-w-2xl">
              {hub.summary}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to={`/tools?tool=${hub.recommendedToolId}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-[#0B192C] bg-[#C49645] hover:bg-[#D5A756] transition-colors"
            >
              <Calculator className="w-4 h-4" />
              <span>{hub.recommendedToolLabel}</span>
            </Link>
            <Link
              to="/studio"
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-lg text-sm font-medium border border-[#E4E7EC] bg-white text-[#0B192C] hover:border-[#C49645] transition-colors"
            >
              <span>Auto-Research New {hub.shortTitle} Guide</span>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5">
          <EditorialImage
            src={hub.heroImage}
            alt={hub.title}
            aspectClass="aspect-[4/3]"
          />
        </div>
      </div>

      {/* Category Key Benchmarks (Navy Strip) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 rounded-2xl bg-[#0B192C] text-white divide-y md:divide-y-0 md:divide-x divide-white/15 shadow-md">
        {hub.keyMetrics.map((metric) => (
          <div key={metric.label} className="p-6">
            <div className="text-xs text-slate-300">{metric.label}</div>
            <div className="font-mono text-2xl font-semibold text-[#E5C17B] tabular-nums mt-1">
              {metric.value}
            </div>
            <div className="text-xs text-slate-400 mt-1">{metric.context}</div>
          </div>
        ))}
      </div>

      {/* Published Guides in Category */}
      <section className="mt-14">
        <h2 className="font-serif text-2xl font-semibold text-[#0B192C] mb-6">
          Published Guides &amp; Analysis ({categoryArticles.length})
        </h2>

        {categoryArticles.length === 0 ? (
          <div className="p-8 bg-white border border-[#E4E7EC] rounded-xl text-sm text-[#475569]">
            No guides published in this section yet. Generate one in the{' '}
            <Link to="/studio" className="text-[#9A6F22] font-semibold underline">
              AI Editorial Studio
            </Link>
            .
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryArticles.map((article) => (
              <article key={article.slug} className="card-elevated p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#475569]">
                    <span>{article.publishedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readTimeMinutes} min read</span>
                  </div>
                  <h3 className="mt-3 font-serif text-xl font-semibold text-[#0B192C] leading-snug hover:text-[#9A6F22] transition-colors">
                    <Link to={`/article/${article.slug}`}>{article.title}</Link>
                  </h3>
                  <p className="mt-2.5 text-sm text-[#475569] leading-relaxed">
                    {article.deck}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                  <span className="text-[#475569]">{article.author}</span>
                  <Link
                    to={`/article/${article.slug}`}
                    className="inline-flex items-center gap-1 font-semibold text-[#0B192C] hover:text-[#9A6F22]"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Relevant Card Archetypes */}
      {categoryArchetypes.length > 0 && (
        <section className="mt-14 pt-10 border-t border-[#E4E7EC]">
          <h2 className="font-serif text-2xl font-semibold text-[#0B192C] mb-6">
            Applicable Card Archetypes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryArchetypes.map((arch) => (
              <div key={arch.id} className="card-elevated p-6">
                <div className="text-xs font-semibold text-[#9A6F22]">
                  Credit Tier: {arch.creditTier}
                </div>
                <h3 className="mt-1.5 font-serif text-xl font-semibold text-[#0B192C]">
                  {arch.name}
                </h3>
                <p className="mt-2 text-sm text-[#475569] leading-relaxed">
                  {arch.idealProfile}
                </p>
                <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex flex-wrap gap-6 text-xs">
                  <div>
                    <span className="text-[#475569]">Annual Fee: </span>
                    <span className="font-mono font-medium text-[#0B192C] tabular-nums">
                      {arch.typicalAnnualFee}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#475569]">APR Profile: </span>
                    <span className="font-mono font-medium text-[#0B192C] tabular-nums">
                      {arch.typicalAprRange}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cross-Category Internal Linking */}
      <section className="mt-14 pt-10 border-t border-[#E4E7EC]">
        <h2 className="font-serif text-xl font-semibold text-[#0B192C] mb-4">
          Continue Across Related Hubs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {otherCategories.map((otherSlug) => {
            const other = CATEGORY_HUBS[otherSlug];
            return (
              <Link
                key={otherSlug}
                to={`/category/${otherSlug}`}
                className="bg-white border border-[#E4E7EC] rounded-xl p-4 hover:border-[#C49645] transition-colors"
              >
                <div className="text-xs text-[#9A6F22] font-semibold">{other.kicker}</div>
                <div className="mt-1 font-serif text-base font-semibold text-[#0B192C]">
                  {other.title}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
