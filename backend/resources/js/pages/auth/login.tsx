import { useForm, Head } from "@inertiajs/react";
import InputError from "@/components/input-error";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";
import { LoaderCircle } from "lucide-react";

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            {status && (
                <div className="mb-4 rounded-lg bg-green-50 p-4 text-center text-sm font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div className="space-y-4">
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
                            autoFocus
                            autoComplete="email"
                            placeholder="email@example.com"
                            className="h-10"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label
                                htmlFor="password"
                                className="text-sm font-medium"
                            >
                                Password
                            </Label>
                            {canResetPassword && (
                                <TextLink
                                    href={route("password.request")}
                                    className="text-sm font-medium text-primary hover:text-primary/80"
                                >
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            required
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            className="h-10"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="remember"
                            checked={data.remember}
                            onCheckedChange={(val) =>
                                setData("remember", !!val)
                            }
                        />
                        <Label
                            htmlFor="remember"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Remember me
                        </Label>
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
                    Log in
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <TextLink
                        href={route("register")}
                        className="font-medium text-primary hover:text-primary/80"
                    >
                        Sign up
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
