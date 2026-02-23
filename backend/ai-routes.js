// ai-routes.js — Express routes for K9 Rehab Pro Vet AI
// Handles conversations, messages, SSE streaming, and suggestions

const express = require('express');
const rateLimit = require('express-rate-limit');

function createAIRouter(db, aiService, requireAuth) {
  const router = express.Router();

  // AI-specific rate limiter: 30 requests per 15 minutes per user
  const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.AI_RATE_LIMIT_PER_15MIN || '30', 10),
    keyGenerator: (req) => (req.user && req.user.id) ? String(req.user.id) : req.ip,
    message: { error: 'AI request limit reached. Please try again in a few minutes.' },
    standardHeaders: true,
    legacyHeaders: false
  });

  // All AI routes require authentication
  router.use(requireAuth(db));

  // ─── AI Status ───
  router.get('/status', (req, res) => {
    res.json(aiService.getStatus());
  });

  // ─── Conversations CRUD ───

  // Create conversation
  router.post('/conversations', async (req, res) => {
    try {
      const { title, patientId, contextType } = req.body;
      const conversation = await aiService.createConversation(
        req.user.id, title, patientId, contextType
      );
      res.status(201).json(conversation);
    } catch (err) {
      console.error('🔴 Create conversation error:', err.message);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  });

  // List conversations
  router.get('/conversations', async (req, res) => {
    try {
      const conversations = await aiService.getConversations(req.user.id);
      res.json(conversations);
    } catch (err) {
      console.error('🔴 List conversations error:', err.message);
      res.status(500).json({ error: 'Failed to list conversations' });
    }
  });

  // Get conversation with messages
  router.get('/conversations/:id', async (req, res) => {
    try {
      const conversation = await aiService.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      if (conversation.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      const messages = await aiService.getConversationMessages(req.params.id);
      res.json({ conversation, messages });
    } catch (err) {
      console.error('🔴 Get conversation error:', err.message);
      res.status(500).json({ error: 'Failed to get conversation' });
    }
  });

  // Delete conversation
  router.delete('/conversations/:id', async (req, res) => {
    try {
      const conversation = await aiService.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      if (conversation.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      await aiService.deleteConversation(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error('🔴 Delete conversation error:', err.message);
      res.status(500).json({ error: 'Failed to delete conversation' });
    }
  });

  // ─── Messages ───

  // Send message (non-streaming)
  router.post('/conversations/:id/messages', aiLimiter, async (req, res) => {
    try {
      const conversation = await aiService.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      if (conversation.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { message, context } = req.body;
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const response = await aiService.sendMessage(req.params.id, message.trim(), {
        ...context,
        userId: req.user.id,
        contextType: conversation.context_type
      });

      res.json(response);
    } catch (err) {
      console.error('🔴 Send message error:', err.message);
      if (err.message.includes('No AI provider')) {
        return res.status(503).json({ error: 'AI service not configured. Contact administrator.' });
      }
      res.status(500).json({ error: 'Failed to process message' });
    }
  });

  // Send message (streaming via SSE)
  router.post('/conversations/:id/stream', aiLimiter, async (req, res) => {
    try {
      const conversation = await aiService.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      if (conversation.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { message, context } = req.body;
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      // Handle client disconnect
      let clientDisconnected = false;
      req.on('close', () => { clientDisconnected = true; });

      await aiService.streamMessage(
        req.params.id,
        message.trim(),
        {
          ...context,
          userId: req.user.id,
          contextType: conversation.context_type
        },
        (chunk) => {
          if (clientDisconnected) return;
          try {
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
          } catch (e) {
            // Client may have disconnected
          }
        }
      );

      if (!clientDisconnected) {
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
      }
    } catch (err) {
      console.error('🔴 Stream message error:', err.message);
      if (!res.headersSent) {
        if (err.message.includes('No AI provider')) {
          return res.status(503).json({ error: 'AI service not configured.' });
        }
        return res.status(500).json({ error: 'Failed to stream message' });
      }
      try {
        res.write(`data: ${JSON.stringify({ type: 'error', error: 'Stream interrupted' })}\n\n`);
        res.end();
      } catch (e) {
        // Client disconnected
      }
    }
  });

  // ─── Suggestions ───

  router.get('/suggestions', (req, res) => {
    const contextType = req.query.context || 'general';
    const suggestions = aiService.getSuggestions(contextType);
    res.json(suggestions);
  });

  // ─── Usage Stats (admin only) ───

  router.get('/usage', async (req, res) => {
    try {
      const stats = await new Promise((resolve, reject) => {
        db.all(
          `SELECT
            provider,
            model,
            COUNT(*) as request_count,
            SUM(input_tokens) as total_input_tokens,
            SUM(output_tokens) as total_output_tokens,
            SUM(input_tokens + output_tokens) as total_tokens
           FROM ai_usage
           WHERE user_id = ?
           GROUP BY provider, model
           ORDER BY total_tokens DESC`,
          [req.user.id],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      res.json({ userId: req.user.id, stats });
    } catch (err) {
      console.error('🔴 Usage stats error:', err.message);
      res.status(500).json({ error: 'Failed to get usage stats' });
    }
  });

  return router;
}

module.exports = createAIRouter;
