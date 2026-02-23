// services/ai-api.ts — Frontend API service for K9 Rehab Pro Vet AI

import { AI_API_BASE_URL } from '../config/api';
import type {
  AIConversation,
  AIMessage,
  AISuggestion,
  AIStatus,
  AIUsageStats,
  StreamEvent,
  SendMessageContext
} from '../types/ai';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('k9_auth_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// ─── AI Status ───

export async function getAIStatus(): Promise<AIStatus> {
  const res = await fetch(`${AI_API_BASE_URL}/status`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to get AI status');
  return res.json();
}

// ─── Conversations ───

export async function createConversation(
  title?: string,
  patientId?: number,
  contextType?: string
): Promise<AIConversation> {
  const res = await fetch(`${AI_API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, patientId, contextType })
  });
  if (!res.ok) throw new Error('Failed to create conversation');
  return res.json();
}

export async function getConversations(): Promise<AIConversation[]> {
  const res = await fetch(`${AI_API_BASE_URL}/conversations`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to list conversations');
  return res.json();
}

export async function getConversation(id: string): Promise<{
  conversation: AIConversation;
  messages: AIMessage[];
}> {
  const res = await fetch(`${AI_API_BASE_URL}/conversations/${id}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to get conversation');
  return res.json();
}

export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`${AI_API_BASE_URL}/conversations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete conversation');
}

// ─── Messages ───

export async function sendMessage(
  conversationId: string,
  message: string,
  context?: SendMessageContext
): Promise<AIMessage> {
  const res = await fetch(`${AI_API_BASE_URL}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message, context })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to send message' }));
    throw new Error(err.error || 'Failed to send message');
  }
  return res.json();
}

// ─── Streaming via SSE ───

export async function streamMessage(
  conversationId: string,
  message: string,
  context: SendMessageContext | undefined,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${AI_API_BASE_URL}/conversations/${conversationId}/stream`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message, context }),
    signal
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Stream failed' }));
    throw new Error(err.error || 'Stream failed');
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Parse SSE events from buffer
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        const data = trimmed.slice(6);
        try {
          const event: StreamEvent = JSON.parse(data);
          onEvent(event);
          if (event.type === 'done') return;
        } catch {
          // Skip malformed events
        }
      }
    }
  }
}

// ─── Storyboard Animation ───

export async function getStoryboardAnimation(exerciseCode: string): Promise<unknown> {
  const res = await fetch(`${AI_API_BASE_URL}/storyboard/${exerciseCode}/animation`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to load storyboard animation');
  return res.json();
}

// ─── Suggestions ───

export async function getSuggestions(contextType?: string): Promise<AISuggestion[]> {
  const params = contextType ? `?context=${contextType}` : '';
  const res = await fetch(`${AI_API_BASE_URL}/suggestions${params}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) return [];
  return res.json();
}

// ─── Usage ───

export async function getUsageStats(): Promise<AIUsageStats> {
  const res = await fetch(`${AI_API_BASE_URL}/usage`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to get usage stats');
  return res.json();
}
