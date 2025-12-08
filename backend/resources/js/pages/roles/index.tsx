import { useState, useEffect, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { type BreadcrumbItem } from "@/types";
import {
    Search,
    Shield,
    Plus,
    Pencil,
    Trash,
    Users,
    Key,
    Settings2,
    MoreHorizontal,
} from "lucide-react";

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions: Permission[];
    permissions_count: number;
    users_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    roles: {
        data: Role[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

interface ColumnVisibility {
    permissions: boolean;
    users: boolean;
    type: boolean;
}

export default function RolesIndex({ roles, filters }: Props) {
    // Client-side filter state
    const [searchQuery, setSearchQuery] = useState("");

    // Client-side pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Column visibility state with localStorage persistence
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
        () => {
            // Try to load saved preferences from localStorage
            const savedPreferences = localStorage.getItem(
                "rolesTableColumnVisibility"
            );
            if (savedPreferences) {
                try {
                    return JSON.parse(savedPreferences);
                } catch (e) {
                    console.error(
                        "Failed to parse column visibility preferences:",
                        e
                    );
                }
            }
            // Default values if nothing saved
            return {
                permissions: true,
                users: true,
                type: true,
            };
        }
    );

    // Save column visibility preferences to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(
            "rolesTableColumnVisibility",
            JSON.stringify(columnVisibility)
        );
    }, [columnVisibility]);

    // Client-side filtering - instant results
    const filteredRoles = useMemo(() => {
        return roles.data.filter((role) => {
            // Search filter - only match role name with prefix
            const matchesSearch =
                searchQuery === "" ||
                role.name.toLowerCase().startsWith(searchQuery.toLowerCase());

            return matchesSearch;
        });
    }, [roles.data, searchQuery]);

    // Client-side pagination calculations
    const totalFiltered = filteredRoles.length;
    const lastPage = Math.ceil(totalFiltered / perPage);
    const from = totalFiltered === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, totalFiltered);

    // Paginated data for current page
    const paginatedRoles = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        const end = start + perPage;
        return filteredRoles.slice(start, end);
    }, [filteredRoles, currentPage, perPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Roles",
            href: "/roles",
        },
    ];

    const handleDelete = (id: number) => {
        router.delete(`/roles/${id}`, {
            onSuccess: () => {
                toast.success("Role deleted successfully");
            },
            onError: () => {
                toast.error("Failed to delete role");
            },
        });
    };

    const getSystemRoleBadge = (roleName: string) => {
        if (["superadmin", "admin", "user"].includes(roleName.toLowerCase())) {
            return (
                <Badge variant="secondary" className="text-xs">
                    System
                </Badge>
            );
        }
        return null;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Roles & Permissions
                        </h1>
                        <p className="text-muted-foreground">
                            Manage user roles and their permissions
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/roles/create">
                            <Button className="gap-2">
                                <Shield className="h-4 w-4" />
                                Create Role
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search roles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    {/* Column Toggle */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto"
                            >
                                <Settings2 className="h-4 w-4" />
                                View
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[150px]">
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.permissions}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        permissions: !!value,
                                    }))
                                }
                            >
                                Permissions
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.users}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        users: !!value,
                                    }))
                                }
                            >
                                Users
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.type}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        type: !!value,
                                    }))
                                }
                            >
                                Type
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Table-like layout */}
                <div className="rounded-md border overflow-x-auto">
                    <div className="min-w-[800px]">
                        {/* Table Header */}
                        <div className="border-b bg-muted/50 p-4">
                            <div
                                className="grid gap-4 items-center"
                                style={{
                                    gridTemplateColumns: `3fr ${
                                        columnVisibility.permissions
                                            ? "4fr"
                                            : ""
                                    } ${columnVisibility.users ? "2fr" : ""} ${
                                        columnVisibility.type ? "2fr" : ""
                                    } 1fr`.trim(),
                                }}
                            >
                                <div className="text-sm font-medium">
                                    Role Name
                                </div>
                                {columnVisibility.permissions && (
                                    <div className="text-sm font-medium">
                                        Permissions
                                    </div>
                                )}
                                {columnVisibility.users && (
                                    <div className="text-sm font-medium">
                                        Users
                                    </div>
                                )}
                                {columnVisibility.type && (
                                    <div className="text-sm font-medium">
                                        Type
                                    </div>
                                )}
                                <div className="text-sm font-medium">
                                    Actions
                                </div>
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y">
                            {paginatedRoles.length === 0 ? (
                                <div className="col-span-full p-12">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <Shield className="h-8 w-8" />
                                            </EmptyMedia>
                                            <EmptyTitle className="text-xl">
                                                No roles found
                                            </EmptyTitle>
                                            <EmptyDescription className="text-base">
                                                {searchQuery
                                                    ? "No roles match your search. Try adjusting your search criteria."
                                                    : "Get started by creating your first role."}
                                            </EmptyDescription>
                                        </EmptyHeader>
                                        <EmptyContent className="flex gap-2">
                                            {searchQuery && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        setSearchQuery("")
                                                    }
                                                >
                                                    Clear Search
                                                </Button>
                                            )}
                                            {!searchQuery && (
                                                <Link href="/roles/create">
                                                    <Button>
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        Create Role
                                                    </Button>
                                                </Link>
                                            )}
                                        </EmptyContent>
                                    </Empty>
                                </div>
                            ) : (
                                paginatedRoles.map((role) => (
                                    <div
                                        key={role.id}
                                        className="p-4 hover:bg-muted/50"
                                    >
                                        <div
                                            className="grid gap-4 items-start"
                                            style={{
                                                gridTemplateColumns: `3fr ${
                                                    columnVisibility.permissions
                                                        ? "4fr"
                                                        : ""
                                                } ${
                                                    columnVisibility.users
                                                        ? "2fr"
                                                        : ""
                                                } ${
                                                    columnVisibility.type
                                                        ? "2fr"
                                                        : ""
                                                } 1fr`.trim(),
                                            }}
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium capitalize">
                                                        {role.name}
                                                    </span>
                                                </div>
                                            </div>
                                            {columnVisibility.permissions && (
                                                <div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {role.permissions
                                                            .slice(0, 3)
                                                            .map(
                                                                (
                                                                    permission
                                                                ) => (
                                                                    <Badge
                                                                        key={
                                                                            permission.id
                                                                        }
                                                                        variant="outline"
                                                                        className="text-xs"
                                                                    >
                                                                        {
                                                                            permission.name
                                                                        }
                                                                    </Badge>
                                                                )
                                                            )}
                                                        {role.permissions
                                                            .length > 3 && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                +
                                                                {role
                                                                    .permissions
                                                                    .length -
                                                                    3}{" "}
                                                                more
                                                            </Badge>
                                                        )}
                                                        {role.permissions
                                                            .length === 0 && (
                                                            <span className="text-sm text-muted-foreground">
                                                                No permissions
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {columnVisibility.users && (
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">
                                                            {role.users_count}{" "}
                                                            users
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            {columnVisibility.type && (
                                                <div>
                                                    {getSystemRoleBadge(
                                                        role.name
                                                    )}
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/roles/${role.id}/edit`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={`/roles/${role.id}/edit`}
                                                                >
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    Edit role
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {role.name.toLowerCase() !==
                                                                "superadmin" && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger
                                                                            asChild
                                                                        >
                                                                            <DropdownMenuItem
                                                                                onSelect={(
                                                                                    e
                                                                                ) =>
                                                                                    e.preventDefault()
                                                                                }
                                                                                className="text-red-600 focus:text-red-600"
                                                                            >
                                                                                <Trash className="mr-2 h-4 w-4" />
                                                                                Delete
                                                                                role
                                                                            </DropdownMenuItem>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle>
                                                                                    Are
                                                                                    you
                                                                                    absolutely
                                                                                    sure?
                                                                                </AlertDialogTitle>
                                                                                <AlertDialogDescription>
                                                                                    This
                                                                                    action
                                                                                    cannot
                                                                                    be
                                                                                    undone.
                                                                                    This
                                                                                    will
                                                                                    permanently
                                                                                    delete
                                                                                    the
                                                                                    role
                                                                                    "
                                                                                    {
                                                                                        role.name
                                                                                    }

                                                                                    "
                                                                                    and
                                                                                    remove
                                                                                    it
                                                                                    from
                                                                                    all
                                                                                    users
                                                                                    who
                                                                                    have
                                                                                    it
                                                                                    assigned.
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>
                                                                                    Cancel
                                                                                </AlertDialogCancel>
                                                                                <AlertDialogAction
                                                                                    onClick={() =>
                                                                                        handleDelete(
                                                                                            role.id
                                                                                        )
                                                                                    }
                                                                                    className="bg-red-600 hover:bg-red-700"
                                                                                >
                                                                                    Delete
                                                                                </AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {from} to {to} of {totalFiltered} row(s).
                    </div>

                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Rows per page</p>
                            <Select
                                value={String(perPage)}
                                onValueChange={(value) => {
                                    setPerPage(Number(value));
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue
                                        placeholder={String(perPage)}
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
                            Page {currentPage} of {lastPage || 1}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
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
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
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
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === lastPage}
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
                                onClick={() => setCurrentPage(lastPage)}
                                disabled={currentPage === lastPage}
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
