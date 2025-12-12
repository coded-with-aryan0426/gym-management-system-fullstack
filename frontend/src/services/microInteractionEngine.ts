// Micro-Interaction Engine for Enhanced User Action Modals

import React from 'react';
import type { MicroInteractionEngine, ErrorInfo } from '../types/modalEnhancement';

export class MicroInteractionService implements MicroInteractionEngine {
  private hoverTimeouts: Map<HTMLElement, number> = new Map();
  private loadingStates: Map<string, boolean> = new Map();

  triggerHoverEffect(element: HTMLElement): void {
    // Clear any existing timeout for this element
    const existingTimeout = this.hoverTimeouts.get(element);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Apply hover effect immediately (within 100ms requirement)
    this.applyHoverStyles(element);

    // Set timeout to remove hover effect
    const timeout = setTimeout(() => {
      this.removeHoverStyles(element);
      this.hoverTimeouts.delete(element);
    }, 200);

    this.hoverTimeouts.set(element, timeout);
  }

  showLoadingState(operation: string): void {
    console.log(`[MicroInteractionService] Showing loading state for: ${operation}`);
    this.loadingStates.set(operation, true);

    // Dispatch event for UI components to listen to
    const event = new CustomEvent('loading-state-change', {
      detail: { operation, isLoading: true }
    });
    window.dispatchEvent(event);
  }

  displaySuccessAnimation(operation: string): void {
    console.log(`[MicroInteractionService] Displaying success animation for: ${operation}`);
    
    // Remove loading state
    this.loadingStates.delete(operation);

    // Dispatch success event
    const event = new CustomEvent('success-animation', {
      detail: { operation }
    });
    window.dispatchEvent(event);

    // Auto-hide success state after 3 seconds
    setTimeout(() => {
      const hideEvent = new CustomEvent('hide-success-animation', {
        detail: { operation }
      });
      window.dispatchEvent(hideEvent);
    }, 3000);
  }

  showErrorState(error: ErrorInfo): void {
    console.log(`[MicroInteractionService] Showing error state:`, error);

    // Dispatch error event
    const event = new CustomEvent('error-state-change', {
      detail: { error }
    });
    window.dispatchEvent(event);
  }

  createSkeletonLoader(contentType: string): React.ReactElement {
    // Return skeleton loader based on content type
    switch (contentType) {
      case 'user-card':
        return React.createElement(UserCardSkeleton);
      case 'user-list':
        return React.createElement(UserListSkeleton);
      case 'profile-form':
        return React.createElement(ProfileFormSkeleton);
      default:
        return React.createElement(DefaultSkeleton);
    }
  }

  private applyHoverStyles(element: HTMLElement): void {
    // Store original styles
    const originalTransform = element.style.transform;
    const originalTransition = element.style.transition;

    // Apply hover effect
    element.style.transition = 'all 0.1s ease-out';
    element.style.transform = 'scale(1.02) translateY(-1px)';
    element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';

    // Store original styles for restoration
    element.dataset.originalTransform = originalTransform;
    element.dataset.originalTransition = originalTransition;
  }

  private removeHoverStyles(element: HTMLElement): void {
    // Restore original styles
    element.style.transform = element.dataset.originalTransform || '';
    element.style.transition = element.dataset.originalTransition || '';
    element.style.boxShadow = '';

    // Clean up data attributes
    delete element.dataset.originalTransform;
    delete element.dataset.originalTransition;
  }

  // Utility methods
  isLoading(operation: string): boolean {
    return this.loadingStates.get(operation) || false;
  }

  clearLoadingState(operation: string): void {
    this.loadingStates.delete(operation);
    
    const event = new CustomEvent('loading-state-change', {
      detail: { operation, isLoading: false }
    });
    window.dispatchEvent(event);
  }

  // Cleanup method
  cleanup(): void {
    // Clear all hover timeouts
    this.hoverTimeouts.forEach(timeout => clearTimeout(timeout));
    this.hoverTimeouts.clear();
    
    // Clear loading states
    this.loadingStates.clear();
  }
}

// Skeleton Components (simplified React elements)
const UserCardSkeleton: React.FC = () => {
  return React.createElement('div', {
    className: 'animate-pulse flex items-center space-x-4 p-4',
    children: [
      React.createElement('div', {
        className: 'rounded-full bg-gray-300 h-12 w-12',
        key: 'avatar'
      }),
      React.createElement('div', {
        className: 'flex-1 space-y-2',
        key: 'content',
        children: [
          React.createElement('div', {
            className: 'h-4 bg-gray-300 rounded w-3/4',
            key: 'name'
          }),
          React.createElement('div', {
            className: 'h-3 bg-gray-300 rounded w-1/2',
            key: 'email'
          })
        ]
      })
    ]
  });
};

const UserListSkeleton: React.FC = () => {
  return React.createElement('div', {
    className: 'space-y-3',
    children: Array.from({ length: 3 }, (_, i) => 
      React.createElement(UserCardSkeleton, { key: i })
    )
  });
};

const ProfileFormSkeleton: React.FC = () => {
  return React.createElement('div', {
    className: 'animate-pulse space-y-4',
    children: [
      React.createElement('div', {
        className: 'h-4 bg-gray-300 rounded w-1/4',
        key: 'label1'
      }),
      React.createElement('div', {
        className: 'h-10 bg-gray-300 rounded',
        key: 'input1'
      }),
      React.createElement('div', {
        className: 'h-4 bg-gray-300 rounded w-1/3',
        key: 'label2'
      }),
      React.createElement('div', {
        className: 'h-10 bg-gray-300 rounded',
        key: 'input2'
      })
    ]
  });
};

const DefaultSkeleton: React.FC = () => {
  return React.createElement('div', {
    className: 'animate-pulse',
    children: React.createElement('div', {
      className: 'h-20 bg-gray-300 rounded'
    })
  });
};

// Singleton instance
export const microInteractionEngine = new MicroInteractionService();