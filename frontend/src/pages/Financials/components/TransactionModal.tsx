import React, { useState } from 'react';
import './TransactionModal.css';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSubmit }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        type: 'Income',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        status: 'Completed'
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user types
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        
        if (!formData.category) {
            newErrors.category = 'Category is required';
        }
        
        if (!formData.amount || Number(formData.amount) <= 0) {
            newErrors.amount = 'Valid amount is required';
        }

        if (!formData.date) {
            newErrors.date = 'Date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit(e as any);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
            <div className="modal-container" onKeyDown={handleKeyDown}>
                <div className="modal-header">
                    <h2>Add Transaction</h2>
                    <button onClick={onClose} className="close-btn" aria-label="Close modal">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label>Type</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="modal-input">
                            <option value="Income">Income (Revenue)</option>
                            <option value="Expense">Expense</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select 
                            name="category" 
                            value={formData.category} 
                            onChange={handleChange} 
                            className={`modal-input ${errors.category ? 'input-error' : ''}`}
                        >
                            <option value="" disabled>Select Category...</option>
                            {formData.type === 'Income' ? (
                                <>
                                    <option value="Membership">Membership</option>
                                    <option value="PT Session">PT Session</option>
                                    <option value="Merchandise">Merchandise</option>
                                    <option value="Day Pass">Day Pass</option>
                                </>
                            ) : (
                                <>
                                    <option value="Rent">Rent</option>
                                    <option value="Salaries">Salaries</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Equipment">Equipment</option>
                                    <option value="Maintenance">Maintenance</option>
                                </>
                            )}
                        </select>
                        {errors.category && <span className="error-text">{errors.category}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label>Amount (₹)</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                className={`modal-input ${errors.amount ? 'input-error' : ''}`}
                                placeholder="0.00"
                                min="0.01"
                                step="0.01"
                            />
                            {errors.amount && <span className="error-text">{errors.amount}</span>}
                        </div>
                        <div className="form-group flex-1">
                            <label>Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className={`modal-input ${errors.date ? 'input-error' : ''}`}
                            />
                            {errors.date && <span className="error-text">{errors.date}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="modal-input"
                            rows={3}
                            placeholder="Optional notes..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="modal-input">
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Add Transaction</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;
