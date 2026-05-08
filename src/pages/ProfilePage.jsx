import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    KeyRound,
    BadgeCheck,
    Stethoscope,
    CreditCard,
    Clock,
    EyeOff,
    Eye,
} from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSideBar from "./AppSideBar";

const API_URL = import.meta.env.VITE_API_URL;


function getInitials(first = "", last = "") {
    return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
    });
}

function calcAge(dob) {
    if (!dob) return null;
    return Math.floor(
        (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );
}


function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="relative flex items-start gap-3 py-2.5">
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium mt-0.5 break-words">{value || "—"}</p>
            </div>
        </div>
    );
}


// modal to change password
function ChangePasswordModal({ open, onClose }) {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // show/hide toggles per field
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (open) {
            setOldPassword(""); setNewPassword(""); setConfirmPass("");
            setError(null); setSuccess(false);
            setShowOld(false); setShowNew(false); setShowConfirm(false);
        }
    }, [open]);

    // clear error as soon as the user starts correcting anything
    function handleChange(setter) {
        return (e) => { setter(e.target.value); setError(null); };
    }

    function handleSubmit() {
        setError(null);
        if (!oldPassword || !newPassword || !confirmPass) {
            setError("All fields are required."); return;
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(newPassword)) {
            setError("Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character."); return;
        }
        if (newPassword !== confirmPass) {
            setError("New passwords do not match."); return;
        }
        if (oldPassword === newPassword) {
            setError("New password must be different from the old one."); return;
        }

        setLoading(true);
        fetch(`${API_URL}/profile/pwd`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", authorization: sessionStorage.getItem("token") },
            body: JSON.stringify({ new_password: newPassword, old_password: oldPassword }),
        })
            .then(r => { if (!r.ok) throw new Error("Incorrect current password."); setSuccess(true); })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        Change Password
                    </DialogTitle>
                    <DialogDescription>
                        Enter your current password and choose a new one.
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-6 flex flex-col items-center gap-3 text-center">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                            <BadgeCheck className="h-6 w-6 text-emerald-600" />
                        </div>
                        <p className="font-medium">Password updated successfully</p>
                        <Button className="w-full mt-2" onClick={() => onClose(false)}>Done</Button>
                    </div>
                ) : (
                    <div className="space-y-4 pt-1">
                        <PasswordField
                            handleChange={handleChange}
                            label="Current password"
                            value={oldPassword} setter={setOldPassword}
                            show={showOld} onToggle={() => setShowOld(v => !v)}
                        />
                        <PasswordField
                            handleChange={handleChange}
                            label="New password"
                            value={newPassword} setter={setNewPassword}
                            show={showNew} onToggle={() => setShowNew(v => !v)}
                        />
                        <PasswordField
                            handleChange={handleChange}
                            label="Confirm new password"
                            value={confirmPass} setter={setConfirmPass}
                            show={showConfirm} onToggle={() => setShowConfirm(v => !v)}
                            onKeyDown={e => e.key === "Enter" && handleSubmit()}
                        />

                        {error && <p className="text-sm text-destructive">{error}</p>}

                        <div className="flex gap-2 pt-1">
                            <Button variant="outline" className="flex-1" onClick={() => onClose(false)} disabled={loading}>
                                Cancel
                            </Button>
                            <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                                {loading ? "Updating…" : "Update password"}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// reusable password field with toggle
function PasswordField({ label, value, setter, show, onToggle, onKeyDown, handleChange }) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium">{label}</label>
            <div className="relative">
                <Input
                    type={show ? "text" : "password"}
                    placeholder="••••••••"
                    value={value}
                    onChange={handleChange(setter)}
                    onKeyDown={onKeyDown}
                    className="pr-10"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
}



export default function ProfilePage() {
    const [psy, setPsy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modal, setModal] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/profile`, { headers: { authorization: sessionStorage.getItem("token") } })
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(d => { setPsy(d); setLoading(false); })
            .catch(e => { setError(e.message); setLoading(false); });
    }, []);

    return (
        <SidebarProvider>
            <AppSideBar />
            <SidebarInset>
                <div className="p-6 space-y-6 w-full max-w-4xl mx-auto">

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Your account information and settings
                        </p>
                    </div>

                    <Card>
                        <CardContent className="pt-6 pb-5">
                            {loading ? (
                                <div className="flex items-center gap-5">
                                    <Skeleton className="h-20 w-20 rounded-full" />
                                    <div className="space-y-2.5">
                                        <Skeleton className="h-5 w-48" />
                                        <Skeleton className="h-4 w-32" />
                                        <div className="flex gap-2 mt-1">
                                            <Skeleton className="h-6 w-24 rounded-full" />
                                            <Skeleton className="h-6 w-20 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            ) : error ? (
                                <p className="text-sm text-destructive">Failed to load profile: {error}</p>
                            ) : psy ? (
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div className="flex items-center gap-5">
                                        {/* Initials avatar — large */}
                                        <div className="h-20 w-20 rounded-full bg-violet-100 border-2 border-violet-200 flex items-center justify-center shrink-0">
                                            <span className="text-2xl font-bold text-violet-700">
                                                {getInitials(psy.first_name, psy.last_name)}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5">
                                            <h2 className="text-xl font-bold">
                                                {psy.first_name} {psy.last_name}
                                            </h2>

                                            {psy.specialization && (
                                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                                    <Stethoscope className="h-3.5 w-3.5" />
                                                    {psy.specialization}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 flex-wrap pt-0.5">
                                                {/* Role badge */}
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        psy.psy_type === "admin"
                                                            ? "border-amber-300 text-amber-700 bg-amber-50"
                                                            : "border-violet-300 text-violet-700 bg-violet-50"
                                                    }
                                                >
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    {psy.psy_type === "admin" ? "Administrator" : "Psychiatrist"}
                                                </Badge>

                                                {/* Verified badge — always shown since unverified can't log in */}
                                                <Badge
                                                    variant="outline"
                                                    className="border-emerald-300 text-emerald-700 bg-emerald-50"
                                                >
                                                    <BadgeCheck className="h-3 w-3 mr-1" />
                                                    Verified
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Change password button */}
                                    <Button
                                        variant="outline"
                                        className="gap-2 shrink-0"
                                        onClick={() => setModal(true)}
                                    >
                                        <KeyRound className="h-4 w-4" />
                                        Change password
                                    </Button>
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>

                    {/* ── Two-column info ── */}
                    {!loading && psy && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Personal information */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="divide-y">
                                    <InfoRow icon={Mail} label="Email address" value={psy.email} />
                                    <InfoRow icon={Phone} label="Phone number" value={psy.phone} />
                                    <InfoRow icon={CreditCard} label="CIN" value={psy.cin} />
                                    <InfoRow
                                        icon={Calendar}
                                        label="Date of birth"
                                        value={
                                            psy.date_of_birth
                                                ? `${formatDate(psy.date_of_birth)} (${calcAge(psy.date_of_birth)} years old)`
                                                : null
                                        }
                                    />
                                    <InfoRow icon={MapPin} label="Address" value={psy.address} />
                                </CardContent>
                            </Card>

                            {/* Account information */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        Account Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="divide-y">
                                    <InfoRow icon={User} label="Account type" value={psy.psy_type === "admin" ? "Administrator" : "Psychiatrist"} />
                                    <InfoRow icon={Stethoscope} label="Specialization" value={psy.specialization} />
                                    <InfoRow icon={BadgeCheck} label="Account status" value="Verified" />
                                    <InfoRow icon={Clock} label="Member since" value={formatDate(psy.created_at)} />
                                    <InfoRow icon={Clock} label="Last updated" value={formatDate(psy.updated_at)} />
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* ── Loading skeleton for the two columns ── */}
                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[0, 1].map(i => (
                                <Card key={i}>
                                    <CardContent className="pt-6 space-y-4">
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <div key={j} className="flex items-center gap-3">
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                                <div className="space-y-1.5 flex-1">
                                                    <Skeleton className="h-2.5 w-16" />
                                                    <Skeleton className="h-3.5 w-32" />
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* ── Change password modal ── */}
                    <ChangePasswordModal open={modal} onClose={setModal} />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}