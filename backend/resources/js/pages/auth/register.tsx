import { useForm, Head } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";

import InputError from "@/components/input-error";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("register"));
    };

    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />

            <form onSubmit={submit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                            Full name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            required
                            autoFocus
                            autoComplete="name"
                            placeholder="Enter your full name"
                            className="h-10"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            required
                            autoComplete="email"
                            placeholder="email@example.com"
                            className="h-10"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="password"
                            className="text-sm font-medium"
                        >
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            required
                            autoComplete="new-password"
                            placeholder="Create a password"
                            className="h-10"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="password_confirmation"
                            className="text-sm font-medium"
                        >
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
                            required
                            autoComplete="new-password"
                            placeholder="Confirm your password"
                            className="h-10"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-10"
                    disabled={processing}
                >
                    {processing && (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create account
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <TextLink
                        href={route("login")}
                        className="font-medium text-primary hover:text-primary/80"
                    >
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
