#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { installSnapshot, ALLOWED_POLICIES } = require('../lib/install-snapshot');

function parseArgs(argv) {
  let conflictPolicy = process.env.FLARES_AGENTS_ON_CONFLICT || 'skip';
  let targetRoot = process.env.INIT_CWD || process.cwd();
  let postinstall = false;

  for (const arg of argv) {
    if (arg === '--postinstall') {
      postinstall = true;
      continue;
    }

    if (arg.startsWith('--on-conflict=')) {
      conflictPolicy = arg.slice('--on-conflict='.length);
      continue;
    }

    if (arg.startsWith('--target=')) {
      targetRoot = arg.slice('--target='.length);
    }
  }

  return { conflictPolicy, targetRoot, postinstall };
}

function printSummary(result) {
  const { copied, skipped, overwritten, backedUp } = result.events;

  for (const filePath of copied) {
    console.log(`[flares-agents] copied: ${filePath}`);
  }
  for (const filePath of skipped) {
    console.log(`[flares-agents] skipped: ${filePath}`);
  }
  for (const filePath of overwritten) {
    console.log(`[flares-agents] overwritten: ${filePath}`);
  }
  for (const entry of backedUp) {
    console.log(`[flares-agents] backed up: ${entry.targetPath} -> ${entry.backupTarget}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!ALLOWED_POLICIES.has(args.conflictPolicy)) {
    console.error(
      `[flares-agents] invalid --on-conflict value: ${args.conflictPolicy}. Use skip|fail|overwrite|backup.`
    );
    process.exit(2);
  }

  const packageRoot = path.resolve(__dirname, '..');
  const targetRoot = path.resolve(args.targetRoot);

  const result = installSnapshot({
    packageRoot,
    targetRoot,
    conflictPolicy: args.conflictPolicy
  });

  if (result.skippedSelfInstall) {
    console.log('[flares-agents] skipped: package root and target root are the same');
    return;
  }

  printSummary(result);

  if (!args.postinstall) {
    console.log(`[flares-agents] install completed with on-conflict=${args.conflictPolicy}`);
  }
}

try {
  main();
} catch (error) {
  console.error(`[flares-agents] ${error.message}`);
  process.exit(error.code === 'EFLARESCONFLICT' ? 3 : 1);
}
