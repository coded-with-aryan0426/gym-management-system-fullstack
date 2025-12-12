// Trainer Assignment Hook for Enhanced Member Action Modal

import { useState, useCallback } from 'react';
import { relationshipFilterService } from '../services';
import { useOptimisticUpdates, useMicroInteractions } from './';
import type { User } from '../types/user';

interface UseTrainerAssignmentOptions {
  memberId: number;
  onAssignmentChange?: (trainers: User[]) => void;
}

interface UseTrainerAssignmentReturn {
  assignedTrainers: User[];
  availableTrainers: User[];
  isLoading: boolean;
  isSearching: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  assignTrainer: (trainer: User) => Promise<void>;
  removeTrainer: (trainerId: number) => Promise<void>;
  searchTrainers: (query: string) => Promise<void>;
  refreshAssignments: () => Promise<void>;
}

export function useTrainerAssignment({
  memberId,
  onAssignmentChange
}: UseTrainerAssignmentOptions): UseTrainerAssignmentReturn {
  const [assignedTrainers, setAssignedTrainers] = useState<User[]>([]);
  const [availableTrainers, setAvailableTrainers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { performUpdate, revertUpdate } = useOptimisticUpdates();
  const { showSuccess, showError } = useMicroInteractions();

  const refreshAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await relationshipFilterService.getAssignedTrainers(memberId);
      setAssignedTrainers(result.items);
      onAssignmentChange?.(result.items);
    } catch (error) {
      console.error('[useTrainerAssignment] Failed to refresh assignments:', error);
      showError({
        code: 'REFRESH_FAILED',
        message: 'Failed to refresh trainer assignments',
        recoverable: true,
        retryable: true
      });
    } finally {
      setIsLoading(false);
    }
  }, [memberId, onAssignmentChange, showError]);

  const searchTrainers = useCallback(async (query: string) => {
    try {
      setIsSearching(true);
      const result = await relationshipFilterService.getAvailableTrainers(
        memberId,
        query,
        { role: 'TRAINER' }
      );
      setAvailableTrainers(result.items);
    } catch (error) {
      console.error('[useTrainerAssignment] Search failed:', error);
      showError({
        code: 'SEARCH_FAILED',
        message: 'Failed to search trainers',
        recoverable: true,
        retryable: true
      });
    } finally {
      setIsSearching(false);
    }
  }, [memberId, showError]);

  const assignTrainer = useCallback(async (trainer: User) => {
    const operationId = performUpdate({
      type: 'create',
      entity: 'relationship',
      data: { trainerId: trainer.userId, customerId: memberId },
      optimistic: true
    });

    try {
      // Optimistic update
      setAssignedTrainers(prev => [...prev, trainer]);
      
      // Actual assignment
      await relationshipFilterService.assignUserToUser(
        trainer.userId,
        memberId,
        'customer'
      );
      
      showSuccess('Trainer assigned successfully');
      onAssignmentChange?.([...assignedTrainers, trainer]);
    } catch (error) {
      // Revert on failure
      revertUpdate(operationId);
      setAssignedTrainers(prev => prev.filter(t => t.userId !== trainer.userId));
      
      showError({
        code: 'ASSIGNMENT_FAILED',
        message: 'Failed to assign trainer',
        recoverable: true,
        retryable: true
      });
    }
  }, [memberId, assignedTrainers, performUpdate, revertUpdate, showSuccess, showError, onAssignmentChange]);

  const removeTrainer = useCallback(async (trainerId: number) => {
    const trainerToRemove = assignedTrainers.find(t => t.userId === trainerId);
    if (!trainerToRemove) return;

    const operationId = performUpdate({
      type: 'delete',
      entity: 'relationship',
      data: { trainerId, customerId: memberId },
      optimistic: true
    });

    try {
      // Optimistic update
      const newTrainers = assignedTrainers.filter(t => t.userId !== trainerId);
      setAssignedTrainers(newTrainers);
      
      // Actual removal
      await relationshipFilterService.removeUserFromUser(
        trainerId,
        memberId,
        'customer'
      );
      
      showSuccess('Trainer removed successfully');
      onAssignmentChange?.(newTrainers);
    } catch (error) {
      // Revert on failure
      revertUpdate(operationId);
      setAssignedTrainers(prev => [...prev, trainerToRemove]);
      
      showError({
        code: 'REMOVAL_FAILED',
        message: 'Failed to remove trainer',
        recoverable: true,
        retryable: true
      });
    }
  }, [memberId, assignedTrainers, performUpdate, revertUpdate, showSuccess, showError, onAssignmentChange]);

  return {
    assignedTrainers,
    availableTrainers,
    isLoading,
    isSearching,
    searchQuery,
    setSearchQuery,
    assignTrainer,
    removeTrainer,
    searchTrainers,
    refreshAssignments
  };
}