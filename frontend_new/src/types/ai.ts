// types/ai.ts — TypeScript interfaces for K9 Rehab Pro Vet AI

export interface AIConversation {
  id: string;
  user_id: number;
  title: string;
  patient_id?: number;
  context_type: 'general' | 'protocol' | 'exercise' | 'intake' | 'storyboard';
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface AIMessage {
  id: number;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  structured_data?: string | null;
  tool_calls?: string | null;
  token_count?: number;
  provider?: string;
  model?: string;
  created_at: string;
  // Client-side only
  isStreaming?: boolean;
}

export interface AIToolCall {
  name: string;
  input: Record<string, unknown>;
  result?: unknown;
}

export interface AISuggestion {
  label: string;
  prompt: string;
  icon: string;
  category: string;
}

export interface AIStatus {
  provider: string;
  anthropicAvailable: boolean;
  openaiAvailable: boolean;
  activeProvider: string | null;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface AIUsageStats {
  userId: number;
  stats: Array<{
    provider: string;
    model: string;
    request_count: number;
    total_input_tokens: number;
    total_output_tokens: number;
    total_tokens: number;
  }>;
}

export type StreamEventType = 'text_delta' | 'tool_start' | 'tool_result' | 'done' | 'error';

export interface StreamEvent {
  type: StreamEventType;
  text?: string;
  content?: string;
  name?: string;
  result?: unknown;
  error?: string;
}

export interface SendMessageContext {
  contextType?: string;
  patient?: unknown;
  protocols?: unknown[];
  conditions?: unknown[];
}
