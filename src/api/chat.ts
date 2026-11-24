import { intelligenceApi } from './client';
import { getFullUrl, INTELLIGENCE_PREFIX } from './config';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';
import {
  consumeStream,
  parseAccumulatedBlocks,
  StreamState,
} from '../utils/streamParser';

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
  isStreaming?: boolean;
}

export interface StreamChatOptions {
  message: string;
  projectId: string;
  onEvent?: (event: ChatEvent) => void;
  onRawChunk?: (fragment: string, accumulated: string) => void;
  onError?: (error: Error, partialText?: string) => void;
  onComplete?: (accumulatedText: string) => void;
  onCancelled?: (partialText: string) => void;
  onStateChange?: (state: StreamState) => void;
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
    onRawChunk,
    onError,
    onComplete,
    onCancelled,
    onStateChange,
    signal,
  }: StreamChatOptions): Promise<void> => {
    const streamUrl = getFullUrl(INTELLIGENCE_PREFIX, '/chat/stream');
    const token = useAuthStore.getState().token;

    // Internal AbortController for idle timeout management (90s)
    const internalController = new AbortController();
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const IDLE_TIMEOUT_MS = 90000;

    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        internalController.abort(
          new Error('Connection timed out - no data received from server for 90 seconds.')
        );
      }, IDLE_TIMEOUT_MS);
    };

    const handleExternalAbort = () => {
      internalController.abort(signal?.reason || new Error('Stream cancelled'));
    };

    if (signal) {
      if (signal.aborted) {
        handleExternalAbort();
      } else {
        signal.addEventListener('abort', handleExternalAbort);
      }
    }

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
          throw new Error(errorBody || 'Access Denied (403)');
        } else if (response.status === 429) {
          toast.error('Token quota exceeded for daily limit.', {
            action: {
              label: 'Upgrade Plan',
              onClick: () => {
                window.location.href = '/billing';
              },
            },
          });
          throw new Error(errorBody || 'Token quota limit exceeded (429)');
        }

        throw new Error(errorBody || `HTTP Error ${response.status}: ${response.statusText}`);
      }

      let lastEmittedLength = 0;
      let lastThought = '';
      const emittedFiles = new Set<string>();

      await consumeStream(response, internalController.signal, {
        onStateChange,
        onFragment: (fragment, accumulated) => {
          resetIdleTimer();
          if (onRawChunk) {
            onRawChunk(fragment, accumulated);
          }

          // Parse blocks and emit structured events if onEvent listener provided
          if (onEvent) {
            const blocks = parseAccumulatedBlocks(accumulated);

            // New message fragment
            if (blocks.message.length > lastEmittedLength) {
              const incrementalMessage = blocks.message.slice(lastEmittedLength);
              lastEmittedLength = blocks.message.length;
              onEvent({
                id: `evt-msg-${Date.now()}`,
                type: 'MESSAGE',
                sequenceOrder: Date.now(),
                content: incrementalMessage,
              });
            }

            // Reasoning / thought
            if (blocks.reasoning && blocks.reasoning !== lastThought) {
              lastThought = blocks.reasoning;
              onEvent({
                id: `evt-thought-${Date.now()}`,
                type: 'THOUGHT',
                sequenceOrder: Date.now(),
                content: blocks.reasoning,
              });
            }

            // File edits
            for (const f of blocks.files) {
              if (!emittedFiles.has(f.path) || f.content) {
                emittedFiles.add(f.path);
                onEvent({
                  id: `evt-file-${f.path}`,
                  type: 'FILE_EDIT',
                  sequenceOrder: Date.now(),
                  content: f.content,
                  filePath: f.path,
                });
              }
            }
          }
        },
        onCompleted: (finalText) => {
          if (onComplete) onComplete(finalText);
        },
        onFailed: (error, partialText) => {
          console.error('[Voltrix AI Stream Failed]', error);
          if (onError) onError(error, partialText);
        },
        onCancelled: (partialText) => {
          if (onCancelled) onCancelled(partialText);
        },
      });
    } catch (err: unknown) {
      if (internalController.signal.aborted || signal?.aborted) {
        if (onCancelled) onCancelled('');
        return;
      }
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[Voltrix AI Stream Error]', error);
      if (onError) onError(error);
    } finally {
      if (idleTimer) clearTimeout(idleTimer);
      if (signal) {
        signal.removeEventListener('abort', handleExternalAbort);
      }
    }
  },
};
