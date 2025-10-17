import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { type BreadcrumbItem, type User } from "@/types";
import {
    PlusIcon,
    SearchIcon,
    EditIcon,
    TrashIcon,
    EyeIcon,
    EyeOffIcon,
    Filter,
    Users,
} from "lucide-react";

interface UsersPageProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        role?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
    },
    {
        title: "Users",
        href: "/users",
    },
];

export default function UsersIndex({ users, filters }: UsersPageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [statusFilter, setStatusFilter] = useState(filters.status || "all");
    const [roleFilter, setRoleFilter] = useState(filters.role || "all");
    const [showAddUserDialog, setShowAddUserDialog] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        username: "",
        phone_number: "",
        role: "",
        password: "",
        password_confirmation: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const handleSearch = () => {
        router.get(
            "/users",
            {
                search: searchTerm,
                status: statusFilter === "all" ? "" : statusFilter,
                role: roleFilter === "all" ? "" : roleFilter,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleReset = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setRoleFilter("all");
        router.get(
            "/users",
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        router.post("/users", formData, {
            onSuccess: () => {
                setShowAddUserDialog(false);
                setFormData({
                    name: "",
                    email: "",
                    username: "",
                    phone_number: "",
                    role: "",
                    password: "",
                    password_confirmation: "",
                });
            },
        });
    };

    const handleDeleteUser = (userId: number) => {
        if (confirm("Are you sure you want to delete this user?")) {
            router.delete(`/users/${userId}`);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusColors = {
            Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            Inactive:
                "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
            Invited:
                "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            Suspended:
                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        };

        return (
            <Badge
                className={
                    statusColors[status as keyof typeof statusColors] ||
                    statusColors.Inactive
                }
            >
                {status}
            </Badge>
        );
    };

    const getRoleBadge = (role: string) => {
        const roleColors = {
            "Super Admin":
                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
            Admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
            User: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        };

        return (
            <Badge
                className={
                    roleColors[role as keyof typeof roleColors] ||
                    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                }
            >
                {role}
            </Badge>
        );
    };

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setRoleFilter("all");
        router.get("/users");
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            User Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage users and their permissions
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline">Import</Button>
                        <Dialog
                            open={showAddUserDialog}
                            onOpenChange={setShowAddUserDialog}
                        >
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <PlusIcon className="size-4" />
                                    Add New User
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add New User</DialogTitle>
                                </DialogHeader>

                                <form
                                    onSubmit={handleAddUser}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                First Name
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
                                            />
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
                                                        username:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Doe"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
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
                                        />
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
                                                    phone_number:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="+123456789"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select
                                            value={formData.role}
                                            onValueChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    role: value,
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Super Admin">
                                                    Super Admin
                                                </SelectItem>
                                                <SelectItem value="Admin">
                                                    Admin
                                                </SelectItem>
                                                <SelectItem value="User">
                                                    User
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Password
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
                                                required
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
                                                required
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
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setShowAddUserDialog(false)
                                            }
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit">
                                            Save changes
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                            onKeyPress={(e) =>
                                e.key === "Enter" && handleSearch()
                            }
                        />
                    </div>

                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-[150px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Invited">Invited</SelectItem>
                            <SelectItem value="Suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="Super Admin">
                                Super Admin
                            </SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="User">User</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[150px]">
                            <Users className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="Super Admin">
                                Super Admin
                            </SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="User">User</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Users Table */}
                <div className="rounded-md border overflow-x-auto">
                    <div className="min-w-[1200px]">
                        {/* Table Header */}
                        <div className="border-b bg-muted/50 p-4">
                            <div className="grid grid-cols-11 gap-4 items-center">
                                <div className="col-span-2 text-sm font-medium">
                                    Name
                                </div>
                                <div className="col-span-2 text-sm font-medium">
                                    Email
                                </div>
                                <div className="col-span-1 text-sm font-medium">
                                    Phone Number
                                </div>
                                <div className="col-span-1 text-sm font-medium">
                                    Registered Date
                                </div>
                                <div className="col-span-1 text-sm font-medium">
                                    Last Login Date
                                </div>
                                <div className="col-span-1 text-sm font-medium">
                                    Status
                                </div>
                                <div className="col-span-1 text-sm font-medium">
                                    Role
                                </div>
                                <div className="col-span-2 text-sm font-medium">
                                    Actions
                                </div>
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y">
                            {users.data.map((user: User) => (
                                <div
                                    key={user.id}
                                    className="p-4 hover:bg-muted/50"
                                >
                                    <div className="grid grid-cols-11 gap-4 items-center">
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-primary">
                                                        {user.name
                                                            .split(" ")
                                                            .map(
                                                                (n: string) =>
                                                                    n[0]
                                                            )
                                                            .join("")
                                                            .toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="font-medium truncate">
                                                    {user.name}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="text-sm text-muted-foreground truncate">
                                                {user.email}
                                            </div>
                                        </div>
                                        <div className="col-span-1">
                                            <div className="text-sm text-muted-foreground">
                                                {user.phone_number || "-"}
                                            </div>
                                        </div>
                                        <div className="col-span-1">
                                            <div className="text-sm text-muted-foreground">
                                                {new Date(
                                                    user.created_at
                                                ).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="col-span-1">
                                            <div className="text-sm text-muted-foreground">
                                                {user.last_login_at
                                                    ? new Date(
                                                          user.last_login_at
                                                      ).toLocaleDateString()
                                                    : "-"}
                                            </div>
                                        </div>
                                        <div className="col-span-1">
                                            {getStatusBadge(
                                                user.status || "Inactive"
                                            )}
                                        </div>
                                        <div className="col-span-1">
                                            {getRoleBadge(user.role || "User")}
                                        </div>
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/users/${user.id}/edit`}
                                                    >
                                                        <EditIcon className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteUser(
                                                            user.id
                                                        )
                                                    }
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {users.data.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground">
                                    No users found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {(users.current_page - 1) * users.per_page + 1}{" "}
                        to{" "}
                        {Math.min(
                            users.current_page * users.per_page,
                            users.total
                        )}{" "}
                        of {users.total} row(s).
                    </div>

                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Rows per page</p>
                            <Select
                                value={String(users.per_page)}
                                onValueChange={(value) => {
                                    router.get("/users", {
                                        ...filters,
                                        per_page: value,
                                        page: 1,
                                    });
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue
                                        placeholder={String(users.per_page)}
                                    />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="30">30</SelectItem>
                                    <SelectItem value="40">40</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Page {users.current_page} of {users.last_page}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() =>
                                    router.get("/users", {
                                        ...filters,
                                        page: 1,
                                    })
                                }
                                disabled={users.current_page === 1}
                            >
                                <span className="sr-only">
                                    Go to first page
                                </span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                >
                                    <polyline points="11,17 6,12 11,7" />
                                    <polyline points="18,17 13,12 18,7" />
                                </svg>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                    router.get("/users", {
                                        ...filters,
                                        page: users.current_page - 1,
                                    })
                                }
                                disabled={users.current_page === 1}
                            >
                                <span className="sr-only">
                                    Go to previous page
                                </span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                >
                                    <polyline points="15,18 9,12 15,6" />
                                </svg>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                    router.get("/users", {
                                        ...filters,
                                        page: users.current_page + 1,
                                    })
                                }
                                disabled={
                                    users.current_page === users.last_page
                                }
                            >
                                <span className="sr-only">Go to next page</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                >
                                    <polyline points="9,18 15,12 9,6" />
                                </svg>
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() =>
                                    router.get("/users", {
                                        ...filters,
                                        page: users.last_page,
                                    })
                                }
                                disabled={
                                    users.current_page === users.last_page
                                }
                            >
                                <span className="sr-only">Go to last page</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                >
                                    <polyline points="13,17 18,12 13,7" />
                                    <polyline points="6,17 11,12 6,7" />
                                </svg>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
