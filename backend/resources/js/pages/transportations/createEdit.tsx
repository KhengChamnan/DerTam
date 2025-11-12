import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Bus } from "lucide-react";

interface Place {
    id: number;
    placeID: number;
    name: string;
    category?: {
        placeCategoryName: string;
    };
}

interface Owner {
    id: number;
    name: string;
    email: string;
}

interface Transportation {
    id: number;
    owner_user_id: number;
    placeID: number;
    place?: Place;
    owner?: Owner;
}

interface Props {
    transportation?: Transportation;
    availablePlaces?: Place[];
    owners: Owner[];
}

export default function TransportationCreateEdit({
    transportation,
    availablePlaces,
    owners,
}: Props) {
    const isEditing = !!transportation;

    const { data, setData, post, put, errors, processing } = useForm({
        owner_user_id: transportation?.owner_user_id || 0,
        placeID: transportation?.placeID || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/transportations/${transportation.id}`);
        } else {
            post("/transportations");
        }
    };

    return (
        <AppLayout>
            <Head
                title={
                    isEditing ? "Edit Transportation" : "Create Transportation"
                }
            />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {isEditing
                                ? "Edit Transportation Company"
                                : "Add New Transportation Company"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing
                                ? `Update transportation company information`
                                : "Register a new transportation company to the system"}
                        </p>
                    </div>
                    <Link href="/transportations">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Transportation
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bus className="h-5 w-5" />
                                Information
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Assign a transportation company to a place and
                                owner
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Place Selection (only for create) */}
                            {!isEditing && (
                                <div>
                                    <Label htmlFor="place_id">
                                        Place{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={
                                            data.placeID > 0
                                                ? data.placeID.toString()
                                                : ""
                                        }
                                        onValueChange={(value) =>
                                            setData(
                                                "placeID",
                                                parseInt(value) || 0
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a place" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {!availablePlaces ||
                                            availablePlaces.length === 0 ? (
                                                <div className="p-2 text-sm text-muted-foreground text-center">
                                                    No places available
                                                </div>
                                            ) : (
                                                availablePlaces.map((place) => (
                                                    <SelectItem
                                                        key={place.placeID}
                                                        value={place.placeID.toString()}
                                                    >
                                                        {place.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.placeID && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.placeID}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Display associated place for edit */}
                            {isEditing && transportation?.place && (
                                <div>
                                    <Label>Associated Place</Label>
                                    <div className="rounded-md border bg-muted p-3 mt-1">
                                        <p className="font-medium">
                                            {transportation.place.name}
                                        </p>
                                        {transportation.place.category && (
                                            <p className="text-sm text-muted-foreground">
                                                {
                                                    transportation.place
                                                        .category
                                                        .placeCategoryName
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Owner Selection */}
                            <div>
                                <Label htmlFor="owner_user_id">
                                    Transportation Owner{" "}
                                    <span className="text-red-500">*</span>
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
                                        <SelectValue placeholder="Select transportation owner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {owners.length === 0 ? (
                                            <div className="p-2 text-sm text-muted-foreground text-center">
                                                No transportation owners
                                                available
                                            </div>
                                        ) : (
                                            owners.map((owner) => (
                                                <SelectItem
                                                    key={owner.id}
                                                    value={owner.id.toString()}
                                                >
                                                    {owner.name} ({owner.email})
                                                </SelectItem>
                                            ))
                                        )}
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

                    {/* Additional Information Card (for editing) */}
                    {isEditing && transportation && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground">
                                            Transportation ID
                                        </Label>
                                        <Input
                                            value={`#${transportation.id}`}
                                            disabled
                                            className="bg-muted"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">
                                            Current Owner
                                        </Label>
                                        <Input
                                            value={
                                                transportation.owner?.name ||
                                                "N/A"
                                            }
                                            disabled
                                            className="bg-muted"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4">
                        <Link href="/transportations">
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
                                ? "Update Company"
                                : "Add Transportation"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
