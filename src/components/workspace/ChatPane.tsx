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
} from 'lucide-react';
import { chatApi, ChatMessage, ChatEvent } from '../../api/chat';
import { ProjectRole } from '../../api/workspace';
import { AiThinkingOrb } from '../canvas/AiThinkingOrb';

interface ChatPaneProps {
  projectId: string;
  role: ProjectRole;
  onFileEdited?: (filePath: string) => void;
}

export const ChatPane: React.FC<ChatPaneProps> = ({ projectId, role, onFileEdited }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeThoughtCollapsed, setActiveThoughtCollapsed] = useState<Record<string, boolean>>({});

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

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
        // Default initial welcome message if history is empty
        if (isMounted) setMessages([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingHistory(false);
      });

    return () => {
      isMounted = false;
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

  const handleSend = async () => {
    if (!inputMessage.trim() || isStreaming || isReadOnly) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    // Append user message immediately
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

    await chatApi.streamChat({
      message: userText,
      projectId,
      signal: abortController.signal,
      onEvent: (event: ChatEvent) => {
        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id === assistantMsgId) {
              const updatedEvents = [...msg.events, event];
              // Trigger file tree refresh if event is FILE_EDIT
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
      onComplete: () => {
        setIsStreaming(false);
        abortControllerRef.current = null;
      },
      onError: () => {
        setIsStreaming(false);
        abortControllerRef.current = null;
      },
    });
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
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
          <div key={event.id} className="my-2 rounded-xl bg-white/5 border border-white/10 overflow-hidden text-xs">
            <button
              onClick={() => toggleThought(event.id)}
              className="w-full px-3 py-1.5 flex items-center justify-between bg-white/5 text-voltrix-muted hover:text-white font-mono transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-voltrix-violet-light" />
                <span>Thinking Process</span>
              </div>
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {!isCollapsed && (
              <div className="p-3 font-mono text-[11px] text-gray-400 bg-[#070709]/80 border-t border-white/5 leading-relaxed whitespace-pre-wrap">
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
            className="my-2 p-2.5 rounded-xl bg-voltrix-cyan/10 border border-voltrix-cyan/30 flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2 font-mono text-voltrix-cyan-light">
              <FileCode className="w-4 h-4 text-voltrix-cyan" />
              <span>Edited <strong className="text-white">{event.filePath || 'file'}</strong></span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        );

      case 'TOOL_LOG':
        return (
          <div key={event.id} className="my-1.5 px-2.5 py-1 rounded-lg bg-[#0D0E15] border border-white/5 font-mono text-[11px] text-gray-400 flex items-center gap-2">
            <Terminal className="w-3 h-3 text-voltrix-muted" />
            <span className="truncate">{event.content}</span>
          </div>
        );

      case 'MESSAGE':
      default:
        return (
          <div key={event.id} className="prose prose-invert prose-sm max-w-none text-gray-200 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{event.content}</ReactMarkdown>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#070709] border-r border-voltrix-border">
      {/* Header */}
      <div className="px-4 py-3 border-b border-voltrix-border flex items-center justify-between bg-voltrix-card/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-voltrix-cyan" />
          <span className="font-display font-semibold text-xs text-white">Voltrix AI Builder</span>
        </div>
        {isStreaming && <AiThinkingOrb size="sm" />}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-32 text-xs font-mono text-voltrix-muted">
            Loading prompt trajectory...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center my-12 px-4">
            <div className="w-12 h-12 rounded-2xl bg-voltrix-violet/10 border border-voltrix-violet/30 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-voltrix-cyan" />
            </div>
            <h4 className="font-display text-sm font-bold text-white mb-1">What application shall we build?</h4>
            <p className="text-xs text-voltrix-muted">
              Describe your feature, layout or full stack application. Voltrix AI will create files in your project workspace.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'USER' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-xs ${
                  msg.role === 'USER'
                    ? 'bg-gradient-to-r from-voltrix-violet to-voltrix-cyan text-white shadow-lg'
                    : 'bg-voltrix-card border border-voltrix-border text-gray-200'
                }`}
              >
                {msg.role === 'USER' ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <div>
                    {msg.events && msg.events.length > 0 ? (
                      msg.events
                        .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0))
                        .map(renderEvent)
                    ) : (
                      <div className="prose prose-invert prose-sm max-w-none text-gray-200">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
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

      {/* Input Area */}
      <div className="p-3 border-t border-voltrix-border bg-voltrix-card/80">
        {isReadOnly ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-voltrix-muted">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Read-only role (VIEWER). You cannot send AI prompts.</span>
          </div>
        ) : (
          <div className="relative flex items-end gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Ask Voltrix AI to build or edit code... (Enter to send, Shift+Enter for newline)"
              rows={2}
              className="w-full bg-[#070709] border border-voltrix-border rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:border-voltrix-cyan focus:outline-none resize-none transition-all disabled:opacity-60"
            />
            {isStreaming ? (
              <button
                onClick={handleStop}
                type="button"
                className="p-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center justify-center"
                title="Stop generation"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!inputMessage.trim()}
                type="button"
                className="p-3 rounded-xl bg-gradient-to-r from-voltrix-violet to-voltrix-cyan text-white hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center shadow-lg"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
