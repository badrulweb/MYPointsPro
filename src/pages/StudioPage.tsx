import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Play,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from '../lib/router';
import { Article, AutomationConfig, CategorySlug } from '../types/publication';

interface StudioPageProps {
  onArticlePublished: (article: Article) => void;
}

const CATEGORY_OPTIONS: { slug: CategorySlug; label: string }[] = [
  { slug: 'zero-apr', label: '0% APR Strategy' },
  { slug: 'credit-building', label: 'Credit Building' },
  { slug: 'cashback', label: 'Cashback Math' },
  { slug: 'points-miles', label: 'Points & Miles' },
  { slug: 'travel-rewards', label: 'Travel Perks' },
];

export function StudioPage({ onArticlePublished }: StudioPageProps) {
  const [topic, setTopic] = useState(
    'How to Time Balance Transfers Before a Major Auto or Mortgage Application'
  );
  const [category, setCategory] = useState<CategorySlug>('zero-apr');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pipelineError, setPipelineError] = useState('');
  const [lastResult, setLastResult] = useState<{
    article: Article;
    flaggedTermsReplaced: string[];
    stages: { stage: string; detail: string }[];
  } | null>(null);

  const [config, setConfig] = useState<AutomationConfig | null>(null);
  const [newQueueTopic, setNewQueueTopic] = useState('');
  const [newQueueCat, setNewQueueCat] = useState<CategorySlug>('points-miles');

  const [testText, setTestText] = useState(
    'Compare a flexible transferable points card against a flat 2% cashback card without mentioning specific bank products.'
  );
  const [auditResult, setAuditResult] = useState<{
    passed: boolean;
    flaggedTerms: string[];
    sanitizedText: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/automation/status')
      .then((r) => r.json())
      .then((d) => {
        if (d.config) setConfig(d.config);
      })
      .catch(() => {});
  }, []);

  async function handleGenerate(targetTopic: string, targetCategory: CategorySlug, queueId?: string) {
    if (!targetTopic.trim()) return;
    setIsGenerating(true);
    setPipelineError('');
    setLastResult(null);

    try {
      const res = await fetch('/api/automation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic.trim(),
          category: targetCategory,
          queueId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPipelineError(data.error || 'Automation pipeline error.');
      } else {
        setLastResult({
          article: data.article,
          flaggedTermsReplaced: data.flaggedTermsReplaced || [],
          stages: data.stages || [],
        });
        if (data.config) setConfig(data.config);
        onArticlePublished(data.article);
      }
    } catch {
      setPipelineError('Network failure while executing AI editorial pipeline.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function updateScheduleConfig(patch: Partial<AutomationConfig>) {
    if (!config) return;
    const next = { ...config, ...patch };
    setConfig(next);
    try {
      const res = await fetch('/api/automation/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      const data = await res.json();
      if (data.config) setConfig(data.config);
    } catch {
      // ignore
    }
  }

  function handleAddQueueItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newQueueTopic.trim() || !config) return;
    const nextQueue = [
      ...config.topicQueue,
      {
        id: `q-${Date.now()}`,
        topic: newQueueTopic.trim(),
        category: newQueueCat,
        addedAt: new Date().toISOString(),
      },
    ];
    setNewQueueTopic('');
    updateScheduleConfig({ topicQueue: nextQueue });
  }

  async function runComplianceTest() {
    if (!testText.trim()) return;
    const res = await fetch('/api/automation/compliance-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: testText }),
    });
    const data = await res.json();
    setAuditResult(data);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
      <div className="pb-8 border-b border-[#E4E7EC]">
        <div className="text-xs font-semibold text-[#9A6F22] mb-2">
          AI Editorial Automation
        </div>
        <h1
          className="font-serif font-semibold text-[#0B192C]"
          style={{ fontSize: 'clamp(2rem, 3.4vw, 2.85rem)' }}
        >
          Automated Research &amp; Publishing Studio
        </h1>
        <p className="mt-3 text-base text-[#475569] max-w-3xl leading-relaxed">
          Generate and schedule humanized financial journalism using a four-stage Gemini workflow: live industry search grounding, structural internal-link outlining, anti-cliché prose humanization, and deterministic issuer-neutral compliance verification.
        </p>
      </div>

      {/* On-Demand 4-Stage Generator */}
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 card-elevated p-6 sm:p-8 space-y-5">
          <h2 className="font-serif text-xl font-semibold text-[#0B192C]">
            Publish New Researched Guide
          </h2>

          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1.5">
              Editorial Topic or Research Question
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a credit, 0% APR, cashback, or travel points topic..."
              className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-[#F7F8FA] border border-[#E4E7EC] text-[#0B192C]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1.5">
              Target Publication Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategorySlug)}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-[#F7F8FA] border border-[#E4E7EC] text-[#0B192C]"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={isGenerating || !topic.trim()}
            onClick={() => handleGenerate(topic, category)}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-[#0B192C] bg-[#C49645] hover:bg-[#D5A756] disabled:opacity-60 transition-colors cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Researching, Humanizing &amp; Auditing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run 4-Stage Pipeline &amp; Publish</span>
              </>
            )}
          </button>

          {pipelineError && (
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {pipelineError}
            </div>
          )}
        </div>

        {/* Pipeline Trace & Result */}
        <div className="lg:col-span-6 bg-[#0B192C] text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold text-white mb-4">
              Editorial Pipeline Execution
            </h2>

            {!isGenerating && !lastResult && (
              <ol className="space-y-4 text-sm text-slate-300">
                <li className="pb-3 border-b border-white/10">
                  <strong className="text-[#E5C17B]">01. Live Search Research:</strong> Queries current consumer credit benchmarks and fee norms via Google Search grounding.
                </li>
                <li className="pb-3 border-b border-white/10">
                  <strong className="text-[#E5C17B]">02. Internal Link Mapping:</strong> Aligns sections with existing guides and builds a quantitative figure chart.
                </li>
                <li className="pb-3 border-b border-white/10">
                  <strong className="text-[#E5C17B]">03. Humanized Drafting:</strong> Writes crisp broadsheet journalism with concrete dollar math and zero AI phrasing clichés.
                </li>
                <li>
                  <strong className="text-[#E5C17B]">04. Issuer-Neutral Compliance Pass:</strong> Scans and replaces any real bank, issuer, or card names before publishing.
                </li>
              </ol>
            )}

            {isGenerating && (
              <div className="py-10 text-center space-y-3">
                <Loader2 className="w-7 h-7 animate-spin text-[#E5C17B] mx-auto" />
                <p className="text-sm font-medium text-white">
                  Executing live research and humanized editorial pass...
                </p>
                <p className="text-xs text-slate-400">
                  Typically completes in 10–20 seconds.
                </p>
              </div>
            )}

            {lastResult && (
              <div className="space-y-4">
                <div className="flex items-start gap-2.5 text-sm text-[#E5C17B] font-semibold">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>Published: {lastResult.article.title}</span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  {lastResult.stages.map((st, idx) => (
                    <div key={idx} className="pb-2 border-b border-white/10">
                      <span className="font-semibold text-white capitalize">{st.stage}:</span>{' '}
                      {st.detail}
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-lg bg-[#132844] border border-white/10 text-xs text-slate-300">
                  <strong className="text-white">Compliance Guardrail:</strong>{' '}
                  {lastResult.flaggedTermsReplaced.length === 0
                    ? 'Zero prohibited bank or card names detected.'
                    : `Automatically sanitized ${lastResult.flaggedTermsReplaced.length} term(s): ${lastResult.flaggedTermsReplaced.join(', ')}.`}
                </div>

                <Link
                  to={`/article/${lastResult.article.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E5C17B] hover:underline"
                >
                  <span>Open Published Article</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Continuous Auto-Publish Scheduler & Editorial Queue */}
      {config && (
        <section className="mt-12 pt-10 border-t border-[#E4E7EC] grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 card-elevated p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold text-[#0B192C]">
                Continuous Publishing Cadence
              </h2>
              <Clock className="w-4 h-4 text-[#9A6F22]" />
            </div>

            <div className="flex items-center justify-between py-3 border-y border-[#F1F5F9]">
              <div>
                <div className="text-sm font-medium text-[#0B192C]">
                  Automated Background Scheduler
                </div>
                <div className="text-xs text-[#475569]">
                  {config.enabled ? 'Active on configured interval' : 'Paused (manual triggers only)'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateScheduleConfig({ enabled: !config.enabled })}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  config.enabled
                    ? 'bg-[#0B192C] text-white'
                    : 'bg-[#F7F8FA] text-[#0B192C] border border-[#E4E7EC]'
                }`}
              >
                {config.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#475569] mb-1.5">
                Publishing Interval
              </label>
              <select
                value={config.cadenceHours}
                onChange={(e) => updateScheduleConfig({ cadenceHours: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-[#F7F8FA] border border-[#E4E7EC]"
              >
                <option value={6}>Every 6 Hours (High-Velocity Newsroom)</option>
                <option value={24}>Daily Edition (Every 24 Hours)</option>
                <option value={72}>Twice Weekly (Every 72 Hours)</option>
                <option value={168}>Weekly Deep Dive (Every 7 Days)</option>
              </select>
            </div>

            {config.nextRunAt && (
              <div className="text-xs text-[#475569]">
                Next Scheduled Run:{' '}
                <span className="font-mono text-[#0B192C]">
                  {new Date(config.nextRunAt).toLocaleString()}
                </span>
              </div>
            )}

            {config.recentLogs.length > 0 && (
              <div className="pt-4 border-t border-[#E4E7EC]">
                <h3 className="text-xs font-semibold text-[#475569] mb-2.5">
                  Recent Automated Runs
                </h3>
                <ul className="space-y-2 text-xs">
                  {config.recentLogs.slice(0, 4).map((log) => (
                    <li key={log.id} className="flex items-center justify-between gap-2 pb-2 border-b border-[#F1F5F9]">
                      <span className="truncate text-[#0B192C]">{log.message}</span>
                      {log.slug && (
                        <Link to={`/article/${log.slug}`} className="text-[#9A6F22] font-semibold shrink-0">
                          View
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 card-elevated p-6 sm:p-8">
            <h2 className="font-serif text-xl font-semibold text-[#0B192C] mb-4">
              Upcoming Research &amp; Publishing Queue ({config.topicQueue.length})
            </h2>

            <form onSubmit={handleAddQueueItem} className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6">
              <input
                type="text"
                value={newQueueTopic}
                onChange={(e) => setNewQueueTopic(e.target.value)}
                placeholder="Queue a new article topic..."
                className="sm:col-span-7 px-3.5 py-2 rounded-lg text-sm bg-[#F7F8FA] border border-[#E4E7EC]"
              />
              <select
                value={newQueueCat}
                onChange={(e) => setNewQueueCat(e.target.value as CategorySlug)}
                className="sm:col-span-3 px-3 py-2 rounded-lg text-sm bg-[#F7F8FA] border border-[#E4E7EC]"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.label}</option>
                ))}
              </select>
              <button
                type="submit"
                className="sm:col-span-2 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#0B192C] hover:bg-[#132844] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Queue</span>
              </button>
            </form>

            <div className="divide-y divide-[#F1F5F9]">
              {config.topicQueue.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-[#9A6F22]">
                      {CATEGORY_OPTIONS.find((c) => c.slug === item.category)?.label}
                    </div>
                    <div className="text-sm font-medium text-[#0B192C] mt-0.5">
                      {item.topic}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => handleGenerate(item.topic, item.category, item.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#0B192C] text-[#0B192C] hover:bg-[#0B192C] hover:text-white transition-colors cursor-pointer"
                    >
                      Publish Now
                    </button>
                    <button
                      type="button"
                      aria-label="Remove queued topic"
                      onClick={() =>
                        updateScheduleConfig({
                          topicQueue: config.topicQueue.filter((q) => q.id !== item.id),
                        })
                      }
                      className="p-1.5 text-[#475569] hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Issuer-Neutral Compliance Guardrail Tester */}
      <section className="mt-12 pt-10 border-t border-[#E4E7EC]">
        <div className="card-elevated p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#9A6F22] mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Pre-Publication Compliance Sandbox</span>
          </div>
          <h2 className="font-serif text-xl font-semibold text-[#0B192C]">
            Test Copy Against Bank &amp; Issuer Name Restrictions
          </h2>
          <p className="mt-1.5 text-sm text-[#475569]">
            Verify that editorial drafts remain 100% free of specific bank, financial institution, or branded card names before distribution.
          </p>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-3">
              <textarea
                rows={3}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-[#F7F8FA] border border-[#E4E7EC]"
              />
              <button
                type="button"
                onClick={runComplianceTest}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0B192C] hover:bg-[#132844] transition-colors cursor-pointer"
              >
                Run Compliance Audit
              </button>
            </div>

            <div className="lg:col-span-5 p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E7EC] text-xs space-y-2">
              {auditResult ? (
                <>
                  <div className={`font-semibold ${auditResult.passed ? 'text-[#0B192C]' : 'text-[#9A6F22]'}`}>
                    {auditResult.passed
                      ? 'Passed: Zero Prohibited Issuer or Card Terms Detected'
                      : `Sanitized ${auditResult.flaggedTerms.length} Flagged Term(s): ${auditResult.flaggedTerms.join(', ')}`}
                  </div>
                  <div className="text-[#475569] leading-relaxed">
                    <strong className="text-[#0B192C]">Compliant Output:</strong> {auditResult.sanitizedText}
                  </div>
                </>
              ) : (
                <div className="text-[#475569]">
                  Click “Run Compliance Audit” to validate text against our issuer and card-product blocklist.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
