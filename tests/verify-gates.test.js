'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');

function runGate(mode, env = {}) {
  return spawnSync('bash', ['scripts/qa/verify-gates.sh', mode], {
    cwd: repoRoot,
    env: {
      ...process.env,
      QA_DRY_RUN: '1',
      ...env
    },
    encoding: 'utf8'
  });
}

test('quick mode passes immediately for docs-only changes', () => {
  const result = runGate('quick', {
    QA_CHANGED_FILES: ['README.md', 'docs/qa/push-gate-separation.md'].join('\n')
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /docs-only change detected -> quick gate passed/);
});

test('quick mode schedules unit tests for non-doc changes', () => {
  const result = runGate('quick', {
    QA_CHANGED_FILES: ['scripts/qa/verify-gates.sh'].join('\n')
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /1\/3 unit tests/);
  assert.match(result.stdout, /dry-run: npm test/);
});

test('deterministic mode requires CI by default', () => {
  const result = runGate('deterministic', {
    CI: ''
  });

  assert.equal(result.status, 2);
  assert.match(result.stderr, /deterministic mode is CI-required/);
});

test('invalid mode is rejected', () => {
  const result = runGate('invalid');

  assert.equal(result.status, 2);
  assert.match(result.stderr, /invalid mode/);
});
