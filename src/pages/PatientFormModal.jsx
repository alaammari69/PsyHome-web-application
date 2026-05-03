import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { UserPen, UserPlus, Save, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const AUTH = `Bearer ${"9999999999999999999555"}`; // TODO: replace with real auth token


export default function PatientFormModal({ open, onClose, onSaved, isEditMode = false, patient = null }) {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [cin, setCin] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);


    useEffect(() => {
        if (isEditMode && patient) { // editing mode
            setFirstName(patient.first_name ?? "");
            setLastName(patient.last_name ?? "");
            setCin(patient.cin ?? "");
            setDateOfBirth(patient.date_of_birth ? patient.date_of_birth.slice(0, 10) : "");
            setGender(patient.gender ?? "");
            setUsername(patient.username ?? "");
            setPassword(patient.password ?? "");
        } else { // creating new patient profile mode
            // reset all fields when opening in create mode
            setFirstName("");
            setLastName("");
            setCin("");
            setDateOfBirth("");
            setGender("");
            setUsername("");
            setPassword("");
        }
        setError(null);
    }, [open, isEditMode, patient]);


    async function handleSave() {
        setError(null);
        setSaving(true);

        try {
            if (!firstName || !lastName || !cin || !dateOfBirth || !gender || !username || !password) { // check for no empty feilds
                    setError("All fields are required when creating a new patient.");
                    setSaving(false);
                    return;
            }
            const body = {
                        first_name: firstName,
                        last_name: lastName,
                        cin,
                        date_of_birth: dateOfBirth,
                        gender,
                        username,
                        password,
                    }
            if (isEditMode) {
                // add the patient id
                body.patient_id = patient.patient_id;
                
                const res = await fetch(`${API_URL}/patient`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", Authorization: AUTH },
                    body: JSON.stringify(body),
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

            } else {
                
                const res = await fetch(`${API_URL}/patient`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: AUTH },
                    body: JSON.stringify(body),
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
            }

            onSaved?.();   // to tell the parent page to reload
            onClose(false);
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isEditMode
                            ? <><UserPen className="h-5 w-5 text-sky-600" /> Edit Patient</>
                            : <><UserPlus className="h-5 w-5 text-emerald-600" /> New Patient</>
                        }
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Update the fields you want to change."
                            : "Fill in all fields to register a new patient."
                        }
                    </DialogDescription>
                </DialogHeader>

                <Separator />

                {/*fields */}
                <div className="grid grid-cols-2 gap-4 py-2">

                    {/* first name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="first_name">
                            First name
                            {!isEditMode && <span className="text-destructive ml-0.5">*</span>}
                        </Label>
                        <Input
                            id="first_name"
                            placeholder="Jane"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                        />
                    </div>

                    {/* last name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="last_name">
                            Last name
                            {!isEditMode && <span className="text-destructive ml-0.5">*</span>}
                        </Label>
                        <Input
                            id="last_name"
                            placeholder="Doe"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                        />
                    </div>

                    {/* cin */}
                    <div className="space-y-1.5">
                        <Label htmlFor="cin">
                            CIN
                            {!isEditMode && <span className="text-destructive ml-0.5">*</span>}
                        </Label>
                        <Input
                            id="cin"
                            placeholder="12345678"
                            value={cin}
                            onChange={e => setCin(e.target.value)}
                        />
                    </div>

                    {/* birth date */}
                    <div className="space-y-1.5">
                        <Label htmlFor="dob">
                            Date of birth
                            {!isEditMode && <span className="text-destructive ml-0.5">*</span>}
                        </Label>
                        <Input
                            id="dob"
                            type="date"
                            value={dateOfBirth}
                            onChange={e => setDateOfBirth(e.target.value)}
                        />
                    </div>

                    {/* ggender */}
                    <div className="space-y-1.5 col-span-2">
                        <Label>
                            Gender
                            {!isEditMode && <span className="text-destructive ml-0.5">*</span>}
                        </Label>
                        <Select value={gender} onValueChange={setGender}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator className="col-span-2" />

                    {/* username */}
                    <div className="space-y-1.5">
                        <Label htmlFor="username">
                            Username
                            {!isEditMode && <span className="text-destructive ml-0.5">*</span>}
                        </Label>
                        <Input
                            id="username"
                            placeholder="jane.doe"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>

                    {/* password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password">
                            Password
                            {!isEditMode && <span className="text-destructive ml-0.5">*</span>}
                        </Label>
                        <Input
                            id="password"
                            placeholder={isEditMode ? "••••••••" : "New password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <p className="text-sm text-destructive">
                        {error}
                    </p>
                )}

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onClose(false)} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving
                            ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Saving…</>
                            : <><Save className="h-4 w-4 mr-1" /> {isEditMode ? "Save changes" : "Create patient"}</>
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}