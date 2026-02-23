import React from 'react';
import './Avatar.css';

interface AvatarProps {
    src?: string;
    name: string;
    avatarId?: string | null; // Persistent avatar selection
    userId?: number; // For loading custom images from localStorage
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

// Helper to generate DiceBear URL from avatarId
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

const Avatar: React.FC<AvatarProps> = ({
    src,
    name,
    avatarId,
    userId,
    size = 'md',
    className = '',
}) => {
    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Generate consistent color based on name
    const getColorFromName = (name: string): string => {
        const colors = [
            '#DC2626', // Crimson
            '#10B981', // Emerald
            '#F59E0B', // Amber
            '#3B82F6', // Ocean
            '#8B5CF6', // Purple
            '#EC4899', // Pink
            '#06B6D4', // Cyan
        ];
        const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[index % colors.length];
    };

    // Determine image source
    // Priority: src > custom upload > avatarId (DiceBear) > initials
    let imageSrc: string | undefined = src;

    if (!imageSrc && avatarId === 'custom' && userId) {
        imageSrc = getCustomAvatarImage(userId) || undefined;
    }

    if (!imageSrc && avatarId && avatarId !== 'custom') {
        imageSrc = getAvatarUrl(avatarId) || undefined;
    }

    if (imageSrc) {
        return (
            <div className={`avatar avatar--${size} ${className}`}>
                <img src={imageSrc} alt={name} className="avatar__image" />
            </div>
        );
    }

    // Fallback to initials
    return (
        <div
            className={`avatar avatar--${size} avatar--initials ${className}`}
            style={{ backgroundColor: getColorFromName(name) }}
        >
            <span className="avatar__initials">{getInitials(name)}</span>
        </div>
    );
};

export default Avatar;
