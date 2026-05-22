"use client";

import { Paperclip, ArrowRight, X, File, FileText, Image, Languages } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { toast } from "sonner";
import { apiService } from "@/lib/api.service";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TranslateModal } from "../chat/translate-modal";
import { DocumentGenerationModal } from "../chat/document-generation-modal";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

interface Tool {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    file: File;
}

interface AI_InputProps {
    onSendMessage?: (message: string, file?: File) => void | Promise<void>;
    onDocumentGenerationRequest?: (result: any) => void;
    mode?: 'chat' | 'agentic';
    disabled?: boolean;
    showModeIndicator?: boolean;
    wrapperClassName?: string;
    inputMinHeight?: number;
    triggerDocModal?: boolean;
    onTriggerDocModal?: () => void;
    hasActiveConversation?: boolean;
}

const tools: Tool[] = [
    {
        id: 'doc-generate',
        label: 'Doc Generate',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                <path d="M9 12h6" />
                <path d="M9 16h6" />
            </svg>
        )
    },
    {
        id: 'translate',
        label: 'Translate',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 6.371c0 4.418 -2.239 6.629 -5 6.629" />
                <path d="M4 6.371h7" />
                <path d="M5 9c0 2.144 2.252 3.908 6 4" />
                <path d="M12 20l4 -9l4 9" />
                <path d="M19.1 18h-6.2" />
                <path d="M6.694 3l.793 .582" />
            </svg>
        )
    }
];


const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function AI_Input({ onSendMessage, onDocumentGenerationRequest, mode = 'chat', disabled = false, showModeIndicator = true, wrapperClassName, inputMinHeight = 52, triggerDocModal, onTriggerDocModal, hasActiveConversation = false }: AI_InputProps) {
    const pathname = usePathname();
    const isLawyerModule = pathname?.startsWith('/dashboard') || pathname?.startsWith('/assistant');
    const [value, setValue] = useState("");
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: inputMinHeight,
        maxHeight: 200,
    });
    const [showTools, setShowTools] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isTranslateModalOpen, setIsTranslateModalOpen] = useState(false);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    const [translateLanguages, setTranslateLanguages] = useState<{
        sourceLang: string;
        targetLang: string;
        sourceName: string;
        targetName: string;
    } | null>(null);
    const [detectedLanguage, setDetectedLanguage] = useState<{
        language: string;
        display_name: string;
    } | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if ((mode !== 'agentic' && !isLawyerModule) || !value.trim() || value.trim().length < 3) {
            setDetectedLanguage(null);
            return;
        }
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(async () => {
            try {
                setIsDetecting(true);
                const response = await apiService.detectLanguage(value.trim());

                if (response.success && response.data) {
                    setDetectedLanguage(response.data);
                }
            } catch (error) {
                console.error('Language detection failed:', error);
            } finally {
                setIsDetecting(false);
            }
        }, 800);
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [value, mode]);

    useEffect(() => {
        if (triggerDocModal === true) {
            setSelectedTool(tools.find(t => t.id === 'doc-generate') || null);
            setIsDocumentModalOpen(true);
            onTriggerDocModal?.();
        }
    }, [triggerDocModal, onTriggerDocModal]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const validFiles: UploadedFile[] = [];
        const errors: string[] = [];

        Array.from(files).forEach(file => {
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                errors.push(`${file.name}: Invalid file type. Only PDF, DOC, DOCX, TXT, and images are allowed.`);
                return;
            }
            if (file.size > MAX_FILE_SIZE) {
                errors.push(`${file.name}: File too large. Maximum size is ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB.`);
                return;
            }

            validFiles.push({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: file.size,
                type: file.type,
                file: file
            });
        });
        if (errors.length > 0) {
            toast.error("File validation failed", { description: errors[0] });
        }

        if (validFiles.length > 0) {
            setUploadedFiles(prev => [...prev, ...validFiles]);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (fileId: string) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith('image/')) {
            return <Image className="w-6 h-6" />;
        } else if (fileType.includes('pdf') || fileType.includes('document')) {
            return <FileText className="w-6 h-6" />;
        }
        return <File className="w-6 h-6" />;
    };

    const handleSubmit = async () => {
        if (!value.trim() && uploadedFiles.length === 0) return;

        if (disabled) return;
        let messageContent = value.trim();

        if (translateLanguages) {
            messageContent = `Please translate the following text from ${translateLanguages.sourceName} to ${translateLanguages.targetName}:\n\n${messageContent}`;
        }
        console.log('AI Input - sending message', {
            mode,
            translateLanguages,
            messagePreview: messageContent && messageContent.length > 1000 ? messageContent.slice(0, 1000) + '... (truncated)' : messageContent,
            hasFile: uploadedFiles.length > 0
        });
        setValue("");
        adjustHeight(true);

        if (mode === 'agentic') {
            setUploadedFiles([]);
        }

        setDetectedLanguage(null);

        if (onSendMessage) {
            const fileToSend = uploadedFiles.length > 0 ? uploadedFiles[0].file : undefined;
            await onSendMessage(messageContent, fileToSend);
        }

    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleContainerClick = () => {
        if (textareaRef.current && !disabled) {
            textareaRef.current.focus();
        }
    };

    const handleLanguageSelect = (sourceLang: string, targetLang: string, sourceName: string, targetName: string) => {
        setTranslateLanguages({
            sourceLang,
            targetLang,
            sourceName,
            targetName,
        });
        const translateTool = tools.find(t => t.id === 'translate');
        if (translateTool) {
            setSelectedTool(translateTool);
        }
    };

    return (
        <div className="w-full py-2 sm:py-4 overflow-visible">
            <div className={cn("relative w-full overflow-visible", wrapperClassName ?? "max-w-2xl mx-auto px-2 sm:px-0")}>
                {/* Agentic Mode Glowing Gradient Background around the Input Box */}
                {mode === 'agentic' && !hasActiveConversation && (
                    <div
                        className={cn(
                            "hidden sm:block absolute -inset-2.5 z-0 blur-2xl opacity-60 rounded-[36px] transition-all duration-700 ease-in-out pointer-events-none",
                            isFocused ? "opacity-90 blur-3xl scale-[1.04]" : ""
                        )}
                        style={{
                            background: isDark
                              ? `radial-gradient(ellipse 120% 80% at 75% 20%, rgba(255, 20, 147, 0.28), transparent 55%),
                                 radial-gradient(ellipse 100% 60% at 25% 15%, rgba(0, 255, 255, 0.24), transparent 60%),
                                 radial-gradient(ellipse 90% 70% at 50% 10%, rgba(138, 43, 226, 0.32), transparent 65%),
                                 radial-gradient(ellipse 110% 50% at 85% 35%, rgba(255, 215, 0, 0.16), transparent 45%)`
                              : `radial-gradient(ellipse 120% 80% at 75% 20%, rgba(59, 130, 246, 0.24), transparent 55%),
                                 radial-gradient(ellipse 100% 60% at 25% 15%, rgba(14, 165, 233, 0.28), transparent 60%),
                                 radial-gradient(ellipse 90% 70% at 50% 10%, rgba(56, 189, 248, 0.22), transparent 65%),
                                 radial-gradient(ellipse 110% 50% at 85% 35%, rgba(37, 99, 235, 0.18), transparent 45%)`,
                        }}
                    />
                )}
                {/* Main container with extension for doc upload */}
                <div className={cn(
                    "relative z-10 transition-all duration-300 overflow-visible",
                    hasActiveConversation
                      ? "bg-transparent ring-0 border-none shadow-none"
                      : cn(
                          uploadedFiles.length > 0 ? "rounded-3xl" : "rounded-[28px] sm:rounded-[32px]",
                          "bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.08),0_1px_4px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.35),0_1px_4px_rgb(0,0,0,0.15)]",
                          isFocused && "ring-1 ring-black/15 dark:ring-white/15 border-black/15 dark:border-white/15"
                        ),
                    disabled && "opacity-50 cursor-not-allowed"
                )}>
                    <div
                        role="textbox"
                        tabIndex={disabled ? -1 : 0}
                        aria-label="Message input"
                        aria-disabled={disabled}
                        className={cn(
                            "relative flex items-center sm:flex-col sm:items-stretch transition-all duration-300 ease-in-out w-full text-left overflow-visible",
                            "bg-transparent",
                            uploadedFiles.length > 0 ? "rounded-t-3xl" : "rounded-[28px] sm:rounded-[32px]",
                            disabled ? "cursor-not-allowed" : "cursor-text"
                        )}
                        onClick={handleContainerClick}
                        onKeyDown={(e) => {
                            if (!disabled && (e.key === "Enter" || e.key === " ")) {
                                handleContainerClick();
                            }
                        }}
                    >
                        {/* MOBILE: left action icons  */}
                        <div className="sm:hidden flex items-center gap-1 px-2 py-2 shrink-0">
                            {mode === 'agentic' && (
                                <button
                                    type="button"
                                    onClick={() => !disabled && fileInputRef.current?.click()}
                                    disabled={disabled}
                                    className={cn(
                                        "rounded-full p-2.5 transition-colors relative flex items-center justify-center",
                                        "bg-black/5 dark:bg-white/5 text-foreground/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10",
                                        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                    )}
                                >
                                    <Paperclip className="w-4 h-4 text-inherit" />
                                    {uploadedFiles.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {uploadedFiles.length}
                                        </span>
                                    )}
                                </button>
                            )}
                            {mode === 'chat' && (
                                <div className="flex items-center gap-1.5">
                                    {/* Pill-shaped tools button matching agentic aesthetic */}
                                    <DropdownMenu onOpenChange={setShowTools}>
                                        <DropdownMenuTrigger asChild disabled={disabled}>
                                            <button
                                                type="button"
                                                disabled={disabled}
                                                className={cn(
                                                    "rounded-full transition-all flex items-center gap-1.5 px-3 py-2 border h-9",
                                                    selectedTool || showTools
                                                        ? "bg-primary/80 border-primary/50 text-primary-foreground"
                                                        : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10",
                                                    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                                )}
                                            >
                                                <motion.div
                                                    animate={{ rotate: showTools ? 180 : 0, scale: showTools || selectedTool ? 1.05 : 1 }}
                                                    transition={{ type: "spring", stiffness: 260, damping: 25 }}
                                                    className="flex items-center justify-center"
                                                >
                                                    {selectedTool ? selectedTool.icon : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                            <path d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5" />
                                                        </svg>
                                                    )}
                                                </motion.div>
                                                <AnimatePresence>
                                                    <motion.span
                                                        key={selectedTool?.label ?? 'tools'}
                                                        initial={{ opacity: 0, width: 0 }}
                                                        animate={{ opacity: 1, width: 'auto' }}
                                                        exit={{ opacity: 0, width: 0 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="text-xs font-medium whitespace-nowrap overflow-hidden"
                                                    >
                                                        {selectedTool ? selectedTool.label : 'Tools'}
                                                    </motion.span>
                                                </AnimatePresence>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-48 p-2 backdrop-blur-sm border border-border/60 rounded-2xl shadow-[4px_8px_12px_2px_rgba(0,0,0,0.1)] dark:shadow-[4px_8px_12px_2px_rgba(0,0,0,0.2)] bg-popover">
                                            <div className="space-y-1">
                                                {tools.map((tool) => (
                                                    <DropdownMenuItem key={tool.id} asChild>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (tool.id === 'translate') {
                                                                    setSelectedTool(tool);
                                                                    setIsTranslateModalOpen(true);
                                                                    setShowTools(false);
                                                                } else if (tool.id === 'doc-generate') {
                                                                    setSelectedTool(tool);
                                                                    setIsDocumentModalOpen(true);
                                                                    setShowTools(false);
                                                                } else {
                                                                    setSelectedTool(tool);
                                                                    setShowTools(false);
                                                                }
                                                            }}
                                                            className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-xl transition-all duration-200 cursor-pointer group hover:shadow-sm border border-transparent hover:border-border/50"
                                                        >
                                                            <div className="flex items-center gap-2 flex-1">
                                                                {tool.icon}
                                                                <span className="text-sm font-medium text-foreground tracking-tight leading-tight whitespace-nowrap group-hover:text-foreground transition-colors">
                                                                    {tool.label}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    </DropdownMenuItem>
                                                ))}
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    {selectedTool && (
                                        <motion.button
                                            type="button"
                                            onClick={() => {
                                                setSelectedTool(null);
                                                if (selectedTool.id === 'translate') {
                                                    setTranslateLanguages(null);
                                                } else if (selectedTool.id === 'doc-generate') {
                                                    setIsDocumentModalOpen(false);
                                                }
                                            }}
                                            disabled={disabled}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={{ duration: 0.2, type: "spring", stiffness: 260, damping: 25 }}
                                            className={cn(
                                                "w-5 h-5 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15 transition-colors flex items-center justify-center shrink-0",
                                                disabled && "cursor-not-allowed opacity-50"
                                            )}
                                        >
                                            <X className="w-3 h-3 text-foreground/60 dark:text-white/60" />
                                        </motion.button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 overflow-y-auto max-h-[120px] sm:max-h-[200px]">
                            <Textarea
                                id="ai-input"
                                value={value}
                                placeholder={
                                    mode === 'agentic'
                                        ? "Ask Nyay Mitra Agent"
                                        : "Ask LegalAI"
                                }
                                className="w-full min-h-[52px] sm:min-h-[60px] rounded-none sm:rounded-[32px] sm:rounded-b-none px-5 py-5 bg-transparent dark:bg-transparent border-0 border-none border-transparent shadow-none text-foreground placeholder:text-foreground/50 resize-none focus-visible:ring-0 focus-visible:border-none focus-visible:ring-offset-0 leading-relaxed text-base"
                                ref={textareaRef}
                                disabled={disabled}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        if ((value.trim() || uploadedFiles.length > 0) && !disabled) {
                                            handleSubmit();
                                        }
                                    }
                                }}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    adjustHeight();
                                }}
                            />
                        </div>

                        {/* MOBILE: send button  */}
                        <div className="sm:hidden flex items-center px-2 py-2 shrink-0">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={(!value.trim() && uploadedFiles.length === 0) || disabled}
                                className={cn(
                                    "rounded-[28px] sm:rounded-[32px] p-2.5 transition-colors",
                                    (value.trim() || uploadedFiles.length > 0) && !disabled
                                        ? "bg-primary/80 text-primary-foreground cursor-pointer hover:bg-primary/90 dark:bg-primary/80"
                                        : "bg-muted dark:bg-zinc-800 text-muted-foreground/80 cursor-not-allowed"
                                )}
                            >
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                        <div className={cn(
                            "hidden sm:block h-12 bg-transparent transition-all duration-300",
                            uploadedFiles.length > 0 ? "rounded-b-none" : "rounded-b-3xl"
                        )}>
                            <div className="absolute left-3 bottom-3 flex items-center gap-2">
                                {mode === 'agentic' && (
                                    <label
                                        className={cn(
                                            "rounded-[28px] sm:rounded-[32px] p-2.5 transition-colors relative flex items-center justify-center",
                                            mode === 'agentic'
                                                ? "bg-black/5 dark:bg-white/5 text-foreground/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10"
                                                : "bg-muted text-muted-foreground/80 hover:bg-muted/80",
                                            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                        )}
                                        onClick={(e) => {
                                            if (disabled) {
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            disabled={disabled}
                                            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                                        />
                                        <Paperclip className="w-5 h-5 text-inherit" />
                                        {uploadedFiles.length > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                                                {uploadedFiles.length}
                                            </span>
                                        )}
                                    </label>
                                )}

                                {/* Detected language indicator */}
                                {(mode === 'agentic' || isLawyerModule) && detectedLanguage && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20"
                                    >
                                        <Languages className="w-3 h-3" />
                                        <span>{detectedLanguage.display_name}</span>
                                    </motion.div>
                                )}

                                {/* Detecting indicator */}
                                {(mode === 'agentic' || isLawyerModule) && isDetecting && !detectedLanguage && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-1 px-2 py-1 bg-muted-foreground/10 text-muted-foreground rounded-full text-xs font-medium border border-muted-foreground/20"
                                    >
                                        <Languages className="w-3 h-3 animate-pulse" />
                                        <span>Detecting...</span>
                                    </motion.div>
                                )}

                                {/* Translation language indicator */}
                                {translateLanguages && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium border border-blue-500/20">
                                        <Languages className="w-3 h-3" />
                                        <span>{translateLanguages.sourceName} → {translateLanguages.targetName}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTranslateLanguages(null);
                                                if (selectedTool?.id === 'translate') {
                                                    setSelectedTool(null);
                                                }
                                            }}
                                            className="ml-1 hover:bg-blue-500/20 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="w-2.5 h-2.5" />
                                        </button>
                                    </div>
                                )}

                                {mode === 'chat' && (
                                    <div className="flex items-center gap-2">
                                        {isLawyerModule && (
                                            <label
                                                className={cn(
                                                    "rounded-[28px] sm:rounded-[32px] p-2.5 transition-colors relative flex items-center justify-center",
                                                    "bg-muted dark:bg-zinc-800 text-muted-foreground/80 hover:bg-muted/80 dark:hover:bg-zinc-700/80",
                                                    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                                )}
                                                onClick={(e) => { if (disabled) e.preventDefault(); }}
                                            >
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    disabled={disabled}
                                                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                                                />
                                                <Paperclip className="w-5 h-5 text-inherit" />
                                                {uploadedFiles.length > 0 && (
                                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                                                        {uploadedFiles.length}
                                                    </span>
                                                )}
                                            </label>
                                        )}
                                        <DropdownMenu onOpenChange={setShowTools}>
                                            <DropdownMenuTrigger asChild disabled={disabled}>
                                                <button
                                                    type="button"
                                                    disabled={disabled}
                                                    className={cn(
                                                        "rounded-[28px] sm:rounded-[32px] transition-all flex items-center gap-2 px-2 py-1.5 border h-10",
                                                        selectedTool || showTools
                                                            ? "bg-primary/80 border-primary/80 text-primary-foreground dark:bg-primary/80 dark:border-primary/80"
                                                            : "border-transparent bg-muted dark:bg-zinc-800 text-muted-foreground/80 hover:bg-muted/80 dark:hover:bg-zinc-700/80",
                                                        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                                    )}
                                                >
                                                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                                        <motion.div
                                                            animate={{
                                                                rotate: showTools ? 180 : 0,
                                                                scale: showTools || selectedTool ? 1.1 : 1,
                                                            }}
                                                            whileHover={!disabled ? {
                                                                rotate: showTools ? 180 : 15,
                                                                scale: 1.1,
                                                                transition: {
                                                                    type: "spring",
                                                                    stiffness: 300,
                                                                    damping: 10,
                                                                },
                                                            } : {}}
                                                            transition={{
                                                                type: "spring",
                                                                stiffness: 260,
                                                                damping: 25,
                                                            }}
                                                        >
                                                            {selectedTool ? selectedTool.icon : (
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="18"
                                                                    height="18"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    className={cn(
                                                                        "w-5 h-5",
                                                                        showTools
                                                                            ? "text-primary-foreground"
                                                                            : "text-inherit"
                                                                    )}
                                                                >
                                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                                    <path d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5" />
                                                                </svg>
                                                            )}
                                                        </motion.div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {(showTools || selectedTool) && (
                                                            <motion.span
                                                                initial={{ width: 0, opacity: 0 }}
                                                                animate={{
                                                                    width: "auto",
                                                                    opacity: 1,
                                                                }}
                                                                exit={{ width: 0, opacity: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className={cn(
                                                                    "text-sm font-medium overflow-hidden whitespace-nowrap shrink-0",
                                                                    selectedTool || showTools ? "text-primary-foreground" : "text-inherit"
                                                                )}
                                                            >
                                                                {selectedTool ? selectedTool.label : "Tools"}
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                side="top"
                                                align="start"
                                                sideOffset={8}
                                                className="w-48 p-2 backdrop-blur-sm border border-border/60 rounded-2xl shadow-[4px_8px_12px_2px_rgba(0,0,0,0.1)] dark:shadow-[4px_8px_12px_2px_rgba(0,0,0,0.2)] bg-popover">

                                                <div className="space-y-1">
                                                    {tools.map((tool) => (
                                                        <DropdownMenuItem key={tool.id} asChild>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (tool.id === 'translate') {
                                                                        setSelectedTool(tool);
                                                                        setIsTranslateModalOpen(true);
                                                                        setShowTools(false);
                                                                    } else if (tool.id === 'doc-generate') {
                                                                        setSelectedTool(tool);
                                                                        setIsDocumentModalOpen(true);
                                                                        setShowTools(false);
                                                                    } else {
                                                                        setSelectedTool(tool);
                                                                        setShowTools(false);
                                                                    }
                                                                }}
                                                                className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-xl transition-all duration-200 cursor-pointer group hover:shadow-sm border border-transparent hover:border-border/50"
                                                            >
                                                                <div className="flex items-center gap-2 flex-1">
                                                                    {tool.icon}
                                                                    <span className="text-sm font-medium text-foreground tracking-tight leading-tight whitespace-nowrap group-hover:text-foreground transition-colors">
                                                                        {tool.label}
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        </DropdownMenuItem>
                                                    ))}
                                                </div>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        {selectedTool && (
                                            <motion.button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedTool(null);
                                                    if (selectedTool.id === 'translate') {
                                                        setTranslateLanguages(null);
                                                    } else if (selectedTool.id === 'doc-generate') {
                                                        setIsDocumentModalOpen(false);
                                                    }
                                                }}
                                                disabled={disabled}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, type: "spring", stiffness: 260, damping: 25 }}
                                                className={cn(
                                                    "w-6 h-6 rounded-full bg-muted dark:bg-zinc-800 hover:bg-muted/70 dark:hover:bg-zinc-700/70 transition-colors flex items-center justify-center",
                                                    disabled && "cursor-not-allowed opacity-50"
                                                )}
                                            >
                                                <X className="w-3 h-3 text-muted-foreground" />
                                            </motion.button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="absolute right-3 bottom-3">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={(!value.trim() && uploadedFiles.length === 0) || disabled}
                                    className={cn(
                                        "rounded-[28px] sm:rounded-[32px] p-2.5 transition-colors",
                                        (value.trim() || uploadedFiles.length > 0) && !disabled
                                            ? "bg-primary/80 text-primary-foreground cursor-pointer hover:bg-primary/90 dark:bg-primary/80"
                                            : "bg-muted dark:bg-zinc-800 text-muted-foreground/80 cursor-not-allowed"
                                    )}
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Extended container for uploaded files */}
                    <AnimatePresence mode="wait">
                        {uploadedFiles.length > 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-visible"
                            >
                                <div className="bg-transparent rounded-b-3xl overflow-visible">
                                    {/* Separator line */}
                                    <div className="h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent mx-4"></div>

                                    {/* Files container */}
                                    <div className="p-4 overflow-visible">
                                        <div className="flex flex-wrap gap-3">
                                            {uploadedFiles.map((file, index) => (
                                                <motion.div
                                                    key={file.id}
                                                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                                                    transition={{
                                                        duration: 0.2,
                                                        type: "spring",
                                                        stiffness: 300,
                                                        damping: 25,
                                                        delay: index * 0.05
                                                    }}
                                                    className="relative group"
                                                >
                                                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[9999]">
                                                        <div className="bg-popover text-popover-foreground px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg">
                                                            {file.name}
                                                            <div className="text-[10px] opacity-70 mt-0.5">
                                                                {formatFileSize(file.size)}
                                                            </div>
                                                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-popover rotate-45"></div>
                                                        </div>
                                                    </div>

                                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 hover:from-primary/20 hover:to-primary/10 dark:hover:from-primary/30 dark:hover:to-primary/20 border border-primary/20 dark:border-primary/30 flex items-center justify-center text-primary dark:text-primary transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 backdrop-blur-sm">
                                                        {getFileIcon(file.type)}
                                                    </div>

                                                    <button
                                                        onClick={() => removeFile(file.id)}
                                                        disabled={disabled}
                                                        className={cn(
                                                            "absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center opacity-100 scale-100 sm:opacity-0 sm:group-hover:opacity-100 sm:scale-90 sm:group-hover:scale-100 transition-all shadow-lg",
                                                            disabled && "cursor-not-allowed"
                                                        )}
                                                    >
                                                        <X className="w-3 h-3 text-white" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Mobile: translate language indicator */}
                {translateLanguages && (
                    <div className="sm:hidden mt-2 flex items-center justify-center">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium border border-blue-500/20">
                            <Languages className="w-3 h-3" />
                            <span>{translateLanguages.sourceName} → {translateLanguages.targetName}</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setTranslateLanguages(null);
                                    if (selectedTool?.id === 'translate') {
                                        setSelectedTool(null);
                                    }
                                }}
                                className="ml-1 hover:bg-blue-500/20 rounded-full p-0.5 transition-colors"
                            >
                                <X className="w-2.5 h-2.5" />
                            </button>
                        </div>
                    </div>
                )}

                {showModeIndicator && (
                    <div className="hidden sm:block mt-2 text-center">
                        <p className="text-xs text-foreground/50">
                            {mode === 'agentic'
                                ? "Agentic mode: AI with Document Analysis • Upload documents (PDF, DOC, TXT • Max 10MB)"
                                : "Chat mode: General conversation • With Added Tools"
                            }
                        </p>
                    </div>
                )}
            </div>

            <TranslateModal
                open={isTranslateModalOpen}
                onOpenChange={setIsTranslateModalOpen}
                onLanguageSelect={handleLanguageSelect}
            />

            <DocumentGenerationModal
                open={isDocumentModalOpen}
                onOpenChange={setIsDocumentModalOpen}
                onDocumentGenerated={onDocumentGenerationRequest}
            />

            {/* Hidden file input for both mobile and desktop */}
            <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
                disabled={disabled}
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                multiple
            />
        </div>
    );
}