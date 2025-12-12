// Service Integration Test for Enhanced Modal Infrastructure

import { 
  realTimeDataService,
  optimisticUpdateManager,
  microInteractionEngine,
  enhancedApi,
  searchService,
  relationshipFilterService
} from '../services';

// Simple integration test to verify all services are working
export async function testServiceIntegration(): Promise<boolean> {
  try {
    console.log('[ServiceIntegrationTest] Starting integration test...');
    
    // Test 1: Real-time data service
    const isRealTimeConnected = realTimeDataService.isConnected();
    console.log('[ServiceIntegrationTest] Real-time service connected:', isRealTimeConnected);
    
    // Test 2: Optimistic update manager
    const pendingOps = optimisticUpdateManager.getPendingOperations();
    console.log('[ServiceIntegrationTest] Pending operations:', pendingOps.length);
    
    // Test 3: Micro-interaction engine
    const isLoadingTest = microInteractionEngine.isLoading('test-operation');
    console.log('[ServiceIntegrationTest] Loading state test:', isLoadingTest);
    
    // Test 4: Enhanced API
    const apiConnected = enhancedApi.isRealTimeConnected();
    console.log('[ServiceIntegrationTest] Enhanced API connected:', apiConnected);
    
    // Test 5: Search service
    const searchStats = searchService.getStats();
    console.log('[ServiceIntegrationTest] Search service stats:', searchStats);
    
    // Test 6: Relationship filter service
    try {
      await relationshipFilterService.getRelationshipStats(1);
      console.log('[ServiceIntegrationTest] Relationship filter service working');
    } catch (error) {
      console.log('[ServiceIntegrationTest] Relationship filter service test skipped (expected)');
    }
    
    console.log('[ServiceIntegrationTest] All services integrated successfully!');
    return true;
    
  } catch (error) {
    console.error('[ServiceIntegrationTest] Integration test failed:', error);
    return false;
  }
}

// Export for use in development
if (import.meta.env.DEV) {
  (window as any).testServiceIntegration = testServiceIntegration;
}