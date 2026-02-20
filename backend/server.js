/**
 * MindStream Backend — Express + JSON file storage
 * No native modules. Works on Node 24 + Windows without build tools.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const DATA_FILE = path.resolve(__dirname, process.env.DATA_FILE || './data/posts.json');
const VISITORS_FILE = path.resolve(__dirname, './data/visitors.json');

// ─── File-based Storage ──────────────────────────────────────────────────────

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_POSTS, null, 2), 'utf8');
  }
}

function readPosts() {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writePosts(posts) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf8');
}

// ─── Visitor Storage ──────────────────────────────────────────────────────────

function ensureVisitorsFile() {
  const dir = path.dirname(VISITORS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(VISITORS_FILE)) {
    fs.writeFileSync(VISITORS_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

function readVisitors() {
  ensureVisitorsFile();
  try {
    const all = JSON.parse(fs.readFileSync(VISITORS_FILE, 'utf8'));
    // Only return visitors from the last 24 hours
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return all.filter(v => v.timestamp > cutoff);
  } catch {
    return [];
  }
}

function writeVisitors(visitors) {
  ensureVisitorsFile();
  fs.writeFileSync(VISITORS_FILE, JSON.stringify(visitors, null, 2), 'utf8');
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const SEED_POSTS = [
  {
    id: 'crag-study',
    title: 'CRAG: Corrective Retrieval Augmented Generation',
    summary: 'A robust framework designed to address the hallucinations in RAG by adding a self-corrective retrieval evaluator.',
    content: `Retrieval-Augmented Generation (RAG) is great, but what happens when the retriever fetches garbage? The generator typically hallucinates an answer based on that garbage.\n\n### The Problem\nStandard RAG blindly trusts the retrieved documents. If the relevance is low, the model is misled.\n\n### The CRAG Solution\nCorrective RAG introduces a lightweight "Retrieval Evaluator" after the retrieval step. It classifies retrieved documents into three categories:\n1. **Correct:** Use them for generation.\n2. **Ambiguous:** Combine with a web search for more context.\n3. **Incorrect:** Discard and rely entirely on web search fallback.\n\n### My Takeaway\nThis adds a necessary "critic" loop to the pipeline.`,
    tags: ['AI', 'RAG', 'CRAG', 'NLP'],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    readingTime: 4
  },
  {
    id: 'self-improving-rag',
    title: 'Self-Improving RAG: The Infinite Loop',
    summary: 'Exploring how RAG systems can generate their own training data to iteratively refine both retrieval and generation.',
    content: `The concept of Self-Improving RAG is fascinating.\n\n### How it works\n1. **Generate & Critique:** The system generates an answer and critiques its own output.\n2. **Data Creation:** High-quality generations are added to a training set.\n3. **Fine-tuning:** The retriever and generator are fine-tuned based on results.`,
    tags: ['AI', 'RAG', 'Machine Learning'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    readingTime: 5
  },
  {
    id: 'seed-transformers',
    title: 'Attention Is All You Need: Understanding Transformers',
    summary: 'A deep dive into the architecture that revolutionized NLP.',
    content: `The Transformer model, introduced in "Attention Is All You Need" (2017), marked a turning point in NLP.\n\n### Self-Attention\nSelf-attention allows the model to look at all words simultaneously, enabling parallel training and drastically better long-range dependency handling.`,
    tags: ['AI', 'Deep Learning', 'Transformers', 'NLP'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    readingTime: 3
  }
];

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ─── Auth Middleware ──────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.slice(7);
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/admin/login
app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });

  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const valid = password === adminPassword; // plain comparison (fast, secure enough for single-admin)

  if (!valid) return res.status(401).json({ error: 'Invalid password' });

  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// GET /api/posts — public, only published (all posts are "published" in this model)
app.get('/api/posts', (req, res) => {
  const posts = readPosts();
  res.json(posts);
});

// GET /api/posts/:id — public
app.get('/api/posts/:id', (req, res) => {
  const posts = readPosts();
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// GET /api/admin/posts — protected, returns all posts
app.get('/api/admin/posts', requireAuth, (req, res) => {
  const posts = readPosts();
  res.json(posts);
});

// POST /api/posts — protected, create post
app.post('/api/posts', requireAuth, (req, res) => {
  const { title, summary, content, tags, readingTime } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'title and content are required' });

  const posts = readPosts();
  const newPost = {
    id: req.body.id || uuidv4(),
    title,
    summary: summary || '',
    content,
    tags: Array.isArray(tags) ? tags : [],
    createdAt: req.body.createdAt || new Date().toISOString(),
    readingTime: readingTime || Math.ceil(content.split(' ').length / 200)
  };

  posts.unshift(newPost);
  writePosts(posts);
  res.status(201).json(newPost);
});

// PUT /api/posts/:id — protected, update post
app.put('/api/posts/:id', requireAuth, (req, res) => {
  const posts = readPosts();
  const idx = posts.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Post not found' });

  const updated = { ...posts[idx], ...req.body, id: req.params.id };
  posts[idx] = updated;
  writePosts(posts);
  res.json(updated);
});

// DELETE /api/posts/:id — protected
app.delete('/api/posts/:id', requireAuth, (req, res) => {
  const posts = readPosts();
  const idx = posts.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Post not found' });

  posts.splice(idx, 1);
  writePosts(posts);
  res.json({ success: true });
});

// ─── Visitor Routes ───────────────────────────────────────────────────────────

// GET /api/visitors — public, returns visitors from last 24h
app.get('/api/visitors', (req, res) => {
  const visitors = readVisitors();
  res.json(visitors);
});

// POST /api/visitors — public, register a visitor by name
app.post('/api/visitors', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'name is required' });
  }

  const trimmedName = name.trim().slice(0, 32); // max 32 chars
  let visitors = readVisitors();

  // If name already exists, just update their timestamp
  const existingIdx = visitors.findIndex(
    v => v.name.toLowerCase() === trimmedName.toLowerCase()
  );

  const visitor = {
    id: existingIdx >= 0 ? visitors[existingIdx].id : uuidv4(),
    name: trimmedName,
    timestamp: Date.now(),
  };

  if (existingIdx >= 0) {
    visitors[existingIdx] = visitor;
  } else {
    visitors.unshift(visitor);
  }

  // Keep only last 100 visitors to prevent file bloat
  visitors = visitors.slice(0, 100);
  writeVisitors(visitors);

  res.status(201).json(visitor);
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ─── Start ────────────────────────────────────────────────────────────────────
ensureDataFile();
app.listen(PORT, () => {
  console.log(`✅ MindStream API running on http://localhost:${PORT}`);
  console.log(`   Data file: ${DATA_FILE}`);
});
