import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User | null;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    permissions?: string[]; // Array of required permissions to show this item
    roles?: string[]; // Array of required roles to show this item
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    username?: string;
    phone_number?: string;
    role?: 'Super Admin' | 'Admin' | 'Hotel Owner' | 'User';
    status?: 'Active' | 'Inactive' | 'Invited' | 'Suspended';
    avatar?: string;
    email_verified_at: string | null;
    last_login_at?: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    roles?: Array<{ id: number; name: string; }>;
    permissions?: string[];
    owned_properties?: Array<{ property_id: number; place: { name: string; }; }>;
    [key: string]: unknown; // This allows for additional properties...
}
