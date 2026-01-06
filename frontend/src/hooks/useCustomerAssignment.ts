// Customer Assignment Hook for Enhanced Staff Action Modal

import { useState, useCallback } from 'react';
import { relationshipFilterService } from '../services';
import { useOptimisticUpdates, useMicroInteractions } from './';
import type { User } from '../types/user';

interface UseCustomerAssignmentOptions {
  staffId: number;
  onAssignmentChange?: (customers: User[]) => void;
}

interface UseCustomerAssignmentReturn {
  assignedCustomers: User[];
  availableCustomers: User[];
  isLoading: boolean;
  isSearching: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  assignCustomer: (customer: User) => Promise<void>;
  removeCustomer: (customerId: number) => Promise<void>;
  searchCustomers: (query: string) => Promise<void>;
  refreshAssignments: () => Promise<void>;
  batchAssignCustomers: (customers: User[]) => Promise<void>;
  batchRemoveCustomers: (customerIds: number[]) => Promise<void>;
}

export function useCustomerAssignment({
  staffId,
  onAssignmentChange
}: UseCustomerAssignmentOptions): UseCustomerAssignmentReturn {
  const [assignedCustomers, setAssignedCustomers] = useState<User[]>([]);
  const [availableCustomers, setAvailableCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { performUpdate, revertUpdate } = useOptimisticUpdates();
  const { showSuccess, showError } = useMicroInteractions();

  const refreshAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await relationshipFilterService.getAssignedCustomers(staffId);
      setAssignedCustomers(result.items);
      onAssignmentChange?.(result.items);
    } catch (error) {
      console.error('[useCustomerAssignment] Failed to refresh assignments:', error);
      showError({
        code: 'REFRESH_FAILED',
        message: 'Failed to refresh customer assignments',
        recoverable: true,
        retryable: true
      });
    } finally {
      setIsLoading(false);
    }
  }, [staffId, onAssignmentChange, showError]);

  const searchCustomers = useCallback(async (query: string) => {
    try {
      setIsSearching(true);
      const result = await relationshipFilterService.getAvailableCustomers(
        staffId,
        query,
        { role: 'CUSTOMER' }
      );
      setAvailableCustomers(result.items);
    } catch (error) {
      console.error('[useCustomerAssignment] Search failed:', error);
      showError({
        code: 'SEARCH_FAILED',
        message: 'Failed to search customers',
        recoverable: true,
        retryable: true
      });
    } finally {
      setIsSearching(false);
    }
  }, [staffId, showError]);

  const assignCustomer = useCallback(async (customer: User) => {
    const operationId = performUpdate({
      type: 'create',
      entity: 'relationship',
      data: { trainerId: staffId, customerId: customer.userId },
      optimistic: true
    });

    try {
      // Optimistic update
      setAssignedCustomers(prev => [...prev, customer]);
      
      // Actual assignment
      await relationshipFilterService.assignUserToUser(
        staffId,
        customer.userId,
        'trainer'
      );
      
      showSuccess('Customer assigned successfully');
      onAssignmentChange?.([...assignedCustomers, customer]);
    } catch (error) {
      // Revert on failure
      revertUpdate(operationId);
      setAssignedCustomers(prev => prev.filter(c => c.userId !== customer.userId));
      
      showError({
        code: 'ASSIGNMENT_FAILED',
        message: 'Failed to assign customer',
        recoverable: true,
        retryable: true
      });
    }
  }, [staffId, assignedCustomers, performUpdate, revertUpdate, showSuccess, showError, onAssignmentChange]);

  const removeCustomer = useCallback(async (customerId: number) => {
    const customerToRemove = assignedCustomers.find(c => c.userId === customerId);
    if (!customerToRemove) return;

    const operationId = performUpdate({
      type: 'delete',
      entity: 'relationship',
      data: { trainerId: staffId, customerId },
      optimistic: true
    });

    try {
      // Optimistic update
      const newCustomers = assignedCustomers.filter(c => c.userId !== customerId);
      setAssignedCustomers(newCustomers);
      
      // Actual removal
      await relationshipFilterService.removeUserFromUser(
        staffId,
        customerId,
        'trainer'
      );
      
      showSuccess('Customer removed successfully');
      onAssignmentChange?.(newCustomers);
    } catch (error) {
      // Revert on failure
      revertUpdate(operationId);
      setAssignedCustomers(prev => [...prev, customerToRemove]);
      
      showError({
        code: 'REMOVAL_FAILED',
        message: 'Failed to remove customer',
        recoverable: true,
        retryable: true
      });
    }
  }, [staffId, assignedCustomers, performUpdate, revertUpdate, showSuccess, showError, onAssignmentChange]);

  // Batch operations for multiple assignments
  const batchAssignCustomers = useCallback(async (customers: User[]) => {
    const operationIds: string[] = [];
    
    try {
      // Create optimistic updates for all customers
      customers.forEach(customer => {
        const operationId = performUpdate({
          type: 'create',
          entity: 'relationship',
          data: { trainerId: staffId, customerId: customer.userId },
          optimistic: true
        });
        operationIds.push(operationId);
      });

      // Optimistic update
      setAssignedCustomers(prev => [...prev, ...customers]);
      
      // Perform actual assignments
      await Promise.all(
        customers.map(customer =>
          relationshipFilterService.assignUserToUser(
            staffId,
            customer.userId,
            'trainer'
          )
        )
      );
      
      showSuccess(`${customers.length} customers assigned successfully`);
      onAssignmentChange?.([...assignedCustomers, ...customers]);
    } catch (error) {
      // Revert all on failure
      operationIds.forEach(id => revertUpdate(id));
      setAssignedCustomers(prev => 
        prev.filter(c => !customers.some(customer => customer.userId === c.userId))
      );
      
      showError({
        code: 'BATCH_ASSIGNMENT_FAILED',
        message: 'Failed to assign customers',
        recoverable: true,
        retryable: true
      });
    }
  }, [staffId, assignedCustomers, performUpdate, revertUpdate, showSuccess, showError, onAssignmentChange]);

  const batchRemoveCustomers = useCallback(async (customerIds: number[]) => {
    const customersToRemove = assignedCustomers.filter(c => customerIds.includes(c.userId));
    const operationIds: string[] = [];
    
    try {
      // Create optimistic updates for all removals
      customerIds.forEach(customerId => {
        const operationId = performUpdate({
          type: 'delete',
          entity: 'relationship',
          data: { trainerId: staffId, customerId },
          optimistic: true
        });
        operationIds.push(operationId);
      });

      // Optimistic update
      const newCustomers = assignedCustomers.filter(c => !customerIds.includes(c.userId));
      setAssignedCustomers(newCustomers);
      
      // Perform actual removals
      await Promise.all(
        customerIds.map(customerId =>
          relationshipFilterService.removeUserFromUser(
            staffId,
            customerId,
            'trainer'
          )
        )
      );
      
      showSuccess(`${customerIds.length} customers removed successfully`);
      onAssignmentChange?.(newCustomers);
    } catch (error) {
      // Revert all on failure
      operationIds.forEach(id => revertUpdate(id));
      setAssignedCustomers(prev => [...prev, ...customersToRemove]);
      
      showError({
        code: 'BATCH_REMOVAL_FAILED',
        message: 'Failed to remove customers',
        recoverable: true,
        retryable: true
      });
    }
  }, [staffId, assignedCustomers, performUpdate, revertUpdate, showSuccess, showError, onAssignmentChange]);

  return {
    assignedCustomers,
    availableCustomers,
    isLoading,
    isSearching,
    searchQuery,
    setSearchQuery,
    assignCustomer,
    removeCustomer,
    searchCustomers,
    refreshAssignments,
    batchAssignCustomers,
    batchRemoveCustomers
  };
}