import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LANGUAGE_OPTIONS } from '../../utils/validation';
import './LanguageMultiSelect.css';

interface LanguageMultiSelectProps {
    value: string[];
    onChange: (languages: string[]) => void;
    disabled?: boolean;
    placeholder?: string;
}

export const LanguageMultiSelect: React.FC<LanguageMultiSelectProps> = ({
    value = [],
    onChange,
    disabled = false,
    placeholder = 'Search languages...'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Filter options based on search and exclude already selected
    const filteredOptions = React.useMemo(() => {
        const search = searchTerm.toLowerCase().trim();
        const available = LANGUAGE_OPTIONS.filter(
            lang => !value.includes(lang)
        );

        if (!search) return available.slice(0, 15);

        return available.filter(lang =>
            lang.toLowerCase().includes(search)
        ).slice(0, 15);
    }, [searchTerm, value]);

    // Check if search term is a custom language not in suggestions
    const canAddCustom = searchTerm.trim() &&
        !LANGUAGE_OPTIONS.map(l => l.toLowerCase()).includes(searchTerm.toLowerCase().trim()) &&
        !value.map(v => v.toLowerCase()).includes(searchTerm.toLowerCase().trim());

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset highlighted index when options change
    useEffect(() => {
        setHighlightedIndex(0);
    }, [filteredOptions.length]);

    const handleSelect = useCallback((language: string) => {
        if (!value.includes(language)) {
            onChange([...value, language]);
        }
        setSearchTerm('');
        setIsOpen(false);
        inputRef.current?.focus();
    }, [value, onChange]);

    const handleRemove = useCallback((language: string) => {
        onChange(value.filter(v => v !== language));
    }, [value, onChange]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                } else {
                    const maxIndex = canAddCustom ? filteredOptions.length : filteredOptions.length - 1;
                    setHighlightedIndex(prev => Math.min(prev + 1, maxIndex));
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (isOpen) {
                    if (canAddCustom && highlightedIndex === filteredOptions.length) {
                        handleSelect(searchTerm.trim());
                    } else if (filteredOptions[highlightedIndex]) {
                        handleSelect(filteredOptions[highlightedIndex]);
                    }
                } else {
                    setIsOpen(true);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSearchTerm('');
                break;
            case 'Backspace':
                if (!searchTerm && value.length > 0) {
                    handleRemove(value[value.length - 1]);
                }
                break;
        }
    };

    return (
        <div
            ref={containerRef}
            className={`lms ${disabled ? 'lms--disabled' : ''}`}
        >
            <div
                className="lms__control"
                onClick={() => !disabled && inputRef.current?.focus()}
            >
                <div className="lms__chips">
                    {value.map(lang => (
                        <span key={lang} className="lms__chip">
                            {lang}
                            {!disabled && (
                                <button
                                    type="button"
                                    className="lms__chip-remove"
                                    onClick={(e) => { e.stopPropagation(); handleRemove(lang); }}
                                    aria-label={`Remove ${lang}`}
                                >
                                    ×
                                </button>
                            )}
                        </span>
                    ))}
                    <input
                        ref={inputRef}
                        type="text"
                        className="lms__input"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={value.length === 0 ? placeholder : ''}
                        disabled={disabled}
                        aria-label="Search languages"
                        aria-expanded={isOpen}
                        aria-haspopup="listbox"
                        role="combobox"
                        aria-autocomplete="list"
                    />
                </div>
            </div>

            {isOpen && !disabled && (
                <ul
                    ref={listRef}
                    className="lms__dropdown"
                    role="listbox"
                    aria-label="Language options"
                >
                    {filteredOptions.map((lang, idx) => (
                        <li
                            key={lang}
                            role="option"
                            aria-selected={highlightedIndex === idx}
                            className={`lms__option ${highlightedIndex === idx ? 'lms__option--highlighted' : ''}`}
                            onClick={() => handleSelect(lang)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                        >
                            {lang}
                        </li>
                    ))}
                    {canAddCustom && (
                        <li
                            role="option"
                            aria-selected={highlightedIndex === filteredOptions.length}
                            className={`lms__option lms__option--custom ${highlightedIndex === filteredOptions.length ? 'lms__option--highlighted' : ''}`}
                            onClick={() => handleSelect(searchTerm.trim())}
                            onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                        >
                            Add "{searchTerm.trim()}"
                        </li>
                    )}
                    {filteredOptions.length === 0 && !canAddCustom && (
                        <li className="lms__empty">No languages found</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default LanguageMultiSelect;
