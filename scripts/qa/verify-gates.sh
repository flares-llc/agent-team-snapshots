#!/usr/bin/env bash
set -euo pipefail

mode="${1:-quick}"

if [[ "$mode" != "quick" && "$mode" != "full" && "$mode" != "deterministic" ]]; then
  echo "[guard] invalid mode: $mode (expected quick|full|deterministic)" >&2
  exit 2
fi

collect_changed_files() {
  if [[ -n "${QA_CHANGED_FILES:-}" ]]; then
    printf '%s\n' "$QA_CHANGED_FILES" | sed '/^$/d'
    return 0
  fi

  if [[ -n "${QA_DIFF_RANGE:-}" ]] && command -v git >/dev/null 2>&1; then
    git diff --name-only "$QA_DIFF_RANGE" | sed '/^$/d'
    return 0
  fi

  if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    if git rev-parse HEAD^ >/dev/null 2>&1; then
      git diff --name-only HEAD^..HEAD | sed '/^$/d'
    else
      git ls-files | sed '/^$/d'
    fi
    return 0
  fi

  return 0
}

is_docs_file() {
  local file="$1"
  [[ "$file" == "README.md" ]] \
    || [[ "$file" == "AGENTS.md" ]] \
    || [[ "$file" == docs/* ]] \
    || [[ "$file" == .github/instructions/* ]] \
    || [[ "$file" == .github/prompts/* ]]
}

all_docs_only() {
  local file
  local seen=0
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    seen=1
    if ! is_docs_file "$file"; then
      return 1
    fi
  done <<< "$changed_files"

  [[ "$seen" -eq 1 ]]
}

run_step() {
  local label="$1"
  shift
  echo "[guard] $label"
  if [[ "${QA_DRY_RUN:-0}" == "1" ]]; then
    echo "[guard] dry-run: $*"
    return 0
  fi
  "$@"
}

changed_files="$(collect_changed_files || true)"

echo "[guard] mode=$mode"
if [[ -n "$changed_files" ]]; then
  echo "[guard] changed files:"
  printf '%s\n' "$changed_files" | sed 's/^/[guard]   - /'
else
  echo "[guard] changed files: (not detected)"
fi

if [[ "$mode" == "quick" ]] && all_docs_only; then
  echo "[guard] docs-only change detected -> quick gate passed"
  exit 0
fi

if [[ "$mode" == "deterministic" && -z "${CI:-}" && "${ALLOW_LOCAL_DETERMINISTIC:-0}" != "1" ]]; then
  echo "[guard] deterministic mode is CI-required (set ALLOW_LOCAL_DETERMINISTIC=1 to override locally)" >&2
  exit 2
fi

# Fast fail first, then heavier checks.
run_step "1/3 unit tests" npm test

if [[ "$mode" == "full" || "$mode" == "deterministic" ]]; then
  run_step "2/3 package dry-run" npm pack --dry-run >/dev/null
else
  echo "[guard] 2/3 skipped package dry-run (quick mode)"
fi

if [[ "$mode" == "deterministic" ]]; then
  run_step "3/3 deterministic replay" npm test
else
  echo "[guard] 3/3 skipped deterministic replay ($mode mode)"
fi

echo "[guard] all gates passed"
