// Micro-Interactions Hook for Enhanced User Action Modals

import { useCallback, useEffect, useState, useRef } from 'react';
import { microInteractionEngine } from '../services/microInteractionEngine';
import type { ErrorInfo } from '../types/modalEnhancement';

interface UseMicroInteractionsOptions {
  enableHoverEffects?: boolean;
  hoverDelay?: number;
}

interface UseMicroInteractionsReturn {
  triggerHover: (element: HTMLElement) => void;
  showLoading: (operation: string) => void;
  showSuccess: (operation: string) => void;
  showError: (error: ErrorInfo) => void;
  clearLoading: (operation: string) => void;
  isLoading: (operation: string) => boolean;
  loadingStates: Record<string, boolean>;
  successStates: Record<string, boolean>;
  errorStates: Record<string, ErrorInfo | null>;
}

export function useMicroInteractions({
  enableHoverEffects = true,
  hoverDelay = 0
}: UseMicroInteractionsOptions = {}): UseMicroInteractionsReturn {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [successStates, setSuccessStates] = useState<Record<string, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<string, ErrorInfo | null>>({});
  
  const hoverTimeoutRef = useRef<number | null>(null);

  const triggerHover = useCallback((element: HTMLElement) => {
    if (!enableHoverEffects) return;

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    if (hoverDelay > 0) {
      hoverTimeoutRef.current = setTimeout(() => {
        microInteractionEngine.triggerHoverEffect(element);
      }, hoverDelay);
    } else {
      microInteractionEngine.triggerHoverEffect(element);
    }
  }, [enableHoverEffects, hoverDelay]);

  const showLoading = useCallback((operation: string) => {
    setLoadingStates(prev => ({ ...prev, [operation]: true }));
    setSuccessStates(prev => ({ ...prev, [operation]: false }));
    setErrorStates(prev => ({ ...prev, [operation]: null }));
    microInteractionEngine.showLoadingState(operation);
  }, []);

  const showSuccess = useCallback((operation: string) => {
    setLoadingStates(prev => ({ ...prev, [operation]: false }));
    setSuccessStates(prev => ({ ...prev, [operation]: true }));
    setErrorStates(prev => ({ ...prev, [operation]: null }));
    microInteractionEngine.displaySuccessAnimation(operation);
  }, []);

  const showError = useCallback((error: ErrorInfo) => {
    const operation = error.field || 'general';
    setLoadingStates(prev => ({ ...prev, [operation]: false }));
    setSuccessStates(prev => ({ ...prev, [operation]: false }));
    setErrorStates(prev => ({ ...prev, [operation]: error }));
    microInteractionEngine.showErrorState(error);
  }, []);

  const clearLoading = useCallback((operation: string) => {
    setLoadingStates(prev => ({ ...prev, [operation]: false }));
    microInteractionEngine.clearLoadingState(operation);
  }, []);

  const isLoading = useCallback((operation: string): boolean => {
    return loadingStates[operation] || false;
  }, [loadingStates]);

  useEffect(() => {
    const handleLoadingStateChange = (event: CustomEvent) => {
      const { operation, isLoading } = event.detail;
      setLoadingStates(prev => ({ ...prev, [operation]: isLoading }));
    };

    const handleSuccessAnimation = (event: CustomEvent) => {
      const { operation } = event.detail;
      setSuccessStates(prev => ({ ...prev, [operation]: true }));
    };

    const handleHideSuccessAnimation = (event: CustomEvent) => {
      const { operation } = event.detail;
      setSuccessStates(prev => ({ ...prev, [operation]: false }));
    };

    const handleErrorStateChange = (event: CustomEvent) => {
      const { error } = event.detail;
      const operation = error.field || 'general';
      setErrorStates(prev => ({ ...prev, [operation]: error }));
    };

    // Listen to micro-interaction events
    window.addEventListener('loading-state-change', handleLoadingStateChange as EventListener);
    window.addEventListener('success-animation', handleSuccessAnimation as EventListener);
    window.addEventListener('hide-success-animation', handleHideSuccessAnimation as EventListener);
    window.addEventListener('error-state-change', handleErrorStateChange as EventListener);

    return () => {
      window.removeEventListener('loading-state-change', handleLoadingStateChange as EventListener);
      window.removeEventListener('success-animation', handleSuccessAnimation as EventListener);
      window.removeEventListener('hide-success-animation', handleHideSuccessAnimation as EventListener);
      window.removeEventListener('error-state-change', handleErrorStateChange as EventListener);
      
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return {
    triggerHover,
    showLoading,
    showSuccess,
    showError,
    clearLoading,
    isLoading,
    loadingStates,
    successStates,
    errorStates
  };
}