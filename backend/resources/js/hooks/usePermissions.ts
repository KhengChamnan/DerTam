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
}

interface PageProps {
    auth: {
        user: AuthUser;
    };
    [key: string]: any;
}

export const usePermissions = () => {
    const { auth } = usePage<PageProps>().props;

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

    const canViewPlaces = (): boolean => {
        return true; // All authenticated users can view places
    };

    const canCreatePlaces = (): boolean => {
        return isAdmin();
    };

    const canEditPlaces = (): boolean => {
        return isAdmin();
    };

    const canDeletePlaces = (): boolean => {
        return isSuperAdmin();
    };

    const canImportPlaces = (): boolean => {
        return isAdmin();
    };

    const canManageUsers = (): boolean => {
        return isAdmin();
    };

    const canManageRoles = (): boolean => {
        return isAdmin();
    };

    return {
        user: auth.user,
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
    };
};