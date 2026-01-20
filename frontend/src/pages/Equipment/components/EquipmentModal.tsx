import React, { useState, useEffect } from 'react';
import type { Equipment, EquipmentCategory, EquipmentStatus, EquipmentCondition } from '../../../types/equipment';
import Modal from '../../../components/Modal/Modal';
import TextInput from '../../../components/Form/TextInput';
import Select from '../../../components/Form/Select';
import Button from '../../../components/Form/Button';

interface EquipmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Equipment>) => void;
    initialData?: Equipment | null;
}

const EquipmentModal: React.FC<EquipmentModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<Partial<Equipment>>({
        name: '',
        brand: '',
        model: '',
        category: 'STRENGTH',
        status: 'ACTIVE',
        condition: 'GOOD',
        location: '',
        quantity: 1,
        purchaseCost: 0,
        purchaseDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                brand: '',
                model: '',
                category: 'STRENGTH',
                status: 'ACTIVE',
                condition: 'GOOD',
                location: '',
                quantity: 1,
                purchaseCost: 0,
                purchaseDate: new Date().toISOString().split('T')[0]
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (field: keyof Equipment, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    const categoryOptions = [
        { value: 'STRENGTH', label: 'Strength' },
        { value: 'CARDIO', label: 'Cardio' },
        { value: 'FUNCTIONAL', label: 'Functional' },
        { value: 'YOGA', label: 'Yoga' },
        { value: 'RECOVERY', label: 'Recovery' },
        { value: 'OTHER', label: 'Other' }
    ];

    const statusOptions = [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'MAINTENANCE', label: 'Maintenance' },
        { value: 'OUT_OF_ORDER', label: 'Out of Order' },
        { value: 'RETIRED', label: 'Retired' }
    ];

    const conditionOptions = [
        { value: 'NEW', label: 'New' },
        { value: 'GOOD', label: 'Good' },
        { value: 'FAIR', label: 'Fair' },
        { value: 'POOR', label: 'Poor' }
    ];

    const footer = (
        <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={onClose}>
                Cancel
            </Button>
            <Button variant="primary" onClick={() => document.getElementById('equipment-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}>
                {initialData ? 'Save Changes' : 'Add Equipment'}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Edit Equipment' : 'Add New Equipment'}
            footer={footer}
        >
            <form id="equipment-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-[#888888] uppercase tracking-wider">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput
                            label="Name"
                            name="name"
                            value={formData.name || ''}
                            onChange={(val) => handleChange('name', val)}
                            required
                            placeholder="e.g. Treadmill X1"
                        />
                        <Select
                            label="Category"
                            name="category"
                            value={formData.category || 'STRENGTH'}
                            onChange={(val) => handleChange('category', val)}
                            options={categoryOptions}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput
                            label="Brand"
                            name="brand"
                            value={formData.brand || ''}
                            onChange={(val) => handleChange('brand', val)}
                            placeholder="e.g. Life Fitness"
                        />
                        <TextInput
                            label="Model"
                            name="model"
                            value={formData.model || ''}
                            onChange={(val) => handleChange('model', val)}
                            placeholder="e.g. T-2000"
                        />
                    </div>
                </div>

                {/* Status & Condition */}
                <div className="space-y-4 pt-4 border-t border-[#2E2E2E]">
                    <h3 className="text-sm font-semibold text-[#888888] uppercase tracking-wider">Status & Condition</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Status"
                            name="status"
                            value={formData.status || 'ACTIVE'}
                            onChange={(val) => handleChange('status', val)}
                            options={statusOptions}
                        />
                        <Select
                            label="Condition"
                            name="condition"
                            value={formData.condition || 'GOOD'}
                            onChange={(val) => handleChange('condition', val)}
                            options={conditionOptions}
                        />
                    </div>
                    <TextInput
                        label="Location"
                        name="location"
                        value={formData.location || ''}
                        onChange={(val) => handleChange('location', val)}
                        placeholder="e.g. Cardio Zone, Floor 1"
                    />
                </div>

                {/* Purchase Details */}
                <div className="space-y-4 pt-4 border-t border-[#2E2E2E]">
                    <h3 className="text-sm font-semibold text-[#888888] uppercase tracking-wider">Inventory & Purchase</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TextInput
                            label="Purchase Date"
                            name="purchaseDate"
                            type="date" // Note: TextInput type definition might need 'date' added, or we cast 'text'
                            value={formData.purchaseDate || ''}
                            onChange={(val) => handleChange('purchaseDate', val)}
                        />
                        <TextInput
                            label="Cost"
                            name="purchaseCost"
                            type="text" // Using text to avoid number spin buttons, can parse manually
                            value={formData.purchaseCost?.toString() || '0'}
                            onChange={(val) => handleChange('purchaseCost', parseFloat(val) || 0)}
                        />
                        <TextInput
                            label="Quantity"
                            name="quantity"
                            type="text"
                            value={formData.quantity?.toString() || '1'}
                            onChange={(val) => handleChange('quantity', parseInt(val) || 1)}
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default EquipmentModal;
