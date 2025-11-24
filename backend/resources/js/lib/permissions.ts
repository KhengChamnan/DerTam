import { type User } from '@/types';

/**
 * Check if user has any of the required permissions
 */
export function hasPermission(user: User | null, permissions: string[]): boolean {
    if (!user || !permissions.length) return true;
    if (!user.permissions || !Array.isArray(user.permissions)) return false;
    
    return permissions.some(permission => user.permissions?.includes(permission));
}

/**
 * Check if user has any of the required roles
 */
export function hasRole(user: User | null, roles: string[]): boolean {
    if (!user || !roles.length) return true;
    if (!user.roles || !Array.isArray(user.roles)) return false;
    
    const userRoles = user.roles.map(role => role.name);
    return roles.some(role => userRoles.includes(role));
}

/**
 * Check if user can access a navigation item based on permissions and roles
 */
export function canAccessNavItem(user: User | null, item: { permissions?: string[]; roles?: string[] }): boolean {
    // If no permissions or roles are specified, allow access
    if (!item.permissions && !item.roles) return true;
    
    // Check permissions if specified
    if (item.permissions && !hasPermission(user, item.permissions)) return false;
    
    // Check roles if specified
    if (item.roles && !hasRole(user, item.roles)) return false;
    
    return true;
}