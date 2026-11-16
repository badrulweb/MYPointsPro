export type CategorySlug =
  | 'zero-apr'
  | 'credit-building'
  | 'cashback'
  | 'points-miles'
  | 'travel-rewards';

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  calloutTitle?: string;
  calloutBody?: string;
}

export interface ArticleChartBar {
  label: string;
  value: number;
  unit: string;
  note?: string;
}

export interface ArticleChartData {
  title: string;
  subtitle: string;
  figureNumber: string;
  bars: ArticleChartBar[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Article {
  slug: string;
  title: string;
  deck: string;
  category: CategorySlug;
  categoryLabel: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  readTimeMinutes: number;
  imageUrl: string;
  imageCaption: string;
  featured?: boolean;
  isAiAutomated?: boolean;
  complianceVerified: boolean;
  keyTakeaways: string[];
  pullQuote: string;
  sections: ArticleSection[];
  chartData?: ArticleChartData;
  relatedSlugs: string[];
  groundingSources?: GroundingSource[];
}

export interface ValuationEntry {
  id: string;
  programArchetype: string;
  tier: 'Transferable' | 'Airline' | 'Hotel' | 'Fixed Cashback';
  baselineCpp: number;
  sweetSpotCpp: number;
  trend: 'Up' | 'Stable' | 'Down';
  flexibility: 'High' | 'Moderate' | 'Targeted';
  analystNote: string;
}

export interface CardArchetype {
  id: string;
  name: string;
  category: CategorySlug;
  categoryLabel: string;
  creditTier: string;
  typicalAnnualFee: string;
  typicalAprRange: string;
  coreMechanism: string;
  idealProfile: string;
  watchout: string;
  guideSlug: string;
}

export interface CategoryHubInfo {
  slug: CategorySlug;
  title: string;
  shortTitle: string;
  kicker: string;
  summary: string;
  heroImage: string;
  keyMetrics: { label: string; value: string; context: string }[];
  recommendedToolId: 'valuations' | 'zero-apr' | 'utilization' | 'optimizer';
  recommendedToolLabel: string;
}

export interface AutomationConfig {
  enabled: boolean;
  cadenceHours: number;
  defaultCategory: CategorySlug | 'auto';
  lastRunAt: string | null;
  nextRunAt: string | null;
  topicQueue: {
    id: string;
    topic: string;
    category: CategorySlug;
    addedAt: string;
  }[];
  recentLogs: {
    id: string;
    timestamp: string;
    topic: string;
    slug: string;
    status: 'published' | 'failed';
    flaggedTermsReplaced: number;
    message: string;
  }[];
}
