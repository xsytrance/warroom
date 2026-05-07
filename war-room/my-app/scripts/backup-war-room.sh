#!/bin/bash
#
# THE WAR ROOM — Backup Script
# Backs up the SQLite database and uploaded images.
#
# Usage:
#   ./scripts/backup-war-room.sh
#   ./scripts/backup-war-room.sh /path/to/backup/dir
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Default backup directory
BACKUP_DIR="${1:-$PROJECT_DIR/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="war-room-backup-$TIMESTAMP"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

# Database and uploads paths
DB_FILE="$PROJECT_DIR/dev.db"
UPLOADS_DIR="$PROJECT_DIR/public/uploads/images"

echo -e "${CYAN}THE WAR ROOM — Backup Utility${NC}"
echo ""

# Create backup directory
mkdir -p "$BACKUP_PATH"

# Check if database exists
if [ ! -f "$DB_FILE" ]; then
    echo -e "${YELLOW}WARNING: Database file not found at $DB_FILE${NC}"
    echo -e "${YELLOW}Skipping database backup.${NC}"
else
    echo -e "${CYAN}Backing up database...${NC}"
    cp "$DB_FILE" "$BACKUP_PATH/dev.db"
    DB_SIZE=$(du -h "$BACKUP_PATH/dev.db" | cut -f1)
    echo -e "${GREEN}  Database backed up ($DB_SIZE)${NC}"
fi

# Check if uploads exist
if [ ! -d "$UPLOADS_DIR" ]; then
    echo -e "${YELLOW}WARNING: Uploads directory not found at $UPLOADS_DIR${NC}"
    echo -e "${YELLOW}Skipping images backup.${NC}"
else
    UPLOAD_COUNT=$(find "$UPLOADS_DIR" -type f | wc -l)
    if [ "$UPLOAD_COUNT" -eq 0 ]; then
        echo -e "${YELLOW}No uploaded images found.${NC}"
    else
        echo -e "${CYAN}Backing up $UPLOAD_COUNT uploaded images...${NC}"
        cp -r "$UPLOADS_DIR" "$BACKUP_PATH/images"
        IMAGES_SIZE=$(du -sh "$BACKUP_PATH/images" 2>/dev/null | cut -f1)
        echo -e "${GREEN}  Images backed up ($IMAGES_SIZE)${NC}"
    fi
fi

# Create README note
cat > "$BACKUP_PATH/README.txt" << 'EOF'
THE WAR ROOM — Backup Archive
==============================

This backup contains:
- dev.db          : SQLite database (users, posts, comments, reactions, rooms)
- images/         : Uploaded image files referenced by posts

To restore:
1. Copy dev.db to the project root
2. Copy images/ to public/uploads/images/
3. Restart the app

WARNING: Always restore both files together.
Restoring only the database without images will leave broken image links.
Restoring only images without the database will show files that aren't linked.

Timestamp: TIMESTAMP
EOF

sed -i "s/TIMESTAMP/$TIMESTAMP/g" "$BACKUP_PATH/README.txt"

# Create tarball
TARBALL="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
tar -czf "$TARBALL" -C "$BACKUP_DIR" "$BACKUP_NAME"
rm -rf "$BACKUP_PATH"

TARBALL_SIZE=$(du -h "$TARBALL" | cut -f1)

echo ""
echo -e "${GREEN}Backup complete!${NC}"
echo -e "  File: ${CYAN}$TARBALL${NC}"
echo -e "  Size: ${CYAN}$TARBALL_SIZE${NC}"
echo ""
echo -e "${YELLOW}Tip: Store this backup in a safe location outside the project directory.${NC}"
