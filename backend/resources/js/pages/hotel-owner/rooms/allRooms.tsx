import React, { useState, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
} from "@/components/ui/empty";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DoorOpen,
    Users,
    DollarSign,
    Bed,
    CheckCircle,
    AlertCircle,
    Sparkles,
    Edit,
    Maximize,
    Home,
    Search,
    Filter,
} from "lucide-react";
import { type BreadcrumbItem } from "@/types";

interface Room {
    room_id: number;
    room_number: string;
    is_available: boolean;
    status: "available" | "occupied" | "maintenance" | "cleaning";
    notes?: string;
    room_property?: {
        room_properties_id: number;
        property_id: number;
        room_type: string;
        price_per_night: number;
        max_guests: number;
        room_size?: string;
        images_url?: string[];
        property?: {
            property_id: number;
            place?: {
                placeID: number;
                name: string;
            };
        };
        amenities?: Array<{
            amenity_id: number;
            amenity_name: string;
        }>;
    };
}

interface PaginatedData {
    data: Room[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    rooms: PaginatedData;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: "/hotel-owner/dashboard",
    },
    {
        title: "Rooms",
        href: "/hotel-owner/rooms",
    },
];

export default function AllRooms({ rooms }: Props) {
    const data = rooms.data || [];

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all");
    const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
    const [isLoading, setIsLoading] = useState(false);

    // Get unique room types for filter
    const roomTypes = useMemo(() => {
        const types = new Set(
            data.map((room) => room.room_property?.room_type).filter(Boolean)
        );
        return Array.from(types);
    }, [data]);

    // Filter rooms based on all criteria
    const filteredData = useMemo(() => {
        return data.filter((room) => {
            // Search filter
            const matchesSearch =
                searchQuery === "" ||
                room.room_number
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                room.room_property?.room_type
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase());

            // Status filter
            const matchesStatus =
                statusFilter === "all" || room.status === statusFilter;

            // Room type filter
            const matchesRoomType =
                roomTypeFilter === "all" ||
                room.room_property?.room_type === roomTypeFilter;

            // Availability filter
            const matchesAvailability =
                availabilityFilter === "all" ||
                (availabilityFilter === "available" && room.is_available) ||
                (availabilityFilter === "unavailable" && !room.is_available);

            return (
                matchesSearch &&
                matchesStatus &&
                matchesRoomType &&
                matchesAvailability
            );
        });
    }, [data, searchQuery, statusFilter, roomTypeFilter, availabilityFilter]);

    // Calculate totals from filtered data
    const totalRooms = rooms.total || 0;
    const availableCount = filteredData.filter(
        (room) => room.is_available
    ).length;
    const occupiedCount = filteredData.filter(
        (room) => room.status === "occupied"
    ).length;
    const maintenanceCount = filteredData.filter(
        (room) => room.status === "maintenance"
    ).length;
    const occupancyRate =
        totalRooms > 0 ? (occupiedCount / totalRooms) * 100 : 0;

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            {
                variant: "default" | "secondary" | "destructive" | "outline";
                icon: any;
            }
        > = {
            available: { variant: "default", icon: CheckCircle },
            occupied: { variant: "secondary", icon: DoorOpen },
            maintenance: { variant: "destructive", icon: AlertCircle },
            cleaning: { variant: "outline", icon: Sparkles },
        };

        const config = variants[status] || variants.available;
        const Icon = config.icon;

        return (
            <Badge
                variant={config.variant}
                className="flex items-center gap-1 w-fit"
            >
                <Icon className="h-3 w-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All Rooms - Hotel Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">All Rooms</h1>
                        <p className="text-muted-foreground">
                            View and manage all individual room units
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/hotel-owner/rooms/create">
                            <DoorOpen className="h-4 w-4 mr-2" />
                            Create New Room
                        </Link>
                    </Button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Rooms
                            </CardTitle>
                            <DoorOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalRooms}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Individual room units
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Available
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {availableCount}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Ready for booking
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Occupied
                            </CardTitle>
                            <DoorOpen className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {occupiedCount}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Currently booked
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Occupancy Rate
                            </CardTitle>
                            <Home className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {occupancyRate.toFixed(1)}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Current occupancy
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="flex flex-wrap gap-2 flex-1 w-full sm:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search room number or type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Status Filter */}
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="available">
                                    Available
                                </SelectItem>
                                <SelectItem value="occupied">
                                    Occupied
                                </SelectItem>
                                <SelectItem value="maintenance">
                                    Maintenance
                                </SelectItem>
                                <SelectItem value="cleaning">
                                    Cleaning
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Room Type Filter */}
                        <Select
                            value={roomTypeFilter}
                            onValueChange={setRoomTypeFilter}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Room Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {roomTypes.map((type) => (
                                    <SelectItem key={type} value={type!}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Availability Filter */}
                        <Select
                            value={availabilityFilter}
                            onValueChange={setAvailabilityFilter}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Availability" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="available">
                                    Available
                                </SelectItem>
                                <SelectItem value="unavailable">
                                    Not Available
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Clear Filters & Results Count */}
                    <div className="flex items-center gap-3">
                        <p className="text-sm text-muted-foreground whitespace-nowrap">
                            {filteredData.length} of {data.length} rooms
                        </p>
                        {(searchQuery ||
                            statusFilter !== "all" ||
                            roomTypeFilter !== "all" ||
                            availabilityFilter !== "all") && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery("");
                                    setStatusFilter("all");
                                    setRoomTypeFilter("all");
                                    setAvailabilityFilter("all");
                                }}
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Rooms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {isLoading
                        ? // Skeleton loading state
                          Array.from({ length: 8 }).map((_, index) => (
                              <Card key={index}>
                                  <CardHeader className="pb-3">
                                      <div className="flex items-start justify-between">
                                          <div className="space-y-2 flex-1">
                                              <Skeleton className="h-5 w-20" />
                                              <Skeleton className="h-4 w-24" />
                                          </div>
                                          <Skeleton className="h-6 w-20 rounded-full" />
                                      </div>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                      <div className="space-y-2">
                                          <Skeleton className="h-4 w-full" />
                                          <Skeleton className="h-4 w-3/4" />
                                      </div>
                                      <div className="flex gap-2">
                                          <Skeleton className="h-9 flex-1" />
                                          <Skeleton className="h-9 flex-1" />
                                      </div>
                                  </CardContent>
                              </Card>
                          ))
                        : filteredData.map((room) => {
                              const roomProperty = room.room_property;
                              const images = roomProperty?.images_url || [];

                              return (
                                  <Card
                                      key={room.room_id}
                                      className="hover:shadow-lg transition-shadow"
                                  >
                                      <CardHeader className="pb-3">
                                          <div className="flex items-start justify-between">
                                              <div className="space-y-1 flex-1">
                                                  <CardTitle className="text-xl font-bold">
                                                      {room.room_number}
                                                  </CardTitle>
                                                  <p className="text-sm text-muted-foreground">
                                                      {roomProperty?.room_type ||
                                                          "Unknown Type"}
                                                  </p>
                                              </div>
                                              {getStatusBadge(room.status)}
                                          </div>
                                      </CardHeader>

                                      <CardContent className="space-y-4">
                                          {/* Room Image */}
                                          {images.length > 0 && (
                                              <div className="relative h-32 rounded-md overflow-hidden">
                                                  <img
                                                      src={images[0]}
                                                      alt={`Room ${room.room_number}`}
                                                      className="w-full h-full object-cover"
                                                  />
                                              </div>
                                          )}

                                          {/* Room Details */}
                                          <div className="grid grid-cols-2 gap-3 text-sm">
                                              <div className="space-y-1">
                                                  <div className="flex items-center gap-1 text-muted-foreground">
                                                      <DollarSign className="h-4 w-4" />
                                                      <span>Price</span>
                                                  </div>
                                                  <p className="font-semibold">
                                                      $
                                                      {roomProperty?.price_per_night ||
                                                          0}
                                                  </p>
                                              </div>
                                              <div className="space-y-1">
                                                  <div className="flex items-center gap-1 text-muted-foreground">
                                                      <Users className="h-4 w-4" />
                                                      <span>Guests</span>
                                                  </div>
                                                  <p className="font-semibold">
                                                      {roomProperty?.max_guests ||
                                                          0}
                                                  </p>
                                              </div>
                                              {roomProperty?.room_size && (
                                                  <div className="space-y-1 col-span-2">
                                                      <div className="flex items-center gap-1 text-muted-foreground">
                                                          <Maximize className="h-4 w-4" />
                                                          <span>Size</span>
                                                      </div>
                                                      <p className="font-semibold">
                                                          {
                                                              roomProperty.room_size
                                                          }
                                                      </p>
                                                  </div>
                                              )}
                                          </div>

                                          {/* Amenities */}
                                          {roomProperty?.amenities &&
                                              roomProperty.amenities.length >
                                                  0 && (
                                                  <div className="space-y-2 pt-2 border-t">
                                                      <p className="text-sm font-medium">
                                                          Amenities
                                                      </p>
                                                      <div className="flex flex-wrap gap-1">
                                                          {roomProperty.amenities
                                                              .slice(0, 2)
                                                              .map(
                                                                  (amenity) => (
                                                                      <Badge
                                                                          key={
                                                                              amenity.amenity_id
                                                                          }
                                                                          variant="outline"
                                                                          className="text-xs"
                                                                      >
                                                                          {
                                                                              amenity.amenity_name
                                                                          }
                                                                      </Badge>
                                                                  )
                                                              )}
                                                          {roomProperty
                                                              .amenities
                                                              .length > 2 && (
                                                              <Badge
                                                                  variant="outline"
                                                                  className="text-xs"
                                                              >
                                                                  +
                                                                  {roomProperty
                                                                      .amenities
                                                                      .length -
                                                                      2}
                                                              </Badge>
                                                          )}
                                                      </div>
                                                  </div>
                                              )}

                                          {/* Notes */}
                                          {room.notes && (
                                              <div className="pt-2 border-t">
                                                  <p className="text-xs text-muted-foreground">
                                                      {room.notes}
                                                  </p>
                                              </div>
                                          )}

                                          {/* Actions */}
                                          <div className="flex gap-2 pt-2 border-t">
                                              <Button
                                                  asChild
                                                  size="sm"
                                                  variant="outline"
                                                  className="flex-1"
                                              >
                                                  <Link
                                                      href={`/hotel-owner/rooms/${room.room_id}/edit`}
                                                  >
                                                      <Edit className="h-4 w-4 mr-2" />
                                                      Edit
                                                  </Link>
                                              </Button>
                                          </div>
                                      </CardContent>
                                  </Card>
                              );
                          })}
                </div>

                {/* Empty State - No rooms at all */}
                {!isLoading && data.length === 0 && (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <DoorOpen className="size-6" />
                            </EmptyMedia>
                            <EmptyTitle>No Rooms Found</EmptyTitle>
                            <EmptyDescription>
                                You haven't created any individual rooms yet.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button asChild>
                                <Link href="/hotel-owner/properties">
                                    <Home className="h-4 w-4 mr-2" />
                                    Go to My Hotel
                                </Link>
                            </Button>
                        </EmptyContent>
                    </Empty>
                )}

                {/* Empty State - No filtered results */}
                {!isLoading && data.length > 0 && filteredData.length === 0 && (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Search className="size-6" />
                            </EmptyMedia>
                            <EmptyTitle>No Matching Rooms</EmptyTitle>
                            <EmptyDescription>
                                No rooms match your current filters. Try
                                adjusting your search criteria.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchQuery("");
                                    setStatusFilter("all");
                                    setRoomTypeFilter("all");
                                    setAvailabilityFilter("all");
                                }}
                            >
                                Clear All Filters
                            </Button>
                        </EmptyContent>
                    </Empty>
                )}

                {/* Pagination */}
                {rooms.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {rooms.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                asChild={!!link.url}
                                disabled={!link.url}
                            >
                                {link.url ? (
                                    <Link href={link.url}>
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Link>
                                ) : (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                )}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
