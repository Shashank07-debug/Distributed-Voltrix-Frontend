import {
  isTerminalXml,
  parseAccumulatedBlocks,
  consumeStream,
} from '../src/utils/streamParser.ts';

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `Assertion failed: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}. ${message || ''}`
    );
  }
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: expected true. ${message || ''}`);
  }
}

function createMockStream(chunks, throwAfterIndex = -1) {
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index === throwAfterIndex) {
        controller.error(new Error('Network connection dropped unexpectedly'));
        return;
      }
      if (index >= chunks.length) {
        controller.close();
        return;
      }
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(chunks[index]));
      index++;
    },
  });
}

function mockResponse(chunks, status = 200, throwAfterIndex = -1) {
  const stream = createMockStream(chunks, throwAfterIndex);
  return new Response(stream, {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

async function runTests() {
  console.log('Running Stream Parser Test Suite (Cases a - g)...\n');

  // Test (a): normal stream followed by a clean close -> completed
  {
    const chunks = [
      'data:{"text":"<message>Hello world"}\n\n',
      'data:{"text":" from Voltrix!</message>"}\n\n',
    ];
    const res = mockResponse(chunks);
    const controller = new AbortController();
    const result = await consumeStream(res, controller.signal);

    assertEqual(result.state, 'completed');
    assertEqual(result.accumulatedText, '<message>Hello world from Voltrix!</message>');
    console.log('✓ (a) Normal stream followed by clean close -> completed');
  }

  // Test (b): clean close with NO terminal marker -> completed
  {
    const chunks = [
      'data:{"text":"chunk 1 "}\n\n',
      'data:{"text":"chunk 2 "}\n\n',
      'data:{"text":"chunk 3"}\n\n',
    ];
    const res = mockResponse(chunks);
    const controller = new AbortController();
    const result = await consumeStream(res, controller.signal);

    assertEqual(result.state, 'completed');
    assertEqual(result.accumulatedText, 'chunk 1 chunk 2 chunk 3');
    console.log('✓ (b) Clean close with NO terminal marker -> completed');
  }

  // Test (c): close with zero non-empty fragments -> failed
  {
    const chunks = [
      ': ping comment\n\n',
      'data:{"text":""}\n\n',
      '\n\n',
    ];
    const res = mockResponse(chunks);
    const controller = new AbortController();
    const result = await consumeStream(res, controller.signal);

    assertEqual(result.state, 'failed');
    assertEqual(result.error?.message, 'The AI returned an empty response');
    console.log('✓ (c) Close with zero fragments -> failed');
  }

  // Test (d): network error mid-stream with partial text (not ending in terminal tag) -> failed, partial text kept
  {
    const chunks = [
      'data:{"text":"<message>Beginning of output..."}\n\n',
    ];
    const res = mockResponse(chunks, 200, 1);
    const controller = new AbortController();
    const result = await consumeStream(res, controller.signal);

    assertEqual(result.state, 'failed');
    assertEqual(result.accumulatedText, '<message>Beginning of output...');
    assertTrue(Boolean(result.error));
    console.log('✓ (d) Network error mid-stream -> failed, partial text kept');
  }

  // Test (d.2): network error mid-stream BUT text ends with terminal tag -> completed
  {
    const chunks = [
      'data:{"text":"<message>Completed content</message>"}\n\n',
    ];
    const res = mockResponse(chunks, 200, 1);
    const controller = new AbortController();
    const result = await consumeStream(res, controller.signal);

    assertEqual(result.state, 'completed');
    assertEqual(result.accumulatedText, '<message>Completed content</message>');
    console.log('✓ (d.2) Network error mid-stream with terminal tag -> recovered as completed');
  }

  // Test (e): tags split across fragments are reassembled correctly
  {
    const chunks = [
      'data:{"text":"<file path=\\"src/ind"}\n\n',
      'data:{"text":"ex.css\\">body { margin: 0; }"}\n\n',
      'data:{"text":"</file>"}\n\n',
    ];
    const res = mockResponse(chunks);
    const controller = new AbortController();
    const result = await consumeStream(res, controller.signal);

    assertEqual(result.state, 'completed');
    assertEqual(result.accumulatedText, '<file path="src/index.css">body { margin: 0; }</file>');
    const blocks = parseAccumulatedBlocks(result.accumulatedText);
    assertEqual(blocks.files.length, 1);
    assertEqual(blocks.files[0].path, 'src/index.css');
    assertEqual(blocks.files[0].content, 'body { margin: 0; }');
    console.log('✓ (e) Tags split across fragments reassembled correctly');
  }

  // Test (f): comment lines and empty fragments are ignored
  {
    const chunks = [
      ': ping heartbeat\n\n',
      ': another comment\r\n\r\n',
      'data:{"text":""}\n\n',
      'data:{"text":"Valid message"}\n\n',
    ];
    const res = mockResponse(chunks);
    const controller = new AbortController();
    const result = await consumeStream(res, controller.signal);

    assertEqual(result.state, 'completed');
    assertEqual(result.accumulatedText, 'Valid message');
    console.log('✓ (f) Comment lines and empty fragments ignored');
  }

  // Test (g): user abort -> cancelled
  {
    const chunks = [
      'data:{"text":"Part 1"}\n\n',
      'data:{"text":"Part 2"}\n\n',
    ];
    const res = mockResponse(chunks);
    const controller = new AbortController();
    controller.abort(new Error('User clicked stop'));
    const result = await consumeStream(res, controller.signal);

    assertEqual(result.state, 'cancelled');
    console.log('✓ (g) User abort -> cancelled');
  }

  // Verify terminal XML detector helper
  assertTrue(isTerminalXml('<message>Done</message>'));
  assertTrue(isTerminalXml('<file path="test">Content</file>'));
  assertTrue(!isTerminalXml('<message>In progress...'));

  console.log('\nAll 7 test cases passed successfully!');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
