import { Search } from 'lucide-react';
import { useState } from 'react';
import { EditorialImage } from '../components/EditorialImage';
import { Link } from '../lib/router';
import { Article, CategorySlug } from '../types/publication';

interface JournalPageProps {
  articles: Article[];
}

const FILTER_OPTIONS: { id: 'all' | CategorySlug; label: string }[] = [
  { id: 'all', label: 'All Publications' },
  { id: 'zero-apr', label: '0% APR Strategy' },
  { id: 'credit-building', label: 'Credit Building' },
  { id: 'cashback', label: 'Cashback Math' },
  { id: 'points-miles', label: 'Points & Miles' },
  { id: 'travel-rewards', label: 'Travel Perks' },
];

export function JournalPage({ articles }: JournalPageProps) {
  const [category, setCategory] = useState<'all' | CategorySlug>('all');
  const [query, setQuery] = useState('');

  const filtered = articles.filter((a) => {
    const matchCat = category === 'all' || a.category === category;
    const q = query.trim().toLowerCase();
    const matchSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.deck.toLowerCase().includes(q) ||
      a.categoryLabel.toLowerCase().includes(q) ||
      a.author.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
      <div className="pb-8 border-b border-[#E4E7EC]">
        <div className="text-xs font-semibold text-[#9A6F22] mb-2">
          Editorial Archive
        </div>
        <h1
          className="font-serif font-semibold text-[#0B192C]"
          style={{ fontSize: 'clamp(2rem, 3.4vw, 2.85rem)' }}
        >
          The MyPointsPro Journal
        </h1>
        <p className="mt-3 text-base text-[#475569] max-w-2xl">
          Every published guide, credit scoring analysis, and automated research dispatch—audited for issuer-neutral compliance.
        </p>

        <div className="mt-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="inline-flex flex-wrap gap-1 p-1 bg-white border border-[#E4E7EC] rounded-xl">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCategory(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  category === opt.id
                    ? 'bg-[#0B192C] text-white'
                    : 'text-[#475569] hover:text-[#0B192C]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#475569] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search guides, topics, authors..."
              aria-label="Search editorial archive"
              className="w-full pl-9 pr-3.5 py-2 rounded-lg text-sm bg-white border border-[#E4E7EC] text-[#0B192C] placeholder:text-[#475569]"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 p-10 card-elevated text-center">
          <p className="font-serif text-lg text-[#0B192C]">
            No articles match your current filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory('all');
              setQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0B192C] cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((article) => (
            <article key={article.slug} className="card-elevated p-5 group flex flex-col justify-between">
              <div>
                <Link to={`/article/${article.slug}`} className="block">
                  <EditorialImage
                    src={article.imageUrl}
                    alt={article.title}
                    aspectClass="aspect-[4/3]"
                  />
                </Link>
                <div className="mt-4 flex items-center gap-2 text-xs text-[#475569]">
                  <Link
                    to={`/category/${article.category}`}
                    className="font-semibold text-[#9A6F22] hover:underline"
                  >
                    {article.categoryLabel}
                  </Link>
                  <span aria-hidden="true">·</span>
                  <span>{article.publishedAt}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.readTimeMinutes} min</span>
                </div>
                <h2 className="mt-2 font-serif text-xl font-semibold text-[#0B192C] leading-snug group-hover:text-[#9A6F22] transition-colors">
                  <Link to={`/article/${article.slug}`}>{article.title}</Link>
                </h2>
                <p className="mt-2 text-sm text-[#475569] leading-relaxed line-clamp-2">
                  {article.deck}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-xs text-[#475569]">
                By {article.author}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
