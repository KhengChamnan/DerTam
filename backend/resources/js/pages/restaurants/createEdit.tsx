import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Image as ImageIcon,
    X,
} from "lucide-react";
import { type BreadcrumbItem } from "@/types";

interface Place {
    placeID: number;
    name: string;
    province_id: number;
}

interface Owner {
    id: number;
    name: string;
    email: string;
}

interface MenuCategory {
    menu_category_id: number;
    name: string;
    description?: string;
}

interface MenuItem {
    menu_item_id?: number;
    name: string;
    description?: string;
    price: number;
    menu_category_id: number;
    is_available: boolean;
    image?: string;
    image_file?: File | null;
    image_preview?: string;
    image_url_input?: string;
}

interface Property {
    restaurant_property_id: number;
    owner_user_id: number;
    place_id: number;
    place: Place;
    owner: Owner;
    menuItems?: MenuItem[];
}

interface Props {
    property?: Property;
    availablePlaces?: Place[];
    owners: Owner[];
    menuCategories: MenuCategory[];
}

export default function RestaurantCreateEdit({
    property,
    availablePlaces,
    owners,
    menuCategories,
}: Props) {
    const isEditing = !!property;

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
            title: isEditing ? "Edit Restaurant" : "Create Restaurant",
            href: isEditing
                ? `/restaurants/${property?.restaurant_property_id}/edit`
                : "/restaurants/create",
        },
    ];

    const { data, setData, post, put, errors, processing } = useForm<{
        owner_user_id: number;
        place_id: number;
        menuItems: MenuItem[];
    }>({
        owner_user_id: property?.owner_user_id || 0,
        place_id: property?.place_id || 0,
        menuItems: property?.menuItems || [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate owner is selected
        if (!data.owner_user_id || data.owner_user_id === 0) {
            alert("Please select a restaurant owner");
            return;
        }
        if (isEditing) {
            // Use POST with _method spoofing for file uploads
            post(
                `/restaurants/${property.restaurant_property_id}?_method=PUT`,
                {
                    preserveScroll: true,
                    forceFormData: true,
                }
            );
        } else {
            post("/restaurants");
        }
    };

    const addMenuItem = () => {
        setData("menuItems", [
            ...data.menuItems,
            {
                name: "",
                description: "",
                price: 0,
                menu_category_id: 0,
                is_available: true,
                image: "",
                image_file: null,
                image_preview: "",
                image_url_input: "",
            } as MenuItem,
        ]);
    };

    const removeMenuItem = (index: number) => {
        const updatedMenuItems = data.menuItems.filter((_, i) => i !== index);
        setData("menuItems", updatedMenuItems);
    };

    const updateMenuItem = (index: number, field: string, value: any) => {
        const updatedMenuItems = [...data.menuItems];
        updatedMenuItems[index] = {
            ...updatedMenuItems[index],
            [field]: value,
        };
        setData("menuItems", updatedMenuItems);
    };

    const handleImageUpload = (index: number, file: File | null) => {
        if (!file) return;

        const updatedMenuItems = [...data.menuItems];
        updatedMenuItems[index] = {
            ...updatedMenuItems[index],
            image_file: file,
            image_preview: URL.createObjectURL(file),
        };
        setData("menuItems", updatedMenuItems);
    };

    const removeImage = (index: number) => {
        const updatedMenuItems = [...data.menuItems];
        if (updatedMenuItems[index].image_preview) {
            URL.revokeObjectURL(updatedMenuItems[index].image_preview!);
        }
        updatedMenuItems[index] = {
            ...updatedMenuItems[index],
            image_file: null,
            image_preview: "",
            image: "",
        };
        setData("menuItems", updatedMenuItems);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? "Edit Restaurant" : "Create Restaurant"} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {isEditing
                                ? "Edit Restaurant"
                                : "Create New Restaurant"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing
                                ? `Update details for ${property?.place?.name}`
                                : "Add a new restaurant property to the system"}
                        </p>
                    </div>
                    <Link href="/restaurants">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Restaurants
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            {!isEditing && (
                                <p className="text-sm text-muted-foreground">
                                    Select the place and owner for this
                                    restaurant property. The restaurant owner
                                    will be responsible for managing menus and
                                    menu items.
                                </p>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!isEditing && (
                                <div>
                                    <Label htmlFor="place_id">
                                        Select Place
                                    </Label>
                                    <Select
                                        value={
                                            data.place_id > 0
                                                ? data.place_id.toString()
                                                : ""
                                        }
                                        onValueChange={(value) =>
                                            setData(
                                                "place_id",
                                                parseInt(value) || 0
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a place for this restaurant" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availablePlaces?.map((place) => (
                                                <SelectItem
                                                    key={place.placeID}
                                                    value={place.placeID.toString()}
                                                >
                                                    {place.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.place_id && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.place_id}
                                        </p>
                                    )}
                                </div>
                            )}

                            {isEditing && (
                                <div>
                                    <Label>Associated Place</Label>
                                    <Input
                                        defaultValue={
                                            property?.place?.name || ""
                                        }
                                        disabled
                                        className="bg-gray-50"
                                    />
                                </div>
                            )}

                            <div>
                                <Label htmlFor="owner_user_id">
                                    Restaurant Owner *
                                </Label>
                                <Select
                                    value={
                                        data.owner_user_id
                                            ? data.owner_user_id.toString()
                                            : ""
                                    }
                                    onValueChange={(value) => {
                                        const parsedValue = parseInt(value, 10);
                                        if (!isNaN(parsedValue)) {
                                            setData(
                                                "owner_user_id",
                                                parsedValue
                                            );
                                        }
                                    }}
                                    required
                                >
                                    <SelectTrigger
                                        className={
                                            errors.owner_user_id
                                                ? "border-red-500"
                                                : ""
                                        }
                                    >
                                        <SelectValue placeholder="Select restaurant owner *" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {owners.map((owner) => (
                                            <SelectItem
                                                key={owner.id}
                                                value={owner.id.toString()}
                                            >
                                                {owner.name} ({owner.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.owner_user_id && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.owner_user_id}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Menu Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Menu Items</CardTitle>
                            <CardDescription>
                                Add menu items for this restaurant. You can add
                                multiple items with different categories.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.menuItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-4 border rounded-lg space-y-4 relative"
                                >
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium">
                                            Menu Item {index + 1}
                                        </h4>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                removeMenuItem(index)
                                            }
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label
                                                htmlFor={`item-name-${index}`}
                                            >
                                                Item Name *
                                            </Label>
                                            <Input
                                                id={`item-name-${index}`}
                                                value={item.name}
                                                onChange={(e) =>
                                                    updateMenuItem(
                                                        index,
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g., Pad Thai"
                                            />
                                            {errors[
                                                `menuItems.${index}.name`
                                            ] && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    {
                                                        errors[
                                                            `menuItems.${index}.name`
                                                        ]
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor={`item-category-${index}`}
                                            >
                                                Category *
                                            </Label>
                                            <Select
                                                value={
                                                    item.menu_category_id > 0
                                                        ? item.menu_category_id.toString()
                                                        : ""
                                                }
                                                onValueChange={(value) =>
                                                    updateMenuItem(
                                                        index,
                                                        "menu_category_id",
                                                        parseInt(value) || 0
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {menuCategories.map(
                                                        (category) => (
                                                            <SelectItem
                                                                key={
                                                                    category.menu_category_id
                                                                }
                                                                value={category.menu_category_id.toString()}
                                                            >
                                                                {category.name}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {errors[
                                                `menuItems.${index}.menu_category_id`
                                            ] && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    {
                                                        errors[
                                                            `menuItems.${index}.menu_category_id`
                                                        ]
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor={`item-price-${index}`}
                                            >
                                                Price *
                                            </Label>
                                            <Input
                                                id={`item-price-${index}`}
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={item.price}
                                                onChange={(e) =>
                                                    updateMenuItem(
                                                        index,
                                                        "price",
                                                        parseFloat(
                                                            e.target.value
                                                        ) || 0
                                                    )
                                                }
                                                placeholder="0.00"
                                            />
                                            {errors[
                                                `menuItems.${index}.price`
                                            ] && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    {
                                                        errors[
                                                            `menuItems.${index}.price`
                                                        ]
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-2 pt-6">
                                            <Switch
                                                id={`item-available-${index}`}
                                                checked={item.is_available}
                                                onCheckedChange={(checked) =>
                                                    updateMenuItem(
                                                        index,
                                                        "is_available",
                                                        checked
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor={`item-available-${index}`}
                                            >
                                                Available
                                            </Label>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor={`item-image-${index}`}>
                                            Item Image
                                        </Label>

                                        {/* Image input: URL or file upload */}
                                        <div className="flex gap-2 mt-2">
                                            <Input
                                                placeholder="Paste image URL or click to upload"
                                                value={
                                                    item.image_url_input || ""
                                                }
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value;
                                                    updateMenuItem(
                                                        index,
                                                        "image_url_input",
                                                        value
                                                    );
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        const url =
                                                            item.image_url_input?.trim();
                                                        if (url) {
                                                            updateMenuItem(
                                                                index,
                                                                "image",
                                                                url
                                                            );
                                                            updateMenuItem(
                                                                index,
                                                                "image_preview",
                                                                url
                                                            );
                                                            updateMenuItem(
                                                                index,
                                                                "image_url_input",
                                                                ""
                                                            );
                                                            updateMenuItem(
                                                                index,
                                                                "image_file",
                                                                null
                                                            );
                                                        }
                                                    }
                                                }}
                                                onBlur={() => {
                                                    const url =
                                                        item.image_url_input?.trim();
                                                    if (
                                                        url &&
                                                        (url.startsWith(
                                                            "http://"
                                                        ) ||
                                                            url.startsWith(
                                                                "https://"
                                                            ))
                                                    ) {
                                                        updateMenuItem(
                                                            index,
                                                            "image",
                                                            url
                                                        );
                                                        updateMenuItem(
                                                            index,
                                                            "image_preview",
                                                            url
                                                        );
                                                        updateMenuItem(
                                                            index,
                                                            "image_url_input",
                                                            ""
                                                        );
                                                        updateMenuItem(
                                                            index,
                                                            "image_file",
                                                            null
                                                        );
                                                    }
                                                }}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const input =
                                                        document.getElementById(
                                                            `item-image-file-${index}`
                                                        ) as HTMLInputElement;
                                                    input?.click();
                                                }}
                                                title="Upload image from computer"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                            <input
                                                id={`item-image-file-${index}`}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) =>
                                                    handleImageUpload(
                                                        index,
                                                        e.target.files?.[0] ||
                                                            null
                                                    )
                                                }
                                            />
                                        </div>

                                        {/* Image preview */}
                                        {(item.image_preview || item.image) && (
                                            <div className="mt-2 relative inline-block">
                                                <img
                                                    src={
                                                        item.image_preview ||
                                                        item.image
                                                    }
                                                    alt={
                                                        item.name || "Menu item"
                                                    }
                                                    className="w-32 h-32 object-cover rounded-lg border"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="12">Invalid Image</text></svg>';
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                                                    onClick={() =>
                                                        removeImage(index)
                                                    }
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                        {errors[`menuItems.${index}.image`] && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {
                                                    errors[
                                                        `menuItems.${index}.image`
                                                    ]
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor={`item-description-${index}`}
                                        >
                                            Description
                                        </Label>
                                        <Textarea
                                            id={`item-description-${index}`}
                                            value={item.description || ""}
                                            onChange={(e) =>
                                                updateMenuItem(
                                                    index,
                                                    "description",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter item description"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={addMenuItem}
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Menu Item
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-4">
                        <Link href="/restaurants">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing
                                ? isEditing
                                    ? "Updating..."
                                    : "Creating..."
                                : isEditing
                                ? "Update Restaurant"
                                : "Create Restaurant"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
