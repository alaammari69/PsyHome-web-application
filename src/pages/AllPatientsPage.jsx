import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Plus, Search, Eye, RefreshCw, Users, Delete, DeleteIcon, Trash } from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSideBar from "./AppSideBar";
import { useNavigate } from "react-router-dom";

import PatientFormModal from "./PatientFormModal";

const API_URL = import.meta.env.VITE_API_URL;


// returns the initials of the patient's name
function getInitials(fullname) {
    return fullname
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

// reformats the dates from a string to a readable format
function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// returns a class value that changes the Avatar feild backgroud according to the gender and gives the text a tint color 
function genderAvatarClass(gender) {
    switch (gender) {
        case "male": return "bg-blue-100 text-blue-700";
        case "female": return "bg-pink-100 text-pink-700";
    }
}

// returns a class value that changes the gender's feild background color according to it's value too and gives the text a tint color
function genderBadgeClass(gender) {
    switch (gender) {
        case "male": return "border-blue-300  text-blue-700  bg-blue-50";
        case "female": return "border-pink-300  text-pink-700  bg-pink-50";
    }
}

// this renders a gray empty skeleton or layout of the data when it's still being retreived by the REST API
function SkeletonRows() {
    //only 4 rows
    return Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i}>
            {/* Patient column — avatar circle + two text lines */}
            <TableCell>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-2.5 w-20" />
                    </div>
                </div>
            </TableCell>


            {/* Remaining columns */}
            <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-3 w-8" /></TableCell>
            <TableCell><Skeleton className="h-3 w-12" /></TableCell>
            <TableCell><Skeleton className="h-3 w-20" /></TableCell>
            <TableCell><Skeleton className="h-7 w-16 rounded-md" /></TableCell>
        </TableRow>
    ));
}

// STAT CARDS
// a reusable component to show specific information in a card like appearence
// loading value is false when the rest api is done fetching the data to sho the actual value
function StatCard({ label, value, loading }) {
    return (
        <Card>
            <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {label}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                {loading
                    ? <Skeleton className="h-7 w-12" />
                    : <p className="text-2xl font-bold">{value}</p>
                }
            </CardContent>
        </Card>
    );
}

async function delete_patient(patient_id) {
    try {
        const response = await fetch(API_URL+"/patient", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                authorization: sessionStorage.getItem("token")
             },
            body: JSON.stringify({ patient_id: patient_id})
        })
    } catch (err) {
        setError("Something went wrong")
    }
    
}

export default function AllPatientsPage() {

    // for reloading page
    const [reload, setReload] = useState(false);

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [genderFilter, setGenderFilter] = useState("all");

    // for patient form modal
    const [openModal, setOpenModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // get all patients using REST api
    useEffect(() => {
        fetch(`${API_URL}/patient/all`, {
            headers: { authorization: sessionStorage.getItem("token") },
        },reload)
            .then((res) => { //check if no errors occured
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            }) // render the data using the setPatients method for loading all the values
            .then((data) => { setPatients(data); setLoading(false); })
            .catch((err) => { setError(err.message); setLoading(false); });
    }, [reload]);

    // for filtering patient according to names or gender
    const filtered = patients.filter((p) => {
        const matchSearch = p.fullname.toLowerCase().includes(search.toLowerCase()) || String(p.patient_id).includes(search);
        const matchGender = genderFilter === "all" || p.gender === genderFilter;
        return matchSearch && matchGender;
    });

    // this calculates all the session found across all patients
    const totalSessions = patients.reduce((sum, p) => sum + (p.sessions ?? 0), 0);
    const withSessions = patients.reduce((previous_sum, row, index) => previous_sum + (row.active_sessions ?? 0), 0);

    const navigate = useNavigate()


    return (
        
        <SidebarProvider>
            <AppSideBar />
            {/*TooltipProvider must wrap any <Tooltip> usage in shadcn*/}
            <SidebarInset className="flex-1 min-w-0">
                <TooltipProvider>
                    <div className="p-6 space-y-6">

                        {/* ── Header ── */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
                                <p className="text-muted-foreground text-sm mt-1">
                                    Manage patient records and diagnostic sessions
                                </p>
                            </div>

                            {/* button variant=default -> filled primary colour. */}
                            <Button variant="default" onClick={() => {
                                setEditMode(false);
                                setSelectedPatient(null);
                                setOpenModal(true);
                            }}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add patient
                            </Button>
                        </div>

                        {/* 3 cards side by side */}
                        <div className="grid grid-cols-3 gap-4">
                            <StatCard label="Total patients" value={patients.length} loading={loading} />
                            <StatCard label="Total sessions" value={totalSessions} loading={loading} />
                            <StatCard label="Active Sessions" value={withSessions} loading={loading} />
                        </div>

                        {/* toolbar*/}
                        <div className="flex items-center gap-3">

                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                <Input
                                    className="pl-9"
                                    placeholder="Search by name or ID…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>


                            <Select value={genderFilter} onValueChange={setGenderFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="All genders" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All genders</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>

                            {!loading && (
                                <span className="text-sm text-muted-foreground ml-auto">
                                    {filtered.length} / {patients.length} patients
                                </span>
                            )}
                        </div>

                        {/*table */}
                        <Card>
                            <CardContent className="p-0">
                                {error ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-2">
                                        <Users className="h-8 w-8 text-muted-foreground" />
                                        <p className="font-medium text-destructive">Failed to load patients</p>
                                        <p className="text-sm text-muted-foreground">{error}</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Patient</TableHead>
                                                <TableHead>Gender</TableHead>
                                                <TableHead>Age</TableHead>
                                                <TableHead>Sessions</TableHead>
                                                <TableHead>Last session</TableHead>
                                                <TableHead className="w-[80px]" />
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {/*loading state */}
                                            {loading && <SkeletonRows />}

                                            {/* empty state*/}
                                            {!loading && filtered.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={6}>
                                                        <div className="flex flex-col items-center justify-center py-14 gap-2">
                                                            <Users className="h-8 w-8 text-muted-foreground" />
                                                            <p className="font-medium">No patients found</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {search
                                                                    ? "Try a different search term"
                                                                    : "Add your first patient to get started"}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}

                                            {/* data rows */}
                                            {!loading && filtered.map((p) => (
                                                <TableRow key={p.patient_id} >
                                                    {/* patients: Avatar + name + ID*/}
                                                    <TableCell onClick={() => navigate(`/patient/id/${p.patient_id}`)}>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9">
                                                                <AvatarFallback className={`text-xs font-semibold ${genderAvatarClass(p.gender)}`}>
                                                                    {getInitials(p.fullname)}
                                                                </AvatarFallback>
                                                            </Avatar>

                                                            <div>
                                                                <p className="font-medium leading-none">{p.fullname}</p>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    PSY-{String(p.patient_id).padStart(3, "0")}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>


                                                    {/* gender*/}
                                                    <TableCell onClick={() => navigate(`/patient/id/${p.patient_id}`)}>

                                                        <Badge
                                                            variant="outline"
                                                            className={`capitalize ${genderBadgeClass(p.gender)}`}>

                                                            {p.gender ?? "—"}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Age */}
                                                    <TableCell className="tabular-nums" onClick={() => navigate(`/patient/id/${p.patient_id}`)}>
                                                        {p.age ?? "—"}
                                                    </TableCell>

                                                    {/*sessions with dot indicator and count */}
                                                    <TableCell onClick={() => navigate(`/patient/id/${p.patient_id}`)}>
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className={`h-2 w-2 rounded-full ${(p.active_sessions ?? 0) > 0 ? "bg-green-500" : "bg-slate-300"
                                                                    }`}
                                                            />
                                                            <span className="tabular-nums">{p.sessions ?? 0}</span>
                                                        </div>
                                                    </TableCell>

                                                    {/*last session date*/}
                                                    <TableCell onClick={() => navigate(`/patient/id/${p.patient_id}`)}>
                                                        {p.lastSession ? (
                                                            <span className="text-sm">{formatDate(p.lastSession)}</span>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground italic">
                                                                No sessions yet
                                                            </span>
                                                        )}
                                                    </TableCell>

                                                    {/*row buttons */}
                                                    <TableCell>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => {
                                                                        delete_patient(p.patient_id);
                                                                        setReload(!reload);
                                                                    }}
                                                                >
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Delete Patient</TooltipContent>
                                                        </Tooltip>

                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TooltipProvider>
                <PatientFormModal
                    open={openModal}
                    onClose={setOpenModal}
                    onSaved={()=>{setReload(!reload)}}
                    isEditMode={editMode}
                    patient={selectedPatient}
                />
            </SidebarInset>
        </SidebarProvider>
    );
}