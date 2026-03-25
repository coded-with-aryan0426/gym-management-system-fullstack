import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ElementSelection, SelectionMode } from '../types/feedback.types';

interface SelectionContextValue {
  mode: SelectionMode;
  selectedElement: ElementSelection | null;
  hoveredElement: ElementSelection | null;
  startSelection: () => void;
  cancelSelection: () => void;
  confirmSelection: (element: ElementSelection) => void;
  clearSelection: () => void;
  setHoveredElement: (element: ElementSelection | null) => void;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<SelectionMode>('idle');
  const [selectedElement, setSelectedElement] = useState<ElementSelection | null>(null);
  const [hoveredElement, setHoveredElement] = useState<ElementSelection | null>(null);

  const startSelection = useCallback(() => {
    setMode('selecting');
    setSelectedElement(null);
    setHoveredElement(null);
  }, []);

  const cancelSelection = useCallback(() => {
    setMode('idle');
    setSelectedElement(null);
    setHoveredElement(null);
  }, []);

  const confirmSelection = useCallback((element: ElementSelection) => {
    setSelectedElement(element);
    setMode('selected');
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedElement(null);
    setMode('idle');
  }, []);

  return (
    <SelectionContext.Provider
      value={{
        mode,
        selectedElement,
        hoveredElement,
        startSelection,
        cancelSelection,
        confirmSelection,
        clearSelection,
        setHoveredElement,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection(): SelectionContextValue {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}

export function generateElementPath(element: HTMLElement): string {
  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    const currentTagName = current.tagName;

    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break;
    }

    const parent: HTMLElement | null = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children) as HTMLElement[];
      const sameTagSiblings = siblings.filter(
        (child: HTMLElement) => child.tagName === currentTagName
      );
      const index = sameTagSiblings.indexOf(current) + 1;
      if (index > 1) {
        selector += `:nth-of-type(${index})`;
      }
    }

    path.unshift(selector);
    current = parent;
  }

  return path.join(' > ');
}

export function getNthChildIndex(element: HTMLElement): number[] {
  const indices: number[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body) {
    const parent: HTMLElement | null = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children) as HTMLElement[];
      const index = siblings.indexOf(current);
      indices.unshift(index);
    }
    current = parent;
  }

  return indices;
}

export function getSemanticLabel(element: HTMLElement): string {
  const labelSources: (string | null)[] = [
    element.getAttribute('aria-label'),
    element.getAttribute('alt'),
    element.getAttribute('title'),
    element.getAttribute('placeholder'),
    element.getAttribute('name'),
  ];

  for (const label of labelSources) {
    if (label && label.trim()) {
      return label.trim();
    }
  }

  const textContent = element.textContent?.trim();
  if (textContent && textContent.length > 0) {
    return textContent.substring(0, 50);
  }

  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role');
  const type = element.getAttribute('type');

  if (role) {
    return `${role} ${tagName}`;
  }

  if (type) {
    return `${type} ${tagName}`;
  }

  return tagName;
}

export function getVisibleText(element: HTMLElement): string {
  let text = '';
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node: Node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const style = window.getComputedStyle(parent);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  while (walker.nextNode()) {
    const nodeText = (walker.currentNode as Text).textContent;
    if (nodeText) {
      text += nodeText + ' ';
    }
  }

  return text.trim().substring(0, 200);
}

export function getBoundingBox(element: HTMLElement): ElementSelection['boundingBox'] {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  };
}

export function sanitizeSelector(selector: string): string {
  return selector
    .replace(/['"\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 500);
}

export function captureElementScreenshot(element: HTMLElement): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        resolve(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      const svgData = new XMLSerializer().serializeToString(element);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;

      setTimeout(() => resolve(null), 5000);
    } catch {
      resolve(null);
    }
  });
}