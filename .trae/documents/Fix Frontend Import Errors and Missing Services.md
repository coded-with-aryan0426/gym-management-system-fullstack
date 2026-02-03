I have identified the causes of the errors you're experiencing. Here is the plan to fix them:

### 1. Fix `membershipPlanApi.ts`
The 500 error is caused by a broken import. The file tries to import `apiClient` from a non-existent file.
- **Action**: Update the import to use the correct `api` service.
- **Change**: `import { apiClient } from './apiClient'` -> `import { apiClient } from './api'`

### 2. Create Missing `membershipApi.ts`
The `MemberMembershipView` component tries to import `membershipApi.ts`, but this file does not exist in the `services` directory.
- **Action**: Create `frontend/src/services/membershipApi.ts`.
- **Content**: Implement methods required by the component:
  - `getMemberMembership(memberId)`
  - `getMembershipPlan(planId)`
  - `generateCheckInQR(memberId)`
  - `renewMembership(memberId)`

### 3. Fix `unifiedProfileApiService.ts` Imports
This file has broken imports causing build errors.
- **Action**: Correct the paths to `api` and type definitions.
- **Change**: `import { apiClient } from './apiClient'` -> `import { apiClient } from './api'`

### 4. Verify `Members.tsx`
The dynamic import error for `Members.tsx` is likely a side effect of the broken dependencies in the components it uses (specifically `MembershipPlanManagement`).
- **Action**: Once the above fixes are applied, the module resolution error should resolve automatically. I will verify this by checking for any remaining errors.

I will proceed with these fixes to restore the application functionality.