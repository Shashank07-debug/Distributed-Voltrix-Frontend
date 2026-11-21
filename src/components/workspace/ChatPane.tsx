import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Square,
  ChevronDown,
  ChevronRight,
  FileCode,
  CheckCircle2,
  Terminal,
  Brain,
  Sparkles,
  Lock,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';
import { chatApi, ChatMessage, ChatEvent } from '../../api/chat';
import { ProjectRole } from '../../api/workspace';
import { toast } from 'sonner';

interface ChatPaneProps {
  projectId: string;
  role: ProjectRole;
  onFileEdited?: (filePath: string) => void;
  isStreamingState?: boolean;
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

export const ChatPane: React.FC<ChatPaneProps> = ({ projectId, role, onFileEdited }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeThoughtCollapsed, setActiveThoughtCollapsed] = useState<Record<string, boolean>>({});

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isReadOnly = role === 'VIEWER';

  // Load chat history
  useEffect(() => {
    let isMounted = true;
    setIsLoadingHistory(true);
    chatApi
      .getHistory(projectId)
      .then((data) => {
        if (isMounted) {
          setMessages(data || []);
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

  // Auto scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const toggleThought = (eventId: string) => {
    setActiveThoughtCollapsed((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const handleSend = async (customPrompt?: string) => {
    const userText = (customPrompt !== undefined ? customPrompt : inputMessage).trim();
    if (!userText || isStreaming || isReadOnly) return;

    if (customPrompt === undefined) {
      setInputMessage('');
    }

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

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
    };

    setMessages((prev) => [...prev, newUserMsg, newAssistantMsg]);
    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      await chatApi.streamChat({
        message: userText,
        projectId,
        signal: abortController.signal,
        onEvent: (event: ChatEvent) => {
          setMessages((prev) => {
            return prev.map((msg) => {
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
            });
          });
        },
        onComplete: () => {},
        onError: (err: Error) => {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === assistantMsgId) {
                return {
                  ...msg,
                  error: err.message || 'The connection was lost unexpectedly.',
                };
              }
              return msg;
            })
          );
        },
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unexpected streaming failure';
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === assistantMsgId) {
            return {
              ...msg,
              error: errorMsg,
            };
          }
          return msg;
        })
      );
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetry = (assistantMsgIndex: number) => {
    if (isStreaming) return;
    let promptToRetry = '';
    for (let i = assistantMsgIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'USER') {
        promptToRetry = messages[i].content;
        break;
      }
    }
    if (promptToRetry) {
      handleSend(promptToRetry);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderEvent = (event: ChatEvent) => {
    switch (event.type) {
      case 'THOUGHT': {
        const isCollapsed = activeThoughtCollapsed[event.id] ?? true;
        return (
          <div key={event.id} className="my-2 rounded-xl bg-[var(--landing-surface-2)] border border-[var(--landing-border)] overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => toggleThought(event.id)}
              className="w-full px-3 py-1.5 flex items-center justify-between text-[var(--landing-text-secondary)] hover:text-white font-mono text-[11px] transition-colors"
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
            className="my-2 p-2.5 rounded-xl bg-[var(--landing-accent-subtle)] border border-[var(--landing-accent)]/30 flex items-center justify-between text-xs font-mono"
          >
            <div className="flex items-center gap-2 text-[var(--landing-accent)]">
              <FileCode className="w-4 h-4" />
              <span>edited <strong className="text-[var(--landing-text-primary)]">{event.filePath || 'file'}</strong></span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        );

      case 'TOOL_LOG':
        return (
          <div key={event.id} className="my-1.5 px-2.5 py-1 rounded-lg bg-[var(--landing-bg-ink)] border border-[var(--landing-border)] font-mono text-[11px] text-[var(--landing-text-secondary)] flex items-center gap-2">
            <Terminal className="w-3 h-3 text-[var(--landing-accent)]" />
            <span className="truncate">{event.content}</span>
          </div>
        );

      case 'PROGRESS':
        return (
          <div
            key={event.id}
            className="my-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--landing-surface-2)] border border-[var(--landing-border)] font-mono text-[11px] text-[var(--landing-accent)] flex items-center gap-2 animate-pulse"
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
    <div className="flex flex-col h-full bg-[var(--landing-surface-1)] border-r border-[var(--landing-border)] overflow-hidden">
      {/* ── Panel Header (40px) matching unified header spec ───────────────── */}
      <div className="h-10 min-h-10 max-h-10 box-border px-3.5 border-b border-[var(--landing-border)] flex items-center justify-between bg-[var(--landing-bg-ink)] shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-[var(--landing-accent)] animate-ping' : 'bg-[var(--landing-accent)]'}`} />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--landing-text-primary)]">
            AI BUILDER
          </span>
        </div>
        {isStreaming && (
          <span className="text-[10px] font-mono text-[var(--landing-accent)] animate-pulse">
            generating...
          </span>
        )}
      </div>

      {/* ── Messages Stream Container ──────────────────────────────────────── */}
      <div
        data-lenis-prevent
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-32 text-xs font-mono text-[var(--landing-text-secondary)]">
            loading prompt trajectory...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center my-10 px-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--landing-accent-subtle)] border border-[var(--landing-accent)]/30 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-[var(--landing-accent)]" />
            </div>
            <h4 className="font-display text-sm font-bold text-white mb-1">
              what shall we build?
            </h4>
            <p className="text-xs text-[var(--landing-text-secondary)] leading-relaxed max-w-xs mx-auto">
              describe features, backend endpoints, or UI components. voltrix ai will scaffold and edit files live.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'USER' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-3.5 text-xs ${
                  msg.role === 'USER'
                    ? 'bg-[var(--landing-surface-2)] border border-[var(--landing-border-strong)] text-[var(--landing-text-primary)] font-medium'
                    : 'bg-[var(--landing-surface-2)]/60 border border-[var(--landing-border)] text-[var(--landing-text-primary)]'
                }`}
              >
                {msg.role === 'USER' ? (
                  <p className="whitespace-pre-wrap leading-relaxed font-sans">{msg.content}</p>
                ) : (
                  <div>
                    {msg.events && msg.events.length > 0 ? (
                      msg.events
                        .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0))
                        .map(renderEvent)
                    ) : (
                      msg.content && (
                        <div className="prose prose-invert prose-sm max-w-none text-[var(--landing-text-primary)] font-sans text-xs">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                      )
                    )}

                    {/* Assistant Error State with Retry Button */}
                    {msg.error && (
                      <div className="mt-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex flex-col gap-2">
                        <div className="flex items-start gap-2 text-xs">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <div className="flex-1 font-mono text-[11px] leading-relaxed">
                            <span className="font-semibold text-red-200">generation failed: </span>
                            <span>{msg.error}</span>
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleRetry(idx)}
                            disabled={isStreaming}
                            className="px-3 py-1 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-200 text-xs font-mono flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>retry</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* ── Sticky Composer ────────────────────────────────────────────────── */}
      <div className="p-3 border-t border-[var(--landing-border)] bg-[var(--landing-bg-ink)]">
        {isReadOnly ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-[var(--landing-text-secondary)]">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>read-only role (VIEWER). prompting disabled.</span>
          </div>
        ) : (
          <div className="relative flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Ask Voltrix AI to build or edit code... (Enter to send)"
              rows={2}
              className="w-full bg-[var(--landing-surface-1)] border border-[var(--landing-border)] hover:border-[var(--landing-border-hover)] rounded-xl p-3 text-base sm:text-xs text-[var(--landing-text-primary)] placeholder:text-[var(--landing-text-secondary)] placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent-ring)] resize-none transition-all disabled:opacity-60 font-sans"
              style={{ fontSize: '16px' }}
            />
            {isStreaming ? (
              <button
                onClick={handleStop}
                type="button"
                className="h-11 w-11 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
                title="Stop generation"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!inputMessage.trim()}
                type="button"
                className="h-11 w-11 rounded-xl bg-[var(--landing-accent)] hover:bg-[var(--landing-accent-hover)] text-[#090D0F] transition-all flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95 cursor-pointer"
                title="Send instruction to AI"
              >
                <Send className="w-4 h-4 text-[#090D0F]" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
