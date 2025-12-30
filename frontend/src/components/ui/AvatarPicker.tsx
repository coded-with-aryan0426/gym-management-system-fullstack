import React, { useRef, useState } from 'react';
import './AvatarPicker.css';

interface AvatarOption {
    id: string;
    seed: string;
    label: string;
}

interface AvatarPickerProps {
    selectedId: string | null;
    onSelect: (id: string | null, customImageData?: string) => void;
    userId?: number; // For loading/saving custom images to localStorage
    size?: 'sm' | 'md' | 'lg';
}

// Predefined avatar options with fixed seeds for consistency
const AVATAR_OPTIONS: AvatarOption[] = [
    { id: 'hero-1', seed: 'hero-1', label: 'Hero 1' },
    { id: 'hero-2', seed: 'hero-2', label: 'Hero 2' },
    { id: 'hero-3', seed: 'hero-3', label: 'Hero 3' },
    { id: 'hero-4', seed: 'hero-4', label: 'Hero 4' },
    { id: 'sport-1', seed: 'sport-1', label: 'Sport 1' },
    { id: 'sport-2', seed: 'sport-2', label: 'Sport 2' },
    { id: 'sport-3', seed: 'sport-3', label: 'Sport 3' },
    { id: 'sport-4', seed: 'sport-4', label: 'Sport 4' },
    { id: 'pro-1', seed: 'pro-1', label: 'Pro 1' },
    { id: 'pro-2', seed: 'pro-2', label: 'Pro 2' },
    { id: 'pro-3', seed: 'pro-3', label: 'Pro 3' },
    { id: 'pro-4', seed: 'pro-4', label: 'Pro 4' },
    { id: 'fun-1', seed: 'fun-1', label: 'Fun 1' },
    { id: 'fun-2', seed: 'fun-2', label: 'Fun 2' },
    { id: 'cool-1', seed: 'cool-1', label: 'Cool 1' },
    { id: 'cool-2', seed: 'cool-2', label: 'Cool 2' },
];

// Generate DiceBear URL for an avatar seed
export const getAvatarUrl = (avatarId: string | null | undefined): string | null => {
    if (!avatarId) return null;
    if (avatarId === 'custom') return null; // Custom images handled separately
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarId}`;
};

// Get custom image from localStorage
export const getCustomAvatarImage = (userId: number | undefined): string | null => {
    if (!userId) return null;
    return localStorage.getItem(`avatar_image_${userId}`);
};

const AvatarPicker: React.FC<AvatarPickerProps> = ({
    selectedId,
    onSelect,
    userId,
    size = 'md',
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(() => {
        // Load existing custom image if any
        if (userId && selectedId === 'custom') {
            return getCustomAvatarImage(userId);
        }
        return null;
    });

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 500KB for localStorage)
        if (file.size > 500 * 1024) {
            alert('Image must be less than 500KB');
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            setPreviewImage(base64);

            // Save to localStorage
            if (userId) {
                localStorage.setItem(`avatar_image_${userId}`, base64);
            }

            // Notify parent with custom selection
            onSelect('custom', base64);
        };
        reader.readAsDataURL(file);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="avatar-picker">
            <label className="avatar-picker__label">Choose Avatar</label>

            <div className="avatar-picker__grid">
                {/* No Avatar Option (Initials) */}
                <button
                    type="button"
                    className={`avatar-picker__option avatar-picker__option--none ${selectedId === null ? 'avatar-picker__option--selected' : ''}`}
                    onClick={() => onSelect(null)}
                    title="Use initials"
                >
                    <div className="avatar-picker__initials">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <span className="avatar-picker__option-label">Initials</span>
                </button>

                {/* Upload Custom Photo Option */}
                <button
                    type="button"
                    className={`avatar-picker__option avatar-picker__option--upload ${selectedId === 'custom' ? 'avatar-picker__option--selected' : ''}`}
                    onClick={handleUploadClick}
                    title="Upload custom photo"
                >
                    {previewImage ? (
                        <img src={previewImage} alt="Custom" className="avatar-picker__image" />
                    ) : (
                        <div className="avatar-picker__upload-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                    )}
                    <span className="avatar-picker__option-label">Upload</span>
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />

                {/* Predefined Avatar Options */}
                {AVATAR_OPTIONS.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        className={`avatar-picker__option ${selectedId === option.id ? 'avatar-picker__option--selected' : ''}`}
                        onClick={() => onSelect(option.id)}
                        title={option.label}
                    >
                        <img
                            src={getAvatarUrl(option.id) || ''}
                            alt={option.label}
                            className="avatar-picker__image"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AvatarPicker;
export { AVATAR_OPTIONS };
