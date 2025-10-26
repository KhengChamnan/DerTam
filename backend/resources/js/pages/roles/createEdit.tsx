import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { type BreadcrumbItem } from "@/types";
import { ArrowLeft, Save, Shield, Key } from "lucide-react";

interface Permission {
    id: number;
    name: string;
    action: string;
}

interface PermissionGroup {
    resource: string;
    permissions: Permission[];
}

interface Role {
    id?: number;
    name: string;
    permissions: number[];
}

interface Props {
    role?: Role;
    permissions: PermissionGroup[];
}

export default function RoleForm({ role, permissions }: Props) {
    const isEditing = !!role;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Roles",
            href: "/roles",
        },
        {
            title: isEditing && role ? `Edit ${role.name}` : "Create New Role",
            href: "#",
        },
    ];

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: role?.name ?? "",
        permissions: role?.permissions ?? [],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Form submitted", { isEditing, role, data });

        if (isEditing && role?.id) {
            console.log("Updating role:", role.id);
            put(`/roles/${role.id}`, {
                onSuccess: () => {
                    toast.success("Role updated successfully");
                },
                onError: () => {
                    toast.error("Failed to update role");
                },
            });
        } else {
            console.log("Creating new role");
            post("/roles", {
                onSuccess: () => {
                    toast.success("Role created successfully");
                },
                onError: () => {
                    toast.error("Failed to create role");
                },
            });
        }
    };

    const handlePermissionChange = (permissionId: number, checked: boolean) => {
        if (checked) {
            setData("permissions", [...data.permissions, permissionId]);
        } else {
            setData(
                "permissions",
                data.permissions.filter((id) => id !== permissionId)
            );
        }
    };

    const handleGroupPermissionChange = (
        group: PermissionGroup,
        checked: boolean
    ) => {
        const groupPermissionIds = group.permissions.map((p) => p.id);

        if (checked) {
            // Add all permissions from this group
            const newPermissions = [...data.permissions];
            groupPermissionIds.forEach((id) => {
                if (!newPermissions.includes(id)) {
                    newPermissions.push(id);
                }
            });
            setData("permissions", newPermissions);
        } else {
            // Remove all permissions from this group
            setData(
                "permissions",
                data.permissions.filter(
                    (id) => !groupPermissionIds.includes(id)
                )
            );
        }
    };

    const isGroupFullySelected = (group: PermissionGroup) => {
        return group.permissions.every((permission) =>
            data.permissions.includes(permission.id)
        );
    };

    const isGroupPartiallySelected = (group: PermissionGroup) => {
        return (
            group.permissions.some((permission) =>
                data.permissions.includes(permission.id)
            ) && !isGroupFullySelected(group)
        );
    };

    const getActionColor = (action: string) => {
        switch (action.toLowerCase()) {
            case "view":
                return "text-blue-600";
            case "create":
                return "text-green-600";
            case "edit":
                return "text-yellow-600";
            case "delete":
                return "text-red-600";
            case "manage":
                return "text-purple-600";
            case "access":
                return "text-indigo-600";
            case "import":
                return "text-orange-600";
            case "assign":
                return "text-pink-600";
            default:
                return "text-gray-600";
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={isEditing && role ? `Edit ${role.name}` : "Create Role"}
            />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {isEditing && role
                                ? `Edit Role: ${role.name}`
                                : "Create New Role"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing
                                ? "Update role information and permissions"
                                : "Enter the details for the new role"}
                        </p>
                    </div>
                    <Link href="/roles">
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Roles
                        </Button>
                    </Link>
                </div>

                <div className="max-w-4xl mx-auto w-full">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Role Information
                                </CardTitle>
                                <CardDescription>
                                    Enter the basic details of the role
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Role Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        placeholder="Enter role name (e.g., Manager, Editor)"
                                        className="mt-1"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Permissions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-5 w-5" />
                                    Permissions
                                </CardTitle>
                                <CardDescription>
                                    Select which permissions this role should
                                    have. Permissions are grouped by resource
                                    for easier management.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {permissions.map((group) => (
                                    <div
                                        key={group.resource}
                                        className="border rounded-lg p-4"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`group-${group.resource}`}
                                                    checked={isGroupFullySelected(
                                                        group
                                                    )}
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleGroupPermissionChange(
                                                            group,
                                                            checked as boolean
                                                        )
                                                    }
                                                    className={
                                                        isGroupPartiallySelected(
                                                            group
                                                        )
                                                            ? "data-[state=checked]:bg-orange-500"
                                                            : ""
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`group-${group.resource}`}
                                                    className="text-lg font-semibold capitalize cursor-pointer"
                                                >
                                                    {group.resource.replace(
                                                        /[_-]/g,
                                                        " "
                                                    )}
                                                </Label>
                                                {isGroupPartiallySelected(
                                                    group
                                                ) && (
                                                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                                        Partial
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {
                                                    group.permissions.filter(
                                                        (p) =>
                                                            data.permissions.includes(
                                                                p.id
                                                            )
                                                    ).length
                                                }{" "}
                                                / {group.permissions.length}{" "}
                                                selected
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-6">
                                            {group.permissions.map(
                                                (permission) => (
                                                    <div
                                                        key={permission.id}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <Checkbox
                                                            id={`permission-${permission.id}`}
                                                            checked={data.permissions.includes(
                                                                permission.id
                                                            )}
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                handlePermissionChange(
                                                                    permission.id,
                                                                    checked as boolean
                                                                )
                                                            }
                                                        />
                                                        <Label
                                                            htmlFor={`permission-${permission.id}`}
                                                            className="text-sm cursor-pointer flex items-center gap-1"
                                                        >
                                                            <span
                                                                className={`font-medium ${getActionColor(
                                                                    permission.action
                                                                )}`}
                                                            >
                                                                {
                                                                    permission.action
                                                                }
                                                            </span>
                                                            <span className="text-muted-foreground">
                                                                {permission.name.replace(
                                                                    permission.action +
                                                                        " ",
                                                                    ""
                                                                )}
                                                            </span>
                                                        </Label>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {errors.permissions && (
                                    <p className="text-sm text-red-600">
                                        {errors.permissions}
                                    </p>
                                )}

                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Selected permissions:</strong>{" "}
                                        {data.permissions.length} total
                                    </p>
                                    {data.permissions.length > 0 && (
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            You can always modify permissions
                                            later by editing this role.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <Link href="/roles">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                <Save className="w-4 h-4 mr-2" />
                                {processing
                                    ? "Saving..."
                                    : isEditing
                                    ? "Update Role"
                                    : "Create Role"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
