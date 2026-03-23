import re

def rewrite(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Match CREATE TABLE IF NOT EXISTS ... ;
    # Match CREATE INDEX IF NOT EXISTS ... ;
    # Match CREATE UNIQUE INDEX IF NOT EXISTS ... ;
    # Match ALTER TABLE ... ADD COLUMN IF NOT EXISTS ... ;
    # Match ALTER TABLE ... ADD CONSTRAINT ... ; (for FKs) => Wait, V21 needs ignoring ORA-01430 for columns, ORA-02275 for FK. We rewrite V21 manually.

    # Let's do regex substitutions for V20:
    # 1. CREATE [UNIQUE ]INDEX IF NOT EXISTS name ON table (cols);
    def index_repl(m):
        unique = m.group(1) or ''
        name = m.group(2)
        on_part = m.group(3)
        sql = f"CREATE {unique}INDEX {name} ON {on_part}"
        sql_escaped = sql.replace("'", "''")
        return f"""BEGIN
    EXECUTE IMMEDIATE '{sql_escaped}';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE NOT IN (-955, -1408) THEN
            RAISE;
        END IF;
END;
/"""

    content = re.sub(r'CREATE\s+(UNIQUE\s+)?INDEX\s+IF\s+NOT\s+EXISTS\s+([a-zA-Z0-9_]+)\s+ON\s+([^;]+);', index_repl, content, flags=re.IGNORECASE)

    # 2. CREATE TABLE IF NOT EXISTS name ( cols );
    def table_repl(m):
        name = m.group(1)
        body = m.group(2)
        sql = f"CREATE TABLE {name} ({body})"
        sql_escaped = sql.replace("'", "''")
        return f"""BEGIN
    EXECUTE IMMEDIATE '{sql_escaped}';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/"""

    # Note: re.DOTALL is needed for the body to match across newlines
    content = re.sub(r'CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*;', table_repl, content, flags=re.IGNORECASE | re.DOTALL)

    # 3. ALTER TABLE IF EXISTS
    def alter_table_repl(m):
        name = m.group(1)
        body = m.group(2)
        sql = f"ALTER TABLE {name} {body}"
        sql_escaped = sql.replace("'", "''")
        return f"""BEGIN
    EXECUTE IMMEDIATE '{sql_escaped}';
EXCEPTION
    WHEN OTHERS THEN
        -- ORA-02275: such a referential constraint already exists in the table
        IF SQLCODE != -2275 THEN
            RAISE;
        END IF;
END;
/"""

    content = re.sub(r'ALTER\s+TABLE\s+IF\s+EXISTS\s+([a-zA-Z0-9_]+)\s+([^;]+);', alter_table_repl, content, flags=re.IGNORECASE | re.DOTALL)

    with open(filepath, 'w') as f:
        f.write(content)

rewrite('/Users/aryan/Sem 8/Intership/backend/src/main/resources/db/migration/V20__create_chat_tables.sql')
