import fs from 'fs';
import path from 'path';
import { SEED_ARTICLES } from '../src/data/seedPublication';
import { Article, AutomationConfig } from '../src/types/publication';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');
const AUTOMATION_FILE = path.join(DATA_DIR, 'automation.json');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');

const DEFAULT_AUTOMATION: AutomationConfig = {
  enabled: false,
  cadenceHours: 24,
  defaultCategory: 'auto',
  lastRunAt: null,
  nextRunAt: null,
  topicQueue: [
    {
      id: 'q-1',
      topic: 'How Credit Limit Increases Lower Utilization Without Adding New Inquiries',
      category: 'credit-building',
      addedAt: '2026-11-15T10:00:00Z',
    },
    {
      id: 'q-2',
      topic: 'Calculating the True Break-Even on 5% Balance Transfer Fees vs. 3% Offers',
      category: 'zero-apr',
      addedAt: '2026-11-15T10:05:00Z',
    },
    {
      id: 'q-3',
      topic: 'Why Rotating 5% Quarterly Cashback Caps Rarely Beat 2% Flat Cards Alone',
      category: 'cashback',
      addedAt: '2026-11-15T10:10:00Z',
    },
    {
      id: 'q-4',
      topic: 'Transfer Partner Sweet Spots: Sweet-Spot Distance Zones vs. Dynamic Pricing',
      category: 'points-miles',
      addedAt: '2026-11-15T10:15:00Z',
    },
    {
      id: 'q-5',
      topic: 'Trip Cancellation vs. Trip Interruption: What Card Travel Insurance Actually Covers',
      category: 'travel-rewards',
      addedAt: '2026-11-15T10:20:00Z',
    },
  ],
  recentLogs: [],
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadArticles(): Article[] {
  ensureDataDir();
  if (!fs.existsSync(ARTICLES_FILE)) {
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(SEED_ARTICLES, null, 2), 'utf-8');
    return [...SEED_ARTICLES];
  }
  try {
    const raw = fs.readFileSync(ARTICLES_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Article[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      fs.writeFileSync(ARTICLES_FILE, JSON.stringify(SEED_ARTICLES, null, 2), 'utf-8');
      return [...SEED_ARTICLES];
    }
    return parsed;
  } catch {
    return [...SEED_ARTICLES];
  }
}

export function saveArticles(articles: Article[]): void {
  ensureDataDir();
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), 'utf-8');
}

export function upsertArticle(article: Article): Article[] {
  const existing = loadArticles();
  const filtered = existing.filter((a) => a.slug !== article.slug);
  const updated = [article, ...filtered];
  saveArticles(updated);
  return updated;
}

export function deleteArticleBySlug(slug: string): boolean {
  const existing = loadArticles();
  const next = existing.filter((a) => a.slug !== slug);
  if (next.length === existing.length) return false;
  saveArticles(next);
  return true;
}

export function loadAutomationConfig(): AutomationConfig {
  ensureDataDir();
  if (!fs.existsSync(AUTOMATION_FILE)) {
    fs.writeFileSync(AUTOMATION_FILE, JSON.stringify(DEFAULT_AUTOMATION, null, 2), 'utf-8');
    return { ...DEFAULT_AUTOMATION };
  }
  try {
    const raw = fs.readFileSync(AUTOMATION_FILE, 'utf-8');
    return JSON.parse(raw) as AutomationConfig;
  } catch {
    return { ...DEFAULT_AUTOMATION };
  }
}

export function saveAutomationConfig(config: AutomationConfig): void {
  ensureDataDir();
  fs.writeFileSync(AUTOMATION_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export function saveSubscriber(email: string, interest: string): void {
  ensureDataDir();
  let current: { email: string; interest: string; subscribedAt: string }[] = [];
  if (fs.existsSync(SUBSCRIBERS_FILE)) {
    try {
      current = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8'));
    } catch {
      current = [];
    }
  }
  const filtered = current.filter((s) => s.email.toLowerCase() !== email.toLowerCase());
  filtered.unshift({ email, interest, subscribedAt: new Date().toISOString() });
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
}
