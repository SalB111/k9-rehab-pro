// hooks/useAIChat.ts — Custom hook for K9 Rehab Pro Vet AI chat state management

import { useState, useCallback, useRef } from 'react';
import type { AIConversation, AIMessage, SendMessageContext, StreamEvent } from '../types/ai';
import {
  createConversation,
  getConversations,
  getConversation,
  deleteConversation,
  streamMessage,
  sendMessage as sendMessageApi
} from '../services/ai-api';

interface UseAIChatReturn {
  conversations: AIConversation[];
  activeConversation: AIConversation | null;
  messages: AIMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  streamingContent: string;
  loadConversations: () => Promise<void>;
  startNewChat: (title?: string, patientId?: number, contextType?: string) => Promise<AIConversation>;
  selectConversation: (id: string) => Promise<void>;
  removeConversation: (id: string) => Promise<void>;
  send: (message: string, context?: SendMessageContext, useStreaming?: boolean) => Promise<void>;
  stopStreaming: () => void;
  clearError: () => void;
}

export function useAIChat(): UseAIChatReturn {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      const list = await getConversations();
      setConversations(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    }
  }, []);

  const startNewChat = useCallback(async (
    title?: string,
    patientId?: number,
    contextType?: string
  ): Promise<AIConversation> => {
    try {
      setError(null);
      const conv = await createConversation(title, patientId, contextType);
      setActiveConversation(conv);
      setMessages([]);
      setConversations(prev => [conv, ...prev]);
      return conv;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create conversation';
      setError(msg);
      throw err;
    }
  }, []);

  const selectConversation = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { conversation, messages: msgs } = await getConversation(id);
      setActiveConversation(conversation);
      setMessages(msgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeConversation = useCallback(async (id: string) => {
    try {
      await deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversation?.id === id) {
        setActiveConversation(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete conversation');
    }
  }, [activeConversation]);

  const send = useCallback(async (
    message: string,
    context?: SendMessageContext,
    useStreaming = true
  ) => {
    if (!message.trim()) return;

    let convId = activeConversation?.id;

    // Auto-create conversation if none active
    if (!convId) {
      try {
        const conv = await createConversation(
          message.slice(0, 50),
          undefined,
          context?.contextType || 'general'
        );
        convId = conv.id;
        setActiveConversation(conv);
        setConversations(prev => [conv, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create conversation');
        return;
      }
    }

    // Add user message to UI immediately
    const userMsg: AIMessage = {
      id: Date.now(),
      conversation_id: convId,
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setError(null);

    if (useStreaming) {
      setIsStreaming(true);
      setStreamingContent('');

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Add placeholder assistant message
      const placeholderMsg: AIMessage = {
        id: Date.now() + 1,
        conversation_id: convId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
        isStreaming: true
      };
      setMessages(prev => [...prev, placeholderMsg]);

      let accumulated = '';

      try {
        await streamMessage(convId, message, context, (event: StreamEvent) => {
          if (event.type === 'text_delta' || event.type === 'text_delta') {
            const text = event.text || event.content || '';
            accumulated += text;
            setStreamingContent(accumulated);
            // Update the last message (the streaming placeholder)
            setMessages(prev => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === 'assistant') {
                updated[updated.length - 1] = { ...last, content: accumulated };
              }
              return updated;
            });
          } else if (event.type === 'tool_start') {
            // Could show tool call indicator
          } else if (event.type === 'tool_result') {
            // Could show tool result
          } else if (event.type === 'error') {
            setError(event.error || 'Stream error');
          }
        }, abortController.signal);

        // Finalize the message
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: accumulated, isStreaming: false };
          }
          return updated;
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Stream failed');
        }
      } finally {
        setIsStreaming(false);
        setStreamingContent('');
        abortControllerRef.current = null;
      }
    } else {
      // Non-streaming
      setIsLoading(true);
      try {
        const response = await sendMessageApi(convId, message, context);
        setMessages(prev => [...prev, response]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      } finally {
        setIsLoading(false);
      }
    }
  }, [activeConversation]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isStreaming,
    error,
    streamingContent,
    loadConversations,
    startNewChat,
    selectConversation,
    removeConversation,
    send,
    stopStreaming,
    clearError
  };
}
