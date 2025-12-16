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
    Hotel,
    LayoutGrid,
    Map,
    Users,
    UserLock,
    DoorOpen,
    Bus,
    Ticket,
    Building2,
    Building,
    NotebookPen,
    MapPinned,
    MapPin,
    UtensilsCrossed,
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
        icon: MapPinned,
        permissions: ["view places"],
    },
    {
        title: "Hotel",
        href: "/hotels",
        icon: Building,
        permissions: ["view hotels"],
    },
    {
        title: "Transportation",
        href: "/transportations",
        icon: Bus,
        permissions: ["view transportations"],
    },
    {
        title: "Restaurants",
        href: "/restaurants",
        icon: UtensilsCrossed,
        permissions: ["view restaurants"],
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
        icon: UserLock,
        permissions: ["view roles"],
    },
];

const hotelOwnerNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/hotel-owner/dashboard",
        icon: LayoutGrid,
        roles: ["hotel owner"],
    },
    {
        title: "My Hotel",
        href: "/hotel-owner/properties",
        icon: Building,
        roles: ["hotel owner"],
    },
    {
        title: "Rooms",
        href: "/hotel-owner/rooms",
        icon: DoorOpen,
        roles: ["hotel owner"],
    },
    {
        title: "Bookings",
        href: "/hotel-owner/bookings",
        icon: NotebookPen,
        roles: ["hotel owner"],
    },
];

const transportationOwnerNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/transportation-owner/dashboard",
        icon: LayoutGrid,
        roles: ["transportation owner"],
    },
    {
        title: "My Company",
        href: "/transportation-owner/companies",
        icon: Building2,
        roles: ["transportation owner"],
    },
    {
        title: "Buses",
        href: "/transportation-owner/buses",
        icon: Bus,
        roles: ["transportation owner"],
    },
    {
        title: "Schedules",
        href: "/transportation-owner/schedules",
        icon: Map,
        roles: ["transportation owner"],
    },
    {
        title: "Bookings",
        href: "/transportation-owner/bookings",
        icon: BookOpen,
        roles: ["transportation owner"],
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

    // Check if user is hotel owner or transportation owner
    const isHotelOwner = auth?.user?.roles?.some(
        (role) => role.name === "hotel owner"
    );
    const isTransportationOwner = auth?.user?.roles?.some(
        (role) => role.name === "transportation owner"
    );

    // Filter function for navigation items
    const filterNavItems = (items: NavItem[]) =>
        items.filter((item) => {
            try {
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
                return false;
            }
        });

    // Get navigation items based on user role
    const navigationItems = isHotelOwner
        ? filterNavItems(hotelOwnerNavItems)
        : isTransportationOwner
        ? filterNavItems(transportationOwnerNavItems)
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
                                        : isTransportationOwner
                                        ? "/transportation-owner/dashboard"
                                        : dashboard()
                                }
                            >
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    {isHotelOwner ? (
                                        <Hotel className="size-4" />
                                    ) : isTransportationOwner ? (
                                        <Ticket className="size-4" />
                                    ) : (
                                        <MapPin className="size-4" />
                                    )}
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {isHotelOwner
                                            ? "Hotel Management"
                                            : isTransportationOwner
                                            ? "Transportation"
                                            : "DerTam Dashboard"}
                                    </span>
                                    <span className="truncate text-xs">
                                        {isHotelOwner
                                            ? auth?.user?.hotel_name ||
                                              "Hotel Owner"
                                            : isTransportationOwner
                                            ? auth?.user?.company_name ||
                                              "Transportation Owner"
                                            : "Platform"}
                                    </span>
                                </div>
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
