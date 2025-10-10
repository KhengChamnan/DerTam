import AuthLayoutTemplate from "@/layouts/auth/auth-simple-layout";

export default function AuthLayout({
    children,
    title,
    description,
    header,
    ...props
}: {
    children: React.ReactNode;
    title?: string;
    description?: string;
    header?: React.ReactNode;
}) {
    return (
        <div>
            {/* Render header manually if needed */}
            {header && <div className="mb-4">{header}</div>}
            <AuthLayoutTemplate
                title={title}
                description={description}
                {...props}
            >
                {children}
            </AuthLayoutTemplate>
        </div>
    );
}
