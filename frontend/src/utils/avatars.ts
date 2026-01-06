// Avatar utility functions

const AVATAR_COLORS = [
  '#6c5dd3', '#7b68ee', '#4caf50', '#ff9800', '#f44336',
  '#2196f3', '#9c27b0', '#00bcd4', '#ff5722', '#795548'
];

/**
 * Generate a consistent avatar URL based on user ID
 */
export function getAvatarUrl(userId?: number, name?: string): string {
  // Handle undefined or invalid userId
  const safeUserId = userId && typeof userId === 'number' ? userId : 0;
  const colorIndex = safeUserId % AVATAR_COLORS.length;
  const colorHex = AVATAR_COLORS[colorIndex] || AVATAR_COLORS[0];
  const color = colorHex.replace('#', '');
  
  // Handle undefined or empty name
  const safeName = name && name.trim() ? name.trim() : 'User';
  const initial = safeName.charAt(0).toUpperCase();
  
  // Using UI Avatars service
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=${color}&color=fff&size=200&bold=true`;
}

/**
 * Get initials from name
 */
export function getInitials(name?: string): string {
  if (!name || !name.trim()) {
    return 'U';
  }
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}
