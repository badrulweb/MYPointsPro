import { ArrowLeft, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';
import { ArticleChart } from '../components/ArticleChart';
import { EditorialImage } from '../components/EditorialImage';
import { Link } from '../lib/router';
import { Article } from '../types/publication';

interface ArticleDetailPageProps {
  slug: string;
  articles: Article[];
}

export function ArticleDetailPage({ slug, articles }: ArticleDetailPageProps) {
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[#0B192C]">
          Article Not Found
        </h1>
        <p className="mt-3 text-sm text-[#475569]">
          The requested publication record could not be located in our archive.
        </p>
        <Link
          to="/journal"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#0B192C]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Journal</span>
        </Link>
      </div>
    );
  }

  const relatedArticles = articles
    .filter(
      (a) =>
        a.slug !== article.slug &&
        (article.relatedSlugs.includes(a.slug) || a.category === article.category)
    )
    .slice(0, 3);

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-[#475569] mb-6">
        <Link to="/" className="hover:text-[#0B192C]">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/category/${article.category}`} className="hover:text-[#0B192C]">
          {article.categoryLabel}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#0B192C] truncate max-w-xs">{article.title}</span>
      </div>

      {/* Article Header */}
      <header className="max-w-4xl pb-8 border-b border-[#E4E7EC]">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#475569] mb-4">
          <Link
            to={`/category/${article.category}`}
            className="font-semibold text-[#9A6F22] hover:underline"
          >
            {article.categoryLabel}
          </Link>
          <span aria-hidden="true">·</span>
          <span>{article.publishedAt}</span>
          <span aria-hidden="true">·</span>
          <span>{article.readTimeMinutes} min read</span>
          {article.isAiAutomated && (
            <>
              <span aria-hidden="true">·</span>
              <span>AI-Assisted Research Edition</span>
            </>
          )}
        </div>

        <h1
          className="font-serif font-semibold text-[#0B192C] leading-[1.1]"
          style={{ fontSize: 'clamp(2rem, 3.8vw, 3.25rem)' }}
        >
          {article.title}
        </h1>

        <p className="mt-4 text-lg text-[#475569] leading-relaxed">
          {article.deck}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[#475569]">
          <div>
            By <span className="font-semibold text-[#0B192C]">{article.author}</span>
            <span aria-hidden="true"> · </span>
            <span>{article.authorRole}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[#0B192C] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#C49645]" />
            <span>Issuer-Neutral Compliance Audited</span>
          </div>
        </div>
      </header>

      {/* Asymmetric 70 / 30 Reading Canvas */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Main Essay Body */}
        <div className="lg:col-span-8 max-w-2xl">
          <EditorialImage
            src={article.imageUrl}
            alt={article.title}
            caption={article.imageCaption}
            aspectClass="aspect-[16/10]"
            className="mb-10"
          />

          {/* Pull Quote (Clean Top/Bottom Hairlines) */}
          {article.pullQuote && (
            <blockquote className="my-10 py-6 border-y border-[#E4E7EC] font-serif italic text-2xl text-[#0B192C] leading-snug">
              “{article.pullQuote}”
            </blockquote>
          )}

          {/* Sections */}
          <div className="space-y-10">
            {article.sections.map((section, sIdx) => (
              <section key={sIdx} id={`section-${sIdx}`} className="scroll-mt-24">
                <h2 className="font-serif text-2xl font-semibold text-[#0B192C] mb-4">
                  {section.heading}
                </h2>
                <div className="space-y-4 text-[16px] text-[#1E293B] leading-[1.78]">
                  {section.paragraphs.map((para, pIdx) => (
                    <p
                      key={pIdx}
                      className={
                        sIdx === 0 && pIdx === 0
                          ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-[#0B192C]'
                          : ''
                      }
                    >
                      {para}
                    </p>
                  ))}
                </div>

                {section.calloutTitle && section.calloutBody && (
                  <div className="mt-6 p-6 bg-white border border-[#E4E7EC] rounded-xl shadow-xs">
                    <div className="text-xs font-semibold text-[#9A6F22]">
                      {section.calloutTitle}
                    </div>
                    <p className="mt-2 text-sm text-[#475569] leading-relaxed">
                      {section.calloutBody}
                    </p>
                  </div>
                )}

                {sIdx === 0 && article.chartData && (
                  <ArticleChart chart={article.chartData} />
                )}
              </section>
            ))}
          </div>

          {/* Grounding Sources */}
          {article.groundingSources && article.groundingSources.length > 0 && (
            <div className="mt-12 pt-6 border-t border-[#E4E7EC]">
              <h3 className="text-xs font-semibold text-[#0B192C] mb-3">
                Research Reference Sources
              </h3>
              <ul className="space-y-2 text-xs text-[#475569]">
                {article.groundingSources.map((src, idx) => (
                  <li key={idx}>
                    <a
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#9A6F22] font-medium hover:underline"
                    >
                      <span>{src.title}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom Advertiser & Editorial Notice */}
          <div className="mt-12 p-5 rounded-xl bg-white border border-[#E4E7EC] text-xs text-[#475569] leading-relaxed">
            <strong className="text-[#0B192C]">Editorial Compliance Note:</strong> This guide is authored under our issuer-neutral educational charter. No bank, card issuer, or proprietary credit card product is promoted or named. Review our{' '}
            <Link to="/legal/advertiser-disclosure" className="underline text-[#0B192C]">
              Advertiser Disclosure
            </Link>{' '}
            and{' '}
            <Link to="/legal/editorial-policy" className="underline text-[#0B192C]">
              Editorial Standards
            </Link>
            .
          </div>
        </div>

        {/* Sticky Margin Rail */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          {/* Key Takeaways (Midnight Navy Card) */}
          <div className="bg-[#0B192C] text-white rounded-2xl p-6 shadow-md">
            <h3 className="text-xs font-semibold text-[#E5C17B] mb-3">
              Key Takeaways
            </h3>
            <ul className="space-y-3 text-sm text-slate-200 leading-relaxed">
              {article.keyTakeaways.map((point, idx) => (
                <li key={idx} className="pb-3 border-b border-white/10 last:border-b-0 last:pb-0">
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Section Outline */}
          <div className="card-elevated p-6">
            <h3 className="text-xs font-semibold text-[#475569] mb-3">
              In This Guide
            </h3>
            <ol className="space-y-2 text-sm">
              {article.sections.map((sec, idx) => (
                <li key={idx}>
                  <a
                    href={`#section-${idx}`}
                    className="text-[#475569] hover:text-[#0B192C] transition-colors"
                  >
                    0{idx + 1}. {sec.heading}
                  </a>
                </li>
              ))}
            </ol>
          </div>

          {/* Internal Cross-Linking */}
          <div className="card-elevated p-6">
            <h3 className="text-xs font-semibold text-[#475569] mb-4">
              Related Guides
            </h3>
            <div className="space-y-4">
              {relatedArticles.map((rel) => (
                <div key={rel.slug} className="pb-3 border-b border-[#F1F5F9] last:border-b-0 last:pb-0">
                  <div className="text-xs text-[#9A6F22] font-semibold">
                    {rel.categoryLabel}
                  </div>
                  <Link
                    to={`/article/${rel.slug}`}
                    className="mt-1 block font-serif text-base font-semibold text-[#0B192C] hover:text-[#9A6F22] transition-colors"
                  >
                    {rel.title}
                  </Link>
                </div>
              ))}
            </div>
            <Link
              to="/tools"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B192C] hover:text-[#9A6F22]"
            >
              <span>Run Strategy Calculators</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>
      </div>
    </article>
  );
}
