/**
 * Pure stream parser and state machine for Voltrix AI stream.
 *
 * Implements:
 * 1. Single explicit state machine: idle -> streaming -> completed | failed | cancelled
 * 2. Completion without terminal markers (normal connection close after >=1 non-empty fragment)
 * 3. Mid-stream recovery if accumulated text ends with </message> or </file>
 * 4. Resilient chunk buffer splitting and raw text accumulation (never per-fragment XML parsing)
 */

export type StreamState = 'idle' | 'streaming' | 'completed' | 'failed' | 'cancelled';

export interface StreamEventResult {
  state: StreamState;
  accumulatedText: string;
  error?: Error;
}

export interface ParsedBlockOutput {
  message: string;
  reasoning: string;
  files: Array<{ path: string; content: string }>;
  isStreamingXml: boolean;
}

/**
 * Checks whether the accumulated text ends with a valid terminal XML tag.
 */
export function isTerminalXml(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.endsWith('</message>') || trimmed.endsWith('</file>');
}

/**
 * Parses raw SSE line to extract fragment text.
 * Server sends: `data:{"text":"<fragment>"}` followed by blank line.
 * Also tolerates: `data: {"text":"..."}`, `data: {"content":"..."}`, comments (`: ping`), and plain text.
 */
export function parseSseLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith(':')) {
    // Empty line or comment line
    return null;
  }

  if (trimmed.startsWith('data:')) {
    const rawPayload = trimmed.slice(5).trim();
    if (!rawPayload) return null;

    // Fast-path / legacy markers (server may or may not send, ignore if empty)
    if (rawPayload === '[DONE]') {
      return null;
    }

    try {
      const parsed = JSON.parse(rawPayload);
      if (typeof parsed === 'string') {
        return parsed;
      }
      if (parsed && typeof parsed === 'object') {
        if (typeof parsed.text === 'string') {
          return parsed.text;
        }
        if (typeof parsed.content === 'string') {
          return parsed.content;
        }
        if (typeof parsed.message === 'string') {
          return parsed.message;
        }
      }
      return rawPayload;
    } catch {
      // Non-JSON plain text fragment
      return rawPayload;
    }
  }

  return null;
}

/**
 * Parses accumulated XML-like text into structured components without crashing on partial/in-progress tags.
 */
export function parseAccumulatedBlocks(rawText: string): ParsedBlockOutput {
  if (!rawText) {
    return { message: '', reasoning: '', files: [], isStreamingXml: false };
  }

  const hasXml = /<(message|thought|file)\b/i.test(rawText);
  if (!hasXml) {
    return {
      message: rawText,
      reasoning: '',
      files: [],
      isStreamingXml: false,
    };
  }

  let reasoning = '';
  let message = '';
  const files: Array<{ path: string; content: string }> = [];

  // Extract <thought>...</thought>
  const thoughtMatch = /<thought>([\s\S]*?)(?:<\/thought>|$)/i.exec(rawText);
  if (thoughtMatch) {
    reasoning = thoughtMatch[1].trim();
  }

  // Extract <message>...</message>
  const messageMatch = /<message>([\s\S]*?)(?:<\/message>|$)/i.exec(rawText);
  if (messageMatch) {
    message = messageMatch[1].trim();
  }

  // Extract all <file path="...">...</file> blocks
  const fileRegex = /<file\s+path=["']([^"']+)["']>([\s\S]*?)(?:<\/file>|$)/gi;
  let match: RegExpExecArray | null;
  while ((match = fileRegex.exec(rawText)) !== null) {
    files.push({
      path: match[1],
      content: match[2],
    });
  }

  // If no <message> tag was provided but there is text outside <file> and <thought>
  if (!message && !files.length) {
    message = rawText.replace(/<thought>[\s\S]*?(?:<\/thought>|$)/gi, '').trim();
  }

  return {
    message,
    reasoning,
    files,
    isStreamingXml: true,
  };
}

export interface StreamControllerOptions {
  onFragment?: (fragment: string, accumulated: string) => void;
  onStateChange?: (state: StreamState) => void;
  onCompleted?: (finalText: string) => void;
  onFailed?: (error: Error, partialText: string) => void;
  onCancelled?: (partialText: string) => void;
}

/**
 * Pure stream consumer. Handles network read loop, TextDecoder with streaming,
 * buffer boundary splitting, state transitions, and cancellation.
 */
export async function consumeStream(
  response: Response,
  signal: AbortSignal,
  options: StreamControllerOptions = {}
): Promise<StreamEventResult> {
  const { onFragment, onStateChange, onCompleted, onFailed, onCancelled } = options;

  let state: StreamState = 'streaming';
  if (onStateChange) onStateChange(state);

  if (!response.ok) {
    let errorText = '';
    try {
      const errJson = await response.json();
      errorText = errJson.message || errJson.error || JSON.stringify(errJson);
    } catch {
      errorText = await response.text().catch(() => '');
    }
    const err = new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
    state = 'failed';
    if (onStateChange) onStateChange(state);
    if (onFailed) onFailed(err, '');
    return { state, accumulatedText: '', error: err };
  }

  if (!response.body) {
    const err = new Error('ReadableStream not supported on response body');
    state = 'failed';
    if (onStateChange) onStateChange(state);
    if (onFailed) onFailed(err, '');
    return { state, accumulatedText: '', error: err };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let accumulatedText = '';
  let lineBuffer = '';
  let nonEmptyFragmentCount = 0;

  try {
    while (true) {
      if (signal.aborted) {
        state = 'cancelled';
        if (onStateChange) onStateChange(state);
        if (onCancelled) onCancelled(accumulatedText);
        try {
          await reader.cancel();
        } catch {
          // ignore
        }
        return { state, accumulatedText };
      }

      const { value, done } = await reader.read();

      if (done) {
        // Stream completed cleanly from server closing the connection
        break;
      }

      if (value) {
        lineBuffer += decoder.decode(value, { stream: true });
        const lines = lineBuffer.split(/\r?\n/);
        // Retain the last incomplete line
        lineBuffer = lines.pop() ?? '';

        for (const line of lines) {
          const fragment = parseSseLine(line);
          if (fragment && fragment.length > 0) {
            nonEmptyFragmentCount++;
            accumulatedText += fragment;
            if (onFragment) {
              onFragment(fragment, accumulatedText);
            }
          }
        }
      }
    }

    // Flush decoder and process remaining buffer tail
    lineBuffer += decoder.decode();
    if (lineBuffer.trim()) {
      const fragment = parseSseLine(lineBuffer);
      if (fragment && fragment.length > 0) {
        nonEmptyFragmentCount++;
        accumulatedText += fragment;
        if (onFragment) {
          onFragment(fragment, accumulatedText);
        }
      }
    }

    // Check completion criteria
    if (signal.aborted) {
      state = 'cancelled';
      if (onStateChange) onStateChange(state);
      if (onCancelled) onCancelled(accumulatedText);
      return { state, accumulatedText };
    }

    if (nonEmptyFragmentCount === 0) {
      const err = new Error('The AI returned an empty response');
      state = 'failed';
      if (onStateChange) onStateChange(state);
      if (onFailed) onFailed(err, '');
      return { state, accumulatedText, error: err };
    }

    // Server closed connection after >= 1 non-empty fragment -> completed!
    state = 'completed';
    if (onStateChange) onStateChange(state);
    if (onCompleted) onCompleted(accumulatedText);
    return { state, accumulatedText };
  } catch (rawError: unknown) {
    if (signal.aborted) {
      state = 'cancelled';
      if (onStateChange) onStateChange(state);
      if (onCancelled) onCancelled(accumulatedText);
      return { state, accumulatedText };
    }

    const error = rawError instanceof Error ? rawError : new Error(String(rawError));

    // Mid-stream network error: if accumulated text ends with terminal XML tag, treat as completed
    if (nonEmptyFragmentCount > 0 && isTerminalXml(accumulatedText)) {
      console.warn(
        '[Stream] Connection dropped mid-stream but accumulated text ended with valid terminal tag. Treating as completed.'
      );
      state = 'completed';
      if (onStateChange) onStateChange(state);
      if (onCompleted) onCompleted(accumulatedText);
      return { state, accumulatedText };
    }

    state = 'failed';
    if (onStateChange) onStateChange(state);
    if (onFailed) onFailed(error, accumulatedText);
    return { state, accumulatedText, error };
  }
}
