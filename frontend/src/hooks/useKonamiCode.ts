import { useState, useEffect, useCallback } from 'react';

const KONAMI_SEQUENCE = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

export function useKonamiCode(onActivate: () => void) {
    const [position, setPosition] = useState(0);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const key = e.code;
        const expected = KONAMI_SEQUENCE[position];

        if (key === expected) {
            const next = position + 1;
            if (next === KONAMI_SEQUENCE.length) {
                setPosition(0);
                onActivate();
            } else {
                setPosition(next);
            }
        } else {
            setPosition(key === KONAMI_SEQUENCE[0] ? 1 : 0);
        }
    }, [position, onActivate]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return { progress: position, total: KONAMI_SEQUENCE.length };
}
