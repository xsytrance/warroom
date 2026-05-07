#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/xsyvps/projects/warroom"
TAILNET_URL="https://vps.tail5a1fa3.ts.net:11369"
LOCAL_URL="http://127.0.0.1:3000"

pass() { echo "[PASS] $1"; }
fail() { echo "[FAIL] $1"; exit 1; }
warn() { echo "[WARN] $1"; }

cd "$APP_DIR" || fail "Cannot cd to $APP_DIR"

[ -f ".env" ] || fail ".env exists"

if grep -q '^DATABASE_URL="file:/home/xsyvps/projects/warroom/dev.db"$' .env; then
  pass "DATABASE_URL is absolute production path"
else
  fail "DATABASE_URL must be DATABASE_URL=\"file:/home/xsyvps/projects/warroom/dev.db\""
fi

for key in NEXTAUTH_SECRET JWT_SECRET NODE_ENV PORT HOSTNAME; do
  if grep -q "^${key}=" .env; then
    pass "$key is set"
  else
    fail "$key is missing"
  fi
done

[ -f ".next/standalone/server.js" ] || fail ".next/standalone/server.js exists"
pass "standalone server exists"

[ -d ".next/standalone/.next/static" ] || fail "standalone static assets exist"
pass "standalone static assets exist"

[ -d ".next/standalone/public" ] || fail "standalone public assets exist"
pass "standalone public assets exist"

systemctl is-active --quiet war-room.service && pass "war-room.service active" || fail "war-room.service inactive"
systemctl is-active --quiet caddy && pass "caddy active" || fail "caddy inactive"

curl -fsS "$LOCAL_URL/api/health" >/tmp/warroom-local-health.json || fail "local health failed"
grep -q '"status":"ok"' /tmp/warroom-local-health.json && pass "local health OK" || fail "local health response bad"

curl -fsS "$TAILNET_URL/api/health" >/tmp/warroom-https-health.json || fail "HTTPS health failed"
grep -q '"status":"ok"' /tmp/warroom-https-health.json && pass "HTTPS health OK" || fail "HTTPS health response bad"

if ss -tlnp | grep -q '127.0.0.1:3000'; then
  pass "Next.js bound to 127.0.0.1:3000"
else
  fail "Next.js is not bound to 127.0.0.1:3000"
fi

if ss -tlnp | grep -q '100.65.108.84:11369'; then
  pass "Caddy bound to Tailnet 100.65.108.84:11369"
else
  fail "Caddy is not bound to Tailnet 100.65.108.84:11369"
fi

if ss -tlnp | grep -q '0.0.0.0:3000'; then
  fail "Next.js is publicly bound on 0.0.0.0:3000"
else
  pass "Next.js is not publicly bound"
fi

if ss -tlnp | grep -q '0.0.0.0:11369'; then
  fail "Caddy is publicly bound on 0.0.0.0:11369"
else
  pass "Caddy is not publicly bound on 11369"
fi

echo "War Room production verification complete."
