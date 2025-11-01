import AppLogoIcon from "@/components/app-logo-icon";
import { home } from "@/routes";
import { type SharedData } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { type PropsWithChildren } from "react";

interface AuthLayoutProps {
    title?: string;
    description?: string;
    imageSrc?: string;
    imageAlt?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
    imageSrc,
    imageAlt = "Auth illustration",
}: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted text-white lg:flex dark:border-r overflow-hidden">
                <div className="absolute inset-0 bg-gray-100 " />
                {imageSrc && (
                    <img
                        src={imageSrc}
                        alt={imageAlt}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                )}
            </div>

            <div className="w-full lg:p-8 flex flex-col min-h-screen">
                {/* Welcome Section with Logo - Fixed at top */}
                <div className="flex items-start justify-between w-full max-w-[350px] pt-8 lg:pt-12 mb-auto">
                    <div className="flex flex-col space-y-0.5">
                        <p className="text-2xl sm:text-3xl font-semibold text-gray-700 leading-tight">
                            Welcome Back
                        </p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-xl sm:text-2xl font-medium text-gray-600 leading-tight">
                                to
                            </p>
                            <h1 className="text-3xl sm:text-4xl font-bold text-[#001f5c] leading-tight">
                                DERTAM
                            </h1>
                        </div>
                    </div>
                    {/* <AppLogoIcon className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0" /> */}
                </div>

                {/* Form - Centered */}
                <div className="mx-auto flex w-full flex-col justify-center space-y-4 sm:w-[350px] my-auto pb-8">
                    <div className="flex flex-col items-start gap-1.5 text-left sm:items-center sm:text-center pt-2">
                        <h2 className="text-xl font-medium">{title}</h2>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
