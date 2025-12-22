import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type BreadcrumbItem, type User } from "@/types";
import { ArrowLeft, EyeIcon, EyeOffIcon, Save } from "lucide-react";

interface CreateEditUserProps {
    user?: User;
    isEdit?: boolean;
}

export default function CreateEditUser({
    user,
    isEdit = false,
}: CreateEditUserProps) {
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        username: user?.username || "",
        phone_number: user?.phone_number || "",
        role: user?.role || "",
        status: user?.status || "Active",
        password: "",
        password_confirmation: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Dashboard",
            href: "/dashboard",
        },
        {
            title: "Users",
            href: "/users",
        },
        {
            title: isEdit ? "Edit User" : "Add New User",
            href: isEdit ? `/users/${user?.id}/edit` : "/users/create",
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!isEdit && formData.password !== formData.password_confirmation) {
            setErrors({ password_confirmation: "Passwords do not match" });
            return;
        }

        const submitData: any = { ...formData };
        if (isEdit && !submitData.password) {
            delete submitData.password;
            delete submitData.password_confirmation;
        }

        if (isEdit && user) {
            router.put(`/users/${user.id}`, submitData, {
                onSuccess: () => {
                    toast.success("User updated successfully");
                    router.visit("/users");
                },
                onError: (errors) => {
                    toast.error("Failed to update user");
                    setErrors(errors);
                },
            });
        } else {
            router.post("/users", submitData, {
                onSuccess: () => {
                    toast.success("User created successfully");
                    router.visit("/users");
                },
                onError: (errors) => {
                    toast.error("Failed to create user");
                    setErrors(errors);
                },
            });
        }
    };

    const handleCancel = () => {
        router.visit("/users");
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? "Edit User" : "Add New User"} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {isEdit ? "Edit User" : "Add New User"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEdit
                                ? "Update user information and settings"
                                : "Create new user here. Click save when you're done."}
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleCancel}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Users
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            First Name *
                                        </Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                })
                                            }
                                            placeholder="John"
                                            required
                                            className={
                                                errors.name
                                                    ? "border-destructive"
                                                    : ""
                                            }
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="username">
                                            Last Name
                                        </Label>
                                        <Input
                                            id="username"
                                            value={formData.username}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    username: e.target.value,
                                                })
                                            }
                                            placeholder="Doe"
                                            className={
                                                errors.username
                                                    ? "border-destructive"
                                                    : ""
                                            }
                                        />
                                        {errors.username && (
                                            <p className="text-sm text-destructive">
                                                {errors.username}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                        placeholder="john.doe@gmail.com"
                                        required
                                        className={
                                            errors.email
                                                ? "border-destructive"
                                                : ""
                                        }
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone_number">
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phone_number"
                                        value={formData.phone_number}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                phone_number: e.target.value,
                                            })
                                        }
                                        placeholder="+123456789"
                                        className={
                                            errors.phone_number
                                                ? "border-destructive"
                                                : ""
                                        }
                                    />
                                    {errors.phone_number && (
                                        <p className="text-sm text-destructive">
                                            {errors.phone_number}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Role and Status */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    Permissions & Status
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role *</Label>
                                        <Select
                                            value={formData.role}
                                            onValueChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    role: value,
                                                })
                                            }
                                        >
                                            <SelectTrigger
                                                className={
                                                    errors.role
                                                        ? "border-destructive"
                                                        : ""
                                                }
                                            >
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Super Admin">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-2 rounded-full bg-red-500"></div>
                                                        Super Admin
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="Admin">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-2 rounded-full bg-purple-500"></div>
                                                        Admin
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="Hotel Owner">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-2 rounded-full bg-orange-500"></div>
                                                        Hotel Owner
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="Transportation Owner">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-2 rounded-full bg-green-500"></div>
                                                        Transportation Owner
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="Restaurant Owner">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-2 rounded-full bg-yellow-500"></div>
                                                        Restaurant Owner
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="User">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-2 rounded-full bg-blue-500"></div>
                                                        User
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.role && (
                                            <p className="text-sm text-destructive">
                                                {errors.role}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    status: value as any,
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Active">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-2 rounded-full bg-green-500"></div>
                                                        Active
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="Inactive">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-2 rounded-full bg-gray-500"></div>
                                                        Inactive
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="Invited">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-2 rounded-full bg-blue-500"></div>
                                                        Invited
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="Suspended">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-2 rounded-full bg-red-500"></div>
                                                        Suspended
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Password Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    {isEdit
                                        ? "Change Password (Optional)"
                                        : "Password *"}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            {isEdit
                                                ? "New Password"
                                                : "Password"}
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={formData.password}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        password:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="********"
                                                required={!isEdit}
                                                className={
                                                    errors.password
                                                        ? "border-destructive pr-10"
                                                        : "pr-10"
                                                }
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                            >
                                                {showPassword ? (
                                                    <EyeOffIcon className="size-4" />
                                                ) : (
                                                    <EyeIcon className="size-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-sm text-destructive">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">
                                            Confirm Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={
                                                    formData.password_confirmation
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        password_confirmation:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="********"
                                                required={
                                                    !isEdit &&
                                                    !!formData.password
                                                }
                                                className={
                                                    errors.password_confirmation
                                                        ? "border-destructive pr-10"
                                                        : "pr-10"
                                                }
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword
                                                    )
                                                }
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOffIcon className="size-4" />
                                                ) : (
                                                    <EyeIcon className="size-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {errors.password_confirmation && (
                                            <p className="text-sm text-destructive">
                                                {errors.password_confirmation}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {isEdit && (
                                    <p className="text-sm text-muted-foreground">
                                        Leave password fields empty to keep the
                                        current password.
                                    </p>
                                )}
                            </div>

                            <Separator />

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    <Save className="w-4 h-4 mr-2" />
                                    {isEdit ? "Update User" : "Create User"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
