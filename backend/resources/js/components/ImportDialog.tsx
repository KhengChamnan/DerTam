import React, { useState, useRef } from "react";
import { router } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Upload,
    FileSpreadsheet,
    Download,
    CheckCircle,
    AlertCircle,
    XCircle,
    FileText,
    Loader2,
} from "lucide-react";

interface ImportResult {
    type: "success" | "warning" | "error";
    message: string;
    stats?: {
        success: number;
        errors: number;
        duplicates: number;
    };
    errors?: Array<{
        row: number;
        message: string;
    }>;
}

interface ImportDialogProps {
    trigger?: React.ReactNode;
}

export default function ImportDialog({ trigger }: ImportDialogProps) {
    const { props } = usePage<any>();
    const [isOpen, setIsOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0];

            // Validate file type
            const allowedTypes = [
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
                "text/csv",
            ];

            if (
                !allowedTypes.includes(file.type) &&
                !file.name.match(/\.(xlsx|xls|csv)$/i)
            ) {
                alert("Please select a valid Excel (.xlsx, .xls) or CSV file.");
                return;
            }

            if (file.size > 100 * 1024 * 1024) {
                alert("File size must be less than 100MB.");
                return;
            }

            setSelectedFile(file);
            setImportResult(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(e.target.files);
    };

    const handleImport = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setImportResult(null);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            router.post("/places/import", formData, {
                onSuccess: (page: any) => {
                    const result = page.props.import_result as ImportResult;
                    if (result) {
                        setImportResult(result);
                    } else {
                        setImportResult({
                            type: "success",
                            message: "Import completed successfully",
                        });
                    }
                },
                onError: (errors: any) => {
                    setImportResult({
                        type: "error",
                        message:
                            "Import failed: " +
                            Object.values(errors).join(", "),
                    });
                },
                onFinish: () => {
                    setIsUploading(false);
                },
            });
        } catch (error) {
            setIsUploading(false);
            setImportResult({
                type: "error",
                message: "Import failed: " + (error as Error).message,
            });
        }
    };

    const handleDownloadTemplate = () => {
        window.open("/places/import/template", "_blank");
    };

    const resetDialog = () => {
        setSelectedFile(null);
        setImportResult(null);
        setIsUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(resetDialog, 300);
    };

    const getResultIcon = (type: string) => {
        switch (type) {
            case "success":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "warning":
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case "error":
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return null;
        }
    };

    const getResultColor = (type: string) => {
        switch (type) {
            case "success":
                return "border-green-200 bg-green-50";
            case "warning":
                return "border-yellow-200 bg-yellow-50";
            case "error":
                return "border-red-200 bg-red-50";
            default:
                return "border-gray-200 bg-gray-50";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Import Places
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Import Places
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Template Download */}
                    <div className="flex items-center justify-between p-4 border border-blue-200 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="font-medium text-blue-900">
                                    Download Template
                                </p>
                                <p className="text-sm text-blue-700">
                                    Get the Excel template with sample data and
                                    required columns
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadTemplate}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                    </div>

                    {/* File Upload Area */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                            isDragOver
                                ? "border-blue-400 bg-blue-50"
                                : selectedFile
                                ? "border-green-400 bg-green-50"
                                : "border-gray-300 hover:border-gray-400"
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileInputChange}
                            className="hidden"
                        />

                        {selectedFile ? (
                            <div className="space-y-2">
                                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                                <p className="text-lg font-medium text-green-800">
                                    {selectedFile.name}
                                </p>
                                <p className="text-sm text-green-600">
                                    {(selectedFile.size / 1024 / 1024).toFixed(
                                        2
                                    )}{" "}
                                    MB
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFile(null);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = "";
                                        }
                                    }}
                                >
                                    Choose Different File
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                                {isDragOver ? (
                                    <p className="text-lg text-blue-600">
                                        Drop the file here...
                                    </p>
                                ) : (
                                    <>
                                        <p className="text-lg text-gray-700">
                                            Drag and drop your file here, or
                                            click to browse
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Supports .xlsx, .xls, and .csv files
                                            up to 100MB
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Upload Progress */}
                    {isUploading && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm font-medium">
                                    Processing import...
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 animate-pulse"
                                    style={{ width: "60%" }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Import Result */}
                    {importResult && (
                        <Alert className={getResultColor(importResult.type)}>
                            <div className="flex items-start gap-3">
                                {getResultIcon(importResult.type)}
                                <div className="flex-1 space-y-2">
                                    <AlertDescription className="font-medium">
                                        {importResult.message}
                                    </AlertDescription>

                                    {/* Stats */}
                                    {importResult.stats && (
                                        <div className="flex gap-2 flex-wrap">
                                            <Badge
                                                variant="outline"
                                                className="bg-green-100 text-green-800"
                                            >
                                                {importResult.stats.success}{" "}
                                                Imported
                                            </Badge>
                                            {importResult.stats.errors > 0 && (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-red-100 text-red-800"
                                                >
                                                    {importResult.stats.errors}{" "}
                                                    Errors
                                                </Badge>
                                            )}
                                            {importResult.stats.duplicates >
                                                0 && (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-yellow-100 text-yellow-800"
                                                >
                                                    {
                                                        importResult.stats
                                                            .duplicates
                                                    }{" "}
                                                    Duplicates
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                    {/* Error Details */}
                                    {importResult.errors &&
                                        importResult.errors.length > 0 && (
                                            <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                                                <p className="text-sm font-medium">
                                                    Error Details:
                                                </p>
                                                {importResult.errors
                                                    .slice(0, 10)
                                                    .map((error, index) => (
                                                        <p
                                                            key={index}
                                                            className="text-xs text-red-700"
                                                        >
                                                            Row {error.row}:{" "}
                                                            {error.message}
                                                        </p>
                                                    ))}
                                                {importResult.errors.length >
                                                    10 && (
                                                    <p className="text-xs text-red-600 font-medium">
                                                        ... and{" "}
                                                        {importResult.errors
                                                            .length - 10}{" "}
                                                        more errors
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>
                        </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={handleClose}>
                            {importResult ? "Close" : "Cancel"}
                        </Button>
                        {selectedFile && !importResult && (
                            <Button
                                onClick={handleImport}
                                disabled={isUploading}
                                className="gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" />
                                        Import File
                                    </>
                                )}
                            </Button>
                        )}
                        {importResult && importResult.type === "success" && (
                            <Button onClick={handleClose}>Done</Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
