import { useForm, Head } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { FormEventHandler } from "react";

import InputError from "@/components/input-error";
import { route } from "ziggy-js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: email,
        password: "",
        password_confirmation: "",
        token: token,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("password.store"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <AuthLayout
            title="Reset password"
            description="Please enter your new password below"
        >
            <Head title="Reset password" />

            <form onSubmit={submit} className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="email"
                        className="mt-1 block w-full"
                        readOnly
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                        autoComplete="new-password"
                        className="mt-1 block w-full"
                        autoFocus
                        placeholder="Password"
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">
                        Confirm password
                    </Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData("password_confirmation", e.target.value)
                        }
                        autoComplete="new-password"
                        className="mt-1 block w-full"
                        placeholder="Confirm password"
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                <Button
                    type="submit"
                    className="mt-4 w-full"
                    disabled={processing}
                    data-test="reset-password-button"
                >
                    {processing && (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    )}
                    Reset password
                </Button>
            </form>
        </AuthLayout>
    );
}
