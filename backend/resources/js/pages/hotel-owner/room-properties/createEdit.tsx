import React, { useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Bed, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Property {
    property_id: number;
    place?: {
        placeID: number;
        name: string;
    };
}

interface Amenity {
    amenity_id: number;
    amenity_name: string;
    image_url?: string;
}

interface RoomProperty {
    room_properties_id: number;
    room_type: string;
    room_description?: string;
    max_guests: number;
    room_size?: string;
    price_per_night: number;
    images_url?: string[];
    amenities?: Amenity[];
}

interface Props {
    property: Property;
    amenities: Amenity[];
    roomProperty?: RoomProperty;
}

export default function CreateEditRoomProperty({
    property,
    amenities,
    roomProperty,
}: Props) {
    const isEditing = !!roomProperty;

    const { data, setData, post, put, processing, errors } = useForm({
        room_type: roomProperty?.room_type || "",
        room_description: roomProperty?.room_description || "",
        max_guests: roomProperty?.max_guests || 1,
        room_size: roomProperty?.room_size || "",
        price_per_night: roomProperty?.price_per_night || 0,
        images_url: roomProperty?.images_url || [],
        amenity_ids: roomProperty?.amenities?.map((a) => a.amenity_id) || [],
        images: [] as File[],
    });

    const [imageInput, setImageInput] = useState("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            router.post(
                `/hotel-owner/properties/${property.property_id}/room-properties/${roomProperty.room_properties_id}`,
                { ...data, _method: "PUT" },
                {
                    forceFormData: true,
                    onSuccess: () => {
                        toast.success("Room type updated successfully!");
                    },
                    onError: () => {
                        toast.error("Failed to update room type.");
                    },
                }
            );
        } else {
            post(
                `/hotel-owner/properties/${property.property_id}/room-properties`,
                {
                    forceFormData: true,
                    onSuccess: () => {
                        toast.success("Room type created successfully!");
                    },
                    onError: () => {
                        toast.error("Failed to create room type.");
                    },
                }
            );
        }
    };

    const handleImageUrlChange = (value: string) => {
        setImageInput(value);

        // Auto-add image if the value looks like a complete URL
        if (
            value.trim() &&
            (value.startsWith("http://") || value.startsWith("https://"))
        ) {
            const imagePattern =
                /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;
            const isImageUrl =
                imagePattern.test(value) ||
                value.includes("image") ||
                value.includes("img");

            if (isImageUrl) {
                setData("images_url", [...data.images_url, value.trim()]);
                setImageInput("");
            }
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const newFiles = Array.from(files).filter((file) =>
            file.type.startsWith("image/")
        );

        setData("images", [...data.images, ...newFiles]);

        // Create preview URLs for display
        newFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const previewUrl = reader.result as string;
                setData("images_url", [...data.images_url, previewUrl]);
            };
            reader.readAsDataURL(file);
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const openFileBrowser = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = (index: number) => {
        const newImages = data.images_url.filter((_, i) => i !== index);
        setData("images_url", newImages);

        // If removing a preview image, also remove from files
        const existingImagesCount = roomProperty?.images_url?.length || 0;
        if (index >= existingImagesCount) {
            const fileIndex = index - existingImagesCount;
            const newFiles = data.images.filter((_, i) => i !== fileIndex);
            setData("images", newFiles);
        }
    };

    const handleAmenityToggle = (amenityId: number) => {
        const currentIds = data.amenity_ids;
        if (currentIds.includes(amenityId)) {
            setData(
                "amenity_ids",
                currentIds.filter((id) => id !== amenityId)
            );
        } else {
            setData("amenity_ids", [...currentIds, amenityId]);
        }
    };

    return (
        <AppLayout>
            <Head
                title={`${isEditing ? "Edit" : "Create"} Room Type - ${
                    property.place?.name || "Property"
                }`}
            />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {isEditing
                                ? "Edit Room Type"
                                : "Create New Room Type"}
                        </h1>
                        <p className="text-muted-foreground">
                            {property.place?.name || "Unknown Property"}
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/hotel-owner/properties">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Property
                        </Link>
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Room Type Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Room Type Name */}
                            <div className="space-y-2">
                                <Label htmlFor="room_type">
                                    Room Type Name{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="room_type"
                                    value={data.room_type}
                                    onChange={(e) =>
                                        setData("room_type", e.target.value)
                                    }
                                    placeholder="e.g., Deluxe Suite, Standard Room"
                                    required
                                />
                                {errors.room_type && (
                                    <p className="text-sm text-red-500">
                                        {errors.room_type}
                                    </p>
                                )}
                            </div>

                            {/* Room Description */}
                            <div className="space-y-2">
                                <Label htmlFor="room_description">
                                    Description
                                </Label>
                                <Textarea
                                    id="room_description"
                                    value={data.room_description}
                                    onChange={(e) =>
                                        setData(
                                            "room_description",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Describe this room type..."
                                    rows={4}
                                />
                                {errors.room_description && (
                                    <p className="text-sm text-red-500">
                                        {errors.room_description}
                                    </p>
                                )}
                            </div>

                            {/* Max Guests and Room Size */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="max_guests">
                                        Maximum Guests{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="max_guests"
                                        type="number"
                                        min="1"
                                        value={data.max_guests}
                                        onChange={(e) =>
                                            setData(
                                                "max_guests",
                                                parseInt(e.target.value)
                                            )
                                        }
                                        required
                                    />
                                    {errors.max_guests && (
                                        <p className="text-sm text-red-500">
                                            {errors.max_guests}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="room_size">Room Size</Label>
                                    <Input
                                        id="room_size"
                                        value={data.room_size}
                                        onChange={(e) =>
                                            setData("room_size", e.target.value)
                                        }
                                        placeholder="e.g., 35 sqm, 400 sq ft"
                                    />
                                    {errors.room_size && (
                                        <p className="text-sm text-red-500">
                                            {errors.room_size}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                <Label htmlFor="price_per_night">
                                    Price per Night ($){" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="price_per_night"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.price_per_night}
                                    onChange={(e) =>
                                        setData(
                                            "price_per_night",
                                            parseFloat(e.target.value)
                                        )
                                    }
                                    required
                                />
                                {errors.price_per_night && (
                                    <p className="text-sm text-red-500">
                                        {errors.price_per_night}
                                    </p>
                                )}
                            </div>

                            {/* Images */}
                            <div className="space-y-2">
                                <Label>Room Images</Label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                <div className="flex gap-2">
                                    <Input
                                        value={imageInput}
                                        onChange={(e) =>
                                            handleImageUrlChange(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                            }
                                        }}
                                        onPaste={(e) => {
                                            const pastedText =
                                                e.clipboardData.getData("text");
                                            if (pastedText.startsWith("http")) {
                                                handleImageUrlChange(
                                                    pastedText
                                                );
                                            }
                                        }}
                                        placeholder="Paste image URL here (auto-adds)"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={openFileBrowser}
                                    >
                                        Upload Files
                                    </Button>
                                </div>
                                {data.images_url.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                        {data.images_url.map((url, index) => (
                                            <div
                                                key={index}
                                                className="relative group"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Room ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded border"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() =>
                                                        handleRemoveImage(index)
                                                    }
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {errors.images_url && (
                                    <p className="text-sm text-red-500">
                                        {errors.images_url}
                                    </p>
                                )}
                            </div>

                            {/* Amenities */}
                            <div className="space-y-2">
                                <Label>Amenities</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {amenities.map((amenity) => (
                                        <div
                                            key={amenity.amenity_id}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={`amenity-${amenity.amenity_id}`}
                                                checked={data.amenity_ids.includes(
                                                    amenity.amenity_id
                                                )}
                                                onCheckedChange={() =>
                                                    handleAmenityToggle(
                                                        amenity.amenity_id
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor={`amenity-${amenity.amenity_id}`}
                                                className="font-normal cursor-pointer"
                                            >
                                                {amenity.amenity_name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {errors.amenity_ids && (
                                    <p className="text-sm text-red-500">
                                        {errors.amenity_ids}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-2 pt-4 justify-end">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/hotel-owner/properties">
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing
                                        ? "Saving..."
                                        : isEditing
                                        ? "Update Room Type"
                                        : "Create Room Type"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
