// ai-service.js — Provider-agnostic AI service for K9 Rehab Pro
// Supports both Anthropic Claude and OpenAI with tool calling and streaming

const { v4: uuidv4 } = require('uuid');
const {
  buildSystemPrompt,
  AI_TOOLS_ANTHROPIC,
  getToolsForOpenAI
} = require('./ai-system-prompt');
const {
  ALL_EXERCISES,
  getExerciseByCode,
  searchExercises
} = require('./all-exercises');
const {
  validateIntake,
  selectExercisesForWeek,
  PROTOCOL_DEFINITIONS,
  getProtocolType,
  getPhaseForWeek
} = require('./protocol-generator');
const {
  getOrGenerateStoryboard,
  getStoryboardByCode
} = require('./storyboard-references');
const { PatientDB, ProtocolDB } = require('./database');

class AIService {
  constructor(db) {
    this.db = db;
    this.provider = process.env.AI_PROVIDER || 'anthropic';
    this.anthropicClient = null;
    this.openaiClient = null;
    this.maxTokens = parseInt(process.env.AI_MAX_TOKENS || '4096', 10);
    this.temperature = parseFloat(process.env.AI_TEMPERATURE || '0.3');

    this._initializeProvider();
  }

  _initializeProvider() {
    if (this.provider === 'anthropic' || this.provider === 'both') {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (apiKey) {
        try {
          const Anthropic = require('@anthropic-ai/sdk');
          this.anthropicClient = new Anthropic({ apiKey });
          console.log('🤖 Anthropic Claude provider initialized');
        } catch (err) {
          console.warn('⚠️ Anthropic SDK not available:', err.message);
        }
      } else {
        console.warn('⚠️ ANTHROPIC_API_KEY not set');
      }
    }

    if (this.provider === 'openai' || this.provider === 'both') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey) {
        try {
          const OpenAI = require('openai');
          this.openaiClient = new OpenAI({ apiKey });
          console.log('🤖 OpenAI provider initialized');
        } catch (err) {
          console.warn('⚠️ OpenAI SDK not available:', err.message);
        }
      } else {
        console.warn('⚠️ OPENAI_API_KEY not set');
      }
    }
  }

  _getActiveClient() {
    if (this.provider === 'anthropic' && this.anthropicClient) return 'anthropic';
    if (this.provider === 'openai' && this.openaiClient) return 'openai';
    if (this.provider === 'both') {
      if (this.anthropicClient) return 'anthropic';
      if (this.openaiClient) return 'openai';
    }
    return null;
  }

  _getModel(providerType) {
    if (providerType === 'anthropic') {
      return process.env.AI_MODEL_ANTHROPIC || 'claude-sonnet-4-20250514';
    }
    return process.env.AI_MODEL_OPENAI || 'gpt-4o';
  }

  // ─── Tool Call Handlers ───

  async handleToolCall(toolName, toolInput) {
    switch (toolName) {
      case 'search_exercises': {
        let results = ALL_EXERCISES;
        if (toolInput.keyword) {
          results = searchExercises(toolInput.keyword);
        }
        if (toolInput.category) {
          results = results.filter(e =>
            e.category && e.category.toLowerCase().includes(toolInput.category.toLowerCase())
          );
        }
        if (toolInput.difficulty) {
          results = results.filter(e =>
            e.difficulty_level === toolInput.difficulty
          );
        }
        return results.slice(0, 20).map(e => ({
          code: e.code,
          name: e.name,
          category: e.category,
          difficulty: e.difficulty_level,
          description: (e.description || '').substring(0, 150)
        }));
      }

      case 'get_exercise_details': {
        const exercise = getExerciseByCode(toolInput.code);
        if (!exercise) return { error: `Exercise ${toolInput.code} not found in library` };
        return exercise;
      }

      case 'get_storyboard': {
        const exercise = getExerciseByCode(toolInput.exercise_code);
        const storyboard = getOrGenerateStoryboard(toolInput.exercise_code, exercise);
        if (!storyboard) return { error: `Could not generate storyboard for ${toolInput.exercise_code}` };
        return storyboard;
      }

      case 'validate_intake': {
        const result = validateIntake(toolInput);
        return result;
      }

      case 'get_conditions': {
        return new Promise((resolve, reject) => {
          this.db.all('SELECT * FROM conditions ORDER BY category, name', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });
      }

      case 'get_patient_data': {
        try {
          const patient = await PatientDB.getById(toolInput.patient_id);
          if (!patient) return { error: `Patient ${toolInput.patient_id} not found` };
          const protocols = await ProtocolDB.getByPatientId(toolInput.patient_id);
          return { patient, protocols: protocols || [] };
        } catch (err) {
          return { error: err.message };
        }
      }

      case 'generate_protocol': {
        const totalWeeks = toolInput.total_weeks || 8;
        const formData = {
          diagnosis: toolInput.diagnosis,
          affectedRegion: toolInput.affected_region || 'hindlimb',
          patientName: toolInput.patient_name,
          painWithActivity: toolInput.pain_level || 3,
          treatmentApproach: toolInput.treatment_approach || 'conservative_first',
          contraindications: toolInput.contraindications || ''
        };

        const validation = validateIntake(formData);
        if (validation.errors && validation.errors.length > 0) {
          return { error: 'Intake validation failed', errors: validation.errors };
        }

        const weeks = [];
        for (let week = 1; week <= totalWeeks; week++) {
          const exercises = selectExercisesForWeek(week, totalWeeks, ALL_EXERCISES, formData);
          const phase = getPhaseForWeek(week, totalWeeks, getProtocolType(formData.diagnosis, formData.affectedRegion, formData.treatmentApproach));
          weeks.push({
            week,
            phase,
            exercises: exercises.map(e => ({
              code: e.code,
              name: e.name,
              category: e.category,
              sets_reps: e.sets_reps || e.reps || 'Per clinical judgment'
            }))
          });
        }

        return {
          patientName: toolInput.patient_name,
          diagnosis: toolInput.diagnosis,
          totalWeeks,
          protocolType: getProtocolType(formData.diagnosis, formData.affectedRegion, formData.treatmentApproach),
          warnings: validation.warnings || [],
          weeks
        };
      }

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  }

  // ─── Conversation History Helpers ───

  async getConversationMessages(conversationId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM ai_messages WHERE conversation_id = ? ORDER BY created_at ASC',
        [conversationId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  async saveMessage(conversationId, role, content, extra = {}) {
    const id = extra.id || null;
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO ai_messages (conversation_id, role, content, structured_data, tool_calls, token_count, provider, model)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          conversationId,
          role,
          content,
          extra.structuredData ? JSON.stringify(extra.structuredData) : null,
          extra.toolCalls ? JSON.stringify(extra.toolCalls) : null,
          extra.tokenCount || 0,
          extra.provider || null,
          extra.model || null
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, conversationId, role, content });
        }
      );
    });
  }

  async trackUsage(userId, conversationId, provider, model, inputTokens, outputTokens) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO ai_usage (user_id, conversation_id, provider, model, input_tokens, output_tokens)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, conversationId, provider, model, inputTokens, outputTokens],
        (err) => err ? reject(err) : resolve()
      );
    });
  }

  // ─── Build Messages Array for API Call ───

  _buildMessagesForAnthropic(history) {
    return history
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));
  }

  _buildMessagesForOpenAI(history, systemPrompt) {
    const messages = [{ role: 'system', content: systemPrompt }];
    history.forEach(m => {
      messages.push({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      });
    });
    return messages;
  }

  // ─── Send Message (Non-Streaming) ───

  async sendMessage(conversationId, userMessage, context = {}) {
    const activeProvider = this._getActiveClient();
    if (!activeProvider) {
      throw new Error('No AI provider configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.');
    }

    // Save user message
    await this.saveMessage(conversationId, 'user', userMessage);

    // Get conversation history
    const history = await this.getConversationMessages(conversationId);

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt({
      includeProtocols: true,
      includeStoryboard: context.contextType === 'storyboard',
      patient: context.patient || null,
      protocols: context.protocols || null,
      conditions: context.conditions || null
    });

    const model = this._getModel(activeProvider);
    let response;

    if (activeProvider === 'anthropic') {
      response = await this._sendAnthropic(systemPrompt, history, model);
    } else {
      response = await this._sendOpenAI(systemPrompt, history, model);
    }

    // Save assistant message
    const saved = await this.saveMessage(conversationId, 'assistant', response.content, {
      toolCalls: response.toolCalls,
      tokenCount: (response.inputTokens || 0) + (response.outputTokens || 0),
      provider: activeProvider,
      model
    });

    // Track usage
    if (context.userId) {
      await this.trackUsage(
        context.userId, conversationId, activeProvider, model,
        response.inputTokens || 0, response.outputTokens || 0
      );
    }

    // Update conversation timestamp
    this.db.run(
      'UPDATE ai_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [conversationId]
    );

    return {
      id: saved.id,
      role: 'assistant',
      content: response.content,
      toolCalls: response.toolCalls || [],
      provider: activeProvider,
      model
    };
  }

  // ─── Anthropic Claude Implementation ───

  async _sendAnthropic(systemPrompt, history, model) {
    const messages = this._buildMessagesForAnthropic(history);
    let fullContent = '';
    const toolCalls = [];
    let inputTokens = 0;
    let outputTokens = 0;

    // Loop for tool calling
    let currentMessages = [...messages];
    let maxIterations = 5;

    while (maxIterations > 0) {
      maxIterations--;

      const response = await this.anthropicClient.messages.create({
        model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemPrompt,
        tools: AI_TOOLS_ANTHROPIC,
        messages: currentMessages
      });

      inputTokens += response.usage?.input_tokens || 0;
      outputTokens += response.usage?.output_tokens || 0;

      // Process content blocks
      let hasToolUse = false;
      const toolResults = [];

      for (const block of response.content) {
        if (block.type === 'text') {
          fullContent += block.text;
        } else if (block.type === 'tool_use') {
          hasToolUse = true;
          const result = await this.handleToolCall(block.name, block.input);
          toolCalls.push({ name: block.name, input: block.input, result });
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result)
          });
        }
      }

      if (!hasToolUse || response.stop_reason !== 'tool_use') {
        break;
      }

      // Add assistant response and tool results for next iteration
      currentMessages.push({ role: 'assistant', content: response.content });
      currentMessages.push({ role: 'user', content: toolResults });
    }

    return { content: fullContent, toolCalls, inputTokens, outputTokens };
  }

  // ─── OpenAI Implementation ───

  async _sendOpenAI(systemPrompt, history, model) {
    const messages = this._buildMessagesForOpenAI(history, systemPrompt);
    let fullContent = '';
    const toolCalls = [];
    let inputTokens = 0;
    let outputTokens = 0;

    let currentMessages = [...messages];
    let maxIterations = 5;

    while (maxIterations > 0) {
      maxIterations--;

      const response = await this.openaiClient.chat.completions.create({
        model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        tools: getToolsForOpenAI(),
        messages: currentMessages
      });

      const choice = response.choices[0];
      inputTokens += response.usage?.prompt_tokens || 0;
      outputTokens += response.usage?.completion_tokens || 0;

      if (choice.message.content) {
        fullContent += choice.message.content;
      }

      if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        currentMessages.push(choice.message);

        for (const tc of choice.message.tool_calls) {
          const args = JSON.parse(tc.function.arguments);
          const result = await this.handleToolCall(tc.function.name, args);
          toolCalls.push({ name: tc.function.name, input: args, result });

          currentMessages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: JSON.stringify(result)
          });
        }

        if (choice.finish_reason === 'tool_calls') continue;
      }

      break;
    }

    return { content: fullContent, toolCalls, inputTokens, outputTokens };
  }

  // ─── Streaming (SSE) ───

  async streamMessage(conversationId, userMessage, context = {}, onChunk) {
    const activeProvider = this._getActiveClient();
    if (!activeProvider) {
      throw new Error('No AI provider configured.');
    }

    await this.saveMessage(conversationId, 'user', userMessage);
    const history = await this.getConversationMessages(conversationId);

    const systemPrompt = buildSystemPrompt({
      includeProtocols: true,
      includeStoryboard: context.contextType === 'storyboard',
      patient: context.patient || null,
      protocols: context.protocols || null,
      conditions: context.conditions || null
    });

    const model = this._getModel(activeProvider);
    let result;

    if (activeProvider === 'anthropic') {
      result = await this._streamAnthropic(systemPrompt, history, model, onChunk);
    } else {
      result = await this._streamOpenAI(systemPrompt, history, model, onChunk);
    }

    // Save the full assistant response
    await this.saveMessage(conversationId, 'assistant', result.content, {
      toolCalls: result.toolCalls,
      tokenCount: (result.inputTokens || 0) + (result.outputTokens || 0),
      provider: activeProvider,
      model
    });

    if (context.userId) {
      await this.trackUsage(
        context.userId, conversationId, activeProvider, model,
        result.inputTokens || 0, result.outputTokens || 0
      );
    }

    this.db.run(
      'UPDATE ai_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [conversationId]
    );

    return result;
  }

  async _streamAnthropic(systemPrompt, history, model, onChunk) {
    const messages = this._buildMessagesForAnthropic(history);
    let fullContent = '';
    const toolCalls = [];
    let inputTokens = 0;
    let outputTokens = 0;

    const stream = this.anthropicClient.messages.stream({
      model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      system: systemPrompt,
      tools: AI_TOOLS_ANTHROPIC,
      messages
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        fullContent += event.delta.text;
        onChunk({ type: 'text_delta', text: event.delta.text });
      } else if (event.type === 'content_block_start' && event.content_block?.type === 'tool_use') {
        onChunk({ type: 'tool_start', name: event.content_block.name });
      } else if (event.type === 'message_delta' && event.usage) {
        outputTokens += event.usage.output_tokens || 0;
      } else if (event.type === 'message_start' && event.message?.usage) {
        inputTokens += event.message.usage.input_tokens || 0;
      }
    }

    // Handle tool calls from the final message
    const finalMessage = await stream.finalMessage();
    for (const block of finalMessage.content) {
      if (block.type === 'tool_use') {
        const result = await this.handleToolCall(block.name, block.input);
        toolCalls.push({ name: block.name, input: block.input, result });
        onChunk({ type: 'tool_result', name: block.name, result });

        // If there were tool calls, we need to continue the conversation
        if (finalMessage.stop_reason === 'tool_use') {
          const continuationMessages = [
            ...messages,
            { role: 'assistant', content: finalMessage.content },
            {
              role: 'user',
              content: [{
                type: 'tool_result',
                tool_use_id: block.id,
                content: JSON.stringify(result)
              }]
            }
          ];

          // Non-streaming continuation after tool use
          const continuation = await this.anthropicClient.messages.create({
            model,
            max_tokens: this.maxTokens,
            temperature: this.temperature,
            system: systemPrompt,
            tools: AI_TOOLS_ANTHROPIC,
            messages: continuationMessages
          });

          for (const contBlock of continuation.content) {
            if (contBlock.type === 'text') {
              fullContent += contBlock.text;
              onChunk({ type: 'text_delta', text: contBlock.text });
            }
          }

          inputTokens += continuation.usage?.input_tokens || 0;
          outputTokens += continuation.usage?.output_tokens || 0;
        }
      }
    }

    return { content: fullContent, toolCalls, inputTokens, outputTokens };
  }

  async _streamOpenAI(systemPrompt, history, model, onChunk) {
    const messages = this._buildMessagesForOpenAI(history, systemPrompt);
    let fullContent = '';
    const toolCalls = [];
    let inputTokens = 0;
    let outputTokens = 0;

    const stream = await this.openaiClient.chat.completions.create({
      model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      tools: getToolsForOpenAI(),
      messages,
      stream: true,
      stream_options: { include_usage: true }
    });

    const pendingToolCalls = {};

    for await (const chunk of stream) {
      const choice = chunk.choices?.[0];
      if (!choice) {
        if (chunk.usage) {
          inputTokens = chunk.usage.prompt_tokens || 0;
          outputTokens = chunk.usage.completion_tokens || 0;
        }
        continue;
      }

      if (choice.delta?.content) {
        fullContent += choice.delta.content;
        onChunk({ type: 'text_delta', text: choice.delta.content });
      }

      if (choice.delta?.tool_calls) {
        for (const tc of choice.delta.tool_calls) {
          if (!pendingToolCalls[tc.index]) {
            pendingToolCalls[tc.index] = { id: tc.id, name: tc.function?.name || '', arguments: '' };
          }
          if (tc.function?.name) pendingToolCalls[tc.index].name = tc.function.name;
          if (tc.function?.arguments) pendingToolCalls[tc.index].arguments += tc.function.arguments;
        }
      }

      if (choice.finish_reason === 'tool_calls') {
        // Process accumulated tool calls
        for (const [, tc] of Object.entries(pendingToolCalls)) {
          const args = JSON.parse(tc.arguments);
          onChunk({ type: 'tool_start', name: tc.name });
          const result = await this.handleToolCall(tc.name, args);
          toolCalls.push({ name: tc.name, input: args, result });
          onChunk({ type: 'tool_result', name: tc.name, result });
        }

        // Continue conversation with tool results
        const toolMessages = [...messages];
        const assistantMsg = { role: 'assistant', content: fullContent || null, tool_calls: [] };
        for (const [, tc] of Object.entries(pendingToolCalls)) {
          assistantMsg.tool_calls.push({
            id: tc.id,
            type: 'function',
            function: { name: tc.name, arguments: tc.arguments }
          });
        }
        toolMessages.push(assistantMsg);

        for (const [, tc] of Object.entries(pendingToolCalls)) {
          const args = JSON.parse(tc.arguments);
          const result = await this.handleToolCall(tc.name, args);
          toolMessages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: JSON.stringify(result)
          });
        }

        const continuation = await this.openaiClient.chat.completions.create({
          model,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          messages: toolMessages
        });

        const contChoice = continuation.choices[0];
        if (contChoice.message.content) {
          fullContent += contChoice.message.content;
          onChunk({ type: 'text_delta', text: contChoice.message.content });
        }

        inputTokens += continuation.usage?.prompt_tokens || 0;
        outputTokens += continuation.usage?.completion_tokens || 0;
      }
    }

    return { content: fullContent, toolCalls, inputTokens, outputTokens };
  }

  // ─── Conversation Management ───

  async createConversation(userId, title, patientId, contextType) {
    const id = uuidv4();
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO ai_conversations (id, user_id, title, patient_id, context_type)
         VALUES (?, ?, ?, ?, ?)`,
        [id, userId, title || 'New conversation', patientId || null, contextType || 'general'],
        (err) => {
          if (err) reject(err);
          else resolve({ id, userId, title: title || 'New conversation', patientId, contextType: contextType || 'general' });
        }
      );
    });
  }

  async getConversations(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT c.*, COUNT(m.id) as message_count
         FROM ai_conversations c
         LEFT JOIN ai_messages m ON m.conversation_id = c.id
         WHERE c.user_id = ?
         GROUP BY c.id
         ORDER BY c.updated_at DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  async getConversation(conversationId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM ai_conversations WHERE id = ?',
        [conversationId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async deleteConversation(conversationId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM ai_conversations WHERE id = ?',
        [conversationId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // ─── Contextual Suggestions ───

  getSuggestions(contextType) {
    const base = [
      { label: 'Clinical Q&A', prompt: 'What exercises are appropriate for early TPLO recovery?', icon: 'chat', category: 'general' },
      { label: 'Exercise lookup', prompt: 'Show me details for passive range of motion exercises', icon: 'search', category: 'general' },
      { label: 'Protocol help', prompt: 'Help me create a protocol for a dog with hip dysplasia', icon: 'clipboard', category: 'general' }
    ];

    const contextual = {
      intake: [
        { label: 'Validate form', prompt: 'Validate the current intake form for red flags and missing fields', icon: 'check', category: 'intake' },
        { label: 'Explain diagnosis', prompt: 'Explain the diagnosis options and their implications for treatment', icon: 'info', category: 'intake' },
        { label: 'Check contraindications', prompt: 'What contraindications should I be aware of for this patient?', icon: 'alert', category: 'intake' }
      ],
      exercise: [
        { label: 'Exercise alternatives', prompt: 'What are safer alternatives to this exercise?', icon: 'swap', category: 'exercise' },
        { label: 'Generate storyboard', prompt: 'Generate a clinical storyboard for this exercise', icon: 'film', category: 'exercise' },
        { label: 'Progression path', prompt: 'What is the progression path after this exercise?', icon: 'trending', category: 'exercise' }
      ],
      protocol: [
        { label: 'Modify protocol', prompt: 'How should I modify this protocol for a geriatric patient?', icon: 'edit', category: 'protocol' },
        { label: 'Phase progression', prompt: 'Explain the phase progression criteria for this protocol', icon: 'layers', category: 'protocol' },
        { label: 'Safety check', prompt: 'Are there any safety concerns with this protocol configuration?', icon: 'shield', category: 'protocol' }
      ],
      storyboard: [
        { label: 'Generate storyboard', prompt: 'Generate a full 14-point storyboard for this exercise', icon: 'film', category: 'storyboard' },
        { label: 'Frame details', prompt: 'Explain the clinical cues for each frame of this storyboard', icon: 'frame', category: 'storyboard' }
      ]
    };

    return [...base, ...(contextual[contextType] || [])];
  }

  // ─── Status Check ───

  getStatus() {
    return {
      provider: this.provider,
      anthropicAvailable: !!this.anthropicClient,
      openaiAvailable: !!this.openaiClient,
      activeProvider: this._getActiveClient(),
      model: this._getModel(this._getActiveClient() || 'anthropic'),
      maxTokens: this.maxTokens,
      temperature: this.temperature
    };
  }
}

module.exports = AIService;
