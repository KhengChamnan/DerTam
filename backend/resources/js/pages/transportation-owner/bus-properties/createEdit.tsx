import React, { useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Bus,
    ArrowLeft,
    Save,
    Upload,
    X,
    ImageIcon,
    Users,
    Trash2,
    RotateCcw,
    Wifi,
    Wind,
    Tv,
    Usb,
    Info,
    Armchair,
    Bed,
    Cookie,
    Lightbulb,
    UserCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type SeatType = "standard" | "driver" | "empty";

interface Seat {
    id: string;
    row: number;
    col: number;
    column_label: string; // "A", "B", "C", "D"
    type: SeatType;
    number: number | null;
    level?: "upper" | "lower";
}

interface SeatLayout {
    rows: number;
    columns: string[]; // ["A", "B", "C", "D"]
    layout_type: string;
    has_levels: boolean;
    seats: Seat[];
}

interface BusPropertyData {
    id: number;
    bus_type: string;
    bus_description?: string;
    seat_capacity: number;
    has_multiple_levels: boolean;
    level_configuration?: {
        lower: number;
        upper: number;
    };
    price_per_seat?: number;
    features?: string;
    amenities?: string[];
    image_url?: string;
    image_public_ids?: string;
    seat_layout?: string;
}

interface Props {
    busProperty?: BusPropertyData;
}

// Available amenities
const AMENITIES_OPTIONS = [
    { id: "wifi", name: "WiFi", icon: Wifi },
    { id: "ac", name: "Air Conditioning", icon: Wind },
    { id: "tv", name: "TV/Entertainment", icon: Tv },
    { id: "usb", name: "USB Charging", icon: Usb },
    { id: "toilet", name: "Toilet", icon: Info },
    { id: "reclining", name: "Reclining Seats", icon: Armchair },
    { id: "blanket", name: "Blanket/Pillow", icon: Bed },
    { id: "snacks", name: "Snacks/Water", icon: Cookie },
    { id: "reading_light", name: "Reading Light", icon: Lightbulb },
];

export default function TransportationOwnerBusPropertiesCreateEdit({
    busProperty,
}: Props) {
    const isEditing = !!busProperty;

    // Parse existing images
    const initialImages: string[] = busProperty?.image_url
        ? JSON.parse(busProperty.image_url)
        : [];

    const defaultLayout: SeatLayout = {
        rows: 11,
        columns: ["A", "B", "", "C", "D"], // Empty string for aisle
        layout_type: "standard",
        has_levels: false,
        seats: [],
    };

    const [seatLayout, setSeatLayout] = useState<SeatLayout>(
        busProperty?.seat_layout
            ? JSON.parse(busProperty.seat_layout)
            : defaultLayout
    );

    const [imageInput, setImageInput] = useState("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [editMode, setEditMode] = useState<"view" | "edit">("view");
    const [selectedLevel, setSelectedLevel] = useState<"lower" | "upper">(
        "lower"
    );

    const { data, setData, post, put, processing, errors, reset } = useForm({
        bus_type: busProperty?.bus_type || "",
        bus_description: busProperty?.bus_description || "",
        seat_capacity: busProperty?.seat_capacity || 30,
        has_multiple_levels: busProperty?.has_multiple_levels || false,
        price_per_seat: busProperty?.price_per_seat || 0,
        features: busProperty?.features || "",
        amenities: busProperty?.amenities || [],
        images_url: initialImages,
        images: [] as File[],
    });

    // Handle amenity toggle
    const handleAmenityToggle = (amenityId: string) => {
        setData(
            "amenities",
            data.amenities.includes(amenityId)
                ? data.amenities.filter((a: string) => a !== amenityId)
                : [...data.amenities, amenityId]
        );
    };

    // Seat layout templates with column labels
    const layoutTemplates: Record<
        string,
        {
            name: string;
            rows: number;
            columns: string[];
            description: string;
            has_levels: boolean;
            generateSeats: (rows: number) => Seat[];
        }
    > = {
        minivan: {
            name: "Mini Van",
            rows: 5,
            columns: ["A", "B", "C", "D"],
            description: "15 seats - Compact van layout",
            has_levels: false,
            generateSeats: (rows: number) => {
                const seats: Seat[] = [];
                let seatNum = 1;

                // Row 1: 2 seats on the right (C, D)
                seats.push({
                    id: "1-2",
                    row: 1,
                    col: 2,
                    column_label: "C",
                    type: "standard",
                    number: seatNum++,
                });
                seats.push({
                    id: "1-3",
                    row: 1,
                    col: 3,
                    column_label: "D",
                    type: "standard",
                    number: seatNum++,
                });

                // Row 2: 3 seats (A, B, C)
                seats.push({
                    id: "2-0",
                    row: 2,
                    col: 0,
                    column_label: "A",
                    type: "standard",
                    number: seatNum++,
                });
                seats.push({
                    id: "2-1",
                    row: 2,
                    col: 1,
                    column_label: "B",
                    type: "standard",
                    number: seatNum++,
                });
                seats.push({
                    id: "2-2",
                    row: 2,
                    col: 2,
                    column_label: "C",
                    type: "standard",
                    number: seatNum++,
                });

                // Rows 3-4: 2 on left (A, B), 1 on right (D)
                for (let row = 3; row <= 4; row++) {
                    seats.push({
                        id: `${row}-0`,
                        row,
                        col: 0,
                        column_label: "A",
                        type: "standard",
                        number: seatNum++,
                    });
                    seats.push({
                        id: `${row}-1`,
                        row,
                        col: 1,
                        column_label: "B",
                        type: "standard",
                        number: seatNum++,
                    });
                    seats.push({
                        id: `${row}-3`,
                        row,
                        col: 3,
                        column_label: "D",
                        type: "standard",
                        number: seatNum++,
                    });
                }

                // Row 5 (last row): 4 seats (A, B, C, D)
                seats.push({
                    id: "5-0",
                    row: 5,
                    col: 0,
                    column_label: "A",
                    type: "standard",
                    number: seatNum++,
                });
                seats.push({
                    id: "5-1",
                    row: 5,
                    col: 1,
                    column_label: "B",
                    type: "standard",
                    number: seatNum++,
                });
                seats.push({
                    id: "5-2",
                    row: 5,
                    col: 2,
                    column_label: "C",
                    type: "standard",
                    number: seatNum++,
                });
                seats.push({
                    id: "5-3",
                    row: 5,
                    col: 3,
                    column_label: "D",
                    type: "standard",
                    number: seatNum++,
                });

                return seats;
            },
        },
        sleeper: {
            name: "Sleeping Bus",
            rows: 6,
            columns: ["A", "B", "C", "D"],
            description: "34 seats - Double-decker sleeping berths",
            has_levels: true,
            generateSeats: (rows: number) => {
                const seats: Seat[] = [];
                let seatNum = 1;

                // LOWER DECK: 15 seats (2 on left, aisle, 1 on right)
                // Rows 1-5 on lower deck
                for (let row = 1; row <= 5; row++) {
                    seats.push({
                        id: `${row}-0-lower`,
                        row,
                        col: 0,
                        column_label: "A",
                        type: "standard",
                        number: seatNum++,
                        level: "lower",
                    });
                    seats.push({
                        id: `${row}-1-lower`,
                        row,
                        col: 1,
                        column_label: "B",
                        type: "standard",
                        number: seatNum++,
                        level: "lower",
                    });
                    // col 2 is aisle
                    seats.push({
                        id: `${row}-3-lower`,
                        row,
                        col: 3,
                        column_label: "D",
                        type: "standard",
                        number: seatNum++,
                        level: "lower",
                    });
                }

                // UPPER DECK: 19 seats (2 on left, aisle, 1 on right for rows 1-5, last row has 4)
                // Rows 1-5 on upper deck
                for (let row = 1; row <= 5; row++) {
                    seats.push({
                        id: `${row}-0-upper`,
                        row,
                        col: 0,
                        column_label: "A",
                        type: "standard",
                        number: seatNum++,
                        level: "upper",
                    });
                    seats.push({
                        id: `${row}-1-upper`,
                        row,
                        col: 1,
                        column_label: "B",
                        type: "standard",
                        number: seatNum++,
                        level: "upper",
                    });
                    // col 2 is aisle
                    seats.push({
                        id: `${row}-3-upper`,
                        row,
                        col: 3,
                        column_label: "D",
                        type: "standard",
                        number: seatNum++,
                        level: "upper",
                    });
                }

                // Last row on upper deck: 4 seats side-by-side (A, B, C, D)
                // Similar to mini van last row - using consecutive columns 0,1,2,3
                seats.push({
                    id: "6-0-upper",
                    row: 6,
                    col: 0,
                    column_label: "A",
                    type: "standard",
                    number: seatNum++,
                    level: "upper",
                });
                seats.push({
                    id: "6-1-upper",
                    row: 6,
                    col: 1,
                    column_label: "B",
                    type: "standard",
                    number: seatNum++,
                    level: "upper",
                });
                seats.push({
                    id: "6-2-upper",
                    row: 6,
                    col: 2,
                    column_label: "C",
                    type: "standard",
                    number: seatNum++,
                    level: "upper",
                });
                seats.push({
                    id: "6-3-upper",
                    row: 6,
                    col: 3,
                    column_label: "D",
                    type: "standard",
                    number: seatNum++,
                    level: "upper",
                });

                return seats;
            },
        },
        regular: {
            name: "Regular Bus",
            rows: 11,
            columns: ["A", "B", "C", "D", "E"],
            description: "45 seats - Standard bus layout",
            has_levels: false,
            generateSeats: (rows: number) => {
                const seats: Seat[] = [];
                let seatNum = 1;

                // Rows 1-10: 4 seats each (2 on left, 2 on right)
                for (let row = 1; row <= 10; row++) {
                    seats.push({
                        id: `${row}-0`,
                        row,
                        col: 0,
                        column_label: "A",
                        type: "standard",
                        number: seatNum++,
                    });
                    seats.push({
                        id: `${row}-1`,
                        row,
                        col: 1,
                        column_label: "B",
                        type: "standard",
                        number: seatNum++,
                    });

                    seats.push({
                        id: `${row}-3`,
                        row,
                        col: 3,
                        column_label: "D",
                        type: "standard",
                        number: seatNum++,
                    });
                    seats.push({
                        id: `${row}-4`,
                        row,
                        col: 4,
                        column_label: "E",
                        type: "standard",
                        number: seatNum++,
                    });
                }

                // Row 11 (last row): 5 seats (A, B, C, D, E)
                seats.push({
                    id: "11-0",
                    row: 11,
                    col: 0,
                    column_label: "A",
                    type: "standard",
                    number: seatNum++,
                });
                seats.push({
                    id: "11-1",
                    row: 11,
                    col: 1,
                    column_label: "B",
                    type: "standard",
                    number: seatNum++,
                });
                seats.push({
                    id: "11-2",
                    row: 11,
                    col: 2,
                    column_label: "C",
                    type: "standard",
                    number: seatNum++,
                });
                seats.push({
                    id: "11-3",
                    row: 11,
                    col: 3,
                    column_label: "D",
                    type: "standard",
                    number: seatNum++,
                });
                seats.push({
                    id: "11-4",
                    row: 11,
                    col: 4,
                    column_label: "E",
                    type: "standard",
                    number: seatNum++,
                });

                return seats;
            },
        },
    };

    const getSeatStyle = (seat: Seat, isSelected: boolean) => {
        const baseClasses =
            "relative flex items-center justify-center text-xs font-medium transition-all cursor-pointer border-2";

        if (seat.type === "empty") {
            return `${baseClasses} w-12 h-12 bg-transparent border-transparent cursor-default`;
        }

        const selectedStyle = isSelected
            ? "ring-2 ring-offset-2 ring-blue-500"
            : "";

        const levelBadge =
            seat.level === "upper" ? "rounded-t-lg" : "rounded-lg";

        return `${baseClasses} bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200 ${selectedStyle} ${levelBadge} w-12 h-12`;
    };

    const handleTemplateSelect = (templateKey: string) => {
        const template = layoutTemplates[templateKey];
        const seats = template.generateSeats(template.rows);
        const capacity = seats.filter((s) => s.number !== null).length;

        const levelConfig = template.has_levels
            ? {
                  lower: seats.filter(
                      (s) => s.level === "lower" && s.number !== null
                  ).length,
                  upper: seats.filter(
                      (s) => s.level === "upper" && s.number !== null
                  ).length,
              }
            : null;

        setSeatLayout({
            rows: template.rows,
            columns: template.columns,
            layout_type: templateKey,
            has_levels: template.has_levels,
            seats,
        });

        setData("seat_capacity", capacity);
        setData("has_multiple_levels", template.has_levels);
    };

    const handleSeatClick = (seatId: string) => {
        if (editMode === "edit") {
            setSelectedSeats((prev) =>
                prev.includes(seatId)
                    ? prev.filter((id) => id !== seatId)
                    : [...prev, seatId]
            );
        }
    };

    const handleSeatTypeChange = (newType: SeatType) => {
        const updatedSeats = seatLayout.seats.map((seat: Seat) =>
            selectedSeats.includes(seat.id) ? { ...seat, type: newType } : seat
        );
        setSeatLayout({ ...seatLayout, seats: updatedSeats });
        setSelectedSeats([]);
    };

    const handleRemoveSeats = () => {
        const updatedSeats = seatLayout.seats.map((seat: Seat) =>
            selectedSeats.includes(seat.id)
                ? { ...seat, type: "empty" as SeatType, number: null }
                : seat
        );

        // Renumber seats
        let seatNum = 1;
        const renumberedSeats = updatedSeats.map((seat: Seat) => {
            if (seat.number !== null && seat.type !== "empty") {
                return { ...seat, number: seatNum++ };
            }
            return seat;
        });

        const capacity = renumberedSeats.filter(
            (s: Seat) => s.number !== null
        ).length;
        setSeatLayout({ ...seatLayout, seats: renumberedSeats });
        setData("seat_capacity", capacity);
        setSelectedSeats([]);
    };

    const renderSeatMap = (level?: "upper" | "lower") => {
        const maxRow = Math.max(...seatLayout.seats.map((s: Seat) => s.row), 0);
        const columns = seatLayout.columns;
        const grid: React.ReactElement[] = [];

        for (let row = 0; row <= maxRow; row++) {
            const rowSeats: React.ReactElement[] = [];

            columns.forEach((columnLabel, colIndex) => {
                if (columnLabel === "") {
                    // Aisle space
                    rowSeats.push(
                        <div
                            key={`${row}-aisle-${colIndex}`}
                            className="w-8 h-12"
                        />
                    );
                } else {
                    // Find seat by row and col (not column_label)
                    const seat = seatLayout.seats.find(
                        (s: Seat) =>
                            s.row === row &&
                            s.col === colIndex &&
                            (level
                                ? s.level === level
                                : !s.level || s.level === "lower")
                    );

                    if (seat) {
                        rowSeats.push(
                            <div
                                key={seat.id}
                                className={getSeatStyle(
                                    seat,
                                    selectedSeats.includes(seat.id)
                                )}
                                onClick={() => handleSeatClick(seat.id)}
                            >
                                {seat.number !== null && (
                                    <span className="font-semibold">
                                        {seat.number}
                                    </span>
                                )}
                            </div>
                        );
                    } else {
                        // Empty space where no seat exists
                        rowSeats.push(
                            <div
                                key={`${row}-${colIndex}-empty`}
                                className="w-12 h-12"
                            />
                        );
                    }
                }
            });

            grid.push(
                <div
                    key={row}
                    className="flex gap-1 justify-center items-center mb-2"
                >
                    {rowSeats}
                </div>
            );
        }

        return grid;
    };

    const handleImageUrlChange = (value: string) => {
        setImageInput(value);
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

        // Add files to images array
        setData("images", [...data.images, ...newFiles]);

        // Read files and add preview URLs
        const previewPromises = newFiles.map((file) => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(previewPromises).then((previewUrls) => {
            setData("images_url", [...data.images_url, ...previewUrls]);
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

        const existingImagesCount = initialImages.length;
        if (index >= existingImagesCount) {
            const fileIndex = index - existingImagesCount;
            const newFiles = data.images.filter((_, i) => i !== fileIndex);
            setData("images", newFiles);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submissionData = {
            ...data,
            amenities: JSON.stringify(data.amenities),
            seat_layout: JSON.stringify(seatLayout),
        };

        if (isEditing) {
            router.post(
                `/transportation-owner/bus-properties/${busProperty.id}`,
                { ...submissionData, _method: "PUT" },
                {
                    forceFormData: true,
                    onSuccess: () => {
                        toast.success(
                            "Bus type template updated successfully!"
                        );
                    },
                    onError: () => {
                        toast.error("Failed to update bus type template.");
                    },
                }
            );
        } else {
            router.post(
                "/transportation-owner/bus-properties",
                submissionData,
                {
                    forceFormData: true,
                    onSuccess: () => {
                        toast.success(
                            "Bus type template created successfully!"
                        );
                        reset();
                        setSelectedFiles([]);
                    },
                    onError: () => {
                        toast.error("Failed to create bus type template.");
                    },
                }
            );
        }
    };

    return (
        <AppLayout>
            <Head title={isEditing ? "Edit Bus Type" : "Add Bus Type"} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {isEditing
                                ? "Edit Bus Type Template"
                                : "Create Bus Type Template"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing
                                ? "Update the bus type template - changes won't affect existing buses"
                                : "Create a reusable template for adding buses to your fleet"}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/transportation-owner/bus-properties">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Bus Types
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bus className="h-5 w-5" />
                                Bus Type Template Information
                            </CardTitle>
                            <CardDescription>
                                Define the template that will be used when
                                adding actual buses to your fleet
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Bus Type */}
                                <div>
                                    <Label htmlFor="bus_type">
                                        Bus Type/Class Name *
                                    </Label>
                                    <Input
                                        id="bus_type"
                                        type="text"
                                        value={data.bus_type}
                                        onChange={(e) =>
                                            setData("bus_type", e.target.value)
                                        }
                                        placeholder="e.g., Standard, VIP, Sleeper"
                                    />
                                    {errors.bus_type && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.bus_type}
                                        </p>
                                    )}
                                </div>

                                {/* Seat Capacity */}
                                <div>
                                    <Label htmlFor="seat_capacity">
                                        Seat Capacity *
                                    </Label>
                                    <Input
                                        id="seat_capacity"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={data.seat_capacity}
                                        onChange={(e) =>
                                            setData(
                                                "seat_capacity",
                                                parseInt(e.target.value) || 0
                                            )
                                        }
                                        placeholder="e.g., 30"
                                    />
                                    {errors.seat_capacity && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.seat_capacity}
                                        </p>
                                    )}
                                </div>

                                {/* Price Per Seat */}
                                <div>
                                    <Label htmlFor="price_per_seat">
                                        Base Price Per Seat (Optional)
                                    </Label>
                                    <Input
                                        id="price_per_seat"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.price_per_seat}
                                        onChange={(e) =>
                                            setData(
                                                "price_per_seat",
                                                parseFloat(e.target.value) || 0
                                            )
                                        }
                                        placeholder="e.g., 25.00"
                                    />
                                    {errors.price_per_seat && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.price_per_seat}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <Label htmlFor="bus_description">
                                    Description
                                </Label>
                                <Textarea
                                    id="bus_description"
                                    value={data.bus_description}
                                    onChange={(e) =>
                                        setData(
                                            "bus_description",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter a brief description of this bus type (optional)"
                                    rows={3}
                                />
                                {errors.bus_description && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.bus_description}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Images</CardTitle>
                            <CardDescription>
                                Add image URLs or upload files for this bus type
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                            handleImageUrlChange(pastedText);
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
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Files
                                </Button>
                            </div>

                            {data.images_url.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {data.images_url.map((url, index) => (
                                        <div
                                            key={index}
                                            className="relative group"
                                        >
                                            <img
                                                src={url}
                                                alt={`Bus ${index + 1}`}
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
                        </CardContent>
                    </Card>

                    {/* Seat Layout Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Seat Layout Template
                            </CardTitle>
                            <CardDescription>
                                Select a template on the left to preview the
                                seat layout on the right
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left: Predefined Templates */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-700">
                                        Predefined Templates
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {Object.entries(layoutTemplates).map(
                                            ([key, template]) => (
                                                <Card
                                                    key={key}
                                                    className={`cursor-pointer transition-all hover:shadow-md ${
                                                        seatLayout.layout_type ===
                                                        key
                                                            ? "ring-2 ring-primary"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        handleTemplateSelect(
                                                            key
                                                        )
                                                    }
                                                >
                                                    <CardHeader>
                                                        <CardTitle className="text-base">
                                                            {template.name}
                                                        </CardTitle>
                                                        <CardDescription className="text-xs">
                                                            {
                                                                template.description
                                                            }
                                                        </CardDescription>
                                                    </CardHeader>
                                                </Card>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Right: Seat Map Preview */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-700">
                                        Seat Map Preview
                                    </h3>
                                    <div className="bg-gray-50 p-6 rounded-lg border">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="text-sm font-medium">
                                                Total Seats:{" "}
                                                {data.seat_capacity}
                                            </div>
                                        </div>

                                        {seatLayout.has_levels ? (
                                            <Tabs
                                                defaultValue="lower"
                                                className="w-full"
                                                onValueChange={(value) =>
                                                    setSelectedLevel(
                                                        value as
                                                            | "lower"
                                                            | "upper"
                                                    )
                                                }
                                            >
                                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                                    <TabsTrigger value="lower">
                                                        Lower Deck
                                                    </TabsTrigger>
                                                    <TabsTrigger value="upper">
                                                        Upper Deck
                                                    </TabsTrigger>
                                                </TabsList>
                                                <TabsContent
                                                    value="lower"
                                                    className="space-y-4"
                                                >
                                                    <div className="space-y-2 max-w-xl mx-auto">
                                                        {renderSeatMap("lower")}
                                                    </div>
                                                </TabsContent>
                                                <TabsContent
                                                    value="upper"
                                                    className="space-y-4"
                                                >
                                                    <div className="space-y-2 max-w-xl mx-auto">
                                                        {renderSeatMap("upper")}
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        ) : (
                                            <div className="space-y-2 max-w-xl mx-auto">
                                                {renderSeatMap()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Features & Amenities Template</CardTitle>
                            <CardDescription>
                                Define the default features and amenities - all
                                buses created from this template will inherit
                                these
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Amenities */}
                            <div>
                                <Label className="text-base mb-3 block">
                                    Amenities
                                </Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {AMENITIES_OPTIONS.map((amenity) => {
                                        const AmenityIcon = amenity.icon;
                                        return (
                                            <div
                                                key={amenity.id}
                                                className="flex items-center space-x-2"
                                            >
                                                <Checkbox
                                                    id={amenity.id}
                                                    checked={data.amenities.includes(
                                                        amenity.id
                                                    )}
                                                    onCheckedChange={() =>
                                                        handleAmenityToggle(
                                                            amenity.id
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor={amenity.id}
                                                    className="text-sm font-normal flex items-center gap-2 cursor-pointer"
                                                >
                                                    <AmenityIcon className="h-4 w-4" />
                                                    {amenity.name}
                                                </Label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <Label htmlFor="features">
                                    Additional Features (Optional)
                                </Label>
                                <Textarea
                                    id="features"
                                    value={data.features}
                                    onChange={(e) =>
                                        setData("features", e.target.value)
                                    }
                                    placeholder="e.g., Extra legroom, Premium seats in specific rows, etc."
                                    rows={3}
                                />
                                {errors.features && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.features}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4">
                        <Link href="/transportation-owner/bus-properties">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing
                                ? isEditing
                                    ? "Updating Template..."
                                    : "Creating Template..."
                                : isEditing
                                ? "Update Template"
                                : "Create Template"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
