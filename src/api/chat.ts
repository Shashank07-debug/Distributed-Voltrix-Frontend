import { intelligenceApi } from './client';
import { getFullUrl, INTELLIGENCE_PREFIX } from './config';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';

export type ChatRole = 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL';
export type EventType = 'THOUGHT' | 'MESSAGE' | 'FILE_EDIT' | 'TOOL_LOG';

export interface ChatEvent {
  id: string;
  type: EventType;
  sequenceOrder: number;
  content: string;
  filePath?: string;
  metadata?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  tokenUsed?: number;
  createdAt: string;
  events: ChatEvent[];
}

/**
 * TODO: Confirm real SSE event JSON payload structure with backend owners.
 * This parser assumes each `data:` payload is JSON matching ChatEvent.
 * If parsing fails, it gracefully falls back to treating the payload as plain text of type 'MESSAGE'.
 */
export const parseStreamEvent = (rawData: string): ChatEvent => {
  const trimmed = rawData.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      return {
        id: parsed.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: (parsed.type as EventType) || 'MESSAGE',
        sequenceOrder: typeof parsed.sequenceOrder === 'number' ? parsed.sequenceOrder : Date.now(),
        content: parsed.content || '',
        filePath: parsed.filePath,
        metadata: parsed.metadata,
      };
    }
  } catch {
    // Graceful fallback for non-JSON or plain text SSE streams
  }

  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'MESSAGE',
    sequenceOrder: Date.now(),
    content: rawData,
  };
};

export interface StreamChatOptions {
  message: string;
  projectId: string;
  onEvent: (event: ChatEvent) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
  signal?: AbortSignal;
}

export const chatApi = {
  getHistory: async (projectId: string): Promise<ChatMessage[]> => {
    const response = await intelligenceApi.get<ChatMessage[]>(`/chat/projects/${projectId}`);
    return response.data;
  },

  streamChat: async ({
    message,
    projectId,
    onEvent,
    onError,
    onComplete,
    signal,
  }: StreamChatOptions): Promise<void> => {
    const streamUrl = getFullUrl(INTELLIGENCE_PREFIX, '/chat/stream');
    const token = useAuthStore.getState().token;

    try {
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message, projectId }),
        signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          useAuthStore.getState().logout();
          toast.error('Session expired during streaming. Please re-authenticate.');
          window.location.href = '/login';
          return;
        } else if (response.status === 429) {
          toast.error('Token quota exceeded for daily limit.', {
            action: {
              label: 'Upgrade Plan',
              onClick: () => { window.location.href = '/billing'; },
            },
          });
          throw new Error('Token quota limit exceeded');
        }
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported on response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine.startsWith(':')) {
            // Empty line or SSE comment
            continue;
          }

          if (trimmedLine.startsWith('data:')) {
            const dataContent = trimmedLine.slice(5).trim();
            if (dataContent === '[DONE]') {
              if (onComplete) onComplete();
              return;
            }

            if (dataContent) {
              const parsedEvent = parseStreamEvent(dataContent);
              onEvent(parsedEvent);
            }
          }
        }
      }

      // Process any remaining tail in buffer
      if (buffer.trim().startsWith('data:')) {
        const dataContent = buffer.trim().slice(5).trim();
        if (dataContent && dataContent !== '[DONE]') {
          const parsedEvent = parseStreamEvent(dataContent);
          onEvent(parsedEvent);
        }
      }

      if (onComplete) onComplete();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Stream aborted by user via Stop button
        toast.info('AI Response generation stopped');
        if (onComplete) onComplete();
        return;
      }
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(`Stream error: ${error.message}`);
      if (onError) onError(error);
    }
  },
};
