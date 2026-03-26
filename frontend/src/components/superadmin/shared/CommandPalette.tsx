import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Zap, User, Building2, RefreshCw, AlertTriangle,
  Settings, FileText, BarChart3, X, ChevronRight, Terminal
} from 'lucide-react';
import './CommandPalette.css';

export type CommandType = 'action' | 'navigation' | 'search';

export interface Command {
  id: string;
  type: CommandType;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void | string;
  keywords: string[];
  group?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
  placeholder?: string;
  className?: string;
}

const groupIcons: Record<string, React.ReactNode> = {
  'Actions': <Zap size={14} />,
  'Navigation': <ChevronRight size={14} />,
  'Search': <Search size={14} />,
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
  placeholder = 'Type a command or search...',
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd => {
      const labelMatch = cmd.label.toLowerCase().includes(lowerQuery);
      const keywordMatch = cmd.keywords.some(k => k.toLowerCase().includes(lowerQuery));
      const descriptionMatch = cmd.description?.toLowerCase().includes(lowerQuery);
      return labelMatch || keywordMatch || descriptionMatch;
    });
  }, [commands, query]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach(cmd => {
      const group = cmd.group || 'Other';
      if (!groups[group]) groups[group] = [];
      groups[group].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  const flatCommands = useMemo(() => filteredCommands, [filteredCommands]);

  const handleSelect = useCallback((command: Command) => {
    const result = command.action();
    if (typeof result === 'string') {
      // If action returns a string (path), navigate
    }
    onClose();
    setQuery('');
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Parent should handle opening
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, flatCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatCommands[selectedIndex]) {
          handleSelect(flatCommands[selectedIndex]);
        }
        break;
    }
  };

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <motion.div
      className={`command-palette-overlay ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <motion.div
        className="command-palette"
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <div className="command-palette__search">
          <Search size={18} className="command-palette__search-icon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="command-palette__input"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <kbd className="command-palette__shortcut">ESC</kbd>
        </div>

        <div ref={listRef} className="command-palette__results">
          {filteredCommands.length === 0 ? (
            <div className="command-palette__empty">
              <Terminal size={24} />
              <span>No commands found</span>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([group, cmds]) => (
              <div key={group} className="command-palette__group">
                <div className="command-palette__group-header">
                  {groupIcons[group] || <ChevronRight size={14} />}
                  <span>{group}</span>
                </div>
                {cmds.map((cmd, idx) => {
                  const globalIndex = flatCommands.findIndex(c => c.id === cmd.id);
                  const isSelected = globalIndex === selectedIndex;
                  return (
                    <div
                      key={cmd.id}
                      data-index={globalIndex}
                      className={`command-palette__item ${isSelected ? 'command-palette__item--selected' : ''}`}
                      onClick={() => handleSelect(cmd)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      <div className="command-palette__item-icon">
                        {cmd.icon}
                      </div>
                      <div className="command-palette__item-content">
                        <span className="command-palette__item-label">{cmd.label}</span>
                        {cmd.description && (
                          <span className="command-palette__item-description">{cmd.description}</span>
                        )}
                      </div>
                      <ChevronRight size={14} className="command-palette__item-arrow" />
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="command-palette__footer">
          <div className="command-palette__hint">
            <kbd>↑↓</kbd> Navigate
          </div>
          <div className="command-palette__hint">
            <kbd>↵</kbd> Select
          </div>
          <div className="command-palette__hint">
            <kbd>esc</kbd> Close
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CommandPalette;
