import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { chatWithGuideAssistant, runAutomatedPublishPipeline } from './server/aiPipeline';
import { auditCompliance } from './server/compliance';
import {
  deleteArticleBySlug,
  loadArticles,
  loadAutomationConfig,
  saveAutomationConfig,
  saveSubscriber,
} from './server/storage';
import { CategorySlug } from './src/types/publication';

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Articles API
  app.get('/api/articles', (req, res) => {
    const { category, q } = req.query;
    let articles = loadArticles();

    if (typeof category === 'string' && category && category !== 'all') {
      articles = articles.filter((a) => a.category === category);
    }

    if (typeof q === 'string' && q.trim()) {
      const needle = q.trim().toLowerCase();
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(needle) ||
          a.deck.toLowerCase().includes(needle) ||
          a.categoryLabel.toLowerCase().includes(needle)
      );
    }

    res.json({ articles });
  });

  app.get('/api/articles/:slug', (req, res) => {
    const articles = loadArticles();
    const article = articles.find((a) => a.slug === req.params.slug);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    const related = articles.filter((a) => article.relatedSlugs.includes(a.slug));
    res.json({ article, related });
  });

  app.delete('/api/articles/:slug', (req, res) => {
    const deleted = deleteArticleBySlug(req.params.slug);
    if (!deleted) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json({ ok: true });
  });

  // Compliance Audit Endpoint
  app.post('/api/automation/compliance-check', (req, res) => {
    const text = typeof req.body?.text === 'string' ? req.body.text : '';
    if (!text.trim()) {
      return res.status(400).json({ error: 'Text is required for compliance auditing.' });
    }
    const result = auditCompliance(text);
    res.json(result);
  });

  // Automation Status & Config
  app.get('/api/automation/status', (_req, res) => {
    const config = loadAutomationConfig();
    res.json({ config });
  });

  app.put('/api/automation/config', (req, res) => {
    const current = loadAutomationConfig();
    const { enabled, cadenceHours, defaultCategory, topicQueue } = req.body ?? {};

    const nextCadence =
      typeof cadenceHours === 'number' && cadenceHours >= 1 && cadenceHours <= 168
        ? cadenceHours
        : current.cadenceHours;

    const nextEnabled = typeof enabled === 'boolean' ? enabled : current.enabled;
    const now = Date.now();

    const updated = {
      ...current,
      enabled: nextEnabled,
      cadenceHours: nextCadence,
      defaultCategory: defaultCategory ?? current.defaultCategory,
      topicQueue: Array.isArray(topicQueue) ? topicQueue : current.topicQueue,
      nextRunAt: nextEnabled
        ? current.nextRunAt || new Date(now + nextCadence * 3600 * 1000).toISOString()
        : null,
    };

    saveAutomationConfig(updated);
    res.json({ config: updated });
  });

  // Trigger AI Research -> Humanize -> Compliance -> Publish Pipeline (SSE or JSON)
  app.post('/api/automation/generate', async (req, res) => {
    const topicInput = typeof req.body?.topic === 'string' ? req.body.topic.trim() : '';
    const categoryInput = (req.body?.category || 'points-miles') as CategorySlug;
    const queueId = typeof req.body?.queueId === 'string' ? req.body.queueId : null;

    if (!topicInput) {
      return res.status(400).json({ error: 'Please specify an editorial topic to research and publish.' });
    }

    const stages: { stage: string; detail: string; timestamp: string }[] = [];

    try {
      const result = await runAutomatedPublishPipeline(topicInput, categoryInput, (evt) => {
        stages.push({ ...evt, timestamp: new Date().toISOString() });
      });

      const config = loadAutomationConfig();
      const updatedQueue = queueId
        ? config.topicQueue.filter((q) => q.id !== queueId)
        : config.topicQueue;

      config.topicQueue = updatedQueue;
      config.lastRunAt = new Date().toISOString();
      if (config.enabled) {
        config.nextRunAt = new Date(Date.now() + config.cadenceHours * 3600 * 1000).toISOString();
      }
      config.recentLogs = [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          topic: topicInput,
          slug: result.article.slug,
          status: 'published' as const,
          flaggedTermsReplaced: result.flaggedTermsReplaced.length,
          message: `Published "${result.article.title}"`,
        },
        ...config.recentLogs,
      ].slice(0, 15);
      saveAutomationConfig(config);

      res.json({
        article: result.article,
        flaggedTermsReplaced: result.flaggedTermsReplaced,
        stages,
        config,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Automated publishing failed.';
      const config = loadAutomationConfig();
      config.recentLogs = [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          topic: topicInput,
          slug: '',
          status: 'failed' as const,
          flaggedTermsReplaced: 0,
          message,
        },
        ...config.recentLogs,
      ].slice(0, 15);
      saveAutomationConfig(config);
      res.status(500).json({ error: message, stages });
    }
  });

  // Newsletter / Briefing Capture
  app.post('/api/newsletter', (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const interest = typeof req.body?.interest === 'string' ? req.body.interest.trim() : 'All Topics';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    saveSubscriber(email, interest);
    res.json({ ok: true, message: 'Confirmed. You will receive our next weekly financial briefing.' });
  });

  // Demo AI Guide Assistant Chat Endpoint
  app.post('/api/chat', async (req, res) => {
    const rawMessages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const cleanedMessages = rawMessages
      .filter(
        (m: unknown): m is { role: 'user' | 'assistant'; content: string } =>
          typeof m === 'object' &&
          m !== null &&
          ((m as { role?: unknown }).role === 'user' ||
            (m as { role?: unknown }).role === 'assistant') &&
          typeof (m as { content?: unknown }).content === 'string' &&
          (m as { content: string }).content.trim().length > 0
      )
      .slice(-10)
      .map((m: { role: 'user' | 'assistant'; content: string }) => ({
        role: m.role,
        content: m.content.trim().slice(0, 1200),
      }));

    if (
      cleanedMessages.length === 0 ||
      cleanedMessages[cleanedMessages.length - 1].role !== 'user'
    ) {
      return res.status(400).json({ error: 'Please enter a question to ask the assistant.' });
    }

    try {
      const result = await chatWithGuideAssistant(cleanedMessages);
      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Assistant is temporarily unavailable.';
      res.status(500).json({ error: message });
    }
  });

  // Continuous Scheduled Auto-Publisher Loop (checks every 60s)
  let schedulerRunning = false;
  setInterval(async () => {
    if (schedulerRunning) return;
    try {
      const config = loadAutomationConfig();
      if (!config.enabled || !config.nextRunAt || config.topicQueue.length === 0) return;
      if (Date.now() < new Date(config.nextRunAt).getTime()) return;

      schedulerRunning = true;
      const nextItem = config.topicQueue[0];
      const targetCategory =
        config.defaultCategory === 'auto' ? nextItem.category : config.defaultCategory;

      const result = await runAutomatedPublishPipeline(nextItem.topic, targetCategory);
      const refreshed = loadAutomationConfig();
      refreshed.topicQueue = refreshed.topicQueue.filter((item) => item.id !== nextItem.id);
      refreshed.lastRunAt = new Date().toISOString();
      refreshed.nextRunAt = new Date(
        Date.now() + refreshed.cadenceHours * 3600 * 1000
      ).toISOString();
      refreshed.recentLogs = [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          topic: nextItem.topic,
          slug: result.article.slug,
          status: 'published' as const,
          flaggedTermsReplaced: result.flaggedTermsReplaced.length,
          message: `Scheduled publish: "${result.article.title}"`,
        },
        ...refreshed.recentLogs,
      ].slice(0, 15);
      saveAutomationConfig(refreshed);
    } catch (err) {
      console.error('Scheduled auto-publish error:', err);
    } finally {
      schedulerRunning = false;
    }
  }, 60_000);

  // Vite Dev Middleware or Static Production Build
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output missing.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MyPointsPro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
