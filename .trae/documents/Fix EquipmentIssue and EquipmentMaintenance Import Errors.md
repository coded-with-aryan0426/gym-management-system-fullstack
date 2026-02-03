I have identified the issue: The TypeScript interfaces `EquipmentIssue` and `EquipmentMaintenance` are being imported as runtime values in `equipmentApi.ts` and `MaintenancePanel.tsx`, causing a SyntaxError in the browser because these exports do not exist in the compiled JavaScript.

I will fix this by converting these imports to type-only imports using `import type`.

### Plan:

1. **Update** **`frontend/src/services/equipmentApi.ts`**:

   * Change `import { EquipmentMaintenance } from '../types/equipmentMaintenance';` to `import type { EquipmentMaintenance } ...`

   * Change `import { EquipmentIssue } from '../types/equipmentIssue';` to `import type { EquipmentIssue } ...`

2. **Update** **`frontend/src/pages/Equipment/components/MaintenancePanel.tsx`**:

   * Change `import { EquipmentMaintenance, ... }` to `import type { EquipmentMaintenance, ... }`. Note: If `MaintenanceType` and `MaintenanceStatus` are types (which they are), they should also be imported as types.

3. **Verify**:

   * The changes will align with the previous fix for `Equipment`.

   * This should resolve the "does not provide an export named 'EquipmentIssue'" error and allow the Equipment page to load.

