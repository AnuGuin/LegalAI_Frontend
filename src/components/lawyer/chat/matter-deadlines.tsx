"use client"

import { useState } from "react"
import { MatterDeadline, apiService } from "@/lib/api.service"
import { CheckCircle2, AlertCircle, Plus, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface MatterDeadlinesProps {
    matterId: string
    deadlines: MatterDeadline[]
    loading?: boolean
    onDeadlinesChange?: (deadlines: MatterDeadline[]) => void
}

export function MatterDeadlines({ matterId, deadlines, loading, onDeadlinesChange }: MatterDeadlinesProps) {
    const [localDeadlines, setLocalDeadlines] = useState<MatterDeadline[]>(deadlines)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        dueDate: '',
        urgency: 'normal' as 'normal' | 'high' | 'urgent',
        notes: ''
    })

    const urgencyStyles = {
        urgent: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/50",
        high: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50",
        normal: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50",
    }

    const toggleDeadline = async (id: string, currentDone: boolean) => {
        try {
            // Optimistic update
            const updated = localDeadlines.map(d => d.id === id ? { ...d, done: !currentDone } : d)
            setLocalDeadlines(updated)
            onDeadlinesChange?.(updated)

            await apiService.toggleMatterDeadline(matterId, id, !currentDone)
        } catch (error) {
            // Revert on error
            setLocalDeadlines(deadlines)
            onDeadlinesChange?.(deadlines)
            toast.error("Failed to update deadline status")
        }
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title || !formData.dueDate) return

        setIsSubmitting(true)
        try {
            const date = new Date(formData.dueDate)
            const payload = {
                title: formData.title,
                notes: formData.notes,
                day: date.getDate().toString().padStart(2, '0'),
                month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
                urgency: formData.urgency,
                dueDate: date.toISOString()
            }

            const newDeadline = await apiService.addMatterDeadline(matterId, payload)
            const updated = [newDeadline, ...localDeadlines]
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

            setLocalDeadlines(updated)
            onDeadlinesChange?.(updated)
            setIsAddOpen(false)
            setFormData({ title: '', dueDate: '', urgency: 'normal', notes: '' })
            toast.success("Deadline added")
        } catch (error) {
            toast.error("Failed to add deadline")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) return <div className="p-8">Loading deadlines...</div>

    const pending = localDeadlines.filter(d => !d.done).length
    const done = localDeadlines.filter(d => d.done).length

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-foreground tracking-tight gap-2 flex items-center">
                        Key Dates & Deadlines
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {pending} pending · {done} completed
                    </p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#1A3A5C] hover:bg-[#244d7a] text-white gap-2">
                            <Plus className="h-4 w-4" />
                            Add Deadline
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Deadline</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. File Motion to Dismiss"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date</label>
                                    <Input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Urgency</label>
                                    <Select
                                        value={formData.urgency}
                                        onValueChange={(v: 'normal' | 'high' | 'urgent') => setFormData({ ...formData, urgency: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Notes (Optional)</label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="resize-none"
                                    rows={3}
                                />
                            </div>
                            <Button type="submit" className="w-full bg-[#1A3A5C] hover:bg-[#244d7a] text-white" disabled={isSubmitting}>
                                {isSubmitting ? "Adding..." : "Add Deadline"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* List */}
            {localDeadlines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Calendar className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">No deadlines yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Keep track of important court dates, filing deadlines, and meetings.
                    </p>
                    <Button variant="outline" className="mt-6 gap-2" onClick={() => setIsAddOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Add First Deadline
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {localDeadlines.map((dl) => (
                        <div
                            key={dl.id}
                            className={cn(
                                "flex items-start sm:items-center gap-3 md:gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:shadow-sm",
                                dl.done && "opacity-60 bg-muted/30"
                            )}
                        >
                            {/* Checkbox */}
                            <button
                                onClick={() => toggleDeadline(dl.id, dl.done)}
                                className={cn(
                                    "mt-1 sm:mt-0 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                                    dl.done
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
                                        : "border-border hover:border-[#1A3A5C]"
                                )}
                            >
                                {dl.done && <CheckCircle2 className="h-3.5 w-3.5" />}
                            </button>

                            {/* Date chip */}
                            <div
                                className={cn(
                                    "flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg shadow-sm font-semibold",
                                    dl.done ? "bg-muted text-muted-foreground border border-border/60" : urgencyStyles[dl.urgency]
                                )}
                            >
                                <span className="text-lg leading-none tracking-tight">{dl.day}</span>
                                <span className="text-[10px] uppercase tracking-wider mt-0.5 opacity-80">{dl.month}</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "text-base font-semibold leading-tight",
                                    dl.done ? "line-through text-muted-foreground" : "text-foreground"
                                )}>
                                    {dl.title}
                                </p>
                                {dl.notes && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                        {dl.notes}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 mt-2 md:hidden">
                                    {!dl.done && dl.urgency === "urgent" && (
                                        <div className="flex items-center gap-1 text-xs font-semibold text-red-600">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            Urgent
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Desktop Meta */}
                            <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
                                {!dl.done && dl.urgency === "urgent" && (
                                    <Badge variant="destructive" className="gap-1 bg-red-100 text-red-700 hover:bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                                        <AlertCircle className="h-3 w-3" />
                                        Urgent
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
