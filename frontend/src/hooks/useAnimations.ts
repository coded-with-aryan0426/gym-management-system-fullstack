import { useEffect, useRef, useCallback } from 'react';
import anime from 'animejs';

// Check for reduced motion preference
const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// B2B SaaS Animation Presets
export const ANIMATION_CONFIG = {
    duration: {
        fast: 200,
        normal: 300,
        slow: 450,
    },
    easing: {
        smooth: 'easeOutQuad',
        snappy: 'easeOutCubic',
        bounce: 'easeOutBack', // Use sparingly
    },
    stagger: {
        fast: 30,
        normal: 50,
        slow: 80,
    }
};

// Page Entry Animation Hook (Staggered Grid/List)
export const usePageEntry = (selector: string, options?: { delay?: number; stagger?: number; from?: 'center' | 'first' | 'last' }) => {
    useEffect(() => {
        if (prefersReducedMotion()) return;

        const elements = document.querySelectorAll(selector);
        if (!elements.length) return;

        anime({
            targets: elements,
            opacity: [0, 1],
            translateY: [12, 0],
            duration: ANIMATION_CONFIG.duration.normal,
            easing: ANIMATION_CONFIG.easing.smooth,
            delay: anime.stagger(options?.stagger || ANIMATION_CONFIG.stagger.normal, {
                start: options?.delay || 0,
                from: options?.from // Allows 'center' for grid reveals
            }),
        });
    }, [selector, options?.delay, options?.stagger, options?.from]);
};

// Fade In Animation
export const useFadeIn = (ref: React.RefObject<HTMLElement | null>, options?: { delay?: number; duration?: number }) => {
    useEffect(() => {
        if (prefersReducedMotion() || !ref.current) return;

        anime({
            targets: ref.current,
            opacity: [0, 1],
            translateY: [8, 0],
            duration: options?.duration || ANIMATION_CONFIG.duration.normal,
            easing: ANIMATION_CONFIG.easing.smooth,
            delay: options?.delay || 0,
        });
    }, [ref, options?.delay, options?.duration]);
};

// Count Up Animation for KPIs
export const useCountUp = (
    ref: React.RefObject<HTMLElement | null>,
    endValue: number,
    options?: { duration?: number; prefix?: string; suffix?: string }
) => {
    useEffect(() => {
        if (prefersReducedMotion() || !ref.current) {
            if (ref.current) {
                ref.current.textContent = `${options?.prefix || ''}${endValue.toLocaleString()}${options?.suffix || ''}`;
            }
            return;
        }

        const obj = { value: 0 };
        anime({
            targets: obj,
            value: endValue,
            round: 1,
            duration: options?.duration || 1000,
            easing: ANIMATION_CONFIG.easing.smooth,
            update: () => {
                if (ref.current) {
                    ref.current.textContent = `${options?.prefix || ''}${obj.value.toLocaleString()}${options?.suffix || ''}`;
                }
            },
        });
    }, [ref, endValue, options?.duration, options?.prefix, options?.suffix]);
};

// Progress Bar Fill Animation
export const useProgressFill = (
    ref: React.RefObject<HTMLElement | null>,
    percentage: number,
    options?: { duration?: number }
) => {
    useEffect(() => {
        if (!ref.current) return;

        if (prefersReducedMotion()) {
            ref.current.style.width = `${percentage}%`;
            return;
        }

        anime({
            targets: ref.current,
            width: `${percentage}%`,
            duration: options?.duration || 600,
            easing: ANIMATION_CONFIG.easing.smooth,
        });
    }, [ref, percentage, options?.duration]);
};

// Button Press Animation (Micro-interaction)
export const animateButtonPress = (element: HTMLElement) => {
    if (prefersReducedMotion()) return;

    anime({
        targets: element,
        scale: [1, 0.96, 1],
        duration: 150,
        easing: 'easeOutQuad',
    });
};

// Success State Animation
export const animateSuccess = (element: HTMLElement) => {
    if (prefersReducedMotion()) return;

    anime({
        targets: element,
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 300,
        easing: ANIMATION_CONFIG.easing.smooth,
    });
};

// Timeline Hook for Complex Sequences
export const useTimeline = (
    callback: (timeline: anime.AnimeTimelineInstance) => void,
    deps: any[] = []
) => {
    useEffect(() => {
        if (prefersReducedMotion()) return;

        const timeline = anime.timeline({
            easing: ANIMATION_CONFIG.easing.smooth,
            duration: ANIMATION_CONFIG.duration.normal,
        });

        callback(timeline);
    }, deps);
};

// Hook for button with press feedback
export const useButtonPress = () => {
    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
        animateButtonPress(e.currentTarget as HTMLElement);
    }, []);

    return { onMouseDown: handleClick };
};

export default {
    ANIMATION_CONFIG,
    usePageEntry,
    useFadeIn,
    useCountUp,
    useProgressFill,
    useTimeline,
    useButtonPress,
    animateButtonPress,
    animateSuccess,
};
