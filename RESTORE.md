# The War Room — Backup, Restore & Update Guide

Procedures for backing up data, restoring from backup, applying updates, and
rolling back to a previous version.

---

## Table of Contents

1. [Backup Procedure](#backup-procedure)
2. [Restore Procedure](#restore-procedure)
3. [Update Procedure](#update-procedure)
4. [Rollback Procedure](#rollback-procedure)

---

## Backup Procedure

### What gets backed up

| Item | Path | Description |
|------|------|-------------|
| SQLite Database | `dev.db` | All users, posts, comments, reactions, rooms, agents |
| Uploaded Images | `public/uploads/images/` | User-uploaded images referenced by posts |

> **Note:** The `.env` file is **NOT** included in automated backups because
> it contains secrets and lives outside version control. Back it up separately.

### Automated backup using the included script

```bash
cd /home/<USERNAME>/Apps/warroom

# Run with default backup location (./backups/)
./scripts/backup-war-room.sh

# Or specify a custom backup directory
./scripts/backup-war-room.sh /mnt/external-storage/war-room-backups
```

**Output:**

```
THE WAR ROOM — Backup Utility

Backing up database...
  Database backed up (2.1M)
Backing up 47 uploaded images...
  Images backed up (18M)

Backup complete!
  File: /home/<USERNAME>/Apps/warroom/backups/war-room-backup-20250115_143022.tar.gz
  Size: 19M

Tip: Store this backup in a safe location outside the project directory.
```

### Backup archive contents

Extracted tarball structure:

```
war-room-backup-20250115_143022/
├── dev.db              # SQLite database
├── images/             # Uploaded images
│   ├── abc123.jpg
│   ├── def456.png
│   └── ...
└── README.txt          # Restoration instructions
```

### Manual backup (alternative)

```bash
cd /home/<USERNAME>/Apps/warroom
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backup/location"
mkdir -p "$BACKUP_DIR"

# Database
cp dev.db "$BACKUP_DIR/dev.db.$TIMESTAMP"

# Uploads
tar -czf "$BACKUP_DIR/images.$TIMESTAMP.tar.gz" -C public/uploads images/

# .env (store separately, encrypted)
cp .env "$BACKUP_DIR/env.$TIMESTAMP.backup"
chmod 600 "$BACKUP_DIR/env.$TIMESTAMP.backup"
```

### Backing up `.env` separately

The `.env` file contains secrets and must be backed up securely:

```bash
# Copy to an encrypted location
cp /home/<USERNAME>/Apps/warroom/.env /secure-location/war-room-env-backup
chmod 600 /secure-location/war-room-env-backup

# Or print secrets for password manager
 grep -E "SECRET|TOKEN|PASSWORD" /home/<USERNAME>/Apps/warroom/.env
```

### Recommended backup schedule

| Frequency | Method | Destination |
|-----------|--------|-------------|
| Daily | `backup-war-room.sh` | Local backup directory |
| Weekly | Copy tarballs | Off-server (cloud storage, NAS) |
| On change | Manual `.env` copy | Password manager / encrypted storage |

### Automated daily backup with cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 3 AM
0 3 * * * /home/<USERNAME>/Apps/warroom/scripts/backup-war-room.sh /mnt/backups/war-room

# Keep only last 30 days of backups
0 4 * * * find /mnt/backups/war-room -name "war-room-backup-*.tar.gz" -mtime +30 -delete
```

---

## Restore Procedure

### Step 1: Stop the service

```bash
sudo systemctl stop war-room
```

**Verify it's stopped:**

```bash
sudo systemctl status war-room
# Should show: inactive (dead)
```

### Step 2: Locate your backup tarball

```bash
ls -la /path/to/your/backups/war-room-backup-*.tar.gz
# Example: war-room-backup-20250115_143022.tar.gz
```

### Step 3: Extract the backup

```bash
# Create a temporary extraction directory
mkdir -p /tmp/war-room-restore
cd /tmp/war-room-restore

# Extract the tarball
tar -xzf /path/to/your/backups/war-room-backup-20250115_143022.tar.gz

# Verify contents
ls -la war-room-backup-20250115_143022/
# Should show: dev.db  images/  README.txt
```

### Step 4: Restore the database

```bash
cd /home/<USERNAME>/Apps/warroom

# Back up the current database (just in case)
cp dev.db dev.db.pre-restore.$(date +%Y%m%d_%H%M%S)

# Copy the backup database
cp /tmp/war-room-restore/war-room-backup-*/dev.db ./dev.db

# Verify
ls -la dev.db
file dev.db  # Should show: SQLite 3.x database
```

### Step 5: Restore uploaded images

```bash
cd /home/<USERNAME>/Apps/warroom

# Back up current uploads (if any)
if [ -d public/uploads/images ]; then
    mv public/uploads/images "public/uploads/images.pre-restore.$(date +%Y%m%d_%H%M%S)"
fi

# Restore images from backup
mkdir -p public/uploads
cp -r /tmp/war-room-restore/war-room-backup-*/images public/uploads/images

# Verify
ls public/uploads/images | wc -l
# Should match the number of backed-up images
```

### Step 6: Restore `.env` (if needed)

If you backed up `.env` separately:

```bash
cp /secure-location/war-room-env-backup /home/<USERNAME>/Apps/warroom/.env
chmod 600 /home/<USERNAME>/Apps/warroom/.env
```

### Step 7: Regenerate Prisma client

```bash
cd /home/<USERNAME>/Apps/warroom
npx prisma generate
```

### Step 8: Restart the service

```bash
sudo systemctl start war-room

# Verify it's running
sudo systemctl status war-room
```

### Step 9: Verify the restore

```bash
# Check the app responds
curl -k -s -o /dev/null -w "HTTP %{http_code}\n" \
  https://<VPS-MAGICDNS-HOSTNAME>:11369
# Expected: 200

# Check rooms load
curl -k -s https://<VPS-MAGICDNS-HOSTNAME>:11369/api/rooms | python3 -m json.tool | head -20

# Check posts are present
curl -k -s "https://<VPS-MAGICDNS-HOSTNAME>:11369/api/posts" | python3 -m json.tool | head -30
```

### Step 10: Clean up

```bash
rm -rf /tmp/war-room-restore
```

### Complete restore — one-shot script

```bash
#!/bin/bash
# restore-war-room.sh — One-shot restore from backup tarball

set -euo pipefail

BACKUP_TARBALL="$1"
PROJECT_DIR="/home/<USERNAME>/Apps/warroom"
RESTORE_DIR="/tmp/war-room-restore-$$"

echo "=== Stopping War Room service ==="
sudo systemctl stop war-room

echo "=== Extracting backup ==="
mkdir -p "$RESTORE_DIR"
tar -xzf "$BACKUP_TARBALL" -C "$RESTORE_DIR"
BACKUP_NAME=$(ls "$RESTORE_DIR" | head -1)

echo "=== Restoring database ==="
cp "$PROJECT_DIR/dev.db" "$PROJECT_DIR/dev.db.pre-restore.$(date +%Y%m%d_%H%M%S)"
cp "$RESTORE_DIR/$BACKUP_NAME/dev.db" "$PROJECT_DIR/dev.db"

echo "=== Restoring images ==="
if [ -d "$PROJECT_DIR/public/uploads/images" ]; then
    mv "$PROJECT_DIR/public/uploads/images" \
       "$PROJECT_DIR/public/uploads/images.pre-restore.$(date +%Y%m%d_%H%M%S)"
fi
mkdir -p "$PROJECT_DIR/public/uploads"
cp -r "$RESTORE_DIR/$BACKUP_NAME/images" "$PROJECT_DIR/public/uploads/images"

echo "=== Regenerating Prisma client ==="
cd "$PROJECT_DIR"
npx prisma generate

echo "=== Starting War Room service ==="
sudo systemctl start war-room

echo "=== Cleaning up ==="
rm -rf "$RESTORE_DIR"

echo "=== Restore complete ==="
sudo systemctl status war-room --no-pager
```

Usage:

```bash
./restore-war-room.sh /path/to/backups/war-room-backup-20250115_143022.tar.gz
```

---

## Update Procedure

Use this when pulling new code from Git (feature updates, bug fixes, etc.).

### Step 1: Create a pre-update backup

```bash
cd /home/<USERNAME>/Apps/warroom
./scripts/backup-war-room.sh /mnt/backups/war-room-pre-update
```

### Step 2: Stop the service

```bash
sudo systemctl stop war-room
```

### Step 3: Pull latest code

```bash
cd /home/<USERNAME>/Apps/warroom
git status                    # Check current state
git stash                     # Save any local changes (if needed)
git pull origin main          # Pull latest
git stash pop                 # Re-apply local changes (if needed)
```

### Step 4: Install dependencies

```bash
cd /home/<USERNAME>/Apps/warroom
npm install
```

### Step 5: Update database (if migrations changed)

```bash
cd /home/<USERNAME>/Apps/warroom
npx prisma generate
npx prisma migrate deploy
```

> Review migration output. If data loss is warned, restore from backup first.

### Step 6: Rebuild the application

```bash
cd /home/<USERNAME>/Apps/warroom
npm run build
```

### Step 7: Restart the service

```bash
sudo systemctl start war-room
sudo systemctl status war-room
```

### Step 8: Verify after update

```bash
# App responds
curl -k -s -o /dev/null -w "HTTP %{http_code}\n" \
  https://<VPS-MAGICDNS-HOSTNAME>:11369

# Check logs for errors
sudo journalctl -u war-room --no-pager -n 30
```

### Complete update — one-shot script

```bash
#!/bin/bash
# update-war-room.sh — Pull latest and redeploy

set -euo pipefail

PROJECT_DIR="/home/<USERNAME>/Apps/warroom"
BACKUP_DIR="/mnt/backups/war-room-pre-update"

echo "=== Creating pre-update backup ==="
cd "$PROJECT_DIR"
./scripts/backup-war-room.sh "$BACKUP_DIR"

echo "=== Stopping service ==="
sudo systemctl stop war-room

echo "=== Pulling latest code ==="
cd "$PROJECT_DIR"
git pull origin main

echo "=== Installing dependencies ==="
npm install

echo "=== Updating database ==="
npx prisma generate
npx prisma migrate deploy

echo "=== Building ==="
npm run build

echo "=== Starting service ==="
sudo systemctl start war-room

echo "=== Verifying ==="
sleep 3
curl -k -s -o /dev/null -w "HTTP %{http_code}\n" \
  https://<VPS-MAGICDNS-HOSTNAME>:11369

echo "=== Update complete ==="
```

---

## Rollback Procedure

If an update breaks the app, roll back using one of these methods.

### Method A: Restore from pre-update backup (recommended)

Use if the database schema changed or data was affected:

```bash
# Restore from the backup created before the update
./restore-war-room.sh /mnt/backups/war-room-pre-update/war-room-backup-*.tar.gz
```

Then revert code:

```bash
cd /home/<USERNAME>/Apps/warroom
git log --oneline -5          # Find the previous working commit
git reset --hard HEAD~1       # Roll back one commit
# OR: git reset --hard <COMMIT-HASH>
npm install
npx prisma generate
npm run build
sudo systemctl restart war-room
```

### Method B: Git revert without data changes

Use if only code changed (no database migrations):

```bash
cd /home/<USERNAME>/Apps/warroom

# Option 1: Roll back one commit
git reset --hard HEAD~1

# Option 2: Roll back to specific commit
git reset --hard <COMMIT-HASH>

# Rebuild and restart
npm install
npx prisma generate
npm run build
sudo systemctl restart war-room
```

### Method C: Quick code-only rollback

```bash
cd /home/<USERNAME>/Apps/warroom

# View recent commits
git log --oneline -10

# Revert to a known-good commit
git checkout <KNOWN-GOOD-COMMIT-HASH>

# Rebuild
npm install
npm run build
sudo systemctl restart war-room
```

### After any rollback

```bash
# Verify service is healthy
sudo systemctl status war-room
curl -k -s -o /dev/null -w "HTTP %{http_code}\n" \
  https://<VPS-MAGICDNS-HOSTNAME>:11369

# Check for errors
sudo journalctl -u war-room --no-pager -n 30
```

### Rollback decision matrix

| Scenario | Method | Steps |
|----------|--------|-------|
| Update broke DB schema | A — Backup restore | Restore DB + revert git |
| Update broke code only | B — Git revert | `git reset --hard` + rebuild |
| Need to go back N commits | C — Git checkout | `git checkout <hash>` + rebuild |
| Catastrophic failure | A + fresh install | Restore backup + re-clone if needed |

---

## Quick Reference

```bash
# --- BACKUP ---
./scripts/backup-war-room.sh                    # Default location
./scripts/backup-war-room.sh /custom/path       # Custom location

# --- RESTORE ---
sudo systemctl stop war-room                    # 1. Stop
tar -xzf backup.tar.gz                          # 2. Extract
cp backup/dev.db ./dev.db                       # 3. Restore DB
cp -r backup/images public/uploads/images       # 4. Restore images
npx prisma generate                             # 5. Regenerate client
sudo systemctl start war-room                   # 6. Start

# --- UPDATE ---
sudo systemctl stop war-room                    # 1. Stop
git pull origin main                            # 2. Pull
npm install && npx prisma generate              # 3. Dependencies
npm run build                                   # 4. Build
sudo systemctl start war-room                   # 5. Start

# --- ROLLBACK ---
git reset --hard HEAD~1                         # Revert 1 commit
npm install && npm run build
sudo systemctl restart war-room
```

---

*End of Backup, Restore & Update Guide*


## Post-Restore/Update Production Sanity (Required)

After any , run:



Also ensure production DB path is absolute in :



## Git pull/rebase guardrails for local deployment files

If pull/rebase fails on untracked local files, move or stash them before retrying:

```bash
git status --short
mkdir -p /tmp/warroom-local-hold
# example
mv package-lock.json /tmp/warroom-local-hold/package-lock.json.local 2>/dev/null || true

git pull --rebase --autostash origin main
```

For routine updates, prefer:

```bash
./scripts/redeploy-safe.sh
```
