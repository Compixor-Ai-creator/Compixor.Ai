#!/usr/bin/env bash
# =============================================================================
# Compixor AI — deploy proof verifier
#
# Answers one question with evidence: "jo code maine push kiya, woh 100% live
# hai ya nahi?"  (pushed != deployed)
#
# Usage:
#   bash scripts/verify-deploy.sh
#   FRONTEND_URL=https://staging.example.com bash scripts/verify-deploy.sh
#   EXPECTED_SHA=$(git rev-parse HEAD) bash scripts/verify-deploy.sh
#
# Env:
#   FRONTEND_URL   default https://compixor-ai.cloud
#   BACKEND_URL    default https://api.compixor-ai.cloud
#   EXPECTED_SHA   default: local git HEAD (full sha)
#   REMOTE/BRANCH  default origin/main
#   TIMEOUT        per-request seconds, default 20
#
# Exit codes: 0 = all PASS (warnings allowed), 1 = at least one FAIL,
#             2 = environment problem (git/curl missing)
# =============================================================================

set -uo pipefail

FRONTEND_URL="${FRONTEND_URL:-https://compixor-ai.cloud}"
BACKEND_URL="${BACKEND_URL:-https://api.compixor-ai.cloud}"
REMOTE="${REMOTE:-origin}"
BRANCH="${BRANCH:-main}"
TIMEOUT="${TIMEOUT:-20}"

FRONTEND_URL="${FRONTEND_URL%/}"
BACKEND_URL="${BACKEND_URL%/}"

PASS=0
WARN=0
FAIL=0

c_pass=$'\033[32m'; c_warn=$'\033[33m'; c_fail=$'\033[31m'; c_off=$'\033[0m'
if [ ! -t 1 ]; then c_pass=""; c_warn=""; c_fail=""; c_off=""; fi

row() { # status | name | detail
  local s="$1" n="$2" d="$3" col=""
  case "$s" in
    PASS) PASS=$((PASS + 1)); col="$c_pass" ;;
    WARN) WARN=$((WARN + 1)); col="$c_warn" ;;
    FAIL) FAIL=$((FAIL + 1)); col="$c_fail" ;;
  esac
  printf '%s%-4s%s %-30s %s\n' "$col" "$s" "$c_off" "$n" "$d"
}

section() { printf '\n%s\n' "── $1 ─────────────────────────────────────────────────────────"; }

command -v curl >/dev/null 2>&1 || { echo "FATAL: curl not found"; exit 2; }
command -v git  >/dev/null 2>&1 || { echo "FATAL: git not found";  exit 2; }

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$REPO_ROOT" ]; then
  echo "FATAL: not inside a git repository"
  exit 2
fi

HTTP_BODY=""
HTTP_CODE=""
HTTP_HEADERS=""

# fetch <url> [extra curl args...] -> sets HTTP_BODY / HTTP_CODE
fetch() {
  local url="$1"; shift
  local tmp
  tmp="$(mktemp)"
  HTTP_CODE="$(curl -sS -o "$tmp" -w '%{http_code}' --max-time "$TIMEOUT" -L "$@" "$url" 2>/dev/null)"
  [ -n "$HTTP_CODE" ] || HTTP_CODE="000"
  HTTP_BODY="$(cat "$tmp" 2>/dev/null || true)"
  rm -f "$tmp"
}

# json_field <field> <body> -> value without quotes (empty if absent)
json_field() {
  printf '%s' "$2" | tr -d '\n' \
    | grep -o "\"$1\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" 2>/dev/null \
    | head -n1 | sed 's/.*:[[:space:]]*"\(.*\)"/\1/' || true
}

first12() { printf '%s' "$1" | cut -c1-12; }

echo "Compixor AI — deploy verification"
echo "  frontend : $FRONTEND_URL"
echo "  backend  : $BACKEND_URL"
echo "  time     : $(date -u '+%Y-%m-%d %H:%M:%SZ')"

# ---------------------------------------------------------------------------
section "1. Git state"
# ---------------------------------------------------------------------------
LOCAL_SHA="$(git -C "$REPO_ROOT" rev-parse HEAD 2>/dev/null || true)"
LOCAL_SHORT="$(first12 "$LOCAL_SHA")"
LOCAL_BRANCH="$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
DIRTY="$(git -C "$REPO_ROOT" status --porcelain 2>/dev/null | wc -l | tr -d ' ')"

row PASS "local HEAD" "$LOCAL_SHORT ($LOCAL_BRANCH)"

if [ "$LOCAL_BRANCH" != "$BRANCH" ]; then
  row WARN "branch vs deploy branch" \
    "local '$LOCAL_BRANCH' != deploy branch '$BRANCH' — this work is NOT what goes live"
else
  row PASS "branch vs deploy branch" "$LOCAL_BRANCH == $BRANCH"
fi

if [ "$DIRTY" = "0" ]; then
  row PASS "working tree clean" "0 changed files"
else
  row WARN "working tree clean" "$DIRTY uncommitted item(s) — live can never match"
fi

REMOTE_SHA="$(git -C "$REPO_ROOT" ls-remote --heads "$REMOTE" "$BRANCH" 2>/dev/null | awk '{print $1}' | head -n1 || true)"
if [ -z "$REMOTE_SHA" ]; then
  row WARN "remote $REMOTE/$BRANCH" "could not read (no network/auth?)"
elif [ "$REMOTE_SHA" = "$LOCAL_SHA" ]; then
  row PASS "remote $REMOTE/$BRANCH" "== local HEAD ($LOCAL_SHORT)"
else
  row FAIL "remote $REMOTE/$BRANCH" \
    "remote $(first12 "$REMOTE_SHA") != local $LOCAL_SHORT — push before verifying"
fi

TARGET_SHA="${EXPECTED_SHA:-$LOCAL_SHA}"
TARGET_SHORT="$(first12 "$TARGET_SHA")"

# ---------------------------------------------------------------------------
section "2. Frontend build identity"
# ---------------------------------------------------------------------------
fetch "$FRONTEND_URL/api/health"
if [ "$HTTP_CODE" = "000" ]; then
  row FAIL "GET /api/health" "no response (DNS/timeout/TLS/firewall)"
elif [ "$HTTP_CODE" != "200" ]; then
  row FAIL "GET /api/health" "HTTP $HTTP_CODE"
else
  row PASS "GET /api/health" "HTTP 200"
  LIVE_SHA="$(json_field commit "$HTTP_BODY")"
  [ -n "$LIVE_SHA" ] || LIVE_SHA="$(json_field sha "$HTTP_BODY")"
  LIVE_BUILD_TIME="$(json_field buildTime "$HTTP_BODY")"

  if [ -z "$LIVE_SHA" ]; then
    row WARN "health exposes commit" \
      "missing — add NEXT_PUBLIC_BUILD_SHA to /api/health (Phase P4)"
  else
    row PASS "health exposes commit" "$(first12 "$LIVE_SHA")${LIVE_BUILD_TIME:+ built $LIVE_BUILD_TIME}"
    if [ "$(first12 "$LIVE_SHA")" = "$TARGET_SHORT" ]; then
      row PASS "live commit == target" "$TARGET_SHORT"
    else
      row FAIL "live commit == target" "live $(first12 "$LIVE_SHA") != target $TARGET_SHORT"
    fi
  fi
fi

HTTP_HEADERS="$(curl -sS -D - -o /dev/null --max-time "$TIMEOUT" -L "$FRONTEND_URL/" 2>/dev/null || true)"
VERCEL_ID="$(printf '%s' "$HTTP_HEADERS" | tr -d '\r' | awk -F': ' 'tolower($1)=="x-vercel-id"{print $2}' | head -n1)"
VERCEL_CACHE="$(printf '%s' "$HTTP_HEADERS" | tr -d '\r' | awk -F': ' 'tolower($1)=="x-vercel-cache"{print $2}' | head -n1)"
AGE="$(printf '%s' "$HTTP_HEADERS" | tr -d '\r' | awk -F': ' 'tolower($1)=="age"{print $2}' | head -n1)"

if [ -n "$VERCEL_ID" ]; then
  row PASS "edge deployment id" "x-vercel-id present (${VERCEL_CACHE:-cache unknown}${AGE:+, age ${AGE}s})"
elif [ -n "$HTTP_HEADERS" ]; then
  row WARN "edge deployment id" "x-vercel-id absent — not Vercel, or proxied (verify host manually)"
else
  row FAIL "frontend root headers" "no response from $FRONTEND_URL/"
fi

fetch "$FRONTEND_URL/"
HTML_COMMIT="$(printf '%s' "$HTTP_BODY" | grep -o 'name="compixor-build"[^>]*content="[^"]*"' 2>/dev/null | sed 's/.*content="\([^"]*\)".*/\1/' | head -n1)"
if [ -n "$HTML_COMMIT" ]; then
  if [ "$(first12 "$HTML_COMMIT")" = "$TARGET_SHORT" ]; then
    row PASS "html build stamp" "$(first12 "$HTML_COMMIT")"
  else
    row FAIL "html build stamp" "html $(first12 "$HTML_COMMIT") != target $TARGET_SHORT"
  fi
else
  row WARN "html build stamp" "no <meta name=\"compixor-build\"> — served HTML may be a stale CDN copy"
fi

# ---------------------------------------------------------------------------
section "3. Route smoke"
# ---------------------------------------------------------------------------
for path in "/" "/tools/pdf-compressor" "/tools/qr-generator" "/sitemap.xml" "/robots.txt"; do
  fetch "$FRONTEND_URL$path"
  case "$HTTP_CODE" in
    200) row PASS "GET $path" "HTTP 200 ($(printf '%s' "$HTTP_BODY" | wc -c | tr -d ' ') bytes)" ;;
    000) row FAIL "GET $path" "no response" ;;
    *)   row FAIL "GET $path" "HTTP $HTTP_CODE" ;;
  esac
done

# ---------------------------------------------------------------------------
section "4. Backend services"
# ---------------------------------------------------------------------------
fetch "$BACKEND_URL/health"
if [ "$HTTP_CODE" = "000" ]; then
  row FAIL "GET backend /health" "no response (VPS down? nginx? :8001?)"
elif [ "$HTTP_CODE" != "200" ]; then
  row FAIL "GET backend /health" "HTTP $HTTP_CODE"
else
  row PASS "GET backend /health" "HTTP 200"
  BE_SHA="$(json_field commit "$HTTP_BODY")"
  [ -n "$BE_SHA" ] || BE_SHA="$(json_field version "$HTTP_BODY")"
  if [ -n "$BE_SHA" ]; then
    if [ "$(first12 "$BE_SHA")" = "$TARGET_SHORT" ]; then
      row PASS "backend commit == target" "$(first12 "$BE_SHA")"
    else
      row WARN "backend commit == target" \
        "backend $(first12 "$BE_SHA") != frontend $TARGET_SHORT (backend deploys separately)"
    fi
  else
    row WARN "backend build identity" "no commit/version in /health — backend code drift undetectable (P4)"
  fi
fi

# nginx routes /remove-bg to :8000; the health alias is /health-bg
fetch "$BACKEND_URL/health-bg"
if [ "$HTTP_CODE" = "200" ]; then
  row PASS "GET backend /health-bg (:8000)" "HTTP 200"
elif [ "$HTTP_CODE" = "000" ]; then
  row FAIL "GET backend /health-bg (:8000)" "no response — bg service likely down"
else
  row WARN "GET backend /health-bg (:8000)" "HTTP $HTTP_CODE (route may not be exposed)"
fi

# ---------------------------------------------------------------------------
section "Summary"
# ---------------------------------------------------------------------------
printf 'PASS %d   WARN %d   FAIL %d\n' "$PASS" "$WARN" "$FAIL"
if [ "$FAIL" -gt 0 ]; then
  echo
  echo "VERDICT: NOT fully deployed. Do not run the live test yet."
  echo "Next: fix the FAIL rows above, or roll back (Vercel instant rollback)."
  exit 1
fi
if [ "$WARN" -gt 0 ]; then
  echo
  echo "VERDICT: deployed, with warnings. Warnings are the blind spots that"
  echo "cause 'pushed but not 100% live' later — clear them in Phase P4."
  exit 0
fi
echo
echo "VERDICT: fully deployed and provable. Safe to run the live test."
exit 0
