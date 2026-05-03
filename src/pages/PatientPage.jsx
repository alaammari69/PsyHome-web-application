import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import DiagnosisModal from "./DiagnosisModal"
import PatientFormModal from "./PatientFormModal";

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";


import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import {
    ArrowLeft,
    Calendar,
    User,
    Hash,
    Activity,
    Brain,
    Stethoscope,
    ChevronRight,
    FlaskConical,
    Pen,
} from "lucide-react";
import AppSideBar from "./AppSideBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const API_URL = import.meta.env.VITE_API_URL;
const AUTH = `Bearer ${"9999999999999999999555"}`;


function getInitials(first = "", last = "") {
    return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
    });
}

function formatDateTime(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

/* calculates age from date_of_birth str */
function calcAge(dob) {
    if (!dob) return "—";
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

/* confidence */
function pct(val) {
    if (val == null) return "—";
    return `${Math.round(val * 100)}%`;
}

/** colour class for confidence level */
function confidenceColor(val) {
    if (val == null) return "bg-slate-200";
    if (val >= 0.75) return "bg-emerald-500";
    if (val >= 0.5) return "bg-amber-400";
    return "bg-red-400";
}

/* likelihood enum*/
function likelihoodBadge(likelihood) {
    switch (likelihood) {
        case "CONFIRMED": return "default";
        case "LIKELY": return "secondary";
        case "NEUTRAL": return "outline";
        case "UNLIKELY": return "outline";
        case "ABSENT": return "destructive";
        default: return "outline";
    }
}

// for GET requests
function useFetch(url, reload) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!url) return;
        setLoading(true);
        setData(null);
        setError(null);
        fetch(url, { headers: { Authorization: AUTH } })
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(d => { setData(d); setLoading(false); })
            .catch(e => { setError(e.message); setLoading(false); });
    }, [url, reload]);

    return { data, loading, error };
}



export default function PatientPage() {
    const { patient_id } = useParams();
    const navigate = useNavigate();

    // for reloading page
    const [reload, setReload] = useState(false);

    const { data: patient, loading: lPatient } = useFetch(`${API_URL}/patient/${patient_id}`,reload);
    const { data: threads, loading: lThreads } = useFetch(`${API_URL}/patient/${patient_id}/threads`,reload);
    const { data: symptoms, loading: lSymptoms } = useFetch(`${API_URL}/patient/${patient_id}/symptoms`,reload);
    const { data: disorders, loading: lDisorders } = useFetch(`${API_URL}/patient/${patient_id}/disorders`,reload);

    // the diagnosis_id to load in the modal
    const [selectedDiagnosisId, setSelectedDiagnosisId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    // for the patient form modal
    const [openModal, setOpenModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    

    function openDiagnosis(diagnosisId) {
        setSelectedDiagnosisId(diagnosisId);
        setModalOpen(true);
    }


    return (
        <SidebarProvider>
            <AppSideBar />
            <SidebarInset className="flex-1 min-w-0">
                <TooltipProvider>
                    <div className="p-6 space-y-6 w-full">

                        {/* back button and page title*/}
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => navigate("/patients")}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Patient Profile</h1>
                                <p className="text-muted-foreground text-sm">
                                    Full record, sessions and diagnostic history
                                </p>
                            </div>
                        </div>

                        {/* patients header card*/}
                        <Card>
                            <CardContent className="pt-6">
                                {lPatient ? (
                                    // loading skeleton for the header
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-16 w-16 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-48" />
                                            <Skeleton className="h-4 w-32" />
                                            <div className="flex gap-2 mt-2">
                                                <Skeleton className="h-6 w-20 rounded-full" />
                                                <Skeleton className="h-6 w-20 rounded-full" />
                                                <Skeleton className="h-6 w-20 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                ) : patient ? (
                                    <div className="flex items-start gap-5">
                                        {/*initials from first and last name*/}
                                        <Avatar className="h-16 w-16 text-lg">
                                            <AvatarFallback className={
                                                patient.gender === "male" ? "bg-blue-100 text-blue-700 font-semibold" :
                                                    patient.gender === "female" ? "bg-pink-100 text-pink-700 font-semibold" :
                                                        "bg-slate-100 text-slate-600 font-semibold"
                                            }>
                                                {getInitials(patient.first_name, patient.last_name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h2 className="text-xl font-bold">
                                                    {patient.first_name} {patient.last_name}
                                                </h2>
                                                {/* gnder badge */}
                                                <Badge
                                                    variant="outline"
                                                    className={`capitalize ${patient.gender === "male" ? "border-blue-300 text-blue-700 bg-blue-50" :
                                                        patient.gender === "female" ? "border-pink-300 text-pink-700 bg-pink-50" :
                                                            "border-slate-300 text-slate-600"
                                                        }`}
                                                >
                                                    {patient.gender ?? "—"}
                                                </Badge>
                                                <Button variant="outline"
                                                    onClick={() => {
                                                        setEditMode(true);
                                                        setSelectedPatient(patient);
                                                        setOpenModal(true);
                                                    }}>
                                                    <Pen />
                                                </Button>
                                            </div>

                                            {/*info chips row */}
                                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <Hash className="h-3.5 w-3.5" />
                                                    PSY-{String(patient.patient_id).padStart(3, "0")}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5" />
                                                    {calcAge(patient.date_of_birth)} years old
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    DOB: {formatDate(patient.date_of_birth)}
                                                </span>
                                                {patient.cin && (
                                                    <span className="flex items-center gap-1.5">
                                                        <FlaskConical className="h-3.5 w-3.5" />
                                                        CIN: {patient.cin}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-destructive">Failed to load patient.</p>
                                )}
                            </CardContent>
                        </Card>


                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            <div className="space-y-6">

                                {/* symptoms card */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-amber-500" />
                                            Observed Symptoms
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                        {lSymptoms ? (
                                            // skeleton list
                                            Array.from({ length: 3 }).map((_, i) => (
                                                <div key={i} className="flex justify-between items-center">
                                                    <Skeleton className="h-3 w-32" />
                                                    <Skeleton className="h-5 w-16 rounded-full" />
                                                </div>
                                            ))
                                        ) : (symptoms ?? []).length === 0 ? (
                                            <p className="text-xs text-muted-foreground italic">No symptoms recorded.</p>
                                        ) : (
                                            (symptoms ?? []).map((s, i) => (
                                                <div key={i}>
                                                    <div className="flex items-center justify-between gap-2 py-1">
                                                        <div className="flex-1 min-w-0">
                                                            {/* on hovering over the symptom */}
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <p className="text-xs font-medium truncate cursor-default">
                                                                        {s.symptom_name}
                                                                    </p>
                                                                </TooltipTrigger>
                                                                {s.symptom_description && (
                                                                    <TooltipContent className="max-w-xs text-xs">
                                                                        {s.symptom_description}
                                                                    </TooltipContent>
                                                                )}
                                                            </Tooltip>
                                                            <p className="text-[10px] text-muted-foreground">
                                                                observed at: {formatDate(s.observed_at)}
                                                            </p>
                                                        </div>
                                                        {/* confidence bagde */}
                                                        <Badge
                                                            variant={likelihoodBadge(s.confidence)}
                                                            className="text-[10px] shrink-0"
                                                        >
                                                            {s.confidence ?? "—"}
                                                        </Badge>
                                                    </div>
                                                    {i < symptoms.length - 1 && <Separator />}
                                                </div>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>

                                {/* disorders card */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <Brain className="h-4 w-4 text-violet-500" />
                                            Diagnosed Disorders
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                        {lDisorders ? (
                                            Array.from({ length: 2 }).map((_, i) => (
                                                <Skeleton key={i} className="h-14 w-full rounded-md" />
                                            ))
                                        ) : (disorders ?? []).length === 0 ? (
                                            <p className="text-xs text-muted-foreground italic">No disorders on record.</p>
                                        ) : (
                                            (disorders ?? []).map((d, i) => (
                                                <div key={i} className="rounded-md border px-3 py-2 space-y-1.5">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <p className="text-xs font-semibold leading-tight">{d.disorder_name}</p>
                                                            <p className="text-[10px] text-muted-foreground">DSM-5 code: {d.dsm_code}</p>
                                                        </div>
                                                        <Badge variant="outline" className="text-[10px] shrink-0">
                                                            {pct(d.confidence)}
                                                        </Badge>
                                                    </div>
                                                    {/* confidence bar */}
                                                    <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${confidenceColor(d.confidence)}`}
                                                            style={{ width: `${(d.confidence ?? 0) * 100}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        Diagnosed {formatDate(d.diagnosed_at)}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* sessions*/}
                            <div className="lg:col-span-2">
                                <Card className="h-full">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-semibold flex items-center justify-between w-full gap-2">
                                            <div className="flex items-center gap-2">
                                                <Stethoscope className="h-4 w-4 text-sky-500" />
                                                Sessions
                                                {!lThreads && threads && (
                                                    <Badge variant="secondary" className="ml-1 text-xs">
                                                        {threads.length}
                                                    </Badge>
                                                )}
                                            </div>
                                            <Button className="relative"
                                                onClick={() => alert()}
                                            >
                                                Create Session
                                            </Button>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 max-h-128 overflow-y-auto pr-1">
                                        {lThreads ? (
                                            // skeleton session rows
                                            Array.from({ length: 3 }).map((_, i) => (
                                                <Skeleton key={i} className="h-16 w-full rounded-md" />
                                            ))
                                        ) : (threads ?? []).length === 0 ? (
                                            <p className="text-xs text-muted-foreground italic">No sessions yet.</p>
                                        ) : (
                                            // sort threads by newest first
                                            [...(threads ?? [])]
                                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                                .map((thread, i) => (
                                                    <div
                                                        key={thread.thread_id}
                                                        className="flex items-center justify-between rounded-md border px-4 py-3 hover:bg-muted/40 transition-colors"

                                                    >
                                                        {/* index, date, status */}
                                                        <div className="flex items-center gap-3"
                                                            onClick={() => navigate(`/sessions/${thread.thread_id}`)}
                                                        >
                                                            <div className="h-8 w-8 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                                                                <span className="text-xs font-bold text-sky-700">
                                                                    {(threads.length - i).toString().padStart(2, "0")}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">
                                                                    Session {threads.length - i}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {formatDateTime(thread.created_at)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* status badge and diagnosis button */}
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant={thread.status ? "default" : "secondary"}
                                                                className="text-xs"
                                                            >
                                                                {thread.status ? "Completed" : "In progress"}
                                                            </Badge>

                                                            {thread.diagnosis_id ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 text-xs gap-1"
                                                                    onClick={() => openDiagnosis(thread.diagnosis_id)}
                                                                >
                                                                    <Brain className="h-3.5 w-3.5" />
                                                                    Diagnosis
                                                                    <ChevronRight className="h-3 w-3" />
                                                                </Button>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground italic px-2">
                                                                    No diagnosis
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        { /* this only renders when modelOpen is true which is triggered by the diagnosis button */}
                        <DiagnosisModal
                            diagnosisId={selectedDiagnosisId}
                            open={modalOpen}
                            onClose={setModalOpen}
                        />

                    </div>
                </TooltipProvider>
                <PatientFormModal
                    open={openModal}
                    onClose={setOpenModal}
                    onSaved={() => {
                        // refresh data
                        setReload(!reload)
                    }}
                    isEditMode={editMode}
                    patient={selectedPatient}
                />
            </SidebarInset>
        </SidebarProvider>
    );
}