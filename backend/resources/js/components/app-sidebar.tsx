import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { dashboard } from "@/routes";
import { type NavItem, type SharedData } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import {
    BookOpen,
    Folder,
    LayoutGrid,
    Map,
    Users,
    Shield,
    Home,
} from "lucide-react";
import AppLogo from "./app-logo";

const mainNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: dashboard(),
        icon: LayoutGrid,
        permissions: ["access admin panel"],
    },
    {
        title: "Places",
        href: "/places",
        icon: Map,
        permissions: ["view places"],
    },
    {
        title: "Hotel",
        href: "/hotels",
        icon: Home,
        permissions: ["view hotels"],
    },
    {
        title: "Users",
        href: "/users",
        icon: Users,
        permissions: ["view users"],
    },
    {
        title: "Roles",
        href: "/roles",
        icon: Shield,
        permissions: ["view roles"],
    },
];

// Hotel Owner specific navigation
const hotelOwnerNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/hotel-owner/dashboard",
        icon: LayoutGrid,
        roles: ["hotel owner"],
    },
    {
        title: "My Hotels",
        href: "/hotel-owner/properties",
        icon: Home,
        roles: ["hotel owner"],
    },
    {
        title: "Bookings",
        href: "/hotel-owner/bookings",
        icon: Users,
        roles: ["hotel owner"],
    },
];

// const footerNavItems: NavItem[] = [
//     {
//         title: "Repository",
//         href: "https://github.com/laravel/react-starter-kit",
//         icon: Folder,
//     },
//     {
//         title: "Documentation",
//         href: "https://laravel.com/docs/starter-kits#react",
//         icon: BookOpen,
//     },
// ];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;

    // Check if user is hotel owner
    const isHotelOwner = auth?.user?.roles?.some(
        (role) => role.name === "hotel owner"
    );

    // Filter function for navigation items
    const filterNavItems = (items: NavItem[]) =>
        items.filter((item) => {
            try {
                // If user is not logged in, hide all items with permissions
                if (!auth?.user) {
                    return !item.permissions && !item.roles;
                }

                // Check permissions if specified
                if (item.permissions && item.permissions.length > 0) {
                    const userPermissions = auth.user.permissions || [];
                    const hasPermission = item.permissions.some((permission) =>
                        userPermissions.includes(permission)
                    );
                    if (!hasPermission) return false;
                }

                // Check roles if specified
                if (item.roles && item.roles.length > 0) {
                    const userRoles =
                        auth.user.roles?.map((role) => role.name) || [];
                    const hasRole = item.roles.some((role) =>
                        userRoles.includes(role)
                    );
                    if (!hasRole) return false;
                }

                return true;
            } catch (error) {
                console.error(
                    "Error checking permissions for item:",
                    item.title,
                    error
                );
                return false; // Hide item if there's an error
            }
        });

    // Get navigation items based on user role
    const navigationItems = isHotelOwner
        ? filterNavItems(hotelOwnerNavItems)
        : filterNavItems(mainNavItems);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={
                                    isHotelOwner
                                        ? "/hotel-owner/dashboard"
                                        : dashboard()
                                }
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navigationItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
