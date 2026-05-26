"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  X, User, Shield, CreditCard, Bell, Database, Info,
  ChevronRight, LogOut, Trash2, Download, ExternalLink,
  Plus, Check, AlertTriangle, Loader2, Archive
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiService, type LawyerUser } from "@/lib/api.service";
import { useUser } from "@/context/user-context";
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/citizen/misc/delete-confirmation-modal";
import TocDialog from "@/components/docs/terms/toc-dialog";
import PrivacyDialog from "@/components/docs/terms/privacy-dialog";
import ArchivedMattersModal from "./archived-matters-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATE_NAMES: Record<string, string> = {
  DELHI: "Delhi",
  MAHARASHTRA: "Maharashtra",
  KARNATAKA: "Karnataka",
  TAMIL_NADU: "Tamil Nadu",
  KERALA: "Kerala",
  GUJARAT: "Gujarat",
  RAJASTHAN: "Rajasthan",
  WEST_BENGAL: "West Bengal",
  ANDHRA_PRADESH: "Andhra Pradesh",
  TELANGANA: "Telangana",
  UTTAR_PRADESH: "Uttar Pradesh",
  BIHAR: "Bihar",
  PUNJAB_HARYANA: "Punjab & Haryana",
  MADHYA_PRADESH: "Madhya Pradesh",
  ODISHA: "Odisha",
  ASSAM: "Assam",
  GOA: "Goa",
  HIMACHAL: "Himachal Pradesh",
  SUPREME_COURT: "Supreme Court",
};

const BAR_NUMBER_PATTERNS: Record<string, { pattern: RegExp; example: string }> = {
  DELHI: { pattern: /^D\/\d{4}\/\d{4,6}$/i, example: 'D/2010/1234' },
  MAHARASHTRA: { pattern: /^MAH\/\d{4}\/\d{4,6}$/i, example: 'MAH/2010/12345' },
  KARNATAKA: { pattern: /^KAR\/\d{4}\/\d{4,6}$/i, example: 'KAR/2010/1234' },
  TAMIL_NADU: { pattern: /^TN\/\d{4}\/\d{4,6}$/i, example: 'TN/2010/1234' },
  KERALA: { pattern: /^KER\/\d{4}\/\d{4,6}$/i, example: 'KER/2010/1234' },
  GUJARAT: { pattern: /^GUJ\/\d{4}\/\d{4,6}$/i, example: 'GUJ/2010/1234' },
  RAJASTHAN: { pattern: /^RAJ\/\d{4}\/\d{4,6}$/i, example: 'RAJ/2010/1234' },
  WEST_BENGAL: { pattern: /^WB\/\d{4}\/\d{4,6}$/i, example: 'WB/2010/1234' },
  ANDHRA_PRADESH: { pattern: /^AP\/\d{4}\/\d{4,6}$/i, example: 'AP/2010/1234' },
  TELANGANA: { pattern: /^TS\/\d{4}\/\d{4,6}$/i, example: 'TS/2010/1234' },
  UTTAR_PRADESH: { pattern: /^UP\/\d{4}\/\d{4,6}$/i, example: 'UP/2010/1234' },
  BIHAR: { pattern: /^BIH\/\d{4}\/\d{4,6}$/i, example: 'BIH/2010/1234' },
  PUNJAB_HARYANA: { pattern: /^PH\/\d{4}\/\d{4,6}$/i, example: 'PH/2010/1234' },
  MADHYA_PRADESH: { pattern: /^MP\/\d{4}\/\d{4,6}$/i, example: 'MP/2010/1234' },
  ODISHA: { pattern: /^ORI\/\d{4}\/\d{4,6}$/i, example: 'ORI/2010/1234' },
  ASSAM: { pattern: /^ASM\/\d{4}\/\d{4,6}$/i, example: 'ASM/2010/1234' },
  GOA: { pattern: /^GOA\/\d{4}\/\d{4,6}$/i, example: 'GOA/2010/1234' },
  HIMACHAL: { pattern: /^HP\/\d{4}\/\d{4,6}$/i, example: 'HP/2010/1234' },
  SUPREME_COURT: { pattern: /^SC\/\d{4}\/\d{4,6}$/i, example: 'SC/2010/1234' },
};

interface LawyerSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: TabValue;
}

type TabValue = "profile" | "bar_verification" | "billing" | "data" | "about";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function LawyerSettingsModal({
  open,
  onOpenChange,
  initialTab = "profile"
}: LawyerSettingsModalProps) {
  const [activeTab, setActiveTab] = React.useState<TabValue>(initialTab);
  const [profile, setProfile] = React.useState<LawyerUser | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Form Fields
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [yearsOfExperience, setYearsOfExperience] = React.useState<number | "">("");
  const [practiceAreas, setPracticeAreas] = React.useState<string[]>([]);
  const [newArea, setNewArea] = React.useState("");

  // Verification Fields
  const [barNumber, setBarNumber] = React.useState("");
  const [barCouncilState, setBarCouncilState] = React.useState("");



  // Dialog states
  const [tocOpen, setTocOpen] = React.useState(false);
  const [privacyOpen, setPrivacyOpen] = React.useState(false);
  const [archivedOpen, setArchivedOpen] = React.useState(false);

  const { user, login, logout } = useUser();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      loadProfile();
    }
  }, [open, initialTab]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await apiService.getLawyerProfile();
      setProfile(data);
      setName(data.name || "");
      setPhone(data.phone || "");
      setYearsOfExperience(data.yearsOfExperience ?? "");
      setPracticeAreas(data.practiceAreas || []);
      setBarNumber(data.barNumber || "");
      setBarCouncilState(data.barCouncilState || "");


    } catch (err) {
      console.error("Failed to load lawyer profile", err);
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      const updated = await apiService.updateLawyerProfile({
        name: name.trim(),
        phone: phone.trim(),
        yearsOfExperience: yearsOfExperience === "" ? null : Number(yearsOfExperience),
        practiceAreas,
      });

      setProfile(updated);

      // Update local Context details
      if (user) {
        login({
          ...user,
          name: updated.name,
        });
      }

      toast.success("Profile saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile changes");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBarVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barNumber.trim() || !barCouncilState) {
      toast.error("Bar Number and State are required");
      return;
    }

    // Validate bar number pattern
    const patternEntry = BAR_NUMBER_PATTERNS[barCouncilState];
    if (patternEntry && !patternEntry.pattern.test(barNumber.trim())) {
      toast.error(`Invalid Bar Number format. Expected format: ${patternEntry.example}`);
      return;
    }

    setSaving(true);
    try {
      const updated = await apiService.updateLawyerProfile({
        barNumber: barNumber.trim(),
        barCouncilState,
      });

      setProfile(updated);
      toast.success("Bar verification details updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update bar verification details");
    } finally {
      setSaving(false);
    }
  };



  const handleAddPracticeArea = () => {
    const cleanArea = newArea.trim();
    if (cleanArea && !practiceAreas.includes(cleanArea)) {
      setPracticeAreas([...practiceAreas, cleanArea]);
      setNewArea("");
    }
  };

  const handleRemovePracticeArea = (area: string) => {
    setPracticeAreas(practiceAreas.filter(a => a !== area));
  };

  const handleExportData = () => {
    // Generate JSON file with profile info
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `lawyer_profile_export_${profile?.id || "data"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Profile data exported successfully");
  };

  const handleSignOutAll = () => {
    logout();
    onOpenChange(false);
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    await apiService.deleteAccount();
    logout();
    onOpenChange(false);
    window.location.href = "/";
  };

  if (!open || !mounted) return null;

  const isVerified = profile?.verificationStatus === "AUTO_VERIFIED" || profile?.verificationStatus === "MANUALLY_VERIFIED";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-4xl h-[92dvh] sm:h-[620px] sm:max-h-[90vh] bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row border border-border/40"
        role="dialog"
        aria-modal="true"
      >
        {/* Sidebar for Desktop */}
        <div className="hidden sm:flex w-64 bg-sidebar border-r border-border flex-shrink-0 flex-col p-4">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Settings</h2>
          </div>

          <nav className="flex flex-col space-y-1 flex-1">
            <SidebarItem
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
              icon={<User className="w-4 h-4" />}
              label="Profile"
            />
            <SidebarItem
              active={activeTab === "bar_verification"}
              onClick={() => setActiveTab("bar_verification")}
              icon={<Shield className="w-4 h-4" />}
              label="Bar Verification"
            />
            <SidebarItem
              active={activeTab === "billing"}
              onClick={() => setActiveTab("billing")}
              icon={<CreditCard className="w-4 h-4" />}
              label="Billing"
            />

            <SidebarItem
              active={activeTab === "data"}
              onClick={() => setActiveTab("data")}
              icon={<Database className="w-4 h-4" />}
              label="Data & Security"
            />
            <SidebarItem
              active={activeTab === "about"}
              onClick={() => setActiveTab("about")}
              icon={<Info className="w-4 h-4" />}
              label="About"
            />
          </nav>
        </div>

        {/* Modal content body */}
        <div className="flex-1 bg-card flex flex-col min-w-0 min-h-0">
          {/* Mobile drag handle */}
          <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-muted" />
          </div>

          <div className="h-12 sm:h-14 border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0">
            <div className="flex items-center gap-2">
              <span className="sm:hidden text-base font-semibold text-foreground">Settings</span>
              <span className="hidden sm:block text-sm font-medium text-muted-foreground">
                {activeTab === "bar_verification" ? "Bar Verification" : activeTab === "data" ? "Data & Security" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </span>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* PROFILE TAB */}
                {activeTab === "profile" && (
                  <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <Avatar className="w-16 h-16 border-2 border-border shadow-sm">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                          {profile ? getInitials(profile.name) : "CN"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{profile?.name}</h3>
                        <p className="text-muted-foreground text-xs">{profile?.email}</p>
                        {isVerified && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-500/10">
                            <Check className="w-3 h-3" /> Verified Practitioner
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                          required
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          value={profile?.email || ""}
                          disabled
                          className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-muted-foreground cursor-not-allowed text-sm"
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Years of Experience</label>
                        <input
                          type="number"
                          value={yearsOfExperience}
                          onChange={(e) => setYearsOfExperience(e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                          min={0}
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Practice Areas</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newArea}
                            onChange={(e) => setNewArea(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddPracticeArea();
                              }
                            }}
                            placeholder="Add e.g. Tax Law, Corporate"
                            className="flex-1 bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                          />
                          <button
                            type="button"
                            onClick={handleAddPracticeArea}
                            className="bg-primary hover:bg-primary/95 text-primary-foreground px-4 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {practiceAreas.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2 p-3 bg-muted/30 border border-border/40 rounded-xl">
                            {practiceAreas.map((area) => (
                              <span
                                key={area}
                                className="inline-flex items-center gap-1 bg-accent border border-border text-xs px-2.5 py-1 rounded-lg text-foreground font-medium"
                              >
                                {area}
                                <button
                                  type="button"
                                  onClick={() => handleRemovePracticeArea(area)}
                                  className="text-muted-foreground hover:text-foreground hover:bg-border/60 rounded p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end">
                      <button
                        type="submit"
                        className="bg-primary hover:bg-primary/95 text-primary-foreground font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                        disabled={saving}
                      >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}

                {/* BAR VERIFICATION TAB */}
                {activeTab === "bar_verification" && (
                  <form onSubmit={handleSaveBarVerification} className="space-y-6 max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-4 rounded-xl border border-border bg-muted/40">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Current Verification Status</h4>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border",
                          profile?.verificationStatus === "AUTO_VERIFIED" || profile?.verificationStatus === "MANUALLY_VERIFIED"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400"
                            : profile?.verificationStatus === "PENDING"
                              ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400"
                              : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
                        )}>
                          {profile?.verificationStatus === "AUTO_VERIFIED" || profile?.verificationStatus === "MANUALLY_VERIFIED" ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              VERIFIED
                            </>
                          ) : profile?.verificationStatus === "PENDING" ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              PENDING VERIFICATION
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5" />
                              VERIFICATION FAILED
                            </>
                          )}
                        </span>

                        <p className="text-xs text-muted-foreground">
                          {profile?.verificationStatus === "AUTO_VERIFIED" || profile?.verificationStatus === "MANUALLY_VERIFIED"
                            ? `Verified successfully. Credentials are fully validated.`
                            : profile?.verificationStatus === "PENDING"
                              ? `Verification is currently in progress. We verify Bar Council records automatically.`
                              : `Format failed or rejected. Please verify the bar council state and number formatting below.`
                          }
                        </p>
                      </div>
                    </div>

                    {isVerified && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs rounded-xl flex gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong>Warning:</strong> Modifying details below will reset your verification status to PENDING until re-validated.
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="grid gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bar Council State</label>
                        <Select value={barCouncilState} onValueChange={setBarCouncilState}>
                          <SelectTrigger className="w-full bg-muted border border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-sm h-10 shadow-none hover:bg-muted/80 justify-between">
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent position="popper" side="bottom" className="z-50 bg-popover border border-border rounded-xl shadow-lg max-h-[300px]">
                            {Object.entries(STATE_NAMES).map(([key, label]) => (
                              <SelectItem key={key} value={key} className="text-sm cursor-pointer">
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bar Registration Number</label>
                        <input
                          type="text"
                          value={barNumber}
                          onChange={(e) => setBarNumber(e.target.value)}
                          placeholder="e.g. D/1020/2015"
                          className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                        />
                        {barCouncilState && BAR_NUMBER_PATTERNS[barCouncilState] && (
                          <p className="text-[11px] text-muted-foreground">
                            Format example for {STATE_NAMES[barCouncilState]}: <code className="bg-muted px-1.5 py-0.5 rounded border border-border text-foreground font-mono">{BAR_NUMBER_PATTERNS[barCouncilState].example}</code>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end">
                      <button
                        type="submit"
                        className="bg-primary hover:bg-primary/95 text-primary-foreground font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                        disabled={saving}
                      >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Details
                      </button>
                    </div>
                  </form>
                )}

                {/* BILLING TAB */}
                {activeTab === "billing" && (
                  <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-5 border border-border rounded-2xl bg-muted/30 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 dark:bg-primary/20 px-2.5 py-1 rounded-full">Active Plan</span>
                          <h4 className="text-2xl font-bold text-foreground mt-3">Professional</h4>
                          <p className="text-muted-foreground text-xs mt-1">For active legal practitioners &amp; litigators.</p>
                          <ul className="text-xs text-foreground space-y-2 mt-4">
                            <li className="flex items-center gap-2">✓ Unlimited Matters &amp; Clients</li>
                            <li className="flex items-center gap-2">✓ Professional Document generation</li>
                            <li className="flex items-center gap-2">✓ Priority Case RAG analysis</li>
                          </ul>
                        </div>
                        <div className="pt-6">
                          <p className="text-xs text-muted-foreground">Renews automatically on <strong className="text-foreground">June 15, 2026</strong></p>
                        </div>
                      </div>

                      <div className="p-5 border border-border rounded-2xl bg-card flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">Billing Overview</h4>
                          <div className="mt-4 space-y-3">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Monthly Charge</span>
                              <span className="font-semibold text-foreground">$49.00 / mo</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Payment Method</span>
                              <span className="font-semibold text-foreground">Visa ending in 4242</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-6">
                          <button
                            type="button"
                            onClick={() => toast.success("Redirecting to billing portal...")}
                            className="w-full text-center bg-accent hover:bg-accent/80 text-foreground font-semibold py-2 px-4 rounded-xl text-xs border border-border/80 transition-colors cursor-pointer"
                          >
                            Manage Subscription
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Billing History</h4>
                      <div className="border border-border/80 rounded-xl overflow-hidden divide-y divide-border/60">
                        <div className="flex items-center justify-between p-3 bg-muted/40 text-xs">
                          <div>
                            <p className="font-semibold text-foreground">Invoice #INV-00892</p>
                            <p className="text-[10px] text-muted-foreground">May 15, 2026</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium text-foreground">$49.00</span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/10 font-bold">PAID</span>
                            <button
                              onClick={() => toast.success("Invoice downloaded")}
                              className="text-muted-foreground hover:text-foreground p-1 rounded"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/40 text-xs">
                          <div>
                            <p className="font-semibold text-foreground">Invoice #INV-00821</p>
                            <p className="text-[10px] text-muted-foreground">Apr 15, 2026</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium text-foreground">$49.00</span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/10 font-bold">PAID</span>
                            <button
                              onClick={() => toast.success("Invoice downloaded")}
                              className="text-muted-foreground hover:text-foreground p-1 rounded"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}



                {/* DATA & SECURITY TAB */}
                {activeTab === "data" && (
                  <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground px-1">Export &amp; Security</h4>
                      <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                        <div className="p-4 bg-muted/30 flex flex-wrap items-center gap-3 justify-between hover:bg-muted/50 transition-colors">
                          <div>
                            <div className="text-sm font-semibold text-foreground">Archived Matters</div>
                            <div className="text-xs text-muted-foreground">View and restore matters that you have archived.</div>
                          </div>
                          <button
                            onClick={() => setArchivedOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-foreground border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer bg-card"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            View Archived
                          </button>
                        </div>
                        <div className="p-4 bg-muted/30 flex flex-wrap items-center gap-3 justify-between hover:bg-muted/50 transition-colors">
                          <div>
                            <div className="text-sm font-semibold text-foreground">Export Account Info</div>
                            <div className="text-xs text-muted-foreground">Download a JSON file containing all profile and registration details.</div>
                          </div>
                          <button
                            onClick={handleExportData}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-foreground border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer bg-card"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download JSON
                          </button>
                        </div>
                        <div className="p-4 bg-muted/30 flex flex-wrap items-center gap-3 justify-between hover:bg-muted/50 transition-colors">
                          <div>
                            <div className="text-sm font-semibold text-foreground">Log out of all devices</div>
                            <div className="text-xs text-muted-foreground">Forces session terminations on other mobile and browser devices.</div>
                          </div>
                          <button
                            onClick={handleSignOutAll}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground border border-border rounded-lg hover:bg-accent hover:text-foreground transition-colors cursor-pointer bg-card"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Log Out All
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-red-500/80 px-1">Danger Zone</h4>
                      <div className="rounded-xl border border-red-500/10 bg-red-500/5 overflow-hidden p-4 flex flex-wrap items-center gap-3 justify-between hover:bg-red-500/10 transition-all border-dashed">
                        <div>
                          <div className="text-sm font-semibold text-red-600 dark:text-red-400">Delete Lawyer Account</div>
                          <div className="text-xs text-muted-foreground max-w-md">Permanently deletes your account credentials, case records, files, and billing details. This action is irreversible.</div>
                        </div>
                        <DeleteConfirmationModal
                          trigger={
                            <button className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer border-0">
                              Delete Account
                            </button>
                          }
                          title="Delete Lawyer Account"
                          description="Are you absolutely sure? This will permanently delete your attorney profile, case files, matter workspaces, and active billing subscription."
                          confirmText="DELETE ATTORN-PROFILE"
                          onConfirm={handleDeleteAccount}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ABOUT TAB */}
                {activeTab === "about" && (
                  <div className="space-y-6 max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Legal Agreements</h3>
                      <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                        <button
                          onClick={() => setTocOpen(true)}
                          className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
                        >
                          <span className="text-sm font-semibold text-foreground">Terms of Service</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground" />
                        </button>
                        <button
                          onClick={() => setPrivacyOpen(true)}
                          className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
                        >
                          <span className="text-sm font-semibold text-foreground">Privacy Policy</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">About Us</h3>
                      <div className="rounded-xl border border-border overflow-hidden">
                        <button
                          onClick={() => window.open('/about', '_blank')}
                          className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
                        >
                          <span className="text-sm font-semibold text-foreground">About LegalAI</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 text-center sm:text-left px-1">
                      <p className="text-xs text-muted-foreground">LegalAI Workspace v1.2.0</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">&copy; 2026 LegalAI Services Inc. All rights reserved.</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Bottom Tab Navigation */}
          <div className="sm:hidden flex items-center border-t border-border bg-card shrink-0">
            <MobileTabItem active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={<User className="w-5 h-5" />} label="Profile" />
            <MobileTabItem active={activeTab === "bar_verification"} onClick={() => setActiveTab("bar_verification")} icon={<Shield className="w-5 h-5" />} label="Bar" />
            <MobileTabItem active={activeTab === "billing"} onClick={() => setActiveTab("billing")} icon={<CreditCard className="w-5 h-5" />} label="Billing" />
            <MobileTabItem active={activeTab === "data"} onClick={() => setActiveTab("data")} icon={<Database className="w-5 h-5" />} label="Data" />
            <MobileTabItem active={activeTab === "about"} onClick={() => setActiveTab("about")} icon={<Info className="w-5 h-5" />} label="About" />
          </div>
        </div>
      </div>

      <TocDialog open={tocOpen} onOpenChange={setTocOpen} />
      <PrivacyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
      <ArchivedMattersModal open={archivedOpen} onOpenChange={setArchivedOpen} />
    </div>,
    document.body
  );
}

function SidebarItem({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
        active
          ? "bg-card text-foreground shadow-sm ring-1 ring-border"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      {icon}
      <span>{label}</span>
      {active && <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />}
    </button>
  );
}

function MobileTabItem({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-semibold transition-colors cursor-pointer",
        active ? "text-primary" : "text-muted-foreground"
      )}
    >
      <span className={cn("transition-transform duration-200", active && "scale-110")}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

