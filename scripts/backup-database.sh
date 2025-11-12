#!/bin/bash
# ZEMO Database Backup Script
# Automates PostgreSQL database backups with verification and S3 upload
# Usage: ./scripts/backup-database.sh [environment]

set -e # Exit on error

# Configuration
ENVIRONMENT=${1:-production}
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgresql"
DB_NAME="zemo_${ENVIRONMENT}"
RETENTION_DAYS=30

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ZEMO Database Backup Script           ║${NC}"
echo -e "${GREEN}║  Environment: ${ENVIRONMENT}                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Verify DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ ERROR: DATABASE_URL not set${NC}"
  echo "Usage: DATABASE_URL=postgresql://... ./scripts/backup-database.sh"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Step 1: Create database backup
echo -e "${YELLOW}📦 Creating database backup...${NC}"
BACKUP_FILE="$BACKUP_DIR/zemo_backup_${ENVIRONMENT}_$DATE.dump"

pg_dump -Fc -d "$DATABASE_URL" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo -e "${GREEN}✅ Backup created: $BACKUP_FILE ($BACKUP_SIZE)${NC}"
else
  echo -e "${RED}❌ Backup failed!${NC}"
  exit 1
fi

# Step 2: Verify backup integrity
echo -e "${YELLOW}🔍 Verifying backup integrity...${NC}"
pg_restore --list "$BACKUP_FILE" > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Backup verification passed${NC}"
else
  echo -e "${RED}❌ Backup verification failed!${NC}"
  rm "$BACKUP_FILE"
  exit 1
fi

# Step 3: Upload to S3 (if AWS CLI is configured)
if command -v aws &> /dev/null; then
  echo -e "${YELLOW}☁️  Uploading to S3...${NC}"
  
  S3_BUCKET="zemo-backups"
  S3_PATH="s3://$S3_BUCKET/$ENVIRONMENT/$(date +%Y/%m)/"
  
  aws s3 cp "$BACKUP_FILE" "$S3_PATH" --storage-class STANDARD_IA
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Uploaded to $S3_PATH${NC}"
  else
    echo -e "${YELLOW}⚠️  S3 upload failed (backup saved locally)${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  AWS CLI not found, skipping S3 upload${NC}"
fi

# Step 4: Clean up old backups
echo -e "${YELLOW}🧹 Cleaning up old backups (older than $RETENTION_DAYS days)...${NC}"
DELETED_COUNT=$(find $BACKUP_DIR -name "*.dump" -mtime +$RETENTION_DAYS -delete -print | wc -l)

if [ $DELETED_COUNT -gt 0 ]; then
  echo -e "${GREEN}✅ Deleted $DELETED_COUNT old backup(s)${NC}"
else
  echo -e "${GREEN}✅ No old backups to delete${NC}"
fi

# Step 5: Create backup log entry
echo "$(date -Iseconds) | $ENVIRONMENT | $BACKUP_FILE | $BACKUP_SIZE" >> $BACKUP_DIR/backup.log

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Backup completed successfully!     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo "Backup file: $BACKUP_FILE"
echo "Backup size: $BACKUP_SIZE"
echo ""
echo "To restore this backup, run:"
echo "  pg_restore -d \$DATABASE_URL -Fc -c $BACKUP_FILE"
