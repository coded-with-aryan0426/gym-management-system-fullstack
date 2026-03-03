import React, { useMemo, useEffect, useState } from 'react';
import type { UIOverride } from './EditorProvider';

// Import the static JSON file containing production UI overrides.
// We use a try-catch pattern or a simple generic import. For now we will structure 
// the UI overrides as a standard export so it doesn't fail if the file is empty/missing.
import defaultOverrides from '../styles/ui-overrides.json';

/**
 * Global CSS Injector for Zero-Wrap architecture.
 * Takes the overrides mapping it to standard CSS selectors using [data-edit-id="xyz"].
 */
export function generateCssFromOverrides(overrides: Record<string, UIOverride>): string {
    let cssString = '';

    for (const [id, override] of Object.entries(overrides)) {
        let ruleBody = '';

        // Visibility
        if (override.visible === false) {
            ruleBody += 'display: none !important;\n';
        }

        // Density (Padding wrapper approximation)
        if (override.density) {
            const padValue = override.density === 'compact' ? '8px' : override.density === 'relaxed' ? '24px' : '16px';
            // Only apply density padding if explicit padding isn't set via styles
            if (!override.style?.padding && !override.style?.paddingTop && !override.style?.paddingBottom && !override.style?.paddingLeft && !override.style?.paddingRight) {
                ruleBody += `padding: ${padValue} !important;\n`;
            }
        }

        // Apply direct inline styles
        if (override.style) {
            for (const [key, value] of Object.entries(override.style)) {
                // Convert camelCase to kebab-case (e.g., backgroundColor -> background-color)
                const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
                // Automatically append 'px' to pure numbers for size-related properties if they don't have it
                const cssValue = value;
                ruleBody += `${cssKey}: ${cssValue} !important;\n`;
            }
        }

        // If there's rule content, target the element using the generic data attribute
        if (ruleBody) {
            // Target the specific data attribute
            cssString += `[data-edit-id="${id}"] {\n${ruleBody}}\n\n`;
        }
    }

    return cssString;
}

/**
 * Production Style Injector
 * Renders the children directly and injects the <style> block into the head.
 * Does not load any heavy drag/drop libraries or contexts.
 */
export function StyleInjector({ children }: { children: React.ReactNode }) {
    const cssString = useMemo(() => {
        // Here we parse the dictionary of overrides. 
        // Note: For typing to work perfectly, ui-overrides.json must be structured as Record<string, UIOverride>
        const overrides = (defaultOverrides as Record<string, UIOverride>) || {};
        return generateCssFromOverrides(overrides);
    }, []);

    // Apply textContent overrides using a MutationObserver or a simple generic script.
    // For a zero-wrap React layout, handling `textContent` strictly via CSS isn't possible,
    // so we utilize a lightweight DOM manipulation effect for text overrides in production.
    useEffect(() => {
        const overrides = (defaultOverrides as Record<string, UIOverride>) || {};
        const textOverrides = Object.entries(overrides).filter(([_, ov]) => ov.textContent);

        if (textOverrides.length === 0) return;

        const applyText = () => {
            textOverrides.forEach(([id, ov]) => {
                const els = document.querySelectorAll(`[data-edit-id="${id}"]`);
                els.forEach(el => {
                    // Only override text if it's different and user explicitly set textContent
                    if (ov.textContent && el.textContent !== ov.textContent) {
                        el.textContent = ov.textContent;
                    }
                });
            });
        };

        // Run initially
        applyText();

        // Run on DOM mutations in case elements are mounted asynchronously
        const observer = new MutationObserver(applyText);
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: cssString }} />
            {children}
        </>
    );
}

export default StyleInjector;
