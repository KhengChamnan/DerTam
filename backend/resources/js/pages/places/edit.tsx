import React, { useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { type BreadcrumbItem } from "@/types";

interface Place {
    placeID?: number;
    name: string;
    description: string;
    category_id: number;
    province_id: number;
    google_maps_link?: string;
    ratings?: number;
    reviews_count?: number;
    images_url: string[];
    image_public_ids?: string[];
    entry_free: boolean;
    operating_hours: { [key: string]: string };
    best_season_to_visit?: string;
    latitude: number;
    longitude: number;
}

interface Category {
    placeCategoryID: number;
    name: string;
}

interface Province {
    province_categoryID: number;
    name: string;
}

interface Props {
    place?: Place;
    categories: Category[];
    provinces: Province[];
}

export default function PlaceForm({ place, categories, provinces }: Props) {
    const isEditing = !!place;
    const [imageUrl, setImageUrl] = useState("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Places",
            href: "/places",
        },
        {
            title: isEditing ? `Edit ${place.name}` : "Create New Place",
            href: "#",
        },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        name: place?.name || "",
        description: place?.description || "",
        category_id: place?.category_id || "",
        province_id: place?.province_id || "",
        google_maps_link: place?.google_maps_link || "",
        ratings: place?.ratings ?? "",
        reviews_count: place?.reviews_count ?? "",
        images_url: place?.images_url || [],
        image_public_ids: place?.image_public_ids || [],
        entry_free: place?.entry_free || false,
        operating_hours: place?.operating_hours || {
            monday: "",
            tuesday: "",
            wednesday: "",
            thursday: "",
            friday: "",
            saturday: "",
            sunday: "",
        },
        best_season_to_visit: place?.best_season_to_visit || "",
        latitude: place?.latitude ?? "",
        longitude: place?.longitude ?? "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare data for submission
        const submitData: any = {
            ...data,
            existing_images: Array.isArray(data.images_url)
                ? data.images_url.filter((url) => url.startsWith("http"))
                : [],
            existing_public_ids: Array.isArray(data.image_public_ids)
                ? data.image_public_ids
                : [],
            images: selectedFiles,
        };

        // Remove images_url and image_public_ids from submit data as we're sending them separately
        delete submitData.images_url;
        delete submitData.image_public_ids;

        if (isEditing) {
            // Use POST with _method spoofing for file uploads
            router.post(
                `/places/${place.placeID}`,
                {
                    ...submitData,
                    _method: "PUT",
                },
                {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success("Place updated successfully");
                        setSelectedFiles([]);
                    },
                    onError: (errors) => {
                        console.error("Update errors:", errors);
                        toast.error("Failed to update place");
                    },
                }
            );
        } else {
            router.post("/places", submitData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Place created successfully");
                    setSelectedFiles([]);
                },
                onError: (errors) => {
                    console.error("Create errors:", errors);
                    toast.error("Failed to create place");
                },
            });
        }
    };

    const addImageUrl = () => {
        console.log("addImageUrl function called!");
        console.log("imageUrl value:", imageUrl);

        if (imageUrl.trim()) {
            const currentImages = Array.isArray(data.images_url)
                ? data.images_url
                : [];
            console.log("Before adding - current images:", currentImages);
            setData("images_url", [...currentImages, imageUrl.trim()]);
            setImageUrl("");
            console.log("Image added:", imageUrl.trim());
            console.log("After adding - images:", [
                ...currentImages,
                imageUrl.trim(),
            ]);
        } else {
            console.log("Image URL is empty or whitespace only");
        }
    };

    const handleImageUrlChange = (value: string) => {
        setImageUrl(value);

        // Auto-add image if the value looks like a complete URL
        if (
            value.trim() &&
            (value.startsWith("http://") || value.startsWith("https://"))
        ) {
            // Check if URL ends with common image extensions or contains image patterns
            const imagePattern =
                /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;
            const isImageUrl =
                imagePattern.test(value) ||
                value.includes("image") ||
                value.includes("img");

            if (isImageUrl) {
                const currentImages = Array.isArray(data.images_url)
                    ? data.images_url
                    : [];
                setData("images_url", [...currentImages, value.trim()]);
                setImageUrl("");
            }
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        // Add selected files to state for upload
        const newFiles = Array.from(files).filter((file) =>
            file.type.startsWith("image/")
        );
        setSelectedFiles((prev) => [...prev, ...newFiles]);

        // Create preview URLs for display
        newFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const previewUrl = reader.result as string;
                const currentImages = Array.isArray(data.images_url)
                    ? data.images_url
                    : [];
                setData("images_url", [...currentImages, previewUrl]);
            };
            reader.readAsDataURL(file);
        });

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const openFileBrowser = () => {
        fileInputRef.current?.click();
    };

    const removeImageUrl = (index: number) => {
        const newImages = data.images_url.filter((_, i) => i !== index);
        const newPublicIds = Array.isArray(data.image_public_ids)
            ? data.image_public_ids.filter((_, i) => i !== index)
            : [];

        setData((prev) => ({
            ...prev,
            images_url: newImages,
            image_public_ids: newPublicIds,
        }));

        // If removing a preview image, also remove from selectedFiles
        // Calculate how many are existing vs new files
        const existingImagesCount = place?.images_url?.length || 0;
        if (index >= existingImagesCount) {
            const fileIndex = index - existingImagesCount;
            setSelectedFiles((prev) => prev.filter((_, i) => i !== fileIndex));
        }
    };

    const updateOperatingHours = (day: string, time: string) => {
        setData("operating_hours", {
            ...data.operating_hours,
            [day]: time,
        });
    };

    const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? `Edit ${place.name}` : "Create Place"} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {isEditing
                                ? `Edit ${place.name}`
                                : "Create New Place"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing
                                ? "Update place information"
                                : "Enter the details for the new place"}
                        </p>
                    </div>
                    <Link href="/places">
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Places
                        </Button>
                    </Link>
                </div>

                <div className="max-w-4xl mx-auto w-full">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>
                                    Enter the basic details of the place
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData("name", e.target.value)
                                            }
                                            placeholder="Enter place name"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="category_id">
                                            Category *
                                        </Label>
                                        <Select
                                            value={data.category_id.toString()}
                                            onValueChange={(value) =>
                                                setData(
                                                    "category_id",
                                                    parseInt(value)
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem
                                                        key={
                                                            category.placeCategoryID
                                                        }
                                                        value={category.placeCategoryID.toString()}
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category_id && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.category_id}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="province_id">
                                            Province *
                                        </Label>
                                        <Select
                                            value={data.province_id.toString()}
                                            onValueChange={(value) =>
                                                setData(
                                                    "province_id",
                                                    parseInt(value)
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select province" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {provinces.map((province) => (
                                                    <SelectItem
                                                        key={
                                                            province.province_categoryID
                                                        }
                                                        value={province.province_categoryID.toString()}
                                                    >
                                                        {province.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.province_id && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.province_id}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="entry_free"
                                            checked={data.entry_free}
                                            onCheckedChange={(checked) =>
                                                setData("entry_free", checked)
                                            }
                                        />
                                        <Label htmlFor="entry_free">
                                            Free Entry
                                        </Label>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">
                                        Description *
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter place description"
                                        rows={4}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Location Information</CardTitle>
                                <CardDescription>
                                    Specify the location details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="latitude">
                                            Latitude *
                                        </Label>
                                        <Input
                                            id="latitude"
                                            type="number"
                                            step="any"
                                            value={data.latitude}
                                            onChange={(e) =>
                                                setData(
                                                    "latitude",
                                                    e.target.value
                                                        ? parseFloat(
                                                              e.target.value
                                                          )
                                                        : ""
                                                )
                                            }
                                            placeholder="e.g., 13.7563"
                                        />
                                        {errors.latitude && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.latitude}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="longitude">
                                            Longitude *
                                        </Label>
                                        <Input
                                            id="longitude"
                                            type="number"
                                            step="any"
                                            value={data.longitude}
                                            onChange={(e) =>
                                                setData(
                                                    "longitude",
                                                    e.target.value
                                                        ? parseFloat(
                                                              e.target.value
                                                          )
                                                        : ""
                                                )
                                            }
                                            placeholder="e.g., 100.5018"
                                        />
                                        {errors.longitude && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.longitude}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="google_maps_link">
                                            Google Maps Link
                                        </Label>
                                        <Input
                                            id="google_maps_link"
                                            value={data.google_maps_link}
                                            onChange={(e) =>
                                                setData(
                                                    "google_maps_link",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="https://maps.google.com/..."
                                        />
                                        {errors.google_maps_link && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.google_maps_link}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Information</CardTitle>
                                <CardDescription>
                                    Optional details about the place
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="ratings">Ratings</Label>
                                        <Input
                                            id="ratings"
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="5"
                                            value={data.ratings}
                                            onChange={(e) =>
                                                setData(
                                                    "ratings",
                                                    e.target.value
                                                        ? parseFloat(
                                                              e.target.value
                                                          )
                                                        : ""
                                                )
                                            }
                                            placeholder="e.g., 4.5"
                                        />
                                        {errors.ratings && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.ratings}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="reviews_count">
                                            Reviews Count
                                        </Label>
                                        <Input
                                            id="reviews_count"
                                            type="number"
                                            min="0"
                                            value={data.reviews_count}
                                            onChange={(e) =>
                                                setData(
                                                    "reviews_count",
                                                    e.target.value
                                                        ? parseInt(
                                                              e.target.value
                                                          )
                                                        : ""
                                                )
                                            }
                                            placeholder="e.g., 100"
                                        />
                                        {errors.reviews_count && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.reviews_count}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="best_season_to_visit">
                                            Best Season to Visit
                                        </Label>
                                        <Input
                                            id="best_season_to_visit"
                                            value={data.best_season_to_visit}
                                            onChange={(e) =>
                                                setData(
                                                    "best_season_to_visit",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="e.g., Summer, Winter"
                                        />
                                        {errors.best_season_to_visit && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.best_season_to_visit}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Images */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Images</CardTitle>
                                <CardDescription>
                                    Add image URLs for the place
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Hidden file input */}
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
                                        value={imageUrl}
                                        onChange={(e) => {
                                            handleImageUrlChange(
                                                e.target.value
                                            );
                                        }}
                                        onKeyDown={(e) => {
                                            console.log("Key pressed:", e.key);
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                console.log(
                                                    "Enter key detected, calling addImageUrl"
                                                );
                                                addImageUrl();
                                            }
                                        }}
                                        onPaste={(e) => {
                                            // Auto-add on paste
                                            const target = e.currentTarget;
                                            setTimeout(() => {
                                                if (target && target.value) {
                                                    handleImageUrlChange(
                                                        target.value
                                                    );
                                                }
                                            }, 10);
                                        }}
                                        placeholder="Paste image URL "
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            openFileBrowser();
                                        }}
                                        variant="outline"
                                        title="Browse for images from your computer"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Display added images */}
                                {Array.isArray(data.images_url) &&
                                    data.images_url.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">
                                                {data.images_url.length}{" "}
                                                image(s) added
                                            </p>
                                            {data.images_url.map(
                                                (url, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2 p-2 border rounded"
                                                    >
                                                        <img
                                                            src={url}
                                                            alt={`Preview ${
                                                                index + 1
                                                            }`}
                                                            className="w-16 h-16 object-cover rounded"
                                                            onError={(e) => {
                                                                e.currentTarget.src =
                                                                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">No Image</text></svg>';
                                                            }}
                                                        />
                                                        <span className="flex-1 text-sm truncate">
                                                            {url}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            onClick={() =>
                                                                removeImageUrl(
                                                                    index
                                                                )
                                                            }
                                                            variant="destructive"
                                                            size="sm"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                            </CardContent>
                        </Card>

                        {/* Operating Hours */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Operating Hours</CardTitle>
                                <CardDescription>
                                    Specify opening hours for each day
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {days.map((day) => (
                                        <div key={day}>
                                            <Label
                                                htmlFor={day}
                                                className="capitalize"
                                            >
                                                {day}
                                            </Label>
                                            <Input
                                                id={day}
                                                value={
                                                    data.operating_hours[day]
                                                }
                                                onChange={(e) =>
                                                    updateOperatingHours(
                                                        day,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g., 9:00 AM - 6:00 PM or Closed"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <Link href="/places">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                <Save className="w-4 h-4 mr-2" />
                                {processing
                                    ? "Saving..."
                                    : isEditing
                                    ? "Update Place"
                                    : "Create Place"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
