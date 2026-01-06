// Optimistic Updates Hook for Enhanced User Action Modals

import { useState, useCallback, useEffect } from 'react';
import { optimisticUpdateManager } from '../services/optimisticUpdateManager';
import type { CRUDOperation, DataConflict, ConflictResolution } from '../types/modalEnhancement';

interface UseOptimisticUpdatesOptions {
  onSuccess?: (operation: CRUDOperation) => void;
  onError?: (operation: CRUDOperation, error: string) => void;
  onConflict?: (conflict: DataConflict) => ConflictResolution;
}

interface UseOptimisticUpdatesReturn {
  performUpdate: (operation: Omit<CRUDOperation, 'id' | 'timestamp'>) => string;
  revertUpdate: (operationId: string) => void;
  pendingOperations: string[];
  isOperationPending: (operationId: string) => boolean;
}

export function useOptimisticUpdates({
  onSuccess,
  onError,
  onConflict
}: UseOptimisticUpdatesOptions = {}): UseOptimisticUpdatesReturn {
  const [pendingOperations, setPendingOperations] = useState<string[]>([]);

  const performUpdate = useCallback((
    operation: Omit<CRUDOperation, 'id' | 'timestamp'>
  ): string => {
    const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullOperation: CRUDOperation = {
      ...operation,
      id: operationId,
      timestamp: new Date()
    };

    // Add to pending operations
    setPendingOperations(prev => [...prev, operationId]);

    // Apply optimistic update
    optimisticUpdateManager.applyOptimisticUpdate(fullOperation);

    return operationId;
  }, []);

  const revertUpdate = useCallback((operationId: string) => {
    optimisticUpdateManager.revertOptimisticUpdate(operationId);
    setPendingOperations(prev => prev.filter(id => id !== operationId));
  }, []);

  const isOperationPending = useCallback((operationId: string): boolean => {
    return pendingOperations.includes(operationId);
  }, [pendingOperations]);

  useEffect(() => {
    const handleOptimisticUpdate = (event: CustomEvent) => {
      const operation = event.detail as CRUDOperation;
      // Update could trigger additional UI updates here
    };

    const handleOperationSuccess = (event: CustomEvent) => {
      const { operation } = event.detail;
      setPendingOperations(prev => prev.filter(id => id !== operation.id));
      onSuccess?.(operation);
    };

    const handleOperationError = (event: CustomEvent) => {
      const { operation, message } = event.detail;
      setPendingOperations(prev => prev.filter(id => id !== operation.id));
      onError?.(operation, message);
    };

    // Listen to optimistic update events
    window.addEventListener('optimistic-update', handleOptimisticUpdate as EventListener);
    window.addEventListener('operation-success', handleOperationSuccess as EventListener);
    window.addEventListener('operation-error', handleOperationError as EventListener);

    return () => {
      window.removeEventListener('optimistic-update', handleOptimisticUpdate as EventListener);
      window.removeEventListener('operation-success', handleOperationSuccess as EventListener);
      window.removeEventListener('operation-error', handleOperationError as EventListener);
    };
  }, [onSuccess, onError]);

  return {
    performUpdate,
    revertUpdate,
    pendingOperations,
    isOperationPending
  };
}