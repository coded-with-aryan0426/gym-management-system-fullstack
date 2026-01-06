import { useEffect, type RefObject } from 'react'

/**
 * Hook that detects clicks outside of the specified element
 * @param ref - React ref to the element to detect clicks outside of
 * @param callback - Function to call when click outside is detected
 * @param enabled - Whether the listener is active (default: true)
 */
export function useClickOutside<T extends HTMLElement>(
    ref: RefObject<T>,
    callback: () => void,
    enabled: boolean = true
): void {
    useEffect(() => {
        if (!enabled) return

        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback()
            }
        }

        // Use mousedown for faster response
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [ref, callback, enabled])
}

export default useClickOutside
