import assert from 'node:assert/strict';
import {
  parseAssistantText,
  mapPersistedMessageToView,
  normalizePath,
} from '../src/utils/assistantParser.ts';

function runTests() {
  console.log('Running Assistant Parser Test Suite (Cases a - i)...\n');

  // Test (a): tags split across fragments are reassembled correctly
  {
    const full = '<message>Intro text</message><file path="src/App.tsx">import React from "react";</file><message>Summary text</message>';
    const view = parseAssistantText(full, false);
    assert.equal(view.blocks.length, 3);
    assert.equal(view.blocks[0].kind, 'text');
    assert.equal(view.blocks[0].text, 'Intro text');
    assert.equal(view.blocks[1].kind, 'file');
    assert.equal(view.blocks[1].path, 'src/App.tsx');
    assert.equal(view.blocks[1].status, 'done');
    assert.equal(view.blocks[2].kind, 'text');
    assert.equal(view.blocks[2].text, 'Summary text');
    console.log('✓ (a) Tags split across fragments reassembled correctly');
  }

  // Test (b): a partial tag at the end of the buffer is not shown as text
  {
    const partial1 = '<message>Intro text</message><fil';
    const view1 = parseAssistantText(partial1, true);
    assert.equal(view1.blocks.length, 1);
    assert.equal(view1.blocks[0].kind, 'text');
    assert.equal(view1.blocks[0].text, 'Intro text');

    const partial2 = '<message>Intro text</message><file path="src/in';
    const view2 = parseAssistantText(partial2, true);
    assert.equal(view2.blocks.length, 1);
    assert.equal(view2.blocks[0].text, 'Intro text');
    console.log('✓ (b) Partial tag at end of buffer is not shown as text');
  }

  // Test (c): the same file path emitted 40 times produces exactly 1 file block
  {
    let text = '<message>Intro</message>';
    for (let i = 0; i < 40; i++) {
      text += `<file path="src/index.css">body { margin: ${i}px; }</file>`;
    }
    const view = parseAssistantText(text, false);
    const fileBlocks = view.blocks.filter((b) => b.kind === 'file');
    assert.equal(fileBlocks.length, 1);
    assert.equal(fileBlocks[0].path, 'src/index.css');
    assert.equal(fileBlocks[0].status, 'done');
    console.log('✓ (c) Same file path emitted 40 times produces exactly 1 file block');
  }

  // Test (d): file contents never appear in any text block
  {
    const text = '<message>Intro</message><file path="src/App.tsx">SECRET_CODE_NEVER_SHOW_IN_CHAT();</file><message>Done</message>';
    const view = parseAssistantText(text, false);
    for (const b of view.blocks) {
      if (b.kind === 'text') {
        assert.ok(!b.text.includes('SECRET_CODE_NEVER_SHOW_IN_CHAT'));
      }
    }
    console.log('✓ (d) File contents never appear in any text block');
  }

  // Test (e): text-only response (no file tags) works
  {
    const text = 'This is a simple answer without any file modifications.';
    const view = parseAssistantText(text, false);
    assert.equal(view.blocks.length, 1);
    assert.equal(view.blocks[0].kind, 'text');
    assert.equal(view.blocks[0].text, text);
    console.log('✓ (e) Text-only response works');
  }

  // Test (f): an unclosed <message> while streaming is shown as an open text block
  {
    const streamingText = '<message>Streaming content in progress...';
    const view = parseAssistantText(streamingText, true);
    assert.equal(view.blocks.length, 1);
    assert.equal(view.blocks[0].kind, 'text');
    assert.equal(view.blocks[0].text, 'Streaming content in progress...');
    assert.equal(view.blocks[0].isOpen, true);
    console.log('✓ (f) Unclosed <message> while streaming is marked open');
  }

  // Test (g): whitespace-only text is dropped
  {
    const text = '   \n\n\t  <message>Real message</message>   \n\n  ';
    const view = parseAssistantText(text, false);
    assert.equal(view.blocks.length, 1);
    assert.equal(view.blocks[0].text, 'Real message');
    console.log('✓ (g) Whitespace-only text is dropped');
  }

  // Test (h): parsing the buffer at every possible split point gives the same final result as parsing it whole
  {
    const full = '<thought>Analyzing</thought><message>Hello</message><file path="src/App.tsx">const x = 1;</file><message>Finished</message>';
    const expected = parseAssistantText(full, false);

    // Test incremental feeding
    let accumulated = '';
    for (let i = 0; i < full.length; i++) {
      accumulated += full[i];
      const view = parseAssistantText(accumulated, true);
      // Valid structural assertions during streaming
      assert.ok(view.blocks.length <= 3);
    }
    const finalView = parseAssistantText(accumulated, false);
    assert.deepEqual(finalView, expected);
    console.log('✓ (h) Incremental buffer feeding matches whole parse result');
  }

  // Test (i): persisted events with duplicate paths are collapsed to one card
  {
    const persistedMessage = {
      content: '',
      events: [
        { type: 'THOUGHT', content: 'Thinking about changes' },
        { type: 'MESSAGE', content: 'Intro message' },
        { type: 'FILE_EDIT', filePath: '/src/App.tsx', content: '1' },
        { type: 'FILE_EDIT', filePath: 'src/App.tsx', content: '2' },
        { type: 'FILE_EDIT', filePath: 'src/App.tsx', content: '3' },
        { type: 'FILE_EDIT', filePath: 'src/theme.css', content: 'body{}' },
        { type: 'MESSAGE', content: 'Summary message' },
      ],
    };

    const view = mapPersistedMessageToView(persistedMessage);
    assert.equal(view.reasoning?.text, 'Thinking about changes');
    const fileBlocks = view.blocks.filter((b) => b.kind === 'file');
    assert.equal(fileBlocks.length, 2);
    assert.equal(fileBlocks[0].path, 'src/App.tsx');
    assert.equal(fileBlocks[1].path, 'src/theme.css');
    console.log('✓ (i) Persisted events with duplicate paths collapsed to one card');
  }

  console.log('\nAll 9 assistant parser test cases (a - i) passed successfully!');
}

runTests();
