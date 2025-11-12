#!/bin/bash
# ZEMO Database Restore Script
# Restores PostgreSQL database from backup file
# Usage: ./scripts/restore-database.sh <backup-file> [environment]

set -e

# Configuration
BACKUP_FILE=$1
ENVIRONMENT=${2:-production}

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ZEMO Database Restore Script          ║${NC}"
echo -e "${GREEN}║  Environment: ${ENVIRONMENT}                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Validate inputs
if [ -z "$BACKUP_FILE" ]; then
  echo -e "${RED}❌ ERROR: Backup file not specified${NC}"
  echo "Usage: ./scripts/restore-database.sh <backup-file> [environment]"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}❌ ERROR: Backup file not found: $BACKUP_FILE${NC}"
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ ERROR: DATABASE_URL not set${NC}"
  exit 1
fi

# Confirmation prompt
echo -e "${YELLOW}⚠️  WARNING: This will REPLACE all data in the database!${NC}"
echo ""
echo "Database: $DATABASE_URL"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo -e "${YELLOW}❌ Restore cancelled${NC}"
  exit 0
fi

# Create safety backup before restore
echo -e "${YELLOW}📦 Creating safety backup before restore...${NC}"
SAFETY_BACKUP="/tmp/zemo_pre_restore_$(date +%Y%m%d_%H%M%S).dump"
pg_dump -Fc -d "$DATABASE_URL" > "$SAFETY_BACKUP" 2>/dev/null || true
echo -e "${GREEN}✅ Safety backup created: $SAFETY_BACKUP${NC}"

# Restore database
echo -e "${YELLOW}🔄 Restoring database from backup...${NC}"
pg_restore -d "$DATABASE_URL" -Fc -c "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Database restored successfully!${NC}"
else
  echo -e "${RED}❌ Restore failed!${NC}"
  echo "Safety backup available at: $SAFETY_BACKUP"
  exit 1
fi

# Verify restore
echo -e "${YELLOW}🔍 Verifying restored database...${NC}"
psql -d "$DATABASE_URL" -c "SELECT COUNT(*) as user_count FROM \"User\";" > /dev/null 2>&1
psql -d "$DATABASE_URL" -c "SELECT COUNT(*) as vehicle_count FROM \"Vehicle\";" > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Database verification passed${NC}"
else
  echo -e "${RED}❌ Database verification failed!${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Restore completed successfully!    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo "Safety backup retained at: $SAFETY_BACKUP"
