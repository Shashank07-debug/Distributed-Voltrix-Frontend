import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { chatApi, ChatMessage } from '../../api/chat';
import { ProjectRole } from '../../api/workspace';
import { parseAssistantText } from '../../utils/assistantParser';
import { AssistantMessage } from './AssistantMessage';
import { Composer } from './Composer';

interface ChatPaneProps {
  projectId: string;
  role: ProjectRole;
  onFileEdited?: (filePath: string) => void;
  onStreamStateChange?: (isStreaming: boolean) => void;
  onGenerationCompleted?: () => void;
}

export const ChatPane: React.FC<ChatPaneProps> = ({
  projectId,
  role,
  onFileEdited,
  onStreamStateChange,
  onGenerationCompleted,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  // Throttled streaming buffer refs
  const streamingBufferRef = useRef('');
  const lastCommitTimeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const notifiedFilesRef = useRef<Set<string>>(new Set());
  const streamStartTimeRef = useRef(0);

  const isReadOnly = role === 'VIEWER';

  useEffect(() => {
    if (onStreamStateChange) {
      onStreamStateChange(isStreaming);
    }
  }, [isStreaming, onStreamStateChange]);

  // Load chat history
  useEffect(() => {
    let isMounted = true;
    setIsLoadingHistory(true);
    chatApi
      .getHistory(projectId)
      .then((data: unknown) => {
        if (isMounted) {
          const list = Array.isArray(data)
            ? (data as ChatMessage[])
            : Array.isArray((data as { messages?: ChatMessage[] })?.messages)
            ? (data as { messages: ChatMessage[] }).messages
            : [];
          setMessages(list);
        }
      })
      .catch(() => {
        if (isMounted) setMessages([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingHistory(false);
      });

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [projectId]);

  // Handle user scroll detection
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    userScrolledUpRef.current = distanceToBottom > 80;
  };

  // Auto-scroll to bottom only when user has not scrolled up
  useEffect(() => {
    if (!userScrolledUpRef.current) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  // Commit throttled buffer to state
  const commitLiveContent = useCallback((assistantMsgId: string, content: string, isStillStreaming = true) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantMsgId
          ? {
              ...msg,
              content,
              isStreaming: isStillStreaming,
            }
          : msg
      )
    );
  }, []);

  /**
   * Primary stream initiator.
   * If retryAssistantIndex is provided, we reuse the existing user message without adding a duplicate bubble!
   */
  const executeGeneration = async (promptText: string, retryAssistantIndex?: number) => {
    const userText = promptText.trim();
    if (!userText || isStreaming || isReadOnly) return;

    let assistantMsgId: string;

    if (typeof retryAssistantIndex === 'number' && messages[retryAssistantIndex]) {
      // Retry in-place: clear error & reset assistant message
      assistantMsgId = messages[retryAssistantIndex].id;
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === retryAssistantIndex
            ? { ...msg, content: '', events: [], error: undefined, isStreaming: true }
            : msg
        )
      );
    } else {
      // New prompt: add one user message and one assistant message
      setInputMessage('');
      const userMsgId = `user-${Date.now()}`;
      assistantMsgId = `assistant-${Date.now()}`;

      const newUserMsg: ChatMessage = {
        id: userMsgId,
        role: 'USER',
        content: userText,
        createdAt: new Date().toISOString(),
        events: [],
      };

      const newAssistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'ASSISTANT',
        content: '',
        createdAt: new Date().toISOString(),
        events: [],
        isStreaming: true,
      };

      setMessages((prev) => [...prev, newUserMsg, newAssistantMsg]);
    }

    userScrolledUpRef.current = false;
    setIsStreaming(true);
    streamingBufferRef.current = '';
    notifiedFilesRef.current.clear();
    lastCommitTimeRef.current = performance.now();
    streamStartTimeRef.current = Date.now();

    // Cancel any previous stream before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      await chatApi.streamChat({
        message: userText,
        projectId,
        signal: abortController.signal,
        onRawChunk: (_fragment: string, accumulated: string) => {
          streamingBufferRef.current = accumulated;

          // Notify file tree for newly observed files
          const view = parseAssistantText(accumulated, true);
          for (const block of view.blocks) {
            if (block.kind === 'file' && !notifiedFilesRef.current.has(block.path)) {
              notifiedFilesRef.current.add(block.path);
              if (onFileEdited) {
                onFileEdited(block.path);
              }
            }
          }

          // Throttle commit to state: at most once per animation frame or ~50ms
          const now = performance.now();
          if (now - lastCommitTimeRef.current >= 50) {
            lastCommitTimeRef.current = now;
            commitLiveContent(assistantMsgId, accumulated, true);
          } else if (!rafIdRef.current) {
            rafIdRef.current = requestAnimationFrame(() => {
              rafIdRef.current = null;
              lastCommitTimeRef.current = performance.now();
              commitLiveContent(assistantMsgId, streamingBufferRef.current, true);
            });
          }
        },
        onComplete: (finalText: string) => {
          if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
          }

          const elapsedSeconds = Math.round((Date.now() - streamStartTimeRef.current) / 1000);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    content: finalText || streamingBufferRef.current,
                    isStreaming: false,
                    error: undefined,
                    tokenUsed: elapsedSeconds,
                  }
                : msg
            )
          );

          if (onGenerationCompleted) {
            onGenerationCompleted();
          }
        },
        onError: (err: Error, partialText?: string) => {
          if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    content: partialText || streamingBufferRef.current || msg.content,
                    isStreaming: false,
                    error: err.message || 'Stream connection ended unexpectedly.',
                  }
                : msg
            )
          );
        },
        onCancelled: (partialText?: string) => {
          if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    content: partialText || streamingBufferRef.current || msg.content,
                    isStreaming: false,
                  }
                : msg
            )
          );
        },
      });
    } catch (err: unknown) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      const errorMsg = err instanceof Error ? err.message : 'Unexpected streaming failure';
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, isStreaming: false, error: errorMsg }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleSend = () => {
    executeGeneration(inputMessage);
  };

  const handleRetry = (assistantMsgIndex: number) => {
    if (isStreaming) return;
    // Find the corresponding user message
    let promptToRetry = '';
    for (let i = assistantMsgIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'USER') {
        promptToRetry = messages[i].content;
        break;
      }
    }
    if (promptToRetry) {
      // Retry in-place with NO duplicate user bubble
      executeGeneration(promptToRetry, assistantMsgIndex);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--landing-surface-1)] overflow-hidden">
      {/* ── Fixed Header (40px) ────────────────────────────────────────────── */}
      <div className="h-10 min-h-10 max-h-10 box-border px-3.5 border-b border-[var(--landing-border)] flex items-center justify-between bg-[var(--landing-bg-ink)] shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-[var(--landing-accent)] animate-ping' : 'bg-emerald-400'}`} />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--landing-text-primary)]">
            AI BUILDER
          </span>
        </div>
        {isStreaming && (
          <span className="text-[10px] font-mono text-[var(--landing-accent)] animate-pulse">
            streaming...
          </span>
        )}
      </div>

      {/* ── Messages Area (flex-1 min-h-0 overflow-y-auto) ────────────────── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        data-lenis-prevent
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4"
      >
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-32 text-xs font-mono text-[var(--landing-text-secondary)]">
            loading prompt trajectory...
          </div>
        ) : !Array.isArray(messages) || messages.length === 0 ? (
          <div className="text-center my-10 px-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--landing-accent-subtle)] border border-[var(--landing-accent)]/30 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-[var(--landing-accent)]" />
            </div>
            <h4 className="font-display text-sm font-bold text-white mb-1">
              what shall we build?
            </h4>
            <p className="text-xs text-[var(--landing-text-secondary)] leading-relaxed max-w-xs mx-auto font-sans">
              describe features, components, or styles. voltrix ai will scaffold and edit files live.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'USER' ? 'items-end' : 'items-start'} w-full`}
            >
              {msg.role === 'USER' ? (
                // User Bubble: right-aligned, max 85% width
                <div className="max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2.5 bg-[var(--landing-surface-2)] border border-[var(--landing-border-strong)] text-[var(--landing-text-primary)] text-xs font-medium shadow-sm leading-relaxed font-sans whitespace-pre-wrap">
                  {msg.content}
                </div>
              ) : (
                // Unified Assistant Message: left-aligned with NO extra nested bordered boxes
                <div className="w-full text-xs text-[var(--landing-text-primary)] leading-relaxed font-sans">
                  <AssistantMessage
                    message={msg}
                    isStreaming={msg.isStreaming}
                    onRetry={() => handleRetry(idx)}
                    onOpenFile={onFileEdited}
                    durationSeconds={msg.tokenUsed}
                  />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* ── Pinned Composer ─────────────────────────────────────────────────── */}
      <Composer
        value={inputMessage}
        onChange={setInputMessage}
        onSend={handleSend}
        onStop={handleStop}
        isStreaming={isStreaming}
        isReadOnly={isReadOnly}
      />
    </div>
  );
};
