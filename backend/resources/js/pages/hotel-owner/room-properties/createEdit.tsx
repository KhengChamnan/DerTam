import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Bed, Save } from "lucide-react";

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
    });

    const [imageInput, setImageInput] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(
                `/hotel-owner/properties/${property.property_id}/room-properties/${roomProperty.room_properties_id}`
            );
        } else {
            post(
                `/hotel-owner/properties/${property.property_id}/room-properties`
            );
        }
    };

    const handleAddImage = () => {
        if (imageInput.trim()) {
            setData("images_url", [...data.images_url, imageInput.trim()]);
            setImageInput("");
        }
    };

    const handleRemoveImage = (index: number) => {
        setData(
            "images_url",
            data.images_url.filter((_, i) => i !== index)
        );
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
                                <Label>Room Images (URLs)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={imageInput}
                                        onChange={(e) =>
                                            setImageInput(e.target.value)
                                        }
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddImage}
                                    >
                                        Add
                                    </Button>
                                </div>
                                {data.images_url.length > 0 && (
                                    <div className="space-y-2 mt-2">
                                        {data.images_url.map((url, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Room ${index + 1}`}
                                                    className="h-12 w-12 object-cover rounded"
                                                />
                                                <span className="flex-1 text-sm truncate">
                                                    {url}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleRemoveImage(index)
                                                    }
                                                >
                                                    Remove
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
                            <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing
                                        ? "Saving..."
                                        : isEditing
                                        ? "Update Room Type"
                                        : "Create Room Type"}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/hotel-owner/properties">
                                        Cancel
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
