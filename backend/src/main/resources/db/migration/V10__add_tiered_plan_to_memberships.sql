-- Add tiered plan and variant references to memberships table
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS tiered_plan_id BIGINT;
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS plan_variant_id BIGINT;

-- Add foreign keys
ALTER TABLE memberships ADD CONSTRAINT fk_membership_tiered_plan 
    FOREIGN KEY (tiered_plan_id) REFERENCES membership_plans(plan_id) ON DELETE SET NULL;

ALTER TABLE memberships ADD CONSTRAINT fk_membership_plan_variant 
    FOREIGN KEY (plan_variant_id) REFERENCES plan_variants(variant_id) ON DELETE SET NULL;
