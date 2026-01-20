import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../Modal/Modal';
import { Button } from '../Form';
import { getAvatarUrl } from '../../utils/avatars';
import { showToast } from '../../utils/toast';
import api from '../../services/api';
import type { User } from '../../types/user';
import './UserDetailModal.css';

interface UserDetailModalProps {
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
}

type ConfirmAction =
    | { type: 'delete-user' }
    | { type: 'remove-user'; userId: number; userName: string };

const UserDetailModal: React.FC<UserDetailModalProps> = ({
    isOpen,
    onClose,
    user,
    userType,
    onDelete,
    onEdit,
}) => {
    const [relatedUsers, setRelatedUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

    // Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [, setIsSearching] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchRelatedUsers();
            setConfirmAction(null);
            setSearchQuery('');
            setSearchResults([]);
        }
    }, [isOpen, user.id]);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                setIsSearching(true);
                try {
                    const roleToSearch = userType === 'trainer' ? 'CUSTOMER' : 'TRAINER';
                    const results = await api.searchUsers(roleToSearch, searchQuery);

                    const assignedIds = relatedUsers.map(u => u.userId);
                    const filtered = results.filter(u => !assignedIds.includes(u.userId) && u.userId !== user.id);

                    setSearchResults(filtered);
                } catch (err) {
                    console.error('Search failed', err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery, userType, relatedUsers, user.id]);

    const fetchRelatedUsers = async (forceRefresh?: boolean) => {
        setLoading(true);
        try {
            if (forceRefresh) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            let users: User[] = [];
            if (userType === 'trainer') {
                users = await api.getTrainerCustomers(user.id);
            } else {
                users = await api.getCustomerTrainers(user.id);
            }
            setRelatedUsers(users);
        } catch (err) {
            console.error('Could not fetch related users:', err);
            setRelatedUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (targetUser: User) => {
        try {
            if (userType === 'trainer') {
                await api.assignCustomerToTrainer(user.id, targetUser.userId);
            } else {
                await api.assignCustomerToTrainer(targetUser.userId, user.id);
            }
            await fetchRelatedUsers(true);
            setSearchQuery('');
            setSearchResults([]);
            showToast.success(`Assigned ${targetUser.fullName}`);
        } catch (err) {
            showToast.error('Assignment failed');
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
                showToast.success('User deleted');
            } catch (err) {
                showToast.error('Failed to delete user');
            } finally {
                setConfirmAction(null);
            }
        } else if (confirmAction.type === 'remove-user') {
            try {
                const tId = userType === 'trainer' ? user.id : confirmAction.userId;
                const cId = userType === 'trainer' ? confirmAction.userId : user.id;

                await api.removeCustomerFromTrainer(tId, cId);
                await fetchRelatedUsers(true);
                showToast.success('Removed successfully');
            } catch (err) {
                showToast.error('Failed to remove');
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

    // Proper title based on user type
    const modalTitle = userType === 'trainer'
        ? 'Manage Assigned Customers'
        : 'Manage Personal Trainers';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            footer={
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', gap: '10px' }}>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={onClose}>Save Changes</Button>
                </div>
            }
        >
            <div className="user-detail">
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
                    <img
                        src={user.avatarUrl || getAvatarUrl(user.id, user.name)}
                        alt={user.name}
                        className="user-detail__member-avatar"
                    />
                    <p className="user-detail__member-text">
                        Member: <strong>{user.name}</strong> | {user.plan || user.role}
                    </p>
                </div>

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
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="user-detail__user-grid user-detail__search-results">
                            {searchResults.map(result => (
                                <div
                                    key={result.userId}
                                    className="user-detail__user-card user-detail__user-card--clickable"
                                    onClick={() => handleAssign(result)}
                                >
                                    <div className="user-detail__card-left">
                                        {(result as any).avatarUrl ? (
                                            <img src={(result as any).avatarUrl} alt="" className="user-detail__card-avatar" />
                                        ) : (
                                            <div className="user-detail__card-avatar">{getInitials(result.fullName)}</div>
                                        )}
                                        <div className="user-detail__card-info">
                                            <p className="user-detail__card-name">{result.fullName}</p>
                                            <p className="user-detail__card-email">{result.email}</p>
                                        </div>
                                    </div>
                                    <button className="user-detail__card-action user-detail__card-action--add">
                                        Add
                                    </button>
                                </div>
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
                                <div key={relatedUser.userId} className="user-detail__user-card">
                                    <div className="user-detail__card-left">
                                        {(relatedUser as any).avatarUrl ? (
                                            <img src={(relatedUser as any).avatarUrl} alt="" className="user-detail__card-avatar" />
                                        ) : (
                                            <div className="user-detail__card-avatar">{getInitials(relatedUser.fullName)}</div>
                                        )}
                                        <div className="user-detail__card-info">
                                            <p className="user-detail__card-name">{relatedUser.fullName}</p>
                                            <p className="user-detail__card-email">{relatedUser.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="user-detail__card-action user-detail__card-action--remove"
                                        onClick={() => handleRemove(relatedUser.userId, relatedUser.fullName)}
                                    >
                                        <svg className="user-detail__icon" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                                        </svg>
                                        Remove
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="user-detail__empty">
                                No {userType === 'trainer' ? 'customers' : 'trainers'} assigned
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default UserDetailModal;
