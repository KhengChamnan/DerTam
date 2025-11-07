import { usePage } from "@inertiajs/react";

interface Role {
    id: number;
    name: string;
}

interface AuthUser {
    id: number;
    name: string;
    email: string;
    roles: Role[];
    permissions: string[];
}

interface PageProps {
    auth: {
        user: AuthUser;
    };
    [key: string]: any;
}

export const usePermissions = () => {
    const { auth } = usePage<PageProps>().props;

    const hasPermission = (permission: string): boolean => {
        return auth.user?.permissions?.includes(permission) ?? false;
    };

    const hasAnyPermission = (permissions: string[]): boolean => {
        return auth.user?.permissions?.some(permission => permissions.includes(permission)) ?? false;
    };

    const hasRole = (role: string): boolean => {
        return auth.user?.roles?.some(userRole => userRole.name === role) ?? false;
    };

    const hasAnyRole = (roles: string[]): boolean => {
        return auth.user?.roles?.some(userRole => roles.includes(userRole.name)) ?? false;
    };

    const isSuperAdmin = (): boolean => {
        return hasRole('superadmin');
    };

    const isAdmin = (): boolean => {
        return hasAnyRole(['admin', 'superadmin']);
    };

    const isUser = (): boolean => {
        return hasRole('user');
    };

    // Permission-based access control functions
    const canViewPlaces = (): boolean => {
        return hasPermission('view places');
    };

    const canCreatePlaces = (): boolean => {
        return hasPermission('create places');
    };

    const canEditPlaces = (): boolean => {
        return hasPermission('edit places');
    };

    const canDeletePlaces = (): boolean => {
        return hasPermission('delete places');
    };

    const canImportPlaces = (): boolean => {
        return hasPermission('import places');
    };

    const canManageUsers = (): boolean => {
        return hasAnyPermission(['view users', 'create users', 'edit users', 'delete users']);
    };

    const canManageRoles = (): boolean => {
        return hasAnyPermission(['view roles', 'create roles', 'edit roles', 'delete roles']);
    };

    // Hotel permissions
    const canViewHotels = (): boolean => {
        return hasPermission('view hotels');
    };

    const canCreateHotels = (): boolean => {
        return hasPermission('create hotels');
    };

    const canEditHotels = (): boolean => {
        return hasPermission('edit hotels');
    };

    const canDeleteHotels = (): boolean => {
        return hasPermission('delete hotels');
    };

    const canManageHotelRooms = (): boolean => {
        return hasPermission('manage hotel rooms');
    };

    const canViewHotelAnalytics = (): boolean => {
        return hasPermission('view hotel analytics');
    };

    return {
        user: auth.user,
        hasPermission,
        hasAnyPermission,
        hasRole,
        hasAnyRole,
        isSuperAdmin,
        isAdmin,
        isUser,
        canViewPlaces,
        canCreatePlaces,
        canEditPlaces,
        canDeletePlaces,
        canImportPlaces,
        canManageUsers,
        canManageRoles,
        canViewHotels,
        canCreateHotels,
        canEditHotels,
        canDeleteHotels,
        canManageHotelRooms,
        canViewHotelAnalytics,
    };
};