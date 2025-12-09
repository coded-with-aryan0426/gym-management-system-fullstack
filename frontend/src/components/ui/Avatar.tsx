import React from 'react';
import './Avatar.css';

interface AvatarProps {
    src?: string;
    name: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
    src,
    name,
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

    if (src) {
        return (
            <div className={`avatar avatar--${size} ${className}`}>
                <img src={src} alt={name} className="avatar__image" />
            </div>
        );
    }

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
