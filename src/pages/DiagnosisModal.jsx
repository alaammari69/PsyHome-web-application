import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import {
    Activity,
    Brain,
    CheckCircle2,
    XCircle,
    ClipboardList,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const AUTH = `Bearer ${"9999999999999999999555"}`; // TODO: replace with real auth token from context/store

/* Formats a date string into a readable date + time (e.g. "3 Jan 2024, 14:30") */
function formatDateTime(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

// for fetching data from URLs
function useFetch(url) {
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
    }, [url]);

    return { data, loading, error };
}

// opens a dialog to show the generated diagnosis
export default function DiagnosisModal({ diagnosisId, open, onClose }) {
    // get the diagnosis data
    const { data, loading, error } = useFetch(
        diagnosisId ? `${API_URL}/diagnosis/${diagnosisId}` : null
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent style={{ width: "75vw", maxWidth: "75vw" }} className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-violet-600" />
                        Diagnosis Report
                    </DialogTitle>
                    {/* generation timestamp */}
                    {data && (
                        <DialogDescription>
                            Generated on {formatDateTime(data.date_of_diagnosis)}
                        </DialogDescription>
                    )}
                </DialogHeader>

                {/*skeleton */}
                {loading && (
                    <div className="space-y-4 mt-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                )}

                {/* error state */}
                {error && (
                    <p className="text-sm text-destructive mt-2">
                        Failed to load diagnosis: {error}
                    </p>
                )}


                {data && (
                    <div className="space-y-5 mt-2">

                        {/* confidence progress bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Overall confidence</span>
                                <span className="font-bold">{data.overall_confidence}%</span>
                            </div>
                            <Progress value={data.overall_confidence} className="h-2" />
                        </div>

                        <Separator />

                        {data.clinical_summary && (
                            <div className="space-y-1">
                                <p className="text-sm font-semibold flex items-center gap-1.5">
                                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                    Clinical summary
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {data.clinical_summary}
                                </p>
                            </div>
                        )}


                        {data.recommended_followup && (
                            <div className="space-y-1">
                                <p className="text-sm font-semibold flex items-center gap-1.5">
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                    Recommended follow-up
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {data.recommended_followup}
                                </p>
                            </div>
                        )}

                        <Separator />


                        <div className="space-y-3">
                            <p className="text-sm font-semibold">Disorder breakdown</p>
                            {(data.disorders ?? []).map((d) => (

                                // left border indicator color
                                <Card key={d.id} className="border-l-4" style={{
                                    borderLeftColor: d.percentage >= 75 ? "#10b981"
                                        : d.percentage >= 35 ? "#f59e0b"
                                            : "#ef4444"
                                }}>
                                    <CardHeader className="pb-2 pt-3 px-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <CardTitle className="text-sm font-semibold">
                                                    {d.disorder_name}
                                                </CardTitle>
                                                <CardDescription className="text-xs mt-0.5">
                                                    DSM: {d.dsm_code}
                                                </CardDescription>
                                            </div>
                                            {/* likelihood percentage badge */}
                                            <Badge variant="outline" className="shrink-0 text-xs font-bold">
                                                {d.percentage}%
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-4 pb-3 space-y-3">

                                        {d.explenation && (
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {d.explenation}
                                            </p>
                                        )}

                                        {d.supporting_symptoms?.length > 0 && (
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium flex items-center gap-1 text-emerald-700">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Supporting symptoms
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {d.supporting_symptoms.map((s) => (
                                                        <Badge
                                                            key={s.symptom_id}
                                                            variant="outline"
                                                            className="text-xs bg-emerald-50 border-emerald-200 text-emerald-700"
                                                        >
                                                            {s.symptom_name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {d.contradicting_symptoms?.length > 0 && (
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium flex items-center gap-1 text-red-600">
                                                    <XCircle className="h-3.5 w-3.5" />
                                                    Contradicting symptoms
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {d.contradicting_symptoms.map((s) => (
                                                        <Badge
                                                            key={s.symptom_id}
                                                            variant="outline"
                                                            className="text-xs bg-red-50 border-red-200 text-red-600"
                                                        >
                                                            {s.symptom_name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}