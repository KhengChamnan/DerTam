//import { useForm, Head } from '@inertiajs/react';
import { LoaderCircle } from "lucide-react";
import { FormEventHandler } from "react";
import TextLink from "@/components/text-link";
import { useForm, Head } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/layouts/auth-layout";

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm();

    const resendVerification: FormEventHandler = (e) => {
        e.preventDefault();
        post("/email/verification-notification");
    };

    return (
        <AuthLayout
            title="Verify email"
            description="Please verify your email address by clicking on the link we just emailed to you."
        >
            <Head title="Email verification" />

            {status === "verification-link-sent" && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <div className="space-y-6 text-center">
                <form onSubmit={resendVerification}>
                    <Button disabled={processing} variant="secondary">
                        {processing && (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        )}
                        Resend verification email
                    </Button>
                </form>

                <TextLink
                    href={route("logout")}
                    className="mx-auto block text-sm"
                >
                    Log out
                </TextLink>
            </div>
        </AuthLayout>
    );
}
