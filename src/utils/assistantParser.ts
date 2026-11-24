/**
 * Pure assistant response parser and data model.
 *
 * Implements:
 * 1. parseAssistantText(buffer: string, isStreaming: boolean): AssistantView
 * 2. Tolerant tag parsing (holding back trailing partial tags while streaming)
 * 3. Text blocks merged, trimmed, consecutive newlines collapsed
 * 4. File content discarded completely from chat UI
 * 5. Deduplication of file cards by normalized path
 * 6. Mapping of persisted events into the same unified AssistantView
 */

export type FileBlockStatus = 'editing' | 'done' | 'failed';

export interface TextBlock {
  kind: 'text';
  text: string;
  isOpen: boolean;
}

export interface FileBlock {
  kind: 'file';
  path: string;
  status: FileBlockStatus;
}

export type Block = TextBlock | FileBlock;

export interface AssistantView {
  reasoning?: {
    text: string;
    durationSeconds?: number;
  };
  blocks: Block[];
}

/**
 * Strips leading slashes, trims whitespace, and normalizes file path.
 */
export function normalizePath(rawPath: string): string {
  if (!rawPath) return '';
  return rawPath.trim().replace(/^\/+/, '');
}

/**
 * Checks if a string ends with a partial/unclosed XML tag that was cut off mid-token.
 * E.g. "<fil", "<file path=\"src/ind", "</fi", "<th", "</mess".
 */
export function findTrailingPartialTagIndex(text: string): number {
  const lastLt = text.lastIndexOf('<');
  if (lastLt === -1) return -1;

  const afterLt = text.slice(lastLt);
  // If closing '>' occurs after the last '<', it is not partial
  if (afterLt.includes('>')) return -1;

  // Pattern matching start of any XML tag: < or </ followed by tag name prefix or attributes
  if (/^<\/?(?:file|message|thought|\w+)?(?:\s+[^>]*)?$/i.test(afterLt)) {
    return lastLt;
  }

  return -1;
}

/**
 * Collapses 3 or more consecutive newlines into 2.
 */
function cleanNewlines(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
}

/**
 * Pure function parsing the WHOLE accumulated buffer into an AssistantView.
 * Deterministic, idempotent, and tolerant to mid-stream partial tags.
 */
export function parseAssistantText(buffer: string, isStreaming: boolean): AssistantView {
  if (!buffer || typeof buffer !== 'string') {
    return { blocks: [] };
  }

  let textToParse = buffer;

  // While streaming, hold back any trailing partial tag so it is not emitted as text
  if (isStreaming) {
    const partialIdx = findTrailingPartialTagIndex(textToParse);
    if (partialIdx !== -1) {
      textToParse = textToParse.slice(0, partialIdx);
    }
  }

  let reasoningText = '';
  // Extract <thought>...</thought>
  const thoughtMatch = /<thought>([\s\S]*?)(?:<\/thought>|$)/i.exec(textToParse);
  if (thoughtMatch) {
    reasoningText = thoughtMatch[1].trim();
    // Remove the thought block so it doesn't leak into message blocks
    textToParse = textToParse.replace(/<thought>[\s\S]*?(?:<\/thought>|$)/i, '');
  }

  const rawBlocks: Block[] = [];
  // Tokenizer pattern for <message>, </message>, <file path="...">, </file>
  const tokenRegex = /<message>|<\/message>|<file\s+path=["']([^"']*)["']>|<\/file>/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let currentFile: { path: string; startIndex: number } | null = null;
  let inMessage = false;

  while ((match = tokenRegex.exec(textToParse)) !== null) {
    const fullMatch = match[0];
    const matchIndex = match.index;

    // Text prior to this tag
    const precedingText = textToParse.slice(lastIndex, matchIndex);
    lastIndex = matchIndex + fullMatch.length;

    if (currentFile) {
      // We are inside a <file> block: discard all content!
      if (/^<\/file>/i.test(fullMatch)) {
        rawBlocks.push({
          kind: 'file',
          path: currentFile.path,
          status: 'done',
        });
        currentFile = null;
      }
      continue;
    }

    // Outside file blocks: any text becomes a text block
    if (precedingText.trim()) {
      rawBlocks.push({
        kind: 'text',
        text: cleanNewlines(precedingText.trim()),
        isOpen: false,
      });
    }

    if (/^<message>/i.test(fullMatch)) {
      inMessage = true;
    } else if (/^<\/message>/i.test(fullMatch)) {
      inMessage = false;
    } else if (/^<file\b/i.test(fullMatch)) {
      const rawPath = match[1] || '';
      const normPath = normalizePath(rawPath);
      currentFile = { path: normPath, startIndex: matchIndex };
    }
  }

  // Trailing text after last matched tag
  if (currentFile) {
    // Unclosed file tag while streaming or incomplete
    rawBlocks.push({
      kind: 'file',
      path: currentFile.path,
      status: isStreaming ? 'editing' : 'done',
    });
  } else {
    const trailingText = textToParse.slice(lastIndex);
    if (trailingText.trim()) {
      rawBlocks.push({
        kind: 'text',
        text: cleanNewlines(trailingText.trim()),
        isOpen: isStreaming,
      });
    }
  }

  // If buffer had an unclosed <message> while streaming, mark the text block as open
  if (isStreaming && inMessage) {
    for (let i = rawBlocks.length - 1; i >= 0; i--) {
      if (rawBlocks[i].kind === 'text') {
        (rawBlocks[i] as TextBlock).isOpen = true;
        break;
      }
    }
  }

  // Merge consecutive text blocks & drop whitespace-only blocks
  const mergedBlocks: Block[] = [];
  for (const block of rawBlocks) {
    if (block.kind === 'text') {
      const trimmed = block.text.trim();
      if (!trimmed) continue;

      const prev = mergedBlocks[mergedBlocks.length - 1];
      if (prev && prev.kind === 'text') {
        prev.text = cleanNewlines(`${prev.text}\n\n${trimmed}`);
        prev.isOpen = block.isOpen || prev.isOpen;
      } else {
        mergedBlocks.push({
          kind: 'text',
          text: cleanNewlines(trimmed),
          isOpen: block.isOpen,
        });
      }
    } else {
      mergedBlocks.push(block);
    }
  }

  // Deduplicate file blocks by normalized path (Rule 4)
  // Keep ONE block at the position of its first appearance.
  // Status is "editing" if any occurrence is still editing, otherwise "done".
  const finalBlocks: Block[] = [];
  const fileIndices = new Map<string, number>();

  for (const block of mergedBlocks) {
    if (block.kind === 'file') {
      const normPath = normalizePath(block.path);
      if (fileIndices.has(normPath)) {
        const existingIdx = fileIndices.get(normPath)!;
        const existingBlock = finalBlocks[existingIdx] as FileBlock;
        if (block.status === 'editing') {
          existingBlock.status = 'editing';
        }
      } else {
        const newFileBlock: FileBlock = {
          kind: 'file',
          path: normPath,
          status: block.status,
        };
        fileIndices.set(normPath, finalBlocks.length);
        finalBlocks.push(newFileBlock);
      }
    } else {
      finalBlocks.push(block);
    }
  }

  return {
    reasoning: reasoningText ? { text: reasoningText } : undefined,
    blocks: finalBlocks,
  };
}

export interface PersistedEventLike {
  type: string;
  content: string;
  filePath?: string;
}

export interface PersistedMessageLike {
  content?: string;
  events?: PersistedEventLike[];
}

/**
 * Maps persisted messages (from chatApi.getHistory) into the unified AssistantView.
 * Deduplicates file edits and guarantees identical visual structure to live view.
 */
export function mapPersistedMessageToView(message: PersistedMessageLike): AssistantView {
  // If message has raw XML content, parse it through parseAssistantText
  if (message.content && /<(message|thought|file)\b/i.test(message.content)) {
    return parseAssistantText(message.content, false);
  }

  // Otherwise map from structured events
  let reasoningText = '';
  const textBlocks: TextBlock[] = [];
  const fileMap = new Map<string, FileBlock>();

  if (message.events && Array.isArray(message.events)) {
    for (const evt of message.events) {
      if (evt.type === 'THOUGHT') {
        reasoningText = evt.content.trim();
      } else if (evt.type === 'FILE_EDIT' && evt.filePath) {
        const norm = normalizePath(evt.filePath);
        if (!fileMap.has(norm)) {
          fileMap.set(norm, {
            kind: 'file',
            path: norm,
            status: 'done',
          });
        }
      } else if (evt.type === 'MESSAGE' && evt.content.trim()) {
        textBlocks.push({
          kind: 'text',
          text: cleanNewlines(evt.content.trim()),
          isOpen: false,
        });
      }
    }
  }

  // If no structured message events, use root content
  if (textBlocks.length === 0 && message.content && message.content.trim()) {
    textBlocks.push({
      kind: 'text',
      text: cleanNewlines(message.content.trim()),
      isOpen: false,
    });
  }

  const blocks: Block[] = [];
  if (textBlocks.length > 0) {
    blocks.push(textBlocks[0]);
  }
  for (const fileBlock of fileMap.values()) {
    blocks.push(fileBlock);
  }
  if (textBlocks.length > 1) {
    // Add summary text blocks
    for (let i = 1; i < textBlocks.length; i++) {
      blocks.push(textBlocks[i]);
    }
  }

  return {
    reasoning: reasoningText ? { text: reasoningText } : undefined,
    blocks,
  };
}
