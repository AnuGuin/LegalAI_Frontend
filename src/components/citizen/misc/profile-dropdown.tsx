"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Settings, CreditCard, FileText, LogOut, User, Palette } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import TocDialog from "../../docs/terms/toc-dialog";
import SettingsModal from "./settings-modal";

interface Profile {
    name: string;
    email: string;
    avatar?: string;
    subscription?: string;
    model?: string;
}

interface MenuItem {
    label: string;
    value?: string;
    href: string;
    icon: React.ReactNode;
    external?: boolean;
    iconRight?: React.ReactNode;
}

const SAMPLE_PROFILE_DATA: Profile = {
    name: "Eugene An",
    email: "eugene@kokonutui.com",
    avatar: "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/profile-mjss82WnWBRO86MHHGxvJ2TVZuyrDv.jpeg",
    subscription: "PRO",
};

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
    data?: Profile;
    showTopbar?: boolean;
    showUserDetails?: boolean;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    alignOffset?: number;
    onSignOut?: () => void;
}

export default function ProfileDropdown({
    data = SAMPLE_PROFILE_DATA,
    className,
    showUserDetails = true,
    side = "right",
    align = "end",
    sideOffset = 4,
    alignOffset = 0,
    onSignOut,
    ...props
}: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [themesOpen, setThemesOpen] = React.useState(false);
    const [tocOpen, setTocOpen] = React.useState(false);
    const [settingsOpen, setSettingsOpen] = React.useState(false);
    const { theme, setTheme } = useTheme();
    
    const menuItems: MenuItem[] = [
        {
            label: "Settings",
            href: "#",
            icon: <Settings className="w-4 h-4 text-foreground" />,
        },
        {
            label: "Themes",
            href: "#",
            icon: <Palette className="w-4 h-4 text-foreground" />,
        },
        {
            label: "Subscription",
            value: data.subscription,
            href: "#",
            icon: <CreditCard className="w-4 h-4 text-foreground" />,
        },
        {
            label: "Terms & Policies",
            href: "#",
            icon: <FileText className="w-4 h-4 text-foreground" />,
        },
    ];

    return (
        <div className={cn("relative", className)} {...props}>
            <DropdownMenu onOpenChange={setIsOpen}>
                <div className="group relative">
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className={cn(
                                "flex items-center rounded-2xl  transition-all duration-200 focus:outline-none hover:bg-accent",
                                showUserDetails ? "gap-3 p-3 w-full" : "p-2 w-fit justify-center"
                            )}
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-violet-400 p-0.5">
                                    <Avatar className="w-full h-full">
                                        {data.avatar ? (
                                            <AvatarImage src={data.avatar} alt={data.name} className="rounded-full" />
                                        ) : (
                                            <AvatarFallback className="bg-background text-muted-foreground rounded-full">
                                                <User className="w-5 h-5" />
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                </div>
                            </div>
                            {showUserDetails && (
                                <div className="text-left flex-1 min-w-0">
                                    <div className="text-sm font-medium text-foreground tracking-tight leading-tight truncate">
                                        {data.name}
                                    </div>
                                </div>
                            )}
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        side={side}
                        align={align}
                        sideOffset={sideOffset}
                        alignOffset={alignOffset}
                        className="z-50 w-56 p-2 backdrop-blur-sm border border-border/60 rounded-2xl shadow-[4px_8px_12px_2px_rgba(0,0,0,0.1)] dark:shadow-[4px_8px_12px_2px_rgba(0,0,0,0.2)] bg-popover
                    data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                    >

                        {/* Menu Items */}
                        <div className="space-y-1 py-2">
                            {menuItems.map((item) => {
                                if (item.label === "Settings") {
                                    return (
                                        <DropdownMenuItem key={item.label} className="flex items-center p-2 rounded-xl transition-all duration-200 cursor-pointer group border border-transparent
                                                hover:bg-accent
                                                hover:border-border/50 hover:shadow-sm
                                                focus:bg-accent
                                                focus:text-accent-foreground w-full">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSettingsOpen(true);
                                                    setIsOpen(false);
                                                }}
                                                className="flex items-center gap-2 flex-1"
                                            >
                                                {item.icon}
                                                <span className="text-sm font-medium text-foreground tracking-tight leading-tight whitespace-nowrap group-hover:text-foreground transition-colors">
                                                    {item.label}
                                                </span>
                                            </button>
                                        </DropdownMenuItem>
                                    );
                                } else if (item.label === "Themes") {
                                    return (
                                        <DropdownMenuSub key={item.label} open={themesOpen} onOpenChange={setThemesOpen}>
                                            <DropdownMenuSubTrigger
                                                onMouseEnter={() => setThemesOpen(true)}
                                                className="flex items-center p-2 rounded-xl transition-all duration-200 cursor-pointer group border border-transparent 
                                                hover:bg-accent
                                                hover:border-border/50 hover:shadow-sm
                                                focus:bg-accent 
                                                data-[state=open]:bg-accent
                                                focus:text-accent-foreground
                                                data-[state=open]:text-accent-foreground
                                                w-full"
                                            >
                                                <div className="flex items-center gap-2 flex-1">
                                                    {item.icon}
                                                    <span className="text-sm font-medium text-foreground tracking-tight leading-tight whitespace-nowrap group-hover:text-foreground transition-colors">
                                                        {item.label}
                                                    </span>
                                                </div>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent
                                                    sideOffset={4}
                                                    className="w-32 p-2 backdrop-blur-sm border border-border/60 rounded-2xl shadow-[4px_8px_12px_2px_rgba(0,0,0,0.1)] dark:shadow-[4px_8px_12px_2px_rgba(0,0,0,0.2)] bg-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                                                >
                                                    <DropdownMenuRadioGroup value={theme}>
                                                        <DropdownMenuRadioItem
                                                            value="light"
                                                            onClick={() => setTheme("light")}
                                                            className="text-sm font-medium text-foreground tracking-tight leading-tight"
                                                        >
                                                            Light
                                                        </DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem
                                                            value="dark"
                                                            onClick={() => setTheme("dark")}
                                                            className="text-sm font-medium text-foreground tracking-tight leading-tight"
                                                        >
                                                            Dark
                                                        </DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem
                                                            value="system"
                                                            onClick={() => setTheme("system")}
                                                            className="text-sm font-medium text-foreground tracking-tight leading-tight"
                                                        >
                                                            System
                                                        </DropdownMenuRadioItem>
                                                    </DropdownMenuRadioGroup>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                    );
                                } else if (item.label === "Terms & Policies") {
                                    return (
                                        <DropdownMenuItem key={item.label} className="flex items-center p-2 rounded-xl transition-all duration-200 cursor-pointer group border border-transparent
                                                hover:bg-accent
                                                hover:border-border/50 hover:shadow-sm
                                                focus:bg-accent
                                                focus:text-accent-foreground w-full">
                                            <button
                                                type="button"
                                                onClick={() => setTocOpen(true)}
                                                className="flex items-center gap-2 flex-1"
                                            >
                                                {item.icon}
                                                <span className="text-sm font-medium text-foreground tracking-tight leading-tight whitespace-nowrap group-hover:text-foreground transition-colors">
                                                    {item.label}
                                                </span>
                                            </button>
                                        </DropdownMenuItem>
                                    );
                                } else {
                                    return (
                                        <DropdownMenuItem key={item.label} asChild className="flex items-center p-2 rounded-xl transition-all duration-200 cursor-pointer group border border-transparent
                                                hover:bg-accent
                                                hover:border-border/50 hover:shadow-sm
                                                focus:bg-accent
                                                focus:text-accent-foreground w-full">
                                            <Link
                                                href={item.href}
                                            >
                                                <div className="flex items-center gap-2 flex-1">
                                                    {item.icon}
                                                    <span className="text-sm font-medium text-foreground tracking-tight leading-tight whitespace-nowrap group-hover:text-foreground transition-colors">
                                                        {item.label}
                                                    </span>
                                                </div>
                                                <div className="flex-shrink-0 ml-auto">
                                                    {item.value && (
                                                        <span
                                                            className={cn(
                                                                "text-xs font-medium rounded-md py-1 px-2 tracking-tight",
                                                                item.label === "Model"
                                                                    ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 border border-blue-500/10"
                                                                    : "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10 border border-purple-500/10"
                                                            )}
                                                        >
                                                            {item.value}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                        </DropdownMenuItem>
                                    );
                                }
                            })}
                        </div>

                        <DropdownMenuSeparator className="mx-2 bg-gradient-to-r from-transparent via-border to-transparent" />

                        <DropdownMenuItem asChild className="w-full flex items-center gap-2 p-2 rounded-xl cursor-pointer border border-transparent transition-all group
                                hover:bg-accent
                                focus:bg-accent
                                focus:text-accent-foreground">
                            <button
                                type="button"
                                onClick={onSignOut}
                            >
                                <LogOut className="w-4 h-4 text-foreground group-hover:text-red-600/80" />
                                <span className="text-sm font-medium text-foreground group-hover:text-red-600/80">
                                    Sign Out
                                </span>
                            </button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </div>
            </DropdownMenu>
            <TocDialog open={tocOpen} onOpenChange={setTocOpen} />
            <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} onSignOut={onSignOut} />
        </div>
    );
}