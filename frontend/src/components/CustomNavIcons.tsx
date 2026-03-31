import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Members Icon - Clean group of people
 */
export const MembersGroupIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Person 1 - left */}
    <circle cx="6" cy="5" r="1.5" />
    <rect x="5" y="7" width="2" height="2.5" rx="0.3" />
    <path d="M5 9.5L4 12M7 9.5L8 12" />
    
    {/* Person 2 - center */}
    <circle cx="12" cy="4" r="1.8" />
    <rect x="10.5" y="6.5" width="3" height="3" rx="0.3" />
    <path d="M10.5 9.5L9 13M13.5 9.5L15 13" />
    
    {/* Person 3 - right */}
    <circle cx="18" cy="5" r="1.5" />
    <rect x="17" y="7" width="2" height="2.5" rx="0.3" />
    <path d="M17 9.5L16 12M19 9.5L20 12" />
    
    {/* Bottom connector line */}
    <line x1="2" y1="14" x2="22" y2="14" strokeWidth="1" />
    <circle cx="6" cy="14" r="1" fill={color} opacity="0.5" />
    <circle cx="12" cy="14" r="1" fill={color} opacity="0.5" />
    <circle cx="18" cy="14" r="1" fill={color} opacity="0.5" />
  </svg>
);

/**
 * Trainers Icon - Single coach/trainer figure
 */
export const TrainersGroupIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Head */}
    <circle cx="12" cy="3.5" r="2" />
    
    {/* Trainer outfit - athletic/bold */}
    <rect x="10" y="5.5" width="4" height="4" rx="0.5" fill={color} opacity="0.2" />
    
    {/* Body */}
    <path d="M10 5.5Q10 9.5 10 9.5" strokeWidth={strokeWidth} />
    <path d="M14 5.5Q14 9.5 14 9.5" strokeWidth={strokeWidth} />
    
    {/* Arms extended (coaching pose) */}
    <line x1="10" y1="6.5" x2="5" y2="5" strokeWidth={strokeWidth} />
    <line x1="14" y1="6.5" x2="19" y2="5" strokeWidth={strokeWidth} />
    
    {/* Legs */}
    <path d="M10 9.5L9 14" />
    <path d="M14 9.5L15 14" />
    
    {/* Strong stance base */}
    <line x1="7" y1="14" x2="17" y2="14" strokeWidth="1.5" />
  </svg>
);

/**
 * Staff Icon - Organization/team hierarchy
 */
export const StaffGroupIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 2 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Top - Manager/Leader box */}
    <rect x="9.5" y="2" width="5" height="3" rx="0.5" fill={color} opacity="0.3" />
    
    {/* Connecting lines down */}
    <line x1="12" y1="5" x2="12" y2="7" />
    
    {/* Middle level - Two team leads */}
    <rect x="5" y="7" width="3.5" height="2.5" rx="0.4" stroke={color} strokeWidth={strokeWidth * 0.8} />
    <rect x="15.5" y="7" width="3.5" height="2.5" rx="0.4" stroke={color} strokeWidth={strokeWidth * 0.8} />
    
    {/* Lines from top to middle */}
    <line x1="11" y1="7" x2="6.75" y2="7" />
    <line x1="13" y1="7" x2="17.25" y2="7" />
    
    {/* Lines down from middle */}
    <line x1="6.75" y1="9.5" x2="6.75" y2="11" />
    <line x1="17.25" y1="9.5" x2="17.25" y2="11" />
    
    {/* Bottom level - Four staff members (smaller boxes) */}
    <rect x="2" y="11" width="2.5" height="2.5" rx="0.3" stroke={color} strokeWidth={strokeWidth * 0.7} />
    <rect x="5.5" y="11" width="2.5" height="2.5" rx="0.3" stroke={color} strokeWidth={strokeWidth * 0.7} />
    <rect x="16" y="11" width="2.5" height="2.5" rx="0.3" stroke={color} strokeWidth={strokeWidth * 0.7} />
    <rect x="19.5" y="11" width="2.5" height="2.5" rx="0.3" stroke={color} strokeWidth={strokeWidth * 0.7} />
    
    {/* Connection lines to staff */}
    <line x1="3.25" y1="11" x2="3.25" y2="9.5" />
    <line x1="6.75" y1="11" x2="6.75" y2="9.5" />
    <line x1="17.25" y1="11" x2="17.25" y2="9.5" />
    <line x1="20.75" y1="11" x2="20.75" y2="9.5" />
  </svg>
);
