import assert from 'node:assert/strict';
import { normalizePreviewUrl } from '../src/utils/previewUrl.ts';

function runTests() {
  console.log('Running normalizePreviewUrl test suite...');

  // 1. Removes port 8090 and forces https
  assert.equal(
    normalizePreviewUrl('https://project-5.usevoltrix.xyz:8090'),
    'https://project-5.usevoltrix.xyz'
  );

  // 2. Removes port and trailing slash on dynamic project id
  assert.equal(
    normalizePreviewUrl('http://project-8492.usevoltrix.xyz:8090/'),
    'https://project-8492.usevoltrix.xyz'
  );

  // 3. Handles bare host without protocol
  assert.equal(
    normalizePreviewUrl('project-99.usevoltrix.xyz:8090'),
    'https://project-99.usevoltrix.xyz'
  );

  // 4. Preserves query string if present without port
  assert.equal(
    normalizePreviewUrl('https://project-5.usevoltrix.xyz:8090/subpath?view=demo'),
    'https://project-5.usevoltrix.xyz/subpath?view=demo'
  );

  // 5. Handles empty / non-string gracefully
  assert.equal(normalizePreviewUrl(''), '');
  assert.equal(normalizePreviewUrl(null), '');
  assert.equal(normalizePreviewUrl(undefined), '');

  // 6. Invalid URL returns input unchanged
  assert.equal(normalizePreviewUrl(':::invalid:::'), ':::invalid:::');

  console.log('✓ All normalizePreviewUrl tests passed!');
}

runTests();
