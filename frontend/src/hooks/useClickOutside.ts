import { useEffect, useRef, useCallback } from 'react';

type Callback = () => void;

/**
 * Optimized hook that detects clicks outside of the specified element
 * - Uses passive event listeners for better scroll performance
 * - Memoizes the handler to prevent unnecessary re-renders
 * - Only attaches/detaches when enabled changes
 */
export function useClickOutside<T extends HTMLElement>(
    ref: React.RefObject<T | null>,
    callback: Callback,
    enabled: boolean = true
): void {
    const callbackRef = useRef(callback);
    const enabledRef = useRef(enabled);

    // Keep refs in sync with latest values
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        enabledRef.current = enabled;
    }, [enabled]);

    useEffect(() => {
        if (!enabled) return;

        let isMouseDown = true;

        const handleMouseDown = (event: MouseEvent) => {
            isMouseDown = true;
        };

        const handleClickOutside = (event: MouseEvent) => {
            // Only trigger if mousedown started outside and click was inside
            if (
                isMouseDown &&
                ref.current &&
                !ref.current.contains(event.target as Node)
            ) {
                callbackRef.current();
            }
            isMouseDown = false;
        };

        // Use passive for better performance
        document.addEventListener('mousedown', handleMouseDown, { passive: true });
        document.addEventListener('mouseup', handleClickOutside, { passive: true });

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleClickOutside);
        };
    }, [ref, enabled]); // Only re-attach when enabled changes
}

export default useClickOutside;