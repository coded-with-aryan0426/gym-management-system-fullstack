import React from 'react'

interface ActionMenuButtonProps {
    onClick: (e: React.MouseEvent) => void
    className?: string
}

/**
 * Animated three-dot action menu button
 * Used consistently across Members and Staff pages
 */
export const ActionMenuButton: React.FC<ActionMenuButtonProps> = ({ onClick, className = '' }) => {
    return (
        <button
            className={`action-menu-btn ${className}`}
            onClick={onClick}
            aria-label="Open actions menu"
        >
            <span className="action-dot"></span>
            <span className="action-dot"></span>
            <span className="action-dot"></span>
        </button>
    )
}

export default ActionMenuButton
