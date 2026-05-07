#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/xsyvps/projects/warroom"
cd "$APP_DIR"

echo "[redeploy] building app"
npm run build

echo "[redeploy] preparing standalone assets"
./scripts/prepare-standalone-assets.sh

echo "[redeploy] restarting war-room.service"
sudo systemctl restart war-room.service

echo "[redeploy] verifying production"
./scripts/verify-production.sh

echo "[redeploy][PASS] complete"
