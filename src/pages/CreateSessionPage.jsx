import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import {
    ArrowLeft,
    Brain,
    Activity,
    Search,
    ChevronDown,
    ChevronRight,
    Check,
    X,
    Sparkles,
    Info,
    Plus,
} from "lucide-react";

import AppSideBar from "./AppSideBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";

const API_URL = import.meta.env.VITE_API_URL;
const AUTH = () => sessionStorage.getItem("token");


function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}


export default function CreateSessionPage() {
    const { patient_id } = useParams();
    const navigate = useNavigate();

    const [description, setDescription] = useState("");
    const [selectedSymptoms, setSelectedSymptoms] = useState([]); 
    const [selectedDisorders, setSelectedDisorders] = useState([]);


    const [catalog, setCatalog] = useState([]);
    const [loadingCatalog, setLoadingCatalog] = useState(true);

    const [query, setQuery] = useState("");


    const [openDisorders, setOpenDisorders] = useState({});

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // fetch catalog
    useEffect(() => {
        fetch(`${API_URL}/disorders`, { headers: { authorization: AUTH() } })
            .then(r => r.json())
            .then(data => {
                setCatalog(Array.isArray(data) ? data : []);
                setLoadingCatalog(false);
            })
            .catch(() => setLoadingCatalog(false));
    }, []);

    // filtered catalog by search query
    const filteredCatalog = useMemo(() => {
        if (!query.trim()) return catalog;
        const q = query.toLowerCase();
        return catalog
            .map(disorder => {
                const dMatch = disorder.disorder_name?.toLowerCase().includes(q);
                const matchedSymptoms = (disorder.symptoms ?? []).filter(s =>
                    s.symptom_name?.toLowerCase().includes(q)
                );
                if (dMatch || matchedSymptoms.length > 0) {
                    return { ...disorder, symptoms: dMatch ? disorder.symptoms : matchedSymptoms };
                }
                return null;
            })
            .filter(Boolean);
    }, [catalog, query]);

    // auto open disorders matching the query
    useEffect(() => {
        if (!query.trim()) return;
        const newOpen = {};
        filteredCatalog.forEach(d => { newOpen[d.disorder_id] = true; });
        setOpenDisorders(prev => ({ ...prev, ...newOpen }));
    }, [filteredCatalog, query]);


    function toggleDisorder(disorder) {
        const id = disorder.disorder_id;
        const already = selectedDisorders.find(d => d.disorder_id === id);
        if (already) {
            setSelectedDisorders(prev => prev.filter(d => d.disorder_id !== id));
        } else {
            setSelectedDisorders(prev => [...prev, {
                disorder_id: id,
                disorder_name: disorder.disorder_name,
                dsm_code: disorder.dsm_code,
            }]);
        }
    }


    function toggleSymptom(symptom, disorderName) {
        const id = symptom.symptom_id;
        const already = selectedSymptoms.find(s => s.symptom_id === id);
        if (already) {
            setSelectedSymptoms(prev => prev.filter(s => s.symptom_id !== id));
        } else {
            setSelectedSymptoms(prev => [...prev, {
                symptom_id: id,
                symptom_name: symptom.symptom_name,
                disorder_name: disorderName,
            }]);
        }
    }

    function isDisorderSelected(id) {
        return selectedDisorders.some(d => d.disorder_id === id);
    }
    function isSymptomSelected(id) {
        return selectedSymptoms.some(s => s.symptom_id === id);
    }


    async function handleCreate() {
        setError(null);
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/patient/${patient_id}/threads`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: AUTH(),
                },
                body: JSON.stringify({
                    description: description.trim() || null,
                    symptom_ids: selectedSymptoms.map(s => s.symptom_id),
                    disorder_ids: selectedDisorders.map(d => d.disorder_id),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Failed to create session.");
            } else {
                navigate(-1);
            }
        } catch {
            setError("Could not reach the server. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    const totalSelected = selectedSymptoms.length + selectedDisorders.length;

    return (
        <SidebarProvider>
            <AppSideBar />
            <SidebarInset className="flex-1 min-w-0">
                <TooltipProvider>
                    <div className="p-6 space-y-6 w-full max-w-5xl mx-auto">

                        {/* ── Header ── */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => navigate(-1)}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">New Session</h1>
                                <p className="text-muted-foreground text-sm">
                                    Configure the session context and pre-assign clinical findings
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

                            {/* ── LEFT: form ── */}
                            <div className="lg:col-span-3 space-y-5">

                                {/* Session instructions */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-violet-500" />
                                            Session Instructions
                                            <Badge variant="outline" className="text-[10px] ml-auto font-normal">
                                                Optional
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Guide the AI on what to focus on during this session — specific concerns,
                                            therapeutic goals, or areas to explore.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            placeholder="e.g. Focus on sleep disturbances and their connection to anxiety episodes. Patient recently reported recurring nightmares…"
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            className="resize-none min-h-[120px] text-sm leading-relaxed"
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-2 text-right">
                                            {description.length} characters
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Disorders + Symptoms catalog */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <Brain className="h-4 w-4 text-violet-500" />
                                            Assign Disorders & Symptoms
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Pre-assign clinical findings to this patient for this session.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">

                                        {/* search */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                placeholder="Search disorders or symptoms…"
                                                value={query}
                                                onChange={e => setQuery(e.target.value)}
                                                className="pl-9 text-sm h-9"
                                            />
                                        </div>

                                        {/* catalog list */}
                                        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                                            {loadingCatalog ? (
                                                Array.from({ length: 4 }).map((_, i) => (
                                                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                                                ))
                                            ) : filteredCatalog.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic text-center py-6">
                                                    No results found.
                                                </p>
                                            ) : (
                                                filteredCatalog.map(disorder => (
                                                    <DisorderRow
                                                        key={disorder.disorder_id}
                                                        disorder={disorder}
                                                        isOpen={!!openDisorders[disorder.disorder_id]}
                                                        onToggleOpen={() =>
                                                            setOpenDisorders(prev => ({
                                                                ...prev,
                                                                [disorder.disorder_id]: !prev[disorder.disorder_id],
                                                            }))
                                                        }
                                                        isDisorderSelected={isDisorderSelected(disorder.disorder_id)}
                                                        onToggleDisorder={() => toggleDisorder(disorder)}
                                                        isSymptomSelected={isSymptomSelected}
                                                        onToggleSymptom={toggleSymptom}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* ── RIGHT: summary + submit ── */}
                            <div className="lg:col-span-2 space-y-4 sticky top-6">

                                {/* Selection summary */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-sky-500" />
                                            Selection Summary
                                            {totalSelected > 0 && (
                                                <Badge className="ml-auto text-[10px]">{totalSelected}</Badge>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">

                                        {/* disorders */}
                                        <div>
                                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                                <Brain className="h-3 w-3 text-violet-400" />
                                                Disorders ({selectedDisorders.length})
                                            </p>
                                            {selectedDisorders.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic">None selected</p>
                                            ) : (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selectedDisorders.map(d => (
                                                        <Badge
                                                            key={d.disorder_id}
                                                            variant="secondary"
                                                            className="text-[10px] gap-1 pr-1 cursor-pointer group"
                                                            onClick={() => setSelectedDisorders(prev =>
                                                                prev.filter(x => x.disorder_id !== d.disorder_id)
                                                            )}
                                                        >
                                                            {d.disorder_name}
                                                            <X className="h-2.5 w-2.5 opacity-50 group-hover:opacity-100" />
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <Separator />

                                        {/* symptoms */}
                                        <div>
                                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                                <Activity className="h-3 w-3 text-amber-400" />
                                                Symptoms ({selectedSymptoms.length})
                                            </p>
                                            {selectedSymptoms.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic">None selected</p>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    {selectedSymptoms.map(s => (
                                                        <div
                                                            key={s.symptom_id}
                                                            className="flex items-center justify-between text-xs rounded-md bg-amber-50 border border-amber-100 px-2 py-1 group"
                                                        >
                                                            <span className="font-medium truncate">{s.symptom_name}</span>
                                                            <button
                                                                onClick={() => setSelectedSymptoms(prev =>
                                                                    prev.filter(x => x.symptom_id !== s.symptom_id)
                                                                )}
                                                                className="ml-2 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* error */}
                                {error && (
                                    <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                {/* submit */}
                                <Button
                                    className="w-full gap-2"
                                    onClick={handleCreate}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                    ) : (
                                        <Plus className="h-4 w-4" />
                                    )}
                                    {submitting ? "Creating session…" : "Create Session"}
                                </Button>

                                <Button
                                    variant="ghost"
                                    className="w-full text-muted-foreground"
                                    onClick={() => navigate(-1)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </TooltipProvider>
            </SidebarInset>
        </SidebarProvider>
    );
}

/* ─── DisorderRow ─── */
function DisorderRow({
    disorder,
    isOpen,
    onToggleOpen,
    isDisorderSelected,
    onToggleDisorder,
    isSymptomSelected,
    onToggleSymptom,
}) {
    const symptoms = disorder.symptoms ?? [];

    return (
        <Collapsible open={isOpen} onOpenChange={onToggleOpen}>
            <div
                className={cn(
                    "rounded-lg border transition-colors",
                    isDisorderSelected
                        ? "border-violet-300 bg-violet-50/60"
                        : "border-border bg-white hover:bg-muted/30"
                )}
            >
                {/* disorder header row */}
                <div className="flex items-center gap-2 px-3 py-2.5">

                    {/* select disorder checkbox */}
                    <button
                        onClick={onToggleDisorder}
                        className={cn(
                            "h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                            isDisorderSelected
                                ? "bg-violet-600 border-violet-600 text-white"
                                : "border-slate-300 hover:border-violet-400"
                        )}
                    >
                        {isDisorderSelected && <Check className="h-3 w-3" />}
                    </button>

                    {/* name + dsm */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{disorder.disorder_name}</p>
                        {disorder.dsm_code && (
                            <p className="text-[10px] text-muted-foreground">DSM-5: {disorder.dsm_code}</p>
                        )}
                    </div>

                    {/* symptom count */}
                    {symptoms.length > 0 && (
                        <Badge variant="outline" className="text-[10px] shrink-0">
                            {symptoms.length} symptom{symptoms.length !== 1 ? "s" : ""}
                        </Badge>
                    )}

                    {/* expand toggle */}
                    {symptoms.length > 0 && (
                        <CollapsibleTrigger asChild>
                            <button className="text-muted-foreground hover:text-foreground transition-colors ml-1">
                                {isOpen
                                    ? <ChevronDown className="h-4 w-4" />
                                    : <ChevronRight className="h-4 w-4" />
                                }
                            </button>
                        </CollapsibleTrigger>
                    )}
                </div>

                {/* symptoms list */}
                {symptoms.length > 0 && (
                    <CollapsibleContent>
                        <div className="border-t px-3 py-2 space-y-1">
                            {symptoms.map(symptom => (
                                <SymptomRow
                                    key={symptom.symptom_id}
                                    symptom={symptom}
                                    disorderName={disorder.disorder_name}
                                    isSelected={isSymptomSelected(symptom.symptom_id)}
                                    onToggle={() => onToggleSymptom(symptom, disorder.disorder_name)}
                                />
                            ))}
                        </div>
                    </CollapsibleContent>
                )}
            </div>
        </Collapsible>
    );
}

/* ─── SymptomRow ─── */
function SymptomRow({ symptom, disorderName, isSelected, onToggle }) {
    return (
        <div
            className={cn(
                "flex items-center gap-2.5 rounded-md px-2 py-1.5 cursor-pointer transition-colors group",
                isSelected
                    ? "bg-amber-50 border border-amber-200"
                    : "hover:bg-muted/50"
            )}
            onClick={onToggle}
        >
            <div
                className={cn(
                    "h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                    isSelected
                        ? "bg-amber-500 border-amber-500 text-white"
                        : "border-slate-300 group-hover:border-amber-400"
                )}
            >
                {isSelected && <Check className="h-2.5 w-2.5" />}
            </div>

            <span className="text-xs font-medium flex-1 truncate">{symptom.symptom_name}</span>

            {symptom.symptom_description && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground shrink-0 opacity-60 hover:opacity-100" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">
                        {symptom.symptom_description}
                    </TooltipContent>
                </Tooltip>
            )}
        </div>
    );
}