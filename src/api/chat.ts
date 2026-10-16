import { intelligenceApi } from './client';
import { getFullUrl, INTELLIGENCE_PREFIX } from './config';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';

export type ChatRole = 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL';
export type EventType = 'THOUGHT' | 'MESSAGE' | 'FILE_EDIT' | 'TOOL_LOG' | 'PROGRESS' | 'ERROR';

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
  error?: string;
}

/**
 * Parses SSE data payload into ChatEvent.
 * Supports structured JSON (including ERROR and PROGRESS events) and plain text fallback.
 */
export const parseStreamEvent = (rawData: string): ChatEvent => {
  const trimmed = rawData.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      const rawType = (parsed.type || '').toString().toUpperCase();
      let eventType: EventType = 'MESSAGE';
      if (
        rawType === 'THOUGHT' ||
        rawType === 'FILE_EDIT' ||
        rawType === 'TOOL_LOG' ||
        rawType === 'PROGRESS' ||
        rawType === 'ERROR'
      ) {
        eventType = rawType as EventType;
      } else if (parsed.error || parsed.code) {
        eventType = 'ERROR';
      }

      return {
        id: parsed.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: eventType,
        sequenceOrder: typeof parsed.sequenceOrder === 'number' ? parsed.sequenceOrder : Date.now(),
        content: parsed.content || parsed.message || parsed.error || '',
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

    // Internal AbortController for idle timeout management (raised to 90s with 10s heartbeats)
    const internalController = new AbortController();
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const IDLE_TIMEOUT_MS = 90000; // 90s idle timeout for dead streams

    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        internalController.abort(new Error('Connection timed out - no data or heartbeat received from server for 90 seconds.'));
      }, IDLE_TIMEOUT_MS);
    };

    const handleExternalAbort = () => {
      internalController.abort(signal?.reason || new Error('Stream aborted by user'));
    };

    if (signal) {
      if (signal.aborted) {
        handleExternalAbort();
      } else {
        signal.addEventListener('abort', handleExternalAbort);
      }
    }

    let receivedDone = false;

    try {
      resetIdleTimer();

      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message, projectId }),
        signal: internalController.signal,
      });

      if (!response.ok) {
        let errorBody = '';
        try {
          const errorJson = await response.json();
          errorBody = errorJson.message || errorJson.error || JSON.stringify(errorJson);
        } catch {
          errorBody = await response.text().catch(() => '');
        }

        if (response.status === 401) {
          useAuthStore.getState().logout();
          toast.error('Session expired. Please log in again.');
          if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            window.location.href = '/login';
          }
          throw new Error('Session expired (401). Please log in again.');
        } else if (response.status === 403) {
          toast.error('Access Denied: You do not have permission for this workspace.');
          throw new Error(errorBody || 'Access Denied (403): You do not have permission for this workspace.');
        } else if (response.status === 429) {
          toast.error('Token quota exceeded for daily limit.', {
            action: {
              label: 'Upgrade Plan',
              onClick: () => { window.location.href = '/billing'; },
            },
          });
          throw new Error(errorBody || 'Token quota limit exceeded (429)');
        }

        throw new Error(errorBody || `HTTP Error ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported on response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let currentEventType = 'message';

      while (true) {
        const { value, done } = await reader.read();

        // Any chunk resets the idle heartbeat timer
        resetIdleTimer();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);

        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) {
            currentEventType = 'message';
            continue;
          }

          if (trimmedLine.startsWith(':')) {
            // Heartbeat comment (: ping)
            resetIdleTimer();
            continue;
          }

          if (trimmedLine.startsWith('event:')) {
            currentEventType = trimmedLine.slice(6).trim();
            if (currentEventType === 'ping') {
              resetIdleTimer();
            }
            continue;
          }

          if (trimmedLine.startsWith('data:')) {
            const dataContent = trimmedLine.slice(5).trim();
            if (!dataContent) continue;

            if (dataContent === '[DONE]' || dataContent === '{"type":"done"}' || dataContent === '{"type":"DONE"}') {
              receivedDone = true;
              if (onComplete) onComplete();
              return;
            }

            if (currentEventType === 'ping' || dataContent === 'ping') {
              resetIdleTimer();
              continue;
            }

            if (currentEventType === 'error') {
              let errMsg = dataContent;
              try {
                const parsed = JSON.parse(dataContent);
                errMsg = parsed.message || parsed.error || dataContent;
              } catch {
                // Keep raw dataContent
              }
              throw new Error(errMsg || 'The AI took too long to respond. Please retry.');
            }

            const parsedEvent = parseStreamEvent(dataContent);
            if (parsedEvent.type === 'ERROR') {
              throw new Error(parsedEvent.content || 'The AI took too long to respond. Please retry.');
            }
            if ((parsedEvent.type as string).toLowerCase() === 'done') {
              receivedDone = true;
              if (onComplete) onComplete();
              return;
            }

            // Any progress or message event resets idle timer
            resetIdleTimer();
            onEvent(parsedEvent);
          }
        }
      }

      // Process any remaining tail in buffer
      if (buffer.trim()) {
        const trimmedLine = buffer.trim();
        if (trimmedLine.startsWith('data:')) {
          const dataContent = trimmedLine.slice(5).trim();
          if (dataContent === '[DONE]' || dataContent === '{"type":"done"}' || dataContent === '{"type":"DONE"}') {
            receivedDone = true;
            if (onComplete) onComplete();
            return;
          }
          if (dataContent) {
            if (currentEventType === 'error') {
              let errMsg = dataContent;
              try {
                const parsed = JSON.parse(dataContent);
                errMsg = parsed.message || parsed.error || dataContent;
              } catch {}
              throw new Error(errMsg || 'The AI took too long to respond. Please retry.');
            }
            const parsedEvent = parseStreamEvent(dataContent);
            if (parsedEvent.type === 'ERROR') {
              throw new Error(parsedEvent.content || 'The AI took too long to respond. Please retry.');
            }
            if ((parsedEvent.type as string).toLowerCase() === 'done') {
              receivedDone = true;
              if (onComplete) onComplete();
              return;
            }
            onEvent(parsedEvent);
          }
        }
      }

      // If stream reached EOF without receiving a done event, treat as connection lost
      if (!receivedDone) {
        throw new Error('The connection was lost unexpectedly before response finished.');
      }

      if (onComplete) onComplete();
    } catch (err: unknown) {
      if (signal?.aborted) {
        // Stream aborted cleanly by user via Stop button
        toast.info('AI Response generation stopped');
        if (onComplete) onComplete();
        return;
      }
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[Voltrix AI Stream Error]', error);
      toast.error(error.message);
      if (onError) onError(error);
    } finally {
      if (idleTimer) clearTimeout(idleTimer);
      if (signal) {
        signal.removeEventListener('abort', handleExternalAbort);
      }
    }
  },
};
