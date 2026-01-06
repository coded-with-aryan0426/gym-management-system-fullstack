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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Add Transaction</h2>
                    <button onClick={onClose} className="text-secondary hover:text-white">&times;</button>
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
                        <select name="category" value={formData.category} onChange={handleChange} className="modal-input" required>
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
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label>Amount (₹)</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                className="modal-input"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div className="form-group flex-1">
                            <label>Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="modal-input"
                                required
                            />
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
