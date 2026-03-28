"use client";

import * as React from "react";
import { X, User, Database, Bot, Info, ChevronRight, LogOut, Trash2, Download, ExternalLink, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils"; 
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; 
import { apiService, type UserProfile } from "@/lib/api.service";
import ExSwitch from "../../ui/switch";
import DeleteConfirmationModal from "./delete-confirmation-modal";
import TocDialog from "../../docs/terms/toc-dialog";
import PrivacyDialog from "../../docs/terms/privacy-dialog";
import { Meter } from "../../ui/meter";
import { Skeleton } from "@/components/ui/skeleton";

const CAPABILITIES_DATA = {
  name: "Nyay Mitra",
  version: "2.0.0",
  tools: [
    { name: "general_chat", description: "Answer general questions as a Legal AI assistant." },
    { name: "document_analysis", description: "Get analysis for a document." },
    { name: "rag_chat", description: "Answer questions about a document." },
    { name: "batch_questions", description: "Answer multiple questions about a document." },
    { name: "translate_text", description: "Translate text between languages." },
    { name: "document_generation", description: "Generate high quality legal documumets." },
  ],
  supported_languages: [{name:"en", description: "English"}, 
    {name:"bn", description: "Bengali" },
    {name:"hi", description: "Hindi" },
    {name:"fr", description: "French"},
    {name:"ur", description: "Urdu",}],
  
};

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOut?: () => void;
}

type TabValue = "profile" | "data" | "capabilities" | "about";

export default function SettingsModal({ open, onOpenChange, onSignOut }: SettingsModalProps) {
  const [activeTab, setActiveTab] = React.useState<TabValue>("profile");
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [userStats, setUserStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [tocOpen, setTocOpen] = React.useState(false);
  const [privacyOpen, setPrivacyOpen] = React.useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([
        apiService.getUserProfile(),
        apiService.getUserStats()
      ])
        .then(([profile, stats]) => {
          setUserProfile(profile);
          setUserStats(stats);
        })
        .catch(err => console.error("Failed to load data", err))
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleUpdatePreference = async (key: string, value: any) => {
    try {
        await apiService.updateUserProfile({ preferences: { ...userProfile?.preferences, [key]: value }});
        const updated = await apiService.getUserProfile();
        setUserProfile(updated);
    } catch(e) {
        console.error(e);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
            <div 
                className="w-full sm:max-w-4xl h-[92dvh] sm:h-[620px] sm:max-h-[90vh] bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row"
                role="dialog"
                aria-modal="true"
            >
        <div className="hidden sm:flex w-64 bg-sidebar border-r border-border flex-shrink-0 flex-col p-4">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-lg font-semibold text-foreground">Settings</h2>
          </div>

          <nav className="flex flex-col space-y-1 flex-1">
            <SidebarItem 
              active={activeTab === "profile"} 
              onClick={() => setActiveTab("profile")} 
              icon={<User className="w-4 h-4" />} 
              label="Profile" 
            />
            <SidebarItem 
              active={activeTab === "data"} 
              onClick={() => setActiveTab("data")} 
              icon={<Database className="w-4 h-4" />} 
              label="Data" 
            />
            <SidebarItem 
              active={activeTab === "capabilities"} 
              onClick={() => setActiveTab("capabilities")} 
              icon={<Bot className="w-4 h-4" />} 
              label="Capabilities" 
            />
            <SidebarItem 
              active={activeTab === "about"} 
              onClick={() => setActiveTab("about")} 
              icon={<Info className="w-4 h-4" />} 
              label="About" 
            />
          </nav>
        </div>

        <div className="flex-1 bg-card flex flex-col min-w-0 min-h-0">
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-muted" />
            </div>
            <div className="h-12 sm:h-14 border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="sm:hidden text-base font-semibold text-foreground">Settings</span>
                    <span className="hidden sm:block text-sm font-medium text-muted-foreground">
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </span>
                </div>
                <button 
                    onClick={() => onOpenChange(false)} 
                    className="text-muted-foreground hover:text-foreground hover:bg-accent p-2 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                {activeTab === "profile" && (
                    <div className="space-y-8 max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {loading ? (
                            <>
                                <div className="flex items-center gap-4 sm:gap-6">
                                    <Skeleton className="w-20 h-20 rounded-full bg-muted" />
                                    <div>
                                        <Skeleton className="h-6 w-32 mb-2 bg-muted" />
                                        <Skeleton className="h-4 w-48 bg-muted" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Display Name</label>
                                        <Skeleton className="w-full h-10 rounded-lg bg-muted" />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
                                        <Skeleton className="w-full h-10 rounded-lg bg-muted" />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border space-y-3">
                                    <button 
                                        onClick={onSignOut}
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border text-muted-foreground hover:bg-accent hover:border-border/80 transition-all group"
                                    >
                                        <span className="text-sm font-medium">Log out of all devices</span>
                                        <LogOut className="w-4 h-4 text-muted-foreground/60 group-hover:text-muted-foreground" />
                                    </button>
                                    <DeleteConfirmationModal
                                      trigger={
                                        <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-red-900/20 text-red-400 hover:bg-red-950/10 hover:border-red-900/40 transition-all group">
                                            <span className="text-sm font-medium">Delete account</span>
                                            <Trash2 className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                                        </button>
                                      }
                                      title="Delete Account"
                                      description="This action cannot be undone. Your account and all associated data will be permanently deleted."
                                      confirmText="DELETE MY ACCOUNT"
                                      onConfirm={async () => {
                                        await apiService.deleteAccount();
                                        onSignOut?.();
                                      }}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-4 sm:gap-6">
                                     <div className="relative group">
                                        <Avatar className="w-20 h-20 border-2 border-border">
                                            <AvatarFallback className="bg-muted text-muted-foreground text-xl">
                                                {userProfile?.name?.charAt(0) || <User />}
                                            </AvatarFallback>
                                        </Avatar>
                                    
                                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <span className="text-xs text-white">Change</span>
                                        </div>
                                     </div>
                                     <div>
                                        <h3 className="text-xl font-medium text-foreground">{userProfile?.name || "User"}</h3>
                                        <p className="text-muted-foreground text-sm">{userProfile?.email}</p>
                                     </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Display Name</label>
                                        <input 
                                            type="text" 
                                            defaultValue={userProfile?.name || ""}
                                            className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                        />
                                    </div>
                                     <div className="grid gap-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
                                        <input 
                                            type="text" 
                                            value={userProfile?.email || ""}
                                            disabled
                                            className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-muted-foreground cursor-not-allowed"
                                        />
                                    </div>
                                </div>


                                <div className="pt-4 border-t border-border space-y-3">
                                    <button 
                                        onClick={onSignOut}
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border text-muted-foreground hover:bg-accent hover:border-border/80 transition-all group"
                                    >
                                        <span className="text-sm font-medium">Log out of all devices</span>
                                        <LogOut className="w-4 h-4 text-muted-foreground/60 group-hover:text-muted-foreground" />
                                    </button>
                                    <DeleteConfirmationModal
                                      trigger={
                                        <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/10 hover:border-red-300 dark:hover:border-red-900/40 transition-all group">
                                            <span className="text-sm font-medium">Delete account</span>
                                            <Trash2 className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                                        </button>
                                      }
                                      title="Delete Account"
                                      description="This action cannot be undone. Your account and all associated data will be permanently deleted."
                                      confirmText="DELETE MY ACCOUNT"
                                      onConfirm={async () => {
                                        await apiService.deleteAccount();
                                        onSignOut?.();
                                      }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === "data" && (
                     <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">

                         <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground px-1">Export &amp; Delete</h4>
                            <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                                <div className="p-4 bg-muted/50 flex flex-wrap items-center gap-3 justify-between hover:bg-muted transition-colors">
                                    <div>
                                        <div className="text-sm font-medium text-foreground">Export data</div>
                                        <div className="text-xs text-muted-foreground">Download all your conversations and settings</div>
                                    </div>
                                    <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground border border-border rounded-lg hover:bg-accent transition-colors">
                                        <Download className="w-3 h-3" />
                                        Download
                                    </button>
                                </div>
                                <div className="p-4 bg-muted/50 flex flex-wrap items-center gap-3 justify-between hover:bg-red-50 dark:hover:bg-red-950/5 transition-colors group">
                                    <div>
                                        <div className="text-sm font-medium text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300">Delete all chats</div>
                                        <div className="text-xs text-muted-foreground">Permanently remove all conversation history</div>
                                    </div>
                                    <DeleteConfirmationModal
                                      trigger={
                                        <button className="px-3 py-1.5 text-xs font-medium text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-800/50 transition-colors">
                                          Delete all
                                        </button>
                                      }
                                      title="Delete All Chats"
                                      description="This action cannot be undone. All your conversation history will be permanently deleted."
                                      confirmText="DELETE ALL CHATS"
                                      onConfirm={async () => {
                                        await apiService.deleteAllConversations();
                                        alert("All conversations deleted.");
                                      }}
                                    />
                                </div>
                            </div>
                         </div>
                     </div>
                )}

                {activeTab === "capabilities" && (
                    <CapabilitiesTabContent userStats={userStats} />
                )}

                {activeTab === "about" && (
                    <div className="space-y-2 max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 px-2">Legal Information</h3>
                        <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                            <button onClick={() => setTocOpen(true)} className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors group">
                                <span className="text-sm font-medium text-foreground">Terms of Use</span>
                                <ExternalLink className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground" />
                            </button>
                            <button onClick={() => setPrivacyOpen(true)} className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors group">
                                <span className="text-sm font-medium text-foreground">Privacy Policy</span>
                                <ExternalLink className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground" />
                            </button>
                        </div>

                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 px-2 mt-6">What We Do</h3>
                        <div className="rounded-xl border border-border overflow-hidden">
                            <button 
                                onClick={() => window.open('/about', '_blank')} 
                                className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors group"
                            >
                                <span className="text-sm font-medium text-foreground">About Us</span>
                                <ExternalLink className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground" />
                            </button>
                        </div>

                         <div className="mt-8 px-2 text-center md:text-left">
                            <p className="text-xs text-muted-foreground">Nyay Mitra v{CAPABILITIES_DATA.version}</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">&copy; 2025 Legal AI. All rights reserved.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile bottom tab bar */}
            <div className="sm:hidden flex items-center border-t border-border bg-card shrink-0">
                <MobileTabItem active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={<User className="w-5 h-5" />} label="Profile" />
                <MobileTabItem active={activeTab === "data"} onClick={() => setActiveTab("data")} icon={<Database className="w-5 h-5" />} label="Data" />
                <MobileTabItem active={activeTab === "capabilities"} onClick={() => setActiveTab("capabilities")} icon={<Bot className="w-5 h-5" />} label="AI" />
                <MobileTabItem active={activeTab === "about"} onClick={() => setActiveTab("about")} icon={<Info className="w-5 h-5" />} label="About" />
            </div>
        </div>
      </div>
      <TocDialog open={tocOpen} onOpenChange={setTocOpen} />
      <PrivacyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </div>
  );
}

function SidebarItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                active 
                    ? "bg-card text-foreground shadow-sm ring-1 ring-border" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
        >
            {icon}
            <span>{label}</span>
            {active && <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />}
        </button>
    )
}

function MobileTabItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors",
                active
                    ? "text-primary"
                    : "text-muted-foreground"
            )}
        >
            <span className={cn("transition-transform duration-200", active && "scale-110")}>{icon}</span>
            <span>{label}</span>
        </button>
    )
}

function CapabilitiesTabContent({ userStats }: { userStats: any }) {
    const [selectedCapTab, setSelectedCapTab] = React.useState<"tools" | "system" | "stats">("tools");
    
    return (
        <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col gap-6">
                <div className="flex gap-2 p-1 bg-muted border border-border rounded-xl w-full sm:w-fit">
                    <button
                        onClick={() => setSelectedCapTab("tools")}
                        className={cn(
                            "flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-all outline-none",
                            selectedCapTab === "tools"
                                ? "text-foreground bg-card shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Tools
                    </button>
                    <button
                        onClick={() => setSelectedCapTab("system")}
                        className={cn(
                            "flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-all outline-none",
                            selectedCapTab === "system"
                                ? "text-foreground bg-card shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        System
                    </button>
                    <button
                        onClick={() => setSelectedCapTab("stats")}
                        className={cn(
                            "flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-all outline-none",
                            selectedCapTab === "stats"
                                ? "text-foreground bg-card shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Stats
                    </button>
                </div>
                
                {selectedCapTab === "tools" && (
                    <div className="flex-1 outline-none space-y-4">
                        <div className="grid gap-3 md:grid-cols-2">
                            {CAPABILITIES_DATA.tools.map((tool) => (
                                <div key={tool.name} className="p-4 rounded-xl border border-border bg-muted/50 hover:border-border/80 transition-colors">
                                    <div className="text-sm font-medium text-foreground mb-1 font-mono">{tool.name}</div>
                                    <div className="text-xs text-muted-foreground leading-relaxed">{tool.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {selectedCapTab === "system" && (
                    <div className="flex-1 outline-none space-y-6">
                        <div className="p-5 rounded-xl border border-border bg-muted/50">
                            <h3 className="text-sm font-medium text-foreground mb-4">Supported Languages (Beta)</h3>
                            <div className="flex flex-wrap gap-2">
                                {CAPABILITIES_DATA.supported_languages.map(lang => (
                                    <div key={lang.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent border border-border text-xs">
                                        <span className="font-mono uppercase font-semibold text-muted-foreground">{lang.name}</span>
                                        <span className="text-border">·</span>
                                        <span className="text-foreground">{lang.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                    </div>
                )}

                {selectedCapTab === "stats" && (
                    <div className="flex-1 outline-none space-y-6">
                        <div className="p-5 rounded-xl border border-border bg-muted/50 space-y-6">
                            <h3 className="text-sm font-medium text-foreground mb-4">Usage Statistics</h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <Meter 
                                        value={userStats?.documentAnalysisCount || 0} 
                                        max={10} 
                                        label="Document Analysis" 
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {10 - (userStats?.documentAnalysisCount || 0)} remaining
                                    </p>
                                </div>

                                <div>
                                    <Meter 
                                        value={userStats?.translationCount || 0} 
                                        max={100} 
                                        label="Translation" 
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {100 - (userStats?.translationCount || 0)} remaining
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Switch({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: (c: boolean) => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "w-11 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                checked ? "bg-primary" : "bg-muted"
            )}
        >
            <span
                className={cn(
                    "block w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-200 translate-y-0.5",
                    checked ? "translate-x-[22px]" : "translate-x-0.5"
                )}
            />
        </button>
    )
}