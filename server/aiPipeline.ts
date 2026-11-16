import { GoogleGenAI, Type } from '@google/genai';
import { CATEGORY_IMAGES } from '../src/data/seedPublication';
import { Article, CategorySlug, GroundingSource } from '../src/types/publication';
import { auditCompliance } from './compliance';
import { loadArticles, upsertArticle } from './storage';

const CATEGORY_LABELS: Record<CategorySlug, string> = {
  'zero-apr': '0% APR Strategy',
  'credit-building': 'Credit Building',
  cashback: 'Cashback Math',
  'points-miles': 'Points & Miles',
  'travel-rewards': 'Travel Perks',
};

const AUTHOR_ROSTER: Record<CategorySlug, { name: string; role: string }> = {
  'zero-apr': { name: 'Claire Vance', role: 'Senior Credit & Debt Analyst' },
  'credit-building': { name: 'Elena Rostova', role: 'Credit Architecture Researcher' },
  cashback: { name: 'David Chen', role: 'Household Yield Strategist' },
  'points-miles': { name: 'Julian Mercer', role: 'Loyalty Economics Editor' },
  'travel-rewards': { name: 'Marcus Thorne', role: 'Consumer Credit Editor' },
};

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 72);
}

export interface PipelineProgressEvent {
  stage: 'research' | 'outline' | 'humanize' | 'compliance' | 'published';
  detail: string;
}

export interface PipelineResult {
  article: Article;
  flaggedTermsReplaced: string[];
  researchSummary: string;
}

export async function runAutomatedPublishPipeline(
  topic: string,
  category: CategorySlug,
  onProgress?: (event: PipelineProgressEvent) => void
): Promise<PipelineResult> {
  const ai = getClient();
  const existingArticles = loadArticles();
  const existingCatalog = existingArticles
    .slice(0, 12)
    .map((a) => `${a.slug} (${a.categoryLabel}): ${a.title}`)
    .join('\n');

  // Stage 1: Live Industry Research via Google Search Grounding
  onProgress?.({
    stage: 'research',
    detail: `Researching current industry benchmarks and consumer credit standards for "${topic}"...`,
  });

  const researchResponse = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `Research factual, up-to-date consumer finance benchmarks and mechanics for a financial editorial article on:
"${topic}" (Category: ${CATEGORY_LABELS[category]}).

STRICT COMPLIANCE RULE:
Do NOT include or promote any specific bank names, financial institutions, or branded credit card product names in your takeaways. Convert any specific real-world product examples into generic card archetypes (e.g., "flat-rate 2% cashback archetype", "18-month 0% balance transfer card", "flexible transferable travel rewards card").

Provide:
1. Key quantitative industry benchmarks (typical APR ranges, fee bands, scoring weights, or redemption cents-per-point ranges).
2. Common consumer pitfalls or fine-print mechanics.
3. Practical mathematical scenarios readers can verify.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const researchText = researchResponse.text ?? '';
  const rawChunks = researchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const groundingSources: GroundingSource[] = rawChunks
    .filter((c) => c.web?.uri && c.web?.title)
    .slice(0, 4)
    .map((c) => ({
      title: c.web!.title!,
      uri: c.web!.uri!,
    }));

  // Stage 2 & 3: Structured Architecture + Humanized Editorial Prose
  onProgress?.({
    stage: 'outline',
    detail: 'Mapping structural outline, internal links, and quantitative figure data...',
  });

  onProgress?.({
    stage: 'humanize',
    detail: 'Drafting humanized editorial prose with concrete household math and zero AI clichés...',
  });

  const draftResponse = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `You are a senior financial journalist writing for MyPointsPro, an independent broadsheet-style publication comparable in rigor to The Economist and NerdWallet.

Write a complete, deeply humanized editorial guide on:
Topic: "${topic}"
Category: "${CATEGORY_LABELS[category]}"

Research Brief to ground your facts:
${researchText}

Existing Articles Available for Internal Linking (pick 2-3 most relevant slugs):
${existingCatalog}

WRITING & HUMANIZATION RULES:
1. ZERO BANK, ISSUER, OR CREDIT CARD NAMES: Never mention any bank, financial institution, or branded credit card name. Refer exclusively to card archetypes (e.g., "a no-annual-fee 2% cashback card", "a Tier-1 transferable points card", "a secured credit-builder card").
2. HUMAN EDITORIAL VOICE: Write with crisp journalistic authority, varied sentence lengths, concrete dollar-and-cent math scenarios, and natural transitions. Strictly avoid AI clichés ("delve", "tapestry", "unlock", "supercharge", "landscape", "game-changer", "navigating the world of", "it's important to note").
3. STRUCTURE:
   - Compelling title (no colons if avoidable, authoritative, clear) and concise 1-sentence deck.
   - 3 concise key takeaways.
   - 1 memorable pullQuote (1-2 sentences).
   - 3 to 4 substantive sections, each with 2–3 richly detailed paragraphs. Include an optional calloutTitle + calloutBody on one section for a critical fine-print warning.
   - 1 quantitative chartData comparison with 3–4 realistic bars (numbers only in value, clear unit like "$" or "%" or "¢").
   - Concise figure imageCaption starting with "Fig. — ".
   - Select 2–3 relatedSlugs strictly from the Existing Articles list above.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          deck: { type: Type.STRING },
          readTimeMinutes: { type: Type.INTEGER },
          imageCaption: { type: Type.STRING },
          keyTakeaways: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          pullQuote: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                heading: { type: Type.STRING },
                paragraphs: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                calloutTitle: { type: Type.STRING },
                calloutBody: { type: Type.STRING },
              },
              required: ['heading', 'paragraphs'],
            },
          },
          chartData: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              figureNumber: { type: Type.STRING },
              bars: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.NUMBER },
                    unit: { type: Type.STRING },
                    note: { type: Type.STRING },
                  },
                  required: ['label', 'value', 'unit'],
                },
              },
            },
            required: ['title', 'subtitle', 'figureNumber', 'bars'],
          },
          relatedSlugs: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          'title',
          'deck',
          'readTimeMinutes',
          'imageCaption',
          'keyTakeaways',
          'pullQuote',
          'sections',
          'chartData',
          'relatedSlugs',
        ],
      },
    },
  });

  const parsed = JSON.parse((draftResponse.text ?? '{}').trim());

  // Stage 4: Deterministic Compliance Audit + Illustration Assignment
  onProgress?.({
    stage: 'compliance',
    detail: 'Running issuer-neutral compliance verification and assigning editorial illustration...',
  });

  const flaggedSet = new Set<string>();
  const cleanText = (val: string): string => {
    const audit = auditCompliance(val || '');
    audit.flaggedTerms.forEach((t) => flaggedSet.add(t));
    return audit.sanitizedText;
  };

  const validExistingSlugs = new Set(existingArticles.map((a) => a.slug));
  const cleanedRelated = Array.isArray(parsed.relatedSlugs)
    ? parsed.relatedSlugs.filter((s: string) => validExistingSlugs.has(s)).slice(0, 3)
    : existingArticles.slice(0, 2).map((a) => a.slug);

  const cleanTitle = cleanText(parsed.title || topic);
  let baseSlug = slugify(cleanTitle);
  if (!baseSlug) baseSlug = `guide-${Date.now()}`;
  if (validExistingSlugs.has(baseSlug)) {
    baseSlug = `${baseSlug}-${Math.floor(Date.now() / 1000) % 10000}`;
  }

  const author = AUTHOR_ROSTER[category];
  const nowFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const article: Article = {
    slug: baseSlug,
    title: cleanTitle,
    deck: cleanText(parsed.deck || ''),
    category,
    categoryLabel: CATEGORY_LABELS[category],
    author: author.name,
    authorRole: author.role,
    publishedAt: nowFormatted,
    readTimeMinutes: Math.max(4, Math.min(12, Number(parsed.readTimeMinutes) || 6)),
    imageUrl: CATEGORY_IMAGES[category],
    imageCaption: cleanText(parsed.imageCaption || 'Fig. — Editorial analysis illustration.'),
    featured: false,
    isAiAutomated: true,
    complianceVerified: true,
    keyTakeaways: Array.isArray(parsed.keyTakeaways)
      ? parsed.keyTakeaways.slice(0, 4).map((t: string) => cleanText(t))
      : [],
    pullQuote: cleanText(parsed.pullQuote || ''),
    sections: Array.isArray(parsed.sections)
      ? parsed.sections.map((sec: { heading: string; paragraphs: string[]; calloutTitle?: string; calloutBody?: string }) => ({
          heading: cleanText(sec.heading),
          paragraphs: Array.isArray(sec.paragraphs) ? sec.paragraphs.map((p) => cleanText(p)) : [],
          ...(sec.calloutTitle && sec.calloutBody
            ? {
                calloutTitle: cleanText(sec.calloutTitle),
                calloutBody: cleanText(sec.calloutBody),
              }
            : {}),
        }))
      : [],
    chartData: parsed.chartData
      ? {
          title: cleanText(parsed.chartData.title),
          subtitle: cleanText(parsed.chartData.subtitle),
          figureNumber: cleanText(parsed.chartData.figureNumber || 'Fig. 1'),
          bars: Array.isArray(parsed.chartData.bars)
            ? parsed.chartData.bars.slice(0, 5).map((b: { label: string; value: number; unit: string; note?: string }) => ({
                label: cleanText(b.label),
                value: Number(b.value) || 0,
                unit: b.unit || '$',
                note: b.note ? cleanText(b.note) : undefined,
              }))
            : [],
        }
      : undefined,
    relatedSlugs:
      cleanedRelated.length > 0
        ? cleanedRelated
        : existingArticles.slice(0, 2).map((a) => a.slug),
    groundingSources,
  };

  upsertArticle(article);

  onProgress?.({
    stage: 'published',
    detail: `Published "${article.title}" (${flaggedSet.size} compliance terms sanitized).`,
  });

  return {
    article,
    flaggedTermsReplaced: Array.from(flaggedSet),
    researchSummary: researchText.slice(0, 600),
  };
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSuggestedLink {
  label: string;
  path: string;
}

export interface ChatAssistantResponse {
  reply: string;
  suggestedLinks: ChatSuggestedLink[];
  sanitizedTerms: string[];
}

const STATIC_PUBLICATION_ROUTES: { path: string; description: string }[] = [
  { path: '/category/zero-apr', description: '0% APR & Debt Strategy Guides' },
  { path: '/category/credit-building', description: 'Credit Building & Scoring Guides' },
  { path: '/category/cashback', description: 'Cashback Optimization Guides' },
  { path: '/category/points-miles', description: 'Points, Miles & Transfers Guides' },
  { path: '/category/travel-rewards', description: 'Travel Perks & Protections Guides' },
  { path: '/tools?tool=zero-apr', description: '0% APR Balance Transfer Payoff Calculator' },
  { path: '/tools?tool=valuations', description: 'Points & Miles Cents-Per-Point Calculator' },
  { path: '/tools?tool=utilization', description: 'Credit Utilization Ratio Simulator' },
  { path: '/tools?tool=optimizer', description: 'Annual Fee Break-Even & Spend Optimizer' },
  { path: '/valuations', description: 'Monthly Points & Miles Valuation Index' },
  { path: '/journal', description: 'Full Editorial Journal' },
  { path: '/about', description: 'Editorial Methodology & Compliance Standard' },
];

export async function chatWithGuideAssistant(
  messages: ChatTurn[]
): Promise<ChatAssistantResponse> {
  const ai = getClient();
  const articles = loadArticles();
  const validArticleSlugs = new Set(articles.map((a) => a.slug));
  const validStaticPaths = new Set(STATIC_PUBLICATION_ROUTES.map((r) => r.path));

  const articleCatalog = articles
    .slice(0, 14)
    .map((a) => `/article/${a.slug} — "${a.title}" (${a.categoryLabel})`)
    .join('\n');

  const routeCatalog = STATIC_PUBLICATION_ROUTES.map(
    (r) => `${r.path} — ${r.description}`
  ).join('\n');

  const conversationTranscript = messages
    .slice(-10)
    .map((m) => `${m.role === 'user' ? 'Reader' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `Conversation so far:\n${conversationTranscript}\n\nRespond to the reader's latest message.`,
    config: {
      systemInstruction: `You are the MyPointsPro Guide Assistant, a clear, practical financial education assistant for MyPointsPro.

STRICT COMPLIANCE RULE:
- NEVER mention any specific bank name, financial institution, credit card issuer, or branded credit card product name anywhere in your reply or suggested link labels.
- Refer exclusively to generic card archetypes (e.g., "18-month 0% APR balance transfer card", "flat-rate 2% cashback card", "Tier-1 transferable points card", "secured credit-builder card").
- If a reader mentions a specific bank or card name, politely answer the underlying math or strategy using issuer-neutral archetypes without repeating the brand name.

STYLE & LANGUAGE:
- Respond in the same language the reader uses (e.g., English, Bengali, or Banglish).
- Keep answers concise, actionable, and grounded in concrete math (APR math, utilization thresholds like under 9% or 30%, cents-per-point formulas, annual fee break-even formulas).
- Avoid AI clichés and filler. Remind readers when appropriate that examples are educational models, not personalized financial advice.

INTERNAL LINKING:
- Pick 1 to 2 most relevant internal paths from the catalogs below for "suggestedLinks". Only use exact paths from these lists:

Publication Pages & Calculators:
${routeCatalog}

Editorial Guides:
${articleCatalog}`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: { type: Type.STRING },
          suggestedLinks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                path: { type: Type.STRING },
              },
              required: ['label', 'path'],
            },
          },
        },
        required: ['reply', 'suggestedLinks'],
      },
    },
  });

  let parsed: { reply?: string; suggestedLinks?: { label?: string; path?: string }[] } = {};
  try {
    parsed = JSON.parse((response.text ?? '{}').trim());
  } catch {
    parsed = {
      reply: response.text ?? 'I could not generate a response right now. Please try again.',
      suggestedLinks: [],
    };
  }

  const flaggedSet = new Set<string>();
  const clean = (val: string) => {
    const res = auditCompliance(val);
    res.flaggedTerms.forEach((t) => flaggedSet.add(t));
    return res.sanitizedText;
  };

  const replyText = clean(
    parsed.reply ||
      'Ask me about 0% APR balance transfer math, credit utilization, cashback break-evens, or cents-per-point valuations.'
  );

  const isAllowedPath = (p: string): boolean => {
    if (validStaticPaths.has(p)) return true;
    if (p.startsWith('/article/')) {
      const slug = p.slice('/article/'.length);
      return validArticleSlugs.has(slug);
    }
    return false;
  };

  let suggestedLinks: ChatSuggestedLink[] = Array.isArray(parsed.suggestedLinks)
    ? parsed.suggestedLinks
        .filter((l): l is { label: string; path: string } => Boolean(l?.label && l?.path && isAllowedPath(l.path)))
        .slice(0, 3)
        .map((l) => ({
          label: clean(l.label),
          path: l.path,
        }))
    : [];

  if (suggestedLinks.length === 0) {
    const latestQuery = (messages[messages.length - 1]?.content || '').toLowerCase();
    if (/apr|balance|transfer|debt|interest/.test(latestQuery)) {
      suggestedLinks = [
        { label: '0% APR Payoff Calculator', path: '/tools?tool=zero-apr' },
        { label: '0% APR Strategy Guides', path: '/category/zero-apr' },
      ];
    } else if (/utiliz|score|build|credit|secured|history/.test(latestQuery)) {
      suggestedLinks = [
        { label: 'Utilization Simulator', path: '/tools?tool=utilization' },
        { label: 'Credit Building Guides', path: '/category/credit-building' },
      ];
    } else if (/point|mile|cpp|transfer|portal|travel|lounge/.test(latestQuery)) {
      suggestedLinks = [
        { label: 'CPP Valuation Calculator', path: '/tools?tool=valuations' },
        { label: 'Monthly Valuation Index', path: '/valuations' },
      ];
    } else if (/cashback|cash back|fee|break-even|flat/.test(latestQuery)) {
      suggestedLinks = [
        { label: 'Annual Fee Optimizer', path: '/tools?tool=optimizer' },
        { label: 'Cashback Math Guides', path: '/category/cashback' },
      ];
    } else {
      suggestedLinks = [
        { label: 'Financial Calculators', path: '/tools?tool=zero-apr' },
        { label: 'Editorial Journal', path: '/journal' },
      ];
    }
  }

  return {
    reply: replyText,
    suggestedLinks,
    sanitizedTerms: Array.from(flaggedSet),
  };
}

