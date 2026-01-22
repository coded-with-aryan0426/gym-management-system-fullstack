#!/bin/bash
# Database Nuclear Reset Script
# WARNING: This DESTROYS all data in the SYSTEM schema

echo "🔥 DATABASE NUCLEAR RESET"
echo "=========================="
echo "This will DROP the entire schema and recreate it."
echo ""
read -p "Are you sure? Type 'YES' to confirm: " confirm

if [ "$confirm" != "YES" ]; then
  echo "❌ Aborted."
  exit 1
fi

echo ""
echo "🗑️  Dropping all tables, constraints, and sequences..."

# Connect to Oracle and drop everything
sqlplus -s system/Oracle123@//localhost:1521/FREE <<EOF
-- Drop all tables (CASCADE CONSTRAINTS removes dependencies)
BEGIN
  FOR rec IN (SELECT table_name FROM user_tables) LOOP
    EXECUTE IMMEDIATE 'DROP TABLE ' || rec.table_name || ' CASCADE CONSTRAINTS';
  END LOOP;
END;
/

-- Drop all sequences
BEGIN
  FOR rec IN (SELECT sequence_name FROM user_sequences) LOOP
    EXECUTE IMMEDIATE 'DROP SEQUENCE ' || rec.sequence_name;
  END LOOP;
END;
/

-- Verify cleanup
SELECT 'Tables remaining: ' || COUNT(*) FROM user_tables;
SELECT 'Sequences remaining: ' || COUNT(*) FROM user_sequences;

EXIT;
EOF

echo ""
echo "✅ Schema reset complete!"
echo "📋 Next steps:"
echo "   1. Remove V10-V18 migrations"
echo "   2. Create new comprehensive V10 migration"
echo "   3. Run: mvn spring-boot:run"
