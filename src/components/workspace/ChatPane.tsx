import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ChevronDown,
  ChevronRight,
  FileCode,
  CheckCircle2,
  Terminal,
  Brain,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';
import { chatApi, ChatMessage, ChatEvent } from '../../api/chat';
import { ProjectRole } from '../../api/workspace';
import { Composer } from './Composer';
import { toast } from 'sonner';

interface ChatPaneProps {
  projectId: string;
  role: ProjectRole;
  onFileEdited?: (filePath: string) => void;
  onStreamStateChange?: (isStreaming: boolean) => void;
  onGenerationCompleted?: () => void;
}

/* ─── Code Block with Copy Button ─────────────────────────────────────────── */
const CodeBlock: React.FC<{ language?: string; value: string }> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg-ink)] overflow-hidden font-mono text-xs">
      <div className="px-3 py-1.5 bg-[var(--landing-surface-1)] border-b border-[var(--landing-border)] flex items-center justify-between text-[11px] text-[var(--landing-text-secondary)]">
        <span>{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-[var(--landing-accent)]" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'copied' : 'copy'}</span>
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-gray-200 leading-relaxed font-mono text-[11px]" data-lenis-prevent>
        <code>{value}</code>
      </pre>
    </div>
  );
};

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
  const [activeThoughtCollapsed, setActiveThoughtCollapsed] = useState<Record<string, boolean>>({});

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

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

  const toggleThought = (eventId: string) => {
    setActiveThoughtCollapsed((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

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
        onEvent: (event: ChatEvent) => {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === assistantMsgId) {
                const updatedEvents = [...msg.events, event];
                if (event.type === 'FILE_EDIT' && event.filePath && onFileEdited) {
                  onFileEdited(event.filePath);
                }
                return {
                  ...msg,
                  events: updatedEvents,
                  content:
                    event.type === 'MESSAGE'
                      ? msg.content + event.content
                      : msg.content,
                };
              }
              return msg;
            })
          );
        },
        onComplete: () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, isStreaming: false, error: undefined } : msg
            )
          );
          if (onGenerationCompleted) {
            onGenerationCompleted();
          }
        },
        onError: (err: Error) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    isStreaming: false,
                    error: err.message || 'Stream connection ended unexpectedly.',
                  }
                : msg
            )
          );
        },
        onCancelled: () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
            )
          );
        },
      });
    } catch (err: unknown) {
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

  const renderEvent = (event: ChatEvent) => {
    switch (event.type) {
      case 'THOUGHT': {
        const isCollapsed = activeThoughtCollapsed[event.id] ?? true;
        return (
          <div key={event.id} className="my-1.5 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface-2)]/40 overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => toggleThought(event.id)}
              aria-label="Toggle thinking trace"
              className="w-full px-3 py-1.5 flex items-center justify-between text-[var(--landing-text-secondary)] hover:text-white font-mono text-[11px] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-[var(--landing-accent)]" />
                <span>reasoning trace</span>
              </div>
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {!isCollapsed && (
              <div className="p-3 font-mono text-[11px] text-[var(--landing-text-secondary)] bg-[var(--landing-bg-ink)] border-t border-[var(--landing-border)] leading-relaxed whitespace-pre-wrap">
                {event.content}
              </div>
            )}
          </div>
        );
      }

      case 'FILE_EDIT':
        return (
          <div
            key={event.id}
            className="my-1.5 px-3 py-2 rounded-xl bg-[var(--landing-accent-subtle)] border border-[var(--landing-accent)]/30 flex items-center justify-between text-xs font-mono"
          >
            <div className="flex items-center gap-2 text-[var(--landing-accent)] truncate">
              <FileCode className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                edited <strong className="text-[var(--landing-text-primary)]">{event.filePath || 'file'}</strong>
              </span>
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
          </div>
        );

      case 'TOOL_LOG':
        return (
          <div key={event.id} className="my-1 px-2.5 py-1 rounded-lg bg-[var(--landing-bg-ink)] border border-[var(--landing-border)] font-mono text-[11px] text-[var(--landing-text-secondary)] flex items-center gap-2">
            <Terminal className="w-3 h-3 text-[var(--landing-accent)] shrink-0" />
            <span className="truncate">{event.content}</span>
          </div>
        );

      case 'PROGRESS':
        return (
          <div
            key={event.id}
            className="my-1 px-2.5 py-1 rounded-lg bg-[var(--landing-surface-2)] border border-[var(--landing-border)] font-mono text-[11px] text-[var(--landing-accent)] flex items-center gap-2 animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--landing-accent)] shrink-0" />
            <span className="truncate">{event.content}</span>
          </div>
        );

      case 'MESSAGE':
      default:
        return (
          <div key={event.id} className="prose prose-invert prose-sm max-w-none text-[var(--landing-text-primary)] leading-relaxed font-sans text-xs">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !String(children).includes('\n');
                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-[var(--landing-accent)]" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <CodeBlock
                      language={match ? match[1] : undefined}
                      value={String(children).replace(/\n$/, '')}
                    />
                  );
                },
              }}
            >
              {event.content}
            </ReactMarkdown>
          </div>
        );
    }
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
              className={`flex flex-col ${msg.role === 'USER' ? 'items-end' : 'items-start'}`}
            >
              {msg.role === 'USER' ? (
                // User Bubble: right-aligned, max 85% width
                <div className="max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2.5 bg-[var(--landing-surface-2)] border border-[var(--landing-border-strong)] text-[var(--landing-text-primary)] text-xs font-medium shadow-sm leading-relaxed font-sans whitespace-pre-wrap">
                  {msg.content}
                </div>
              ) : (
                // Assistant Message: left-aligned with NO nested bordered boxes
                <div className="w-full text-xs text-[var(--landing-text-primary)] leading-relaxed font-sans">
                  {msg.events && msg.events.length > 0 ? (
                    msg.events
                      .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0))
                      .map(renderEvent)
                  ) : msg.content ? (
                    <div className="prose prose-invert prose-sm max-w-none text-[var(--landing-text-primary)] font-sans text-xs">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  ) : msg.isStreaming ? (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--landing-text-secondary)] py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)] animate-ping" />
                      <span>thinking...</span>
                    </div>
                  ) : null}

                  {/* Compact Single Inline Error Alert with Retry Button */}
                  {msg.error && (
                    <div className="mt-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-center justify-between text-xs font-sans gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate">{msg.error}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRetry(idx)}
                        disabled={isStreaming}
                        aria-label="Retry generation"
                        className="px-2.5 py-1 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 text-[11px] font-mono flex items-center gap-1 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>retry</span>
                      </button>
                    </div>
                  )}
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
