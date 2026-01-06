// Search utility functions

/**
 * Filters users by name or email (case-insensitive)
 */
export function filterUsers<T extends { name: string; email: string }>(
  users: T[],
  query: string
): T[] {
  if (!query.trim()) {
    return users;
  }
  const lowerQuery = query.toLowerCase();
  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery)
  );
}
