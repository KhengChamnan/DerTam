import AuthLayoutTemplate from "@/layouts/auth/auth-split-layout";

export default function AuthLayout({
    children,
    title,
    description,
    header,
    imageSrc,
    imageAlt,
    ...props
}: {
    children: React.ReactNode;
    title?: string;
    description?: string;
    header?: React.ReactNode;
    imageSrc?: string;
    imageAlt?: string;
}) {
    return (
        <div>
            {/* Render header manually if needed */}
            {header && <div className="mb-4">{header}</div>}
            <AuthLayoutTemplate
                title={title}
                description={description}
                imageSrc={imageSrc}
                imageAlt={imageAlt}
                {...props}
            >
                {children}
            </AuthLayoutTemplate>
        </div>
    );
}
