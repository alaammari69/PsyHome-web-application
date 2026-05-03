import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

import { ArrowLeft, Bot, User, Brain, MessageSquare } from "lucide-react";

import DiagnosisModal from "./DiagnosisModal"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSideBar from "./AppSideBar";

const API_URL = import.meta.env.VITE_API_URL;
const AUTH = `Bearer ${"9999999999999999999555"}`;


function formatDateTime(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function useFetch(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!url) return;
        setLoading(true);
        fetch(url, { headers: { Authorization: AUTH } })
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(d => { setData(d); setLoading(false); })
            .catch(e => { setError(e.message); setLoading(false); });
    }, [url]);

    return { data, loading, error };
}

// ai messages
function AIBubble({ content }) {
    return (
        <div className="flex items-start gap-3 max-w-[75%]">
            {/* ai avatar circle */}
            <div className="h-8 w-8 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-4 w-4 text-violet-600" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm">
                {content}
            </div>
        </div>
    );
}


// human message
function HumanBubble({ content }) {
    return (
        <div className="flex items-start gap-3 max-w-[75%] ml-auto flex-row-reverse">
            {/* user avatar circle */}
            <div className="h-8 w-8 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-4 w-4 text-sky-600" />
            </div>
            <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-3 text-sm leading-relaxed shadow-sm">
                {content}
            </div>
        </div>
    );
}

// skeleton message bubbles while loading data
function SkeletonConversation() {

    // to alternate between ai and human bubbles
    const pattern = ["ai", "human", "ai", "human", "ai"];
    return (
        <div className="space-y-4">
            {pattern.map((type, i) => (
                <div
                    key={i}
                    className={`flex items-start gap-3 ${type === "human" ? "flex-row-reverse ml-auto" : ""}`}
                >
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <Skeleton
                        className={`h-16 rounded-2xl ${type === "human" ? "w-56" : "w-72"}`}
                    />
                </div>
            ))}
        </div>
    );
}




export default function SessionPage() {
    const { thread_id } = useParams();
    const navigate = useNavigate();

    // fetch thread and messages
    const { data: thread, loading: lThread } = useFetch(`${API_URL}/thread/${thread_id}`);
    const { data: messages, loading: lMessages } = useFetch(`${API_URL}/thread/${thread_id}/messages`);


    //derived counts
    const aiCount = (messages ?? []).filter(m => m.type === "ai").length;
    const humanCount = (messages ?? []).filter(m => m.type === "human").length;

    // diagnosis modal state
    const [modalOpen, setModalOpen] = useState(false);

    // for auto-scrolling to bottom of conversation on load
    const bottomRef = useRef(null);
    useEffect(() => {
        if (!lMessages) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [lMessages]);

    return (
        <SidebarProvider>
            <AppSideBar />
            <SidebarInset>
                <div className="p-6 space-y-5 w-full">

                    {/* back and header */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => navigate(-1)
                                }
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Session</h1>
                                <p className="text-muted-foreground text-sm">
                                    Read-only conversation transcript
                                </p>
                            </div>
                        </div>

                        {/* diagnosis button only shows if there is a diagnosis available */}
                        {thread?.diagnosis_id && (
                            <Button
                                variant="outline"
                                className="gap-2 shrink-0"
                                onClick={() => setModalOpen(true)}
                            >
                                <Brain className="h-4 w-4 text-violet-600" />
                                View Diagnosis
                            </Button>
                        )}
                    </div>

                    {/* session other data */}
                    <Card>
                        <CardContent className="py-4 px-5">
                            {lThread ? (
                                // for loading skeleton for meta bar
                                <div className="flex gap-6">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ) : thread ? (
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">

                                    {/* date */}
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <span className="font-medium text-foreground">
                                            {formatDateTime(thread.created_at)}
                                        </span>
                                    </span>

                                    {/* status */}
                                    <Badge variant={thread.status ? "default" : "secondary"}>
                                        {thread.status ? "Completed" : "In progress"}
                                    </Badge>

                                    {/* diagnosis */}
                                    {thread.diagnosis_id ? (
                                        <Badge variant="outline" className="border-violet-300 text-violet-700 bg-violet-50">
                                            Diagnosis available
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground">
                                            No diagnosis
                                        </Badge>
                                    )}

                                    {/* message count */}
                                    {!lMessages && (
                                        <span className="flex items-center gap-1.5 text-muted-foreground ml-auto">
                                            <MessageSquare className="h-3.5 w-3.5" />
                                            {(messages ?? []).length} messages
                                            <span className="text-xs">
                                                ({aiCount} AI · {humanCount} patient)
                                            </span>
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-destructive">Failed to load session.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* for showin the conversation */}
                    <Card>
                        <CardContent className="py-6 px-6">
                            {lMessages ? (
                                <SkeletonConversation />
                            ) : (messages ?? []).length === 0 ? (
                                // no conversation yet 
                                <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
                                    <MessageSquare className="h-8 w-8" />
                                    <p className="text-sm font-medium">No messages in this session</p>
                                </div>
                            ) : (
                                // conversation bubbles
                                <div className="space-y-4">
                                    {(messages ?? []).map((msg, i) =>
                                        msg.type === "ai" ? (
                                            <AIBubble key={i} content={msg.content} />
                                        ) : (
                                            <HumanBubble key={i} content={msg.content} />
                                        )
                                            )}
                                            
                                    {/*auto scrol refrence */}
                                    <div ref={bottomRef} />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/*diagnosis modal */}
                    {thread?.diagnosis_id && (
                        <DiagnosisModal
                            diagnosisId={thread.diagnosis_id}
                            open={modalOpen}
                            onClose={setModalOpen}
                        />
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}