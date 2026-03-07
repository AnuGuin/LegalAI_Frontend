"use client";

import * as React from "react";
import { X, User, Database, Bot, Info, ChevronRight, LogOut, Trash2, Download, ExternalLink, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils"; 
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; 
import { apiService, type UserProfile } from "@/lib/api.service";
import ExSwitch from "../ui/switch";
import DeleteConfirmationModal from "./delete-confirmation-modal";
import TocDialog from "../docs/terms/toc-dialog";
import PrivacyDialog from "../docs/terms/privacy-dialog";
import { Meter } from "../ui/meter";
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
        className="w-full sm:max-w-4xl h-[92dvh] sm:h-[620px] sm:max-h-[90vh] bg-white dark:bg-[#1e1e1e] border-0 sm:border border-slate-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row"
        role="dialog"
        aria-modal="true"
      >
        <div className="hidden sm:flex w-64 bg-slate-50 dark:bg-[#18181b] border-r border-slate-200 dark:border-zinc-800 flex-shrink-0 flex-col p-4">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Settings</h2>
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

        <div className="flex-1 bg-white dark:bg-[#1e1e1e] flex flex-col min-w-0 min-h-0">
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-zinc-700" />
            </div>
            <div className="h-12 sm:h-14 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-6 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="sm:hidden text-base font-semibold text-slate-900 dark:text-zinc-100">Settings</span>
                    <span className="hidden sm:block text-sm font-medium text-slate-500 dark:text-zinc-400">
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </span>
                </div>
                <button 
                    onClick={() => onOpenChange(false)} 
                    className="text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 p-2 rounded-full transition-colors"
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
                                    <Skeleton className="w-20 h-20 rounded-full bg-slate-200 dark:bg-neutral-700" />
                                    <div>
                                        <Skeleton className="h-6 w-32 mb-2 bg-slate-200 dark:bg-neutral-700" />
                                        <Skeleton className="h-4 w-48 bg-slate-200 dark:bg-neutral-700" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <label className="text-xs font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Display Name</label>
                                        <Skeleton className="w-full h-10 rounded-lg bg-slate-200 dark:bg-neutral-700" />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-xs font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Email Address</label>
                                        <Skeleton className="w-full h-10 rounded-lg bg-slate-200 dark:bg-neutral-700" />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-3">
                                    <button 
                                        onClick={onSignOut}
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-all group"
                                    >
                                        <span className="text-sm font-medium">Log out of all devices</span>
                                        <LogOut className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300" />
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
                                        <Avatar className="w-20 h-20 border-2 border-slate-200 dark:border-zinc-700">
                                            <AvatarFallback className="bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-xl">
                                                {userProfile?.name?.charAt(0) || <User />}
                                            </AvatarFallback>
                                        </Avatar>
                                    
                                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <span className="text-xs text-white">Change</span>
                                        </div>
                                     </div>
                                     <div>
                                        <h3 className="text-xl font-medium text-slate-900 dark:text-zinc-100">{userProfile?.name || "User"}</h3>
                                        <p className="text-slate-500 dark:text-zinc-500 text-sm">{userProfile?.email}</p>
                                     </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <label className="text-xs font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Display Name</label>
                                        <input 
                                            type="text" 
                                            defaultValue={userProfile?.name || ""}
                                            className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                        />
                                    </div>
                                     <div className="grid gap-2">
                                        <label className="text-xs font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Email Address</label>
                                        <input 
                                            type="text" 
                                            value={userProfile?.email || ""}
                                            disabled
                                            className="w-full bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-slate-400 dark:text-zinc-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>


                                <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-3">
                                    <button 
                                        onClick={onSignOut}
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-all group"
                                    >
                                        <span className="text-sm font-medium">Log out of all devices</span>
                                        <LogOut className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300" />
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
                         {(() => {
                           const checked = userProfile?.preferences?.enhanceModel ?? true;
                           return (
                             <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/30 flex items-start gap-4 justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-slate-800 dark:text-zinc-200">Enhance model for all users</h4>
                                    <p className="text-xs text-slate-500 dark:text-zinc-500 max-w-sm">Allow your content to train our models and improve services. We protect your data privacy.</p>
                                </div>
                                <div className="flex-shrink-0 mt-0.5">
                                    <ExSwitch
                                        checked={checked} 
                                        onCheckedChange={(c: boolean) => handleUpdatePreference('enhanceModel', c)} 
                                    />
                                </div>
                             </div>
                           );
                         })()}

                         <div className="space-y-2">
                            <h4 className="text-sm font-medium text-slate-500 dark:text-zinc-400 px-1">Export & Delete</h4>
                            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 divide-y divide-slate-200 dark:divide-zinc-800 overflow-hidden">
                                <div className="p-4 bg-slate-50 dark:bg-zinc-900/20 flex flex-wrap items-center gap-3 justify-between hover:bg-slate-100 dark:hover:bg-zinc-900/40 transition-colors">
                                    <div>
                                        <div className="text-sm font-medium text-slate-800 dark:text-zinc-200">Export data</div>
                                        <div className="text-xs text-slate-500 dark:text-zinc-500">Download all your conversations and settings</div>
                                    </div>
                                    <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors">
                                        <Download className="w-3 h-3" />
                                        Download
                                    </button>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-zinc-900/20 flex flex-wrap items-center gap-3 justify-between hover:bg-red-50 dark:hover:bg-red-950/5 transition-colors group">
                                    <div>
                                        <div className="text-sm font-medium text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300">Delete all chats</div>
                                        <div className="text-xs text-slate-500 dark:text-zinc-500">Permanently remove all conversation history</div>
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
                        <h3 className="text-xs font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-4 px-2">Legal Information</h3>
                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 divide-y divide-slate-200 dark:divide-zinc-800 overflow-hidden">
                            <button onClick={() => setTocOpen(true)} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/20 hover:bg-slate-100 dark:hover:bg-zinc-900/40 transition-colors group">
                                <span className="text-sm font-medium text-slate-800 dark:text-zinc-200">Terms of Use</span>
                                <ExternalLink className="w-4 h-4 text-slate-400 dark:text-zinc-600 group-hover:text-slate-600 dark:group-hover:text-zinc-400" />
                            </button>
                            <button onClick={() => setPrivacyOpen(true)} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/20 hover:bg-slate-100 dark:hover:bg-zinc-900/40 transition-colors group">
                                <span className="text-sm font-medium text-slate-800 dark:text-zinc-200">Privacy Policy</span>
                                <ExternalLink className="w-4 h-4 text-slate-400 dark:text-zinc-600 group-hover:text-slate-600 dark:group-hover:text-zinc-400" />
                            </button>
                        </div>

                        <h3 className="text-xs font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-4 px-2 mt-6">What We Do</h3>
                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
                            <button 
                                onClick={() => window.open('/about', '_blank')} 
                                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/20 hover:bg-slate-100 dark:hover:bg-zinc-900/40 transition-colors group"
                            >
                                <span className="text-sm font-medium text-slate-800 dark:text-zinc-200">About Us</span>
                                <ExternalLink className="w-4 h-4 text-slate-400 dark:text-zinc-600 group-hover:text-slate-600 dark:group-hover:text-zinc-400" />
                            </button>
                        </div>

                         <div className="mt-8 px-2 text-center md:text-left">
                            <p className="text-xs text-slate-500 dark:text-zinc-600">Nyay Mitra v{CAPABILITIES_DATA.version}</p>
                            <p className="text-xs text-slate-400 dark:text-zinc-700 mt-1">&copy; 2025 Legal AI. All rights reserved.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile bottom tab bar */}
            <div className="sm:hidden flex items-center border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1e1e1e] shrink-0">
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
                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-zinc-700" 
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/50"
            )}
        >
            {icon}
            <span>{label}</span>
            {active && <ChevronRight className="w-4 h-4 ml-auto text-slate-400 dark:text-zinc-500" />}
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
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-zinc-500"
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
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl w-full sm:w-fit">
                    <button
                        onClick={() => setSelectedCapTab("tools")}
                        className={cn(
                            "flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-all outline-none",
                            selectedCapTab === "tools"
                                ? "text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 shadow-sm"
                                : "text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-400"
                        )}
                    >
                        Tools
                    </button>
                    <button
                        onClick={() => setSelectedCapTab("system")}
                        className={cn(
                            "flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-all outline-none",
                            selectedCapTab === "system"
                                ? "text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 shadow-sm"
                                : "text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-400"
                        )}
                    >
                        System
                    </button>
                    <button
                        onClick={() => setSelectedCapTab("stats")}
                        className={cn(
                            "flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-all outline-none",
                            selectedCapTab === "stats"
                                ? "text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 shadow-sm"
                                : "text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-400"
                        )}
                    >
                        Stats
                    </button>
                </div>
                
                {selectedCapTab === "tools" && (
                    <div className="flex-1 outline-none space-y-4">
                        <div className="grid gap-3 md:grid-cols-2">
                            {CAPABILITIES_DATA.tools.map((tool) => (
                                <div key={tool.name} className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/20 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
                                    <div className="text-sm font-medium text-slate-800 dark:text-zinc-200 mb-1 font-mono">{tool.name}</div>
                                    <div className="text-xs text-slate-500 dark:text-zinc-500 leading-relaxed">{tool.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {selectedCapTab === "system" && (
                    <div className="flex-1 outline-none space-y-6">
                        <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/20">
                            <h3 className="text-sm font-medium text-slate-800 dark:text-zinc-200 mb-4">Supported Languages (Beta)</h3>
                            <div className="flex flex-wrap gap-2">
                                {CAPABILITIES_DATA.supported_languages.map(lang => (
                                    <div key={lang.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-xs">
                                        <span className="font-mono uppercase font-semibold text-slate-500 dark:text-zinc-400">{lang.name}</span>
                                        <span className="text-slate-300 dark:text-zinc-600">·</span>
                                        <span className="text-slate-700 dark:text-zinc-300">{lang.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                    </div>
                )}

                {selectedCapTab === "stats" && (
                    <div className="flex-1 outline-none space-y-6">
                        <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/20 space-y-6">
                            <h3 className="text-sm font-medium text-slate-800 dark:text-zinc-200 mb-4">Usage Statistics</h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <Meter 
                                        value={userStats?.documentAnalysisCount || 0} 
                                        max={10} 
                                        label="Document Analysis" 
                                    />
                                    <p className="text-xs text-slate-500 dark:text-zinc-500 mt-2">
                                        {10 - (userStats?.documentAnalysisCount || 0)} remaining
                                    </p>
                                </div>

                                <div>
                                    <Meter 
                                        value={userStats?.translationCount || 0} 
                                        max={100} 
                                        label="Translation" 
                                    />
                                    <p className="text-xs text-slate-500 dark:text-zinc-500 mt-2">
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
                "w-11 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
                checked ? "bg-blue-600" : "bg-slate-300 dark:bg-zinc-700"
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