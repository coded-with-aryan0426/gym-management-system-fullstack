import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useSelection, generateElementPath, getNthChildIndex, getSemanticLabel, getVisibleText, getBoundingBox } from '../../contexts/SelectionContext';
import type { ElementSelection } from '../../types/feedback.types';
import './ElementSelector.css';

interface ElementSelectorProps {
  onConfirm: (selection: ElementSelection) => void;
  onCancel: () => void;
}

const EXCLUDED_TAGS = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'CANVAS', 'SVG', 'IMG', 'VIDEO', 'AUDIO'];

export function ElementSelector({ onConfirm, onCancel }: ElementSelectorProps) {
  const { mode, selectedElement, setHoveredElement, confirmSelection, cancelSelection, startSelection } = useSelection();
  const [hoveredTarget, setHoveredTarget] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const isSelecting = mode === 'selecting';
  const isSelected = mode === 'selected';

  const getSelectableElements = useCallback((): HTMLElement[] => {
    if (!document.body) return [];
    const elements: HTMLElement[] = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node: Node) => {
          const el = node as HTMLElement;
          if (EXCLUDED_TAGS.includes(el.tagName)) return NodeFilter.FILTER_REJECT;
          if (el.hasAttribute('data-feedback-exclude')) return NodeFilter.FILTER_REJECT;
          if (el.classList.contains('feedback-overlay')) return NodeFilter.FILTER_REJECT;
          if (el.classList.contains('feedback-selector')) return NodeFilter.FILTER_REJECT;
          const rect = el.getBoundingClientRect();
          if (rect.width < 20 || rect.height < 20) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    while (walker.nextNode()) {
      elements.push(walker.currentNode as HTMLElement);
    }
    return elements;
  }, []);

  const selectableElements = useMemo(() => getSelectableElements(), [getSelectableElements]);

  const handleMouseOver = useCallback((e: MouseEvent) => {
    if (!isSelecting) return;
    const target = e.target as HTMLElement;
    if (EXCLUDED_TAGS.includes(target.tagName) || target.classList.contains('feedback-overlay')) {
      setHoveredTarget(null);
      setHoveredElement(null);
      return;
    }
    setHoveredTarget(target);
    setTooltipPosition({ x: e.clientX + 15, y: e.clientY + 15 });
  }, [isSelecting, setHoveredElement]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isSelecting || !hoveredTarget) return;
    setTooltipPosition({ x: e.clientX + 15, y: e.clientY + 15 });
  }, [isSelecting, hoveredTarget]);

  const handleMouseOut = useCallback(() => {
    setHoveredTarget(null);
    setHoveredElement(null);
  }, [setHoveredElement]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!isSelecting) return;
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    if (EXCLUDED_TAGS.includes(target.tagName)) return;

    const rect = target.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const selection: ElementSelection = {
      cssSelector: generateElementPath(target),
      nthChildIndex: getNthChildIndex(target),
      boundingBox: {
        top: rect.top + scrollY,
        left: rect.left + scrollX,
        width: rect.width,
        height: rect.height,
      },
      semanticLabel: getSemanticLabel(target),
      visibleText: getVisibleText(target),
      elementPath: generateElementPath(target),
    };

    setHoveredTarget(null);
    setHoveredElement(null);
    confirmSelection(selection);
  }, [isSelecting, confirmSelection, setHoveredElement]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      cancelSelection();
      onCancel();
    }
  }, [cancelSelection, onCancel]);

  useEffect(() => {
    if (!isSelecting) return;

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown);

    document.body.style.cursor = 'crosshair';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isSelecting, handleMouseOver, handleMouseMove, handleMouseOut, handleClick, handleKeyDown]);

  useEffect(() => {
    if (!isSelecting || !hoveredTarget) {
      if (highlightRef.current) {
        highlightRef.current.style.display = 'none';
      }
      return;
    }

    const rect = hoveredTarget.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    if (highlightRef.current) {
      highlightRef.current.style.display = 'block';
      highlightRef.current.style.top = `${rect.top + scrollY}px`;
      highlightRef.current.style.left = `${rect.left + scrollX}px`;
      highlightRef.current.style.width = `${rect.width}px`;
      highlightRef.current.style.height = `${rect.height}px`;
      highlightRef.current.style.border = '3px solid #f97316';
      highlightRef.current.style.backgroundColor = 'rgba(249, 115, 22, 0.1)';
      highlightRef.current.style.zIndex = '999998';
      highlightRef.current.style.position = 'absolute';
      highlightRef.current.style.pointerEvents = 'none';
    }
  }, [isSelecting, hoveredTarget]);

  const semanticLabel = hoveredTarget ? getSemanticLabel(hoveredTarget) : '';

  if (mode === 'idle') return null;

  return (
    <>
      {isSelecting && <div className="feedback-overlay" />}
      {isSelecting && hoveredTarget && (
        <div
          ref={highlightRef}
          className="feedback-highlight"
          aria-hidden="true"
          style={{
            border: '3px solid #f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
          }}
        />
      )}
      {isSelecting && (
        <div
          className="feedback-tooltip"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
          role="tooltip"
          aria-live="polite"
        >
          <span className="tooltip-label">{semanticLabel}</span>
          <span className="tooltip-hint">Click to select</span>
        </div>
      )}
      <div className="selection-controls" role="dialog" aria-label="Element selection controls">
        <div className="controls-header">
          <span className="controls-title">
            {isSelecting ? 'Select an element' : isSelected ? 'Element Selected' : ''}
          </span>
          <span className="controls-hint">
            {isSelecting ? 'Click on any element to select it. Press ESC to cancel.' : ''}
          </span>
        </div>
        <div className="controls-actions">
          {isSelecting && (
            <button
              type="button"
              className="control-btn cancel"
              onClick={() => {
                cancelSelection();
                onCancel();
              }}
            >
              Cancel
            </button>
          )}
          {isSelected && (
            <>
              <button
                type="button"
                className="control-btn change"
                onClick={() => {
                  startSelection();
                }}
              >
                Change Selection
              </button>
              <button
                type="button"
                className="control-btn confirm"
                onClick={() => {
                  if (selectedElement) {
                    onConfirm(selectedElement);
                  }
                }}
              >
                Confirm
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default ElementSelector;