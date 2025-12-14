import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Edit,
    Mail,
    Phone,
    MapPin,
    Star,
    ChefHat,
    DollarSign,
    UtensilsCrossed,
} from "lucide-react";
import { type BreadcrumbItem } from "@/types";

interface Owner {
    id: number;
    name: string;
    email: string;
    phone_number?: string;
}

interface Place {
    placeID: number;
    name: string;
    description?: string;
    ratings?: number;
    reviews_count?: number;
    images_url?: string[];
    provinceCategory?: {
        province_categoryName: string;
    };
}

interface MenuCategory {
    menu_category_id: number;
    name: string;
    description?: string;
}

interface MenuItem {
    menu_item_id: number;
    name: string;
    description?: string;
    price: number;
    is_available: boolean;
    images_url?: string[];
    category: MenuCategory;
    created_at: string;
}

interface RestaurantProperty {
    restaurant_property_id: number;
    place_id: number;
    owner_user_id: number;
    place: Place;
    owner: Owner;
    menuItems: MenuItem[];
    created_at: string;
    updated_at: string;
}

interface Props {
    property: RestaurantProperty;
}

export default function RestaurantShow({ property }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Dashboard",
            href: "/dashboard",
        },
        {
            title: "Restaurants",
            href: "/restaurants",
        },
        {
            title: property.place.name,
            href: `/restaurants/${property.restaurant_property_id}`,
        },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    // Calculate statistics
    const availableItems = property.menuItems.filter(
        (item) => item.is_available
    ).length;
    const totalItems = property.menuItems.length;
    const categories = [
        ...new Set(property.menuItems.map((item) => item.category.name)),
    ];
    const prices = property.menuItems.map((item) => item.price);
    const avgPrice =
        prices.length > 0
            ? prices.reduce((a, b) => a + b, 0) / prices.length
            : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // Group menu items by category
    const menuByCategory = property.menuItems.reduce((acc, item) => {
        const categoryName = item.category.name;
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${property.place.name} - Restaurant`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {property.place.images_url &&
                        property.place.images_url.length > 0 ? (
                            <img
                                src={property.place.images_url[0]}
                                alt={property.place.name}
                                className="h-16 w-16 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                                <UtensilsCrossed className="h-8 w-8 text-primary" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold">
                                {property.place.name}
                            </h1>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                {property.place.provinceCategory && (
                                    <>
                                        <MapPin className="h-4 w-4" />
                                        <span>
                                            {
                                                property.place.provinceCategory
                                                    .province_categoryName
                                            }
                                        </span>
                                        <span>•</span>
                                    </>
                                )}
                                {property.place.ratings && (
                                    <>
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span>{property.place.ratings}</span>
                                        {property.place.reviews_count && (
                                            <span>
                                                ({property.place.reviews_count}{" "}
                                                reviews)
                                            </span>
                                        )}
                                        <span>•</span>
                                    </>
                                )}
                                <span>
                                    {totalItems}{" "}
                                    {totalItems === 1 ? "item" : "items"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/restaurants">
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Restaurants
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Restaurant Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Restaurant Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {property.place.description && (
                                    <div>
                                        <h4 className="text-xs text-muted-foreground mb-1">
                                            Description
                                        </h4>
                                        <p className="text-sm">
                                            {property.place.description}
                                        </p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-xs text-muted-foreground mb-1">
                                            Restaurant ID
                                        </h4>
                                        <p className="font-medium">
                                            #{property.restaurant_property_id}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs text-muted-foreground mb-1">
                                            Place ID
                                        </h4>
                                        <p className="font-medium">
                                            #{property.place_id}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs text-muted-foreground mb-1">
                                            Total Menu Items
                                        </h4>
                                        <p className="font-medium flex items-center gap-2">
                                            <ChefHat className="h-4 w-4" />
                                            {totalItems}{" "}
                                            {totalItems === 1
                                                ? "item"
                                                : "items"}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs text-muted-foreground mb-1">
                                            Categories
                                        </h4>
                                        <p className="font-medium">
                                            {categories.length}{" "}
                                            {categories.length === 1
                                                ? "category"
                                                : "categories"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Menu Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Menu ({totalItems}{" "}
                                    {totalItems === 1 ? "Item" : "Items"})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {totalItems === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <ChefHat className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No menu items available yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {Object.entries(menuByCategory).map(
                                            ([categoryName, items]) => (
                                                <div key={categoryName}>
                                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                                        <ChefHat className="h-5 w-5 text-primary" />
                                                        {categoryName}
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {items.map((item) => (
                                                            <div
                                                                key={
                                                                    item.menu_item_id
                                                                }
                                                                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                                            >
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <h4 className="font-semibold">
                                                                                {
                                                                                    item.name
                                                                                }
                                                                            </h4>
                                                                            {item.is_available ? (
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="text-green-600 border-green-600"
                                                                                >
                                                                                    Available
                                                                                </Badge>
                                                                            ) : (
                                                                                <Badge variant="secondary">
                                                                                    Unavailable
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        {item.description && (
                                                                            <p className="text-sm text-muted-foreground mb-2">
                                                                                {
                                                                                    item.description
                                                                                }
                                                                            </p>
                                                                        )}
                                                                        <p className="text-lg font-bold text-green-600">
                                                                            {formatPrice(
                                                                                item.price
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    {item.images_url &&
                                                                        item
                                                                            .images_url
                                                                            .length >
                                                                            0 && (
                                                                            <img
                                                                                src={
                                                                                    item
                                                                                        .images_url[0]
                                                                                }
                                                                                alt={
                                                                                    item.name
                                                                                }
                                                                                className="h-20 w-20 rounded-lg object-cover"
                                                                            />
                                                                        )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Owner Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Restaurant Owner</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="text-xs text-muted-foreground mb-1">
                                        Name
                                    </h4>
                                    <p className="font-medium">
                                        {property.owner.name}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-xs text-muted-foreground mb-1">
                                        Email
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <a
                                            href={`mailto:${property.owner.email}`}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            {property.owner.email}
                                        </a>
                                    </div>
                                </div>
                                {property.owner.phone_number && (
                                    <div>
                                        <h4 className="text-xs text-muted-foreground mb-1">
                                            Phone
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <a
                                                href={`tel:${property.owner.phone_number}`}
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                {property.owner.phone_number}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Menu Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Menu Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="text-xs text-muted-foreground mb-1">
                                        Total Items
                                    </h4>
                                    <p className="text-2xl font-bold">
                                        {totalItems}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-xs text-muted-foreground mb-1">
                                            Available
                                        </h4>
                                        <p className="text-xl font-semibold text-green-600">
                                            {availableItems}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs text-muted-foreground mb-1">
                                            Unavailable
                                        </h4>
                                        <p className="text-xl font-semibold text-gray-600">
                                            {totalItems - availableItems}
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t">
                                    <h4 className="text-xs text-muted-foreground mb-1">
                                        Categories
                                    </h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {categories.map((cat) => (
                                            <Badge
                                                key={cat}
                                                variant="secondary"
                                            >
                                                {cat}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                {prices.length > 0 && (
                                    <>
                                        <div className="pt-4 border-t">
                                            <h4 className="text-xs text-muted-foreground mb-1">
                                                Price Range
                                            </h4>
                                            <p className="text-lg font-semibold flex items-center gap-1">
                                                <DollarSign className="h-5 w-5 text-green-600" />
                                                {formatPrice(minPrice)} -{" "}
                                                {formatPrice(maxPrice)}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-xs text-muted-foreground mb-1">
                                                Average Price
                                            </h4>
                                            <p className="text-lg font-semibold text-blue-600">
                                                {formatPrice(avgPrice)}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
