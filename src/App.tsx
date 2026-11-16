import { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { SEED_ARTICLES } from './data/seedPublication';
import { RouterProvider, useRouter } from './lib/router';
import { AboutPage } from './pages/AboutPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { CategoryHubPage } from './pages/CategoryHubPage';
import { HomePage } from './pages/HomePage';
import { JournalPage } from './pages/JournalPage';
import { LegalDocType, LegalPage } from './pages/LegalPage';
import { StudioPage } from './pages/StudioPage';
import { ToolsHubPage } from './pages/ToolsHubPage';
import { ValuationsPage } from './pages/ValuationsPage';
import { Article, CategorySlug } from './types/publication';

const VALID_CATEGORIES = new Set<CategorySlug>([
  'zero-apr',
  'credit-building',
  'cashback',
  'points-miles',
  'travel-rewards',
]);

function AppRoutes() {
  const { path } = useRouter();
  const [articles, setArticles] = useState<Article[]>(SEED_ARTICLES);

  useEffect(() => {
    fetch('/api/articles')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.articles) && d.articles.length > 0) {
          setArticles(d.articles);
        }
      })
      .catch(() => {
        // Keep seed editorial articles if offline
      });
  }, []);

  function handleArticlePublished(newArticle: Article) {
    setArticles((prev) => [newArticle, ...prev.filter((a) => a.slug !== newArticle.slug)]);
  }

  let content = <HomePage articles={articles} />;

  if (path === '/' || path === '') {
    content = <HomePage articles={articles} />;
  } else if (path.startsWith('/category/')) {
    const slug = path.replace('/category/', '').split('/')[0] as CategorySlug;
    content = VALID_CATEGORIES.has(slug) ? (
      <CategoryHubPage slug={slug} articles={articles} />
    ) : (
      <HomePage articles={articles} />
    );
  } else if (path === '/tools') {
    content = <ToolsHubPage />;
  } else if (path === '/valuations') {
    content = <ValuationsPage />;
  } else if (path === '/journal') {
    content = <JournalPage articles={articles} />;
  } else if (path.startsWith('/article/')) {
    const slug = path.replace('/article/', '').split('/')[0];
    content = <ArticleDetailPage slug={slug} articles={articles} />;
  } else if (path === '/studio') {
    content = <StudioPage onArticlePublished={handleArticlePublished} />;
  } else if (path === '/about') {
    content = <AboutPage />;
  } else if (path.startsWith('/legal/')) {
    const doc = path.replace('/legal/', '').split('/')[0] as LegalDocType;
    const validLegal: LegalDocType[] = [
      'advertiser-disclosure',
      'editorial-policy',
      'privacy-policy',
      'terms',
    ];
    content = validLegal.includes(doc) ? (
      <LegalPage docType={doc} />
    ) : (
      <LegalPage docType="advertiser-disclosure" />
    );
  }

  return <Layout>{content}</Layout>;
}

export default function App() {
  return (
    <RouterProvider>
      <AppRoutes />
    </RouterProvider>
  );
}
