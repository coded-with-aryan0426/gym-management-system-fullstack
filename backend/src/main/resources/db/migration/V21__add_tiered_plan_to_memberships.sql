-- Add tiered plan and variant references to memberships table
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE memberships ADD tiered_plan_id NUMBER(19)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -1430 THEN -- ORA-01430: column being added already exists
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE memberships ADD plan_variant_id NUMBER(19)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -1430 THEN
            RAISE;
        END IF;
END;
/

-- Add foreign keys
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE memberships ADD CONSTRAINT fk_membership_tiered_plan FOREIGN KEY (tiered_plan_id) REFERENCES membership_plans(plan_id) ON DELETE SET NULL';
EXCEPTION
    WHEN OTHERS THEN
        -- ORA-02275: such a referential constraint already exists in the table
        IF SQLCODE != -2275 AND SQLCODE != -2264 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE memberships ADD CONSTRAINT fk_membership_plan_variant FOREIGN KEY (plan_variant_id) REFERENCES plan_variants(variant_id) ON DELETE SET NULL';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -2275 AND SQLCODE != -2264 THEN
            RAISE;
        END IF;
END;
/
