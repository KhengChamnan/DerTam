import AppLogoIcon from "./app-logo-icon";
import { usePage } from "@inertiajs/react";
import type { SharedData } from "@/types";

export default function AppLogo() {
    const { auth } = usePage<SharedData>().props;

    // Determine if the user is an admin or hotel owner
    const isAdmin = auth?.user?.roles?.some(
        (role) => role.name === "admin" || role.name === "superadmin"
    );
    const isHotelOwner = auth?.user?.roles?.some(
        (role) => role.name === "hotel_owner"
    );

    // Set the title based on the user's role
    const dashboardTitle = isHotelOwner
        ? "Hotel Dashboard"
        : "DerTam Dashboard";

    return (
        <>
            {/* <div className="flex aspect-square size-12 items-center justify-center rounded-md text-sidebar-primary-foreground mx-auto">
                <AppLogoIcon className="size-16 fill-current text-white dark:text-black" />
            </div> */}
            <div className="ml-2 grid flex-1 text-left text-base">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {dashboardTitle}
                </span>
            </div>
        </>
    );
}
