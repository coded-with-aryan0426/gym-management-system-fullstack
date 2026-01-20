// Conflict Resolution Dialog Component

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DataConflict, ConflictResolution } from '../../types/modalEnhancement';

interface ConflictResolutionDialogProps {
  isOpen: boolean;
  conflicts: DataConflict[];
  onResolve: (resolution: ConflictResolution) => void;
  onCancel: () => void;
  entityName?: string;
}

interface FieldResolution {
  field: string;
  action: 'accept_current' | 'accept_incoming' | 'merge' | 'manual';
  customValue?: any;
}

const ConflictResolutionDialog: React.FC<ConflictResolutionDialogProps> = ({
  isOpen,
  conflicts,
  onResolve,
  onCancel,
  entityName = 'Entity'
}) => {
  const [fieldResolutions, setFieldResolutions] = useState<Record<string, FieldResolution>>({});
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  // Initialize field resolutions
  React.useEffect(() => {
    const initialResolutions: Record<string, FieldResolution> = {};
    const initialCustomValues: Record<string, string> = {};
    
    conflicts.forEach(conflict => {
      initialResolutions[conflict.field] = {
        field: conflict.field,
        action: 'accept_current' // Default to keeping current value
      };
      initialCustomValues[conflict.field] = String(conflict.currentValue || '');
    });
    
    setFieldResolutions(initialResolutions);
    setCustomValues(initialCustomValues);
  }, [conflicts]);

  const handleFieldResolutionChange = (
    field: string, 
    action: FieldResolution['action'],
    customValue?: string
  ) => {
    setFieldResolutions(prev => ({
      ...prev,
      [field]: {
        field,
        action,
        customValue: action === 'manual' ? customValue : undefined
      }
    }));
  };

  const handleCustomValueChange = (field: string, value: string) => {
    setCustomValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Update the resolution if it's set to manual
    if (fieldResolutions[field]?.action === 'manual') {
      handleFieldResolutionChange(field, 'manual', value);
    }
  };

  const handleResolve = () => {
    // Build the resolved data
    const resolvedData: Record<string, any> = {};
    
    conflicts.forEach(conflict => {
      const resolution = fieldResolutions[conflict.field];
      
      switch (resolution?.action) {
        case 'accept_current':
          resolvedData[conflict.field] = conflict.currentValue;
          break;
        case 'accept_incoming':
          resolvedData[conflict.field] = conflict.incomingValue;
          break;
        case 'merge':
          // Simple merge strategy - could be enhanced based on field type
          resolvedData[conflict.field] = mergeValues(
            conflict.currentValue, 
            conflict.incomingValue
          );
          break;
        case 'manual':
          resolvedData[conflict.field] = resolution.customValue;
          break;
        default:
          resolvedData[conflict.field] = conflict.currentValue;
      }
    });

    onResolve({
      action: 'merge',
      resolvedData
    });
  };

  const mergeValues = (current: any, incoming: any): any => {
    // Simple merge logic - in a real implementation, this would be more sophisticated
    if (typeof current === 'string' && typeof incoming === 'string') {
      return `${current} | ${incoming}`;
    }
    
    if (typeof current === 'object' && typeof incoming === 'object') {
      return { ...current, ...incoming };
    }
    
    return incoming; // Default to incoming value
  };

  const getConflictTypeIcon = (type: DataConflict['type']) => {
    switch (type) {
      case 'concurrent_modification':
        return '⚡';
      case 'stale_data':
        return '🔄';
      case 'relationship_conflict':
        return '🔗';
      default:
        return '⚠️';
    }
  };

  const getConflictTypeDescription = (type: DataConflict['type']) => {
    switch (type) {
      case 'concurrent_modification':
        return 'Another user modified this field while you were editing';
      case 'stale_data':
        return 'The data you are viewing is outdated';
      case 'relationship_conflict':
        return 'There is a conflict with user relationships';
      default:
        return 'An unknown conflict occurred';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="conflict-resolution-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="conflict-resolution-dialog"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="conflict-dialog__header">
            <h3>Resolve Conflicts</h3>
            <p className="conflict-dialog__subtitle">
              Conflicts detected while updating {entityName}. Please choose how to resolve each conflict.
            </p>
          </div>

          <div className="conflict-dialog__body">
            {conflicts.map((conflict, index) => (
              <motion.div
                key={`${conflict.field}_${index}`}
                className="conflict-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="conflict-item__header">
                  <div className="conflict-type">
                    <span className="conflict-type__icon">
                      {getConflictTypeIcon(conflict.type)}
                    </span>
                    <div className="conflict-type__info">
                      <span className="conflict-field-name">{conflict.field}</span>
                      <span className="conflict-type-desc">
                        {getConflictTypeDescription(conflict.type)}
                      </span>
                    </div>
                  </div>
                  <span className="conflict-timestamp">
                    {new Date(conflict.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="conflict-values">
                  <div className="conflict-value conflict-value--current">
                    <label>Current Value:</label>
                    <div className="value-display">{String(conflict.currentValue)}</div>
                  </div>
                  <div className="conflict-value conflict-value--incoming">
                    <label>Your Change:</label>
                    <div className="value-display">{String(conflict.incomingValue)}</div>
                  </div>
                </div>

                <div className="conflict-resolution-options">
                  <label className="resolution-option">
                    <input
                      type="radio"
                      name={`resolution_${conflict.field}`}
                      value="accept_current"
                      checked={fieldResolutions[conflict.field]?.action === 'accept_current'}
                      onChange={() => handleFieldResolutionChange(conflict.field, 'accept_current')}
                    />
                    <span>Keep current value</span>
                  </label>

                  <label className="resolution-option">
                    <input
                      type="radio"
                      name={`resolution_${conflict.field}`}
                      value="accept_incoming"
                      checked={fieldResolutions[conflict.field]?.action === 'accept_incoming'}
                      onChange={() => handleFieldResolutionChange(conflict.field, 'accept_incoming')}
                    />
                    <span>Use my change</span>
                  </label>

                  <label className="resolution-option">
                    <input
                      type="radio"
                      name={`resolution_${conflict.field}`}
                      value="merge"
                      checked={fieldResolutions[conflict.field]?.action === 'merge'}
                      onChange={() => handleFieldResolutionChange(conflict.field, 'merge')}
                    />
                    <span>Merge both values</span>
                  </label>

                  <label className="resolution-option">
                    <input
                      type="radio"
                      name={`resolution_${conflict.field}`}
                      value="manual"
                      checked={fieldResolutions[conflict.field]?.action === 'manual'}
                      onChange={() => handleFieldResolutionChange(conflict.field, 'manual', customValues[conflict.field])}
                    />
                    <span>Custom value:</span>
                    {fieldResolutions[conflict.field]?.action === 'manual' && (
                      <input
                        type="text"
                        className="custom-value-input"
                        value={customValues[conflict.field] || ''}
                        onChange={(e) => handleCustomValueChange(conflict.field, e.target.value)}
                        placeholder="Enter custom value..."
                      />
                    )}
                  </label>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="conflict-dialog__footer">
            <button className="btn btn--secondary" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn btn--primary" onClick={handleResolve}>
              Resolve Conflicts
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConflictResolutionDialog;
