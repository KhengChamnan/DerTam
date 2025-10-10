import { Config } from "ziggy-js";

// Generate route names from Ziggy configuration
type ZiggyRouteNames = 
    | "login"
    | "login.store"
    | "logout"
    | "password.request"
    | "password.reset"
    | "password.email"
    | "password.update"
    | "register"
    | "register.store"
    | "user-profile-information.update"
    | "user-password.update"
    | "password.confirm"
    | "password.confirmation"
    | "password.confirm.store"
    | "profile.show"
    | "other-browser-sessions.destroy"
    | "current-user-photo.destroy"
    | "sanctum.csrf-cookie"
    | "products.index"
    | "products.create"
    | "products.store"
    | "products.show"
    | "products.edit"
    | "products.update"
    | "products.destroy"
    | "dashboard"
    | "storage.local";

declare global {
    var Ziggy: Config;
    
    function route(
        name: ZiggyRouteNames,
        params?: Record<string, any>,
        absolute?: boolean,
        config?: Config
    ): string;
    
    interface Window {
        Ziggy: Config;
        route: typeof route;
    }
}

declare module "ziggy-js" {
    export function route(
        name: ZiggyRouteNames,
        params?: Record<string, any>,
        absolute?: boolean,
        config?: Config
    ): string;
}

export type { ZiggyRouteNames };
