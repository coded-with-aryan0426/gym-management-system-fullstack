import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../Modal/Modal';
import { Button } from '../Form';
import { getAvatarUrl } from '../../utils/avatars';
import { showToast } from '../../utils/toast';
import { useRealTimeData, useOptimisticUpdates, useMicroInteractions } from '../../hooks';
import { relationshipFilterService, enhancedApi, optimisticLockingService } from '../../services';
import type { User } from '../../types/user';
import type { DataConflict, AuditEntry } from '../../types/modalEnhancement';
import './UserDetailModal.css';

interface EnhancedUserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id: number;
        name: string;
        email: string;
        role?: string;
        plan?: string;
        avatarUrl?: string;
    };
    userType: 'trainer' | 'customer';
    onDelete?: (userId: number) => void;
    onEdit?: (userId: number) => void;
    realTimeEnabled?: boolean;
    optimisticUpdates?: boolean;
    auditTrail?: boolean;
}

type ConfirmAction =
    | { type: 'delete-user' }
    | { type: 'remove-user'; userId: number; userName: string };

const EnhancedUserDetailModal: React.FC<EnhancedUserDetailModalProps> = ({
    isOpen,
    onClose,
    user,
    userType,
    onDelete,
    onEdit,
    realTimeEnabled = true,
    optimisticUpdates = true,
    auditTrail = true,
}) => {
    const [relatedUsers, setRelatedUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [conflicts, setConflicts] = useState<DataConflict[]>([]);
    const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
    const [showAuditTrail, setShowAuditTrail] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        plan: ''
    });

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Real-time data hook
    const {
        userData,
        isLoading: isRealTimeLoading,
        isConnected,
        error: realTimeError,
        refetch
    } = useRealTimeData({
        userId: user.id,
        enabled: realTimeEnabled && isOpen,
        onUserUpdate: (updatedUser) => {
            console.log('[EnhancedUserDetailModal] User updated:', updatedUser);
            // Update local state with new user data
            setEditForm({
                name: updatedUser.fullName,
                email: updatedUser.email,
                phone: updatedUser.phoneNumber || '',
                role: updatedUser.role || (updatedUser.roles?.[0]?.roleId ? `Role ${updatedUser.roles[0].roleId}` : ''),
                plan: (updatedUser as any).plan || ''
            });
        },
        onRelationshipUpdate: (relationships) => {
            console.log('[EnhancedUserDetailModal] Relationships updated:', relationships);
            fetchRelatedUsers(true);
        }
    });

    // Optimistic updates hook
    const {
        performUpdate,
        revertUpdate,
        pendingOperations,
        isOperationPending
    } = useOptimisticUpdates({
        onSuccess: (operation) => {
            showSuccess(`${operation.type} completed successfully`);
            if (operation.entity === 'relationship') {
                fetchRelatedUsers(true);
            }
        },
        onError: (operation, error) => {
            showError({
                code: 'OPERATION_FAILED',
                message: error,
                recoverable: true,
                retryable: true
            });
        }
    });

    // Micro-interactions hook
    const {
        triggerHover,
        showLoading,
        showSuccess,
        showError,
        clearLoading,
        isLoading: isMicroLoading,
        loadingStates,
        successStates,
        errorStates
    } = useMicroInteractions({
        enableHoverEffects: true,
        hoverDelay: 0
    });

    // Initialize form data
    useEffect(() => {
        if (isOpen) {
            setEditForm({
                name: user.name,
                email: user.email,
                phone: '',
                role: user.role || '',
                plan: user.plan || ''
            });
            fetchRelatedUsers();
            if (auditTrail) {
                loadAuditTrail();
            }
            setConfirmAction(null);
            setSearchQuery('');
            setSearchResults([]);
            setIsEditing(false);
            setConflicts([]);
        }
    }, [isOpen, user.id, auditTrail]);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                await performSearch(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery, userType, relatedUsers, user.id]);

    const fetchRelatedUsers = useCallback(async (forceRefresh?: boolean) => {
        setLoading(true);
        try {
            if (forceRefresh) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            let users: User[] = [];
            if (userType === 'trainer') {
                users = await relationshipFilterService.getAssignedCustomers(user.id).then(r => r.items);
            } else {
                users = await relationshipFilterService.getAssignedTrainers(user.id).then(r => r.items);
            }
            setRelatedUsers(users);
        } catch (err) {
            console.error('Could not fetch related users:', err);
            setRelatedUsers([]);
        } finally {
            setLoading(false);
        }
    }, [user.id, userType]);

    const performSearch = async (query: string) => {
        setIsSearching(true);
        try {
            let result;
            if (userType === 'trainer') {
                // If user is a trainer, search for available customers
                result = await relationshipFilterService.getAvailableCustomers(user.id, query);
            } else {
                // If user is a customer, search for available trainers
                result = await relationshipFilterService.getAvailableTrainers(user.id, query);
            }

            setSearchResults(result.items);
        } catch (err) {
            console.error('Search failed', err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const loadAuditTrail = async () => {
        try {
            showLoading('audit-trail');
            const entries = await enhancedApi.getUserAuditTrail(user.id);
            setAuditEntries(entries);
        } catch (error) {
            console.error('Failed to load audit trail:', error);
            showError({
                code: 'AUDIT_LOAD_FAILED',
                message: 'Failed to load audit trail',
                recoverable: true,
                retryable: true
            });
        } finally {
            clearLoading('audit-trail');
        }
    };

    const handleEditProfile = () => {
        setIsEditing(true);
    };

    const handleSaveProfile = async () => {
        try {
            showLoading('save-profile');
            
            // Use optimistic locking service to update with version check
            const versionedUser = { 
                ...user, 
                version: 1, 
                lastModified: new Date() 
            } as any;
            
            const updatedUser = await optimisticLockingService.updateWithVersionCheck(
                versionedUser,
                {
                    fullName: editForm.name,
                    email: editForm.email,
                    phoneNumber: editForm.phone
                },
                'user'
            );

            setIsEditing(false);
            showSuccess('Profile updated successfully');
            onEdit?.(user.id);
            
            if (auditTrail) {
                loadAuditTrail();
            }
        } catch (error) {
            showError({
                code: 'PROFILE_UPDATE_FAILED',
                message: 'Failed to update profile',
                recoverable: true,
                retryable: true
            });
        } finally {
            clearLoading('save-profile');
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setConflicts([]);
        // Revert to original values
        setEditForm({
            name: user.name,
            email: user.email,
            phone: '',
            role: user.role || '',
            plan: user.plan || ''
        });
    };

    const handleAssign = async (targetUser: User) => {
        const operationId = performUpdate({
            type: 'create',
            entity: 'relationship',
            data: { 
                trainerId: userType === 'trainer' ? user.id : targetUser.userId,
                customerId: userType === 'trainer' ? targetUser.userId : user.id
            },
            optimistic: true
        });

        try {
            if (userType === 'trainer') {
                await relationshipFilterService.assignUserToUser(user.id, targetUser.userId, 'trainer');
            } else {
                await relationshipFilterService.assignUserToUser(targetUser.userId, user.id, 'customer');
            }
            await fetchRelatedUsers(true);
            setSearchQuery('');
            setSearchResults([]);
            showSuccess(`Assigned ${targetUser.fullName}`);
        } catch (err) {
            revertUpdate(operationId);
            showError({
                code: 'ASSIGNMENT_FAILED',
                message: 'Assignment failed',
                recoverable: true,
                retryable: true
            });
        }
    };

    const handleRemove = (userId: number, userName: string) => {
        setConfirmAction({ type: 'remove-user', userId, userName });
    };

    const executeConfirmedAction = async () => {
        if (!confirmAction) return;

        if (confirmAction.type === 'delete-user') {
            try {
                if (onDelete) await onDelete(user.id);
                onClose();
                showSuccess('User deleted');
            } catch (err) {
                showError({
                    code: 'DELETE_FAILED',
                    message: 'Failed to delete user',
                    recoverable: true,
                    retryable: true
                });
            } finally {
                setConfirmAction(null);
            }
        } else if (confirmAction.type === 'remove-user') {
            const operationId = performUpdate({
                type: 'delete',
                entity: 'relationship',
                data: {
                    trainerId: userType === 'trainer' ? user.id : confirmAction.userId,
                    customerId: userType === 'trainer' ? confirmAction.userId : user.id
                },
                optimistic: true
            });

            try {
                const tId = userType === 'trainer' ? user.id : confirmAction.userId;
                const cId = userType === 'trainer' ? confirmAction.userId : user.id;

                await relationshipFilterService.removeUserFromUser(tId, cId, userType);
                await fetchRelatedUsers(true);
                showSuccess('Removed successfully');
            } catch (err) {
                revertUpdate(operationId);
                showError({
                    code: 'REMOVAL_FAILED',
                    message: 'Failed to remove',
                    recoverable: true,
                    retryable: true
                });
            } finally {
                setConfirmAction(null);
            }
        }
    };

    const getConfirmMessage = () => {
        if (!confirmAction) return '';
        if (confirmAction.type === 'delete-user') return `Delete ${user.name}?`;
        if (confirmAction.type === 'remove-user') return `Remove ${confirmAction.userName}?`;
        return '';
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const modalTitle = userType === 'trainer'
        ? 'Manage Assigned Customers'
        : 'Manage Personal Trainers';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            footer={
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {auditTrail && (
                            <Button 
                                variant="secondary" 
                                onClick={() => setShowAuditTrail(!showAuditTrail)}
                                disabled={isMicroLoading('audit-trail')}
                            >
                                {isMicroLoading('audit-trail') ? 'Loading...' : 'Audit Trail'}
                            </Button>
                        )}
                        {realTimeEnabled && (
                            <div className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                                <span className="connection-dot"></span>
                                {isConnected ? 'Live' : 'Offline'}
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button onClick={onClose}>Save Changes</Button>
                    </div>
                </div>
            }
        >
            <div className="user-detail enhanced-user-detail">
                {/* Confirmation Dialog */}
                <AnimatePresence>
                    {confirmAction && (
                        <motion.div
                            className="user-detail__confirm-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="user-detail__confirm-dialog"
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                            >
                                <div className="user-detail__confirm-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2L1 21h22L12 2zm0 3.83L19.53 19H4.47L12 5.83zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
                                    </svg>
                                </div>
                                <p className="user-detail__confirm-message">{getConfirmMessage()}</p>
                                <div className="user-detail__confirm-buttons">
                                    <button
                                        className="user-detail__confirm-cancel"
                                        onClick={() => setConfirmAction(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="user-detail__confirm-yes"
                                        onClick={executeConfirmedAction}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Member Info */}
                <div className="user-detail__member-info">
                    <div className="member-avatar-container">
                        <img
                            src={getAvatarUrl(user.id, user.name)}
                            alt={user.name}
                            className="user-detail__member-avatar"
                        />
                        {isRealTimeLoading && (
                            <div className="avatar-loading-overlay">
                                <div className="loading-spinner-small"></div>
                            </div>
                        )}
                    </div>
                    
                    {isEditing ? (
                        <div className="edit-profile-form">
                            <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="edit-input edit-input--name"
                                placeholder="Full Name"
                                disabled={isMicroLoading('save-profile')}
                            />
                            <input
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                className="edit-input edit-input--email"
                                placeholder="Email"
                                disabled={isMicroLoading('save-profile')}
                            />
                            <div className="edit-actions">
                                <button 
                                    className="edit-btn edit-btn--save"
                                    onClick={handleSaveProfile}
                                    disabled={isMicroLoading('save-profile')}
                                >
                                    {isMicroLoading('save-profile') ? 'Saving...' : 'Save'}
                                </button>
                                <button 
                                    className="edit-btn edit-btn--cancel"
                                    onClick={handleCancelEdit}
                                    disabled={isMicroLoading('save-profile')}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="member-info-display">
                            <p className="user-detail__member-text">
                                Member: <strong>{user.name}</strong> | {user.plan || user.role}
                                <button 
                                    className="edit-profile-btn"
                                    onClick={handleEditProfile}
                                    onMouseEnter={(e) => triggerHover(e.currentTarget)}
                                >
                                    ✏️
                                </button>
                            </p>
                            {userData?.lastUpdated && (
                                <p className="last-updated">
                                    Last updated: {new Date(userData.lastUpdated).toLocaleString()}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Conflicts Display */}
                {conflicts.length > 0 && (
                    <motion.div
                        className="conflicts-section"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <h4>⚠️ Conflicts Detected</h4>
                        {conflicts.map((conflict, index) => (
                            <div key={index} className="conflict-item">
                                <span className="conflict-field">{conflict.field}:</span>
                                <span className="conflict-current">Current: {conflict.currentValue}</span>
                                <span className="conflict-incoming">Your change: {conflict.incomingValue}</span>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Add New Section */}
                <div className="user-detail__add-section">
                    <h3 className="user-detail__add-title">
                        {userType === 'trainer' ? 'Add New Customer' : 'Add New Trainer'}
                    </h3>
                    <div className="user-detail__search-container">
                        <svg className="user-detail__search-icon" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="6" cy="6" r="5" />
                            <path d="M10 10l3 3" />
                        </svg>
                        <input
                            type="text"
                            className="user-detail__search-input"
                            placeholder="Search by name or email to add..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {isSearching && <div className="search-spinner"></div>}
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="user-detail__user-grid user-detail__search-results">
                            {searchResults.map(result => (
                                <motion.div
                                    key={result.userId}
                                    className="user-detail__user-card user-detail__user-card--clickable"
                                    onClick={() => handleAssign(result)}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="user-detail__card-left">
                                        <img src={getAvatarUrl(result.userId, result.fullName)} alt="" className="user-detail__card-avatar" />
                                        <div className="user-detail__card-info">
                                            <p className="user-detail__card-name">{result.fullName}</p>
                                            <p className="user-detail__card-email">{result.email}</p>
                                        </div>
                                    </div>
                                    <button className="user-detail__card-action user-detail__card-action--add">
                                        Add
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Assigned Section */}
                <div className="user-detail__assigned-section">
                    <div className="user-detail__assigned-header">
                        <h3 className="user-detail__assigned-title">
                            {userType === 'trainer' ? 'Assigned Customers' : 'Assigned Trainers'}
                            <span className="user-detail__count">({relatedUsers.length})</span>
                        </h3>
                    </div>

                    <div className="user-detail__user-grid">
                        {loading ? (
                            <div className="user-detail__empty">Loading...</div>
                        ) : relatedUsers.length > 0 ? (
                            relatedUsers.map(relatedUser => (
                                <motion.div 
                                    key={relatedUser.userId} 
                                    className="user-detail__user-card"
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    layout
                                >
                                    <div className="user-detail__card-left">
                                        <img src={getAvatarUrl(relatedUser.userId, relatedUser.fullName)} alt="" className="user-detail__card-avatar" />
                                        <div className="user-detail__card-info">
                                            <p className="user-detail__card-name">{relatedUser.fullName}</p>
                                            <p className="user-detail__card-email">{relatedUser.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="user-detail__card-action user-detail__card-action--remove"
                                        onClick={() => handleRemove(relatedUser.userId, relatedUser.fullName)}
                                        disabled={isOperationPending(`user_${relatedUser.userId}`)}
                                    >
                                        <svg className="user-detail__icon" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                                        </svg>
                                        {isOperationPending(`user_${relatedUser.userId}`) ? 'Removing...' : 'Remove'}
                                    </button>
                                </motion.div>
                            ))
                        ) : (
                            <div className="user-detail__empty">
                                No {userType === 'trainer' ? 'customers' : 'trainers'} assigned
                            </div>
                        )}
                    </div>
                </div>

                {/* Audit Trail Section */}
                <AnimatePresence>
                    {showAuditTrail && auditTrail && (
                        <motion.div
                            className="audit-trail-section"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h3 className="audit-trail-title">Audit Trail</h3>
                            <div className="audit-trail-list">
                                {isMicroLoading('audit-trail') ? (
                                    <div className="audit-loading">Loading audit trail...</div>
                                ) : auditEntries.length === 0 ? (
                                    <div className="audit-empty">No audit entries found</div>
                                ) : (
                                    auditEntries.map((entry, index) => (
                                        <motion.div
                                            key={entry.id}
                                            className="audit-entry"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <div className="audit-entry__header">
                                                <span className="audit-action">{entry.action}</span>
                                                <span className="audit-timestamp">
                                                    {new Date(entry.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="audit-entry__details">
                                                <span className="audit-user">By: {entry.performedBy}</span>
                                                {entry.field && (
                                                    <span className="audit-field">Field: {entry.field}</span>
                                                )}
                                            </div>
                                            {(entry.oldValue || entry.newValue) && (
                                                <div className="audit-entry__changes">
                                                    {entry.oldValue && (
                                                        <span className="audit-old">From: {entry.oldValue}</span>
                                                    )}
                                                    {entry.newValue && (
                                                        <span className="audit-new">To: {entry.newValue}</span>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Modal>
    );
};

export default EnhancedUserDetailModal;