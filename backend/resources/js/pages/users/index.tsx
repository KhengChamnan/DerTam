import { useState, useEffect, useRef } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { type BreadcrumbItem, type User } from "@/types";
import { usePermissions } from "@/hooks/usePermissions";
import {
    SearchIcon,
    EditIcon,
    TrashIcon,
    Filter,
    Shield,
    Users,
    UserPlus,
    Upload,
    Settings2,
    UserCog,
    MoreHorizontal,
} from "lucide-react";

interface UserWithRole {
    id: number;
    name: string;
    email: string;
    username?: string;
    phone_number?: string;
    status: string;
    role: string;
    role_display: string;
    roles: string[];
    created_at: string;
    last_login_at?: string;
}

interface UsersPageProps {
    users: {
        data: UserWithRole[];
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

interface ColumnVisibility {
    email: boolean;
    phone: boolean;
    registered: boolean;
    lastLogin: boolean;
    status: boolean;
    role: boolean;
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
    const [isLoading, setIsLoading] = useState(false);

    // Column visibility state with localStorage persistence
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
        () => {
            // Try to load saved preferences from localStorage
            const savedPreferences = localStorage.getItem(
                "userTableColumnVisibility"
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
                email: true,
                phone: true,
                registered: true,
                lastLogin: true,
                status: true,
                role: true,
            };
        }
    );

    useEffect(() => {
        localStorage.setItem(
            "userTableColumnVisibility",
            JSON.stringify(columnVisibility)
        );
    }, [columnVisibility]);

    const isInitialMount = useRef(true);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (isInitialMount.current) {
            return;
        }

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            setIsLoading(true);
            router.get(
                "/users",
                {
                    search: searchTerm || undefined,
                    status: statusFilter === "all" ? undefined : statusFilter,
                    role: roleFilter === "all" ? undefined : roleFilter,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ["users"],
                    onFinish: () => setIsLoading(false),
                }
            );
        }, 500);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchTerm]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        setIsLoading(true);
        router.get(
            "/users",
            {
                search: searchTerm || undefined,
                status: statusFilter === "all" ? undefined : statusFilter,
                role: roleFilter === "all" ? undefined : roleFilter,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ["users"],
                onFinish: () => setIsLoading(false),
            }
        );
    }, [statusFilter, roleFilter]);

    useEffect(() => {
        setSearchTerm(filters.search || "");
        setStatusFilter(filters.status || "all");
        setRoleFilter(filters.role || "all");
    }, [filters.search, filters.status, filters.role]);

    const handleDeleteUser = (userId: number) => {
        router.delete(`/users/${userId}`, {
            onSuccess: () => {
                toast.success("User deleted successfully");
            },
            onError: () => {
                toast.error("Failed to delete user");
            },
        });
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
        const normalizedRole = role.toLowerCase().replace(/\s+/g, "");

        const roleConfig = {
            superadmin: {
                icon: Shield,
                label: "Superadmin",
                className: "bg-transparent border-none text-foreground",
            },
            admin: {
                icon: UserCog,
                label: "Admin",
                className: "bg-transparent border-none text-foreground",
            },
            hotelowner: {
                icon: Users,
                label: "Hotel Owner",
                className: "bg-transparent border-none text-foreground",
            },
            manager: {
                icon: Users,
                label: "Manager",
                className: "bg-transparent border-none text-foreground",
            },
            user: {
                icon: UserCog,
                label: "User",
                className: "bg-transparent border-none text-foreground",
            },
        };

        const config = roleConfig[
            normalizedRole as keyof typeof roleConfig
        ] || {
            icon: UserCog,
            label: role,
            className: "bg-transparent border-none text-foreground",
        };

        const IconComponent = config.icon;

        return (
            <div className="flex items-center gap-2">
                <IconComponent className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{config.label}</span>
            </div>
        );
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
                        {/* <Button variant="outline">
                            <Upload className="size-4" />
                            Import
                        </Button> */}
                        <Button
                            className="gap-2"
                            onClick={() => router.visit("/users/create")}
                        >
                            <UserPlus className="size-4" />
                            Add New User
                        </Button>
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
                        <SelectTrigger className="w-[150px]">
                            <Users className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="superadmin">
                                Super Admin
                            </SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="hotel owner">
                                Hotel Owner
                            </SelectItem>
                            <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                    </Select>

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
                                checked={columnVisibility.email}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        email: !!value,
                                    }))
                                }
                            >
                                Email
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.phone}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        phone: !!value,
                                    }))
                                }
                            >
                                Phone
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.registered}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        registered: !!value,
                                    }))
                                }
                            >
                                Registered
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.lastLogin}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        lastLogin: !!value,
                                    }))
                                }
                            >
                                Last Login
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.status}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        status: !!value,
                                    }))
                                }
                            >
                                Status
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                className="capitalize"
                                checked={columnVisibility.role}
                                onCheckedChange={(value) =>
                                    setColumnVisibility((prev) => ({
                                        ...prev,
                                        role: !!value,
                                    }))
                                }
                            >
                                Role
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Users Table */}
                <div className="rounded-md border overflow-x-auto">
                    <div className="min-w-[1600px]">
                        {/* Table Header */}
                        <div className="border-b bg-muted/50 p-4">
                            <div
                                className="grid gap-4 items-center"
                                style={{
                                    gridTemplateColumns: `2fr ${
                                        columnVisibility.email ? "2fr" : ""
                                    } ${columnVisibility.phone ? "1fr" : ""} ${
                                        columnVisibility.registered ? "1fr" : ""
                                    } ${
                                        columnVisibility.lastLogin ? "1fr" : ""
                                    } ${columnVisibility.status ? "1fr" : ""} ${
                                        columnVisibility.role ? "2fr" : ""
                                    } 1fr`.trim(),
                                }}
                            >
                                <div className="text-sm font-medium">Name</div>
                                {columnVisibility.email && (
                                    <div className="text-sm font-medium">
                                        Email
                                    </div>
                                )}
                                {columnVisibility.phone && (
                                    <div className="text-sm font-medium">
                                        Phone
                                    </div>
                                )}
                                {columnVisibility.registered && (
                                    <div className="text-sm font-medium">
                                        Registered
                                    </div>
                                )}
                                {columnVisibility.lastLogin && (
                                    <div className="text-sm font-medium">
                                        Last Login
                                    </div>
                                )}
                                {columnVisibility.status && (
                                    <div className="text-sm font-medium">
                                        Status
                                    </div>
                                )}
                                {columnVisibility.role && (
                                    <div className="text-sm font-medium">
                                        Role
                                    </div>
                                )}
                                <div className="text-sm font-medium">
                                    Actions
                                </div>
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y">
                            {isLoading
                                ? // Skeleton loading state
                                  Array.from({ length: 5 }).map((_, index) => (
                                      <div key={index} className="p-4">
                                          <div
                                              className="grid gap-4 items-center"
                                              style={{
                                                  gridTemplateColumns: `2fr ${
                                                      columnVisibility.email
                                                          ? "2fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.phone
                                                          ? "1fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.registered
                                                          ? "1fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.lastLogin
                                                          ? "1fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.status
                                                          ? "1fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.role
                                                          ? "2fr"
                                                          : ""
                                                  } 1fr`.trim(),
                                              }}
                                          >
                                              <div className="flex items-center gap-3">
                                                  <Skeleton className="size-8 rounded-full" />
                                                  <div className="space-y-2">
                                                      <Skeleton className="h-4 w-32" />
                                                      <Skeleton className="h-3 w-24" />
                                                  </div>
                                              </div>
                                              {columnVisibility.email && (
                                                  <Skeleton className="h-4 w-40" />
                                              )}
                                              {columnVisibility.phone && (
                                                  <Skeleton className="h-4 w-24" />
                                              )}
                                              {columnVisibility.registered && (
                                                  <Skeleton className="h-4 w-20" />
                                              )}
                                              {columnVisibility.lastLogin && (
                                                  <Skeleton className="h-4 w-20" />
                                              )}
                                              {columnVisibility.status && (
                                                  <Skeleton className="h-5 w-16 rounded-full" />
                                              )}
                                              {columnVisibility.role && (
                                                  <div className="flex items-center gap-2">
                                                      <Skeleton className="h-4 w-4" />
                                                      <Skeleton className="h-4 w-20" />
                                                  </div>
                                              )}
                                              <div className="flex items-center gap-2">
                                                  <Skeleton className="h-8 w-8 rounded-md" />
                                                  <Skeleton className="h-8 w-8 rounded-md" />
                                              </div>
                                          </div>
                                      </div>
                                  ))
                                : users.data.map((user: UserWithRole) => (
                                      <div
                                          key={user.id}
                                          className="p-4 hover:bg-muted/50"
                                      >
                                          <div
                                              className="grid gap-4 items-center"
                                              style={{
                                                  gridTemplateColumns: `2fr ${
                                                      columnVisibility.email
                                                          ? "2fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.phone
                                                          ? "1fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.registered
                                                          ? "1fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.lastLogin
                                                          ? "1fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.status
                                                          ? "1fr"
                                                          : ""
                                                  } ${
                                                      columnVisibility.role
                                                          ? "2fr"
                                                          : ""
                                                  } 1fr`.trim(),
                                              }}
                                          >
                                              <div>
                                                  <div className="flex items-center gap-3">
                                                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                          <span className="text-sm font-medium text-primary">
                                                              {user.name
                                                                  .split(" ")
                                                                  .map(
                                                                      (
                                                                          n: string
                                                                      ) => n[0]
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
                                              {columnVisibility.email && (
                                                  <div>
                                                      <div className="text-sm text-muted-foreground truncate">
                                                          {user.email}
                                                      </div>
                                                  </div>
                                              )}
                                              {columnVisibility.phone && (
                                                  <div>
                                                      <div className="text-xs text-muted-foreground truncate">
                                                          {user.phone_number ||
                                                              "-"}
                                                      </div>
                                                  </div>
                                              )}
                                              {columnVisibility.registered && (
                                                  <div>
                                                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                                                          {new Date(
                                                              user.created_at
                                                          ).toLocaleDateString(
                                                              "en-US",
                                                              {
                                                                  month: "short",
                                                                  day: "numeric",
                                                                  year: "2-digit",
                                                              }
                                                          )}
                                                      </div>
                                                  </div>
                                              )}
                                              {columnVisibility.lastLogin && (
                                                  <div>
                                                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                                                          {user.last_login_at
                                                              ? new Date(
                                                                    user.last_login_at
                                                                ).toLocaleDateString(
                                                                    "en-US",
                                                                    {
                                                                        month: "short",
                                                                        day: "numeric",
                                                                        year: "2-digit",
                                                                    }
                                                                )
                                                              : "-"}
                                                      </div>
                                                  </div>
                                              )}
                                              {columnVisibility.status && (
                                                  <div>
                                                      {getStatusBadge(
                                                          user.status ||
                                                              "Inactive"
                                                      )}
                                                  </div>
                                              )}
                                              {columnVisibility.role && (
                                                  <div>
                                                      {getRoleBadge(
                                                          user.role || "User"
                                                      )}
                                                  </div>
                                              )}
                                              <div>
                                                  <div className="flex items-center gap-2">
                                                      <Link
                                                          href={`/users/${user.id}/edit`}
                                                      >
                                                          <Button
                                                              variant="ghost"
                                                              size="sm"
                                                          >
                                                              <EditIcon className="h-4 w-4" />
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
                                                          <DropdownMenuContent align="start">
                                                              <DropdownMenuItem
                                                                  asChild
                                                              >
                                                                  <Link
                                                                      href={`/users/${user.id}/edit`}
                                                                  >
                                                                      Edit user
                                                                      <EditIcon className="ml-8 h-4 w-4" />
                                                                  </Link>
                                                              </DropdownMenuItem>
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
                                                                          Delete
                                                                          user
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
                                                                              user
                                                                              "
                                                                              {
                                                                                  user.name
                                                                              }
                                                                              "
                                                                              and
                                                                              remove
                                                                              all
                                                                              their
                                                                              data
                                                                              from
                                                                              our
                                                                              servers.
                                                                          </AlertDialogDescription>
                                                                      </AlertDialogHeader>
                                                                      <AlertDialogFooter>
                                                                          <AlertDialogCancel>
                                                                              Cancel
                                                                          </AlertDialogCancel>
                                                                          <AlertDialogAction
                                                                              onClick={() =>
                                                                                  handleDeleteUser(
                                                                                      user.id
                                                                                  )
                                                                              }
                                                                              className="bg-red-600 hover:bg-red-700"
                                                                          >
                                                                              Delete
                                                                          </AlertDialogAction>
                                                                      </AlertDialogFooter>
                                                                  </AlertDialogContent>
                                                              </AlertDialog>
                                                          </DropdownMenuContent>
                                                      </DropdownMenu>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  ))}

                            {!isLoading && users.data.length === 0 && (
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
