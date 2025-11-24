import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";

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

interface Facility {
    facility_id: number;
    facility_name: string;
}

interface Amenity {
    amenity_id: number;
    amenity_name: string;
}

interface Room {
    room_properties_id?: number;
    room_type: string;
    room_description: string;
    max_guests: number;
    room_size: number | null;
    price_per_night: number;
    is_available: boolean;
    amenities: number[];
}

interface Property {
    property_id: number;
    owner_user_id: number;
    place_id: number;
    place: Place;
    owner: Owner;
    facilities: number[];
    rooms: Room[];
}

interface Props {
    property?: Property;
    availablePlaces?: Place[];
    owners: Owner[];
    facilities: Facility[];
    amenities: Amenity[];
}

export default function HotelCreateEdit({
    property,
    availablePlaces,
    owners,
    facilities,
    amenities,
}: Props) {
    const isEditing = !!property;

    const { data, setData, post, put, errors, processing } = useForm({
        owner_user_id: property?.owner_user_id || 0,
        place_id: property?.place_id || 0,
        facilities: property?.facilities || [],
        rooms: property?.rooms || [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/hotels/${property.property_id}`);
        } else {
            post("/hotels");
        }
    };

    const addRoom = () => {
        setData("rooms", [
            ...data.rooms,
            {
                room_type: "",
                room_description: "",
                max_guests: 1,
                room_size: null,
                price_per_night: 0,
                is_available: true,
                amenities: [],
            },
        ]);
    };

    const removeRoom = (index: number) => {
        const updatedRooms = data.rooms.filter((_, i) => i !== index);
        setData("rooms", updatedRooms);
    };

    const updateRoom = (index: number, field: string, value: any) => {
        const updatedRooms = [...data.rooms];
        updatedRooms[index] = { ...updatedRooms[index], [field]: value };
        setData("rooms", updatedRooms);
    };

    const toggleFacility = (facilityId: number) => {
        const updatedFacilities = data.facilities.includes(facilityId)
            ? data.facilities.filter((id) => id !== facilityId)
            : [...data.facilities, facilityId];
        setData("facilities", updatedFacilities);
    };

    const toggleRoomAmenity = (roomIndex: number, amenityId: number) => {
        const updatedRooms = [...data.rooms];
        const room = updatedRooms[roomIndex];
        room.amenities = room.amenities.includes(amenityId)
            ? room.amenities.filter((id) => id !== amenityId)
            : [...room.amenities, amenityId];
        setData("rooms", updatedRooms);
    };

    return (
        <AppLayout>
            <Head title={isEditing ? "Edit Hotel" : "Create Hotel"} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {isEditing ? "Edit Hotel" : "Create New Hotel"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing
                                ? `Update details for ${property?.place?.name}`
                                : "Add a new hotel property to the system"}
                        </p>
                    </div>
                    <Link href="/hotels">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Hotels
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
                                    Select the place and owner for this hotel
                                    property. The hotel owner will be
                                    responsible for adding facilities and rooms.
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
                                            <SelectValue placeholder="Select a place for this hotel" />
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
                                    Property Owner
                                </Label>
                                <Select
                                    value={
                                        data.owner_user_id > 0
                                            ? data.owner_user_id.toString()
                                            : ""
                                    }
                                    onValueChange={(value) =>
                                        setData(
                                            "owner_user_id",
                                            parseInt(value) || 0
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select property owner" />
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

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-4">
                        <Link href="/hotels">
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
                                ? "Update Hotel"
                                : "Create Hotel"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
