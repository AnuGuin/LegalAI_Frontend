"use client"

import { useState } from "react"
import { MatterDocument, apiService } from "@/lib/api.service"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Download, Trash2, UploadCloud, Image as ImageIcon, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface MatterDocumentsProps {
    matterId: string
    documents: MatterDocument[]
    loading?: boolean
    onDocumentsChange?: (docs: MatterDocument[]) => void
}

export function MatterDocuments({ matterId, documents, loading, onDocumentsChange }: MatterDocumentsProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [localDocs, setLocalDocs] = useState<MatterDocument[]>(documents)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const toastId = toast.loading("Uploading document...")

        try {
            const newDoc = await apiService.uploadMatterDocument(matterId, file)
            const updated = [newDoc, ...localDocs]
            setLocalDocs(updated)
            onDocumentsChange?.(updated)
            toast.success("Document uploaded successfully", { id: toastId })
        } catch (error) {
            toast.error("Upload failed", { 
                description: error instanceof Error ? error.message : "An error occurred",
                id: toastId 
            })
        } finally {
            setIsUploading(false)
            if (e.target) e.target.value = ''
        }
    }

    const handleDelete = async (docId: string) => {
        const toastId = toast.loading("Deleting document...")
        try {
            await apiService.deleteMatterDocument(matterId, docId)
            const updated = localDocs.filter(d => d.id !== docId)
            setLocalDocs(updated)
            onDocumentsChange?.(updated)
            toast.success("Document deleted", { id: toastId })
        } catch (error) {
            toast.error("Delete failed", { 
                description: error instanceof Error ? error.message : "An error occurred",
                id: toastId 
            })
        }
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getIcon = (type: string) => {
        if (type.includes('image')) return <ImageIcon className="h-5 w-5 text-blue-500" />
        if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />
        return <File className="h-5 w-5 text-muted-foreground" />
    }

    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-xl border border-border/60 p-4 h-24">
                            <Skeleton className="h-full w-full" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
            
            {/* Header & Upload */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-foreground tracking-tight gap-2 flex items-center">
                        Matter Documents
                        <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {localDocs.length}
                        </span>
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Securely manage all files related to this matter.
                    </p>
                </div>
                
                <div className="shrink-0">
                    <input
                        type="file"
                        id="document-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                    />
                    <Button 
                        asChild
                        disabled={isUploading}
                        className="bg-[#1A3A5C] hover:bg-[#244d7a] text-white gap-2 transition-all cursor-pointer"
                    >
                        <label htmlFor="document-upload">
                            <UploadCloud className="h-4 w-4" />
                            {isUploading ? "Uploading..." : "Upload Document"}
                        </label>
                    </Button>
                </div>
            </div>

            {/* Document Grid */}
            {localDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">No documents yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Upload pleadings, evidence, or correspondence related to this matter to keep everything organized.
                    </p>
                    <Button 
                        asChild
                        variant="outline"
                        className="mt-6 gap-2"
                    >
                        <label htmlFor="document-upload" className="cursor-pointer">
                            <UploadCloud className="h-4 w-4" />
                            Upload First Document
                        </label>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {localDocs.map(doc => (
                        <div 
                            key={doc.id}
                            className="group relative flex flex-col rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-md hover:border-border"
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-1 shrink-0">
                                    {getIcon(doc.type)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-foreground truncate" title={doc.name}>
                                        {doc.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <span>{formatBytes(doc.size)}</span>
                                        <span>•</span>
                                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                {doc.url && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                                        asChild
                                    >
                                        <a href={doc.url} download={doc.name} target="_blank" rel="noreferrer">
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDelete(doc.id)}
                                    className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
