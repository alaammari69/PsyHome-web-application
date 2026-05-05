import { useState, useMemo } from "react";
import { useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {TooltipProvider} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  Search,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Layers,
  Activity,
} from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSideBar from "./AppSideBar";

const API_URL = import.meta.env.VITE_API_URL;
const AUTH = sessionStorage.getItem("token");

// so diffrent categories of disorders has diffrent color
const CATEGORY_COLORS = [
  "border-l-violet-400",
  "border-l-sky-400",
  "border-l-emerald-400",
  "border-l-amber-400",
  "border-l-rose-400",
  "border-l-indigo-400",
];
function categoryColor(id) {
  return CATEGORY_COLORS[(id - 1) % CATEGORY_COLORS.length];
}



function SymptomRow({ symptom, isLast }) {

  // to open and close symptom description
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="py-2" onClick={() => setOpen(o => !o)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
            <p className="text-sm text-foreground leading-snug">{symptom.symptom_name}</p>
          </div>
        </div>

        {/* collapsible description */}
        {open && symptom.symptom_description && (
          <p className="mt-2 ml-3.5 text-xs text-muted-foreground leading-relaxed border-l-2 border-muted pl-3">
            {symptom.symptom_description}
          </p>
        )}
      </div>
      {!isLast && <Separator />}
    </>
  );
}



function DisorderCard({ disorder, isSubtype = false, defaultOpen = false }) {

  const [open, setOpen] = useState(defaultOpen);
  const borderColor = categoryColor(disorder.category_id);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={`
          rounded-lg border border-l-4 bg-card transition-shadow
          ${borderColor}
          ${isSubtype ? "ml-6 shadow-none" : "shadow-sm hover:shadow-md"}
        `}
      >

        <CollapsibleTrigger asChild>
          <button className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 hover:bg-muted/30 rounded-t-lg transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Disorder name */}
                <span className={`font-semibold leading-snug ${isSubtype ? "text-sm" : "text-base"}`}>
                  {disorder.disorder_name}
                </span>

                {/* if it's a subtype make an offset with a badge*/}
                {isSubtype && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Subtype
                  </Badge>
                )}
              </div>

              {/* DSM code and symptom count */}
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground font-mono">
                  DSM {disorder.dsm_code}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {disorder.symptoms.length} symptoms
                </span>
              </div>
            </div>

            {/* expand/collapse icon*/}
            <div className="shrink-0 mt-0.5">
              {open
                ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                : <ChevronRight className="h-4 w-4 text-muted-foreground" />
              }
            </div>
          </button>
        </CollapsibleTrigger>

        {/* when list is expanded */}
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <Separator className="mb-3" />
            <div>
              {disorder.symptoms.map((s, i) => (
                <SymptomRow
                  key={s.symptom_id}
                  symptom={s}
                  isLast={i === disorder.symptoms.length - 1}
                />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// skeleton card
function SkeletonCard() {
  return (
    <div className="rounded-lg border border-l-4 border-l-slate-200 p-4 space-y-2">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  );
}



export default function ReferencePage() {
  const [disorders, setDisorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/disorders`, { headers: { Authorization: AUTH } })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setDisorders(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);


  // each disorder is grouped by it's sub disorder
  const { parents, subtypeMap } = useMemo(() => {
    const parents = disorders.filter(d => !d.is_subtype);
    const subtypeMap = {};
    disorders
      .filter(d => d.is_subtype)
      .forEach(d => {
        if (!subtypeMap[d.parent_disorder_id]) subtypeMap[d.parent_disorder_id] = [];
        subtypeMap[d.parent_disorder_id].push(d);
      });
    return { parents, subtypeMap };
  }, [disorders]);



  // for search filtering
  const { filteredParents, matchedSubtypeIds } = useMemo(() => {
    if (!search.trim()) {
      return { filteredParents: parents, matchedSubtypeIds: new Set() };
    }

    const q = search.toLowerCase();

    const disorderMatches = (d) =>
      d.disorder_name.toLowerCase().includes(q) ||
      d.dsm_code.toLowerCase().includes(q) ||
      d.symptoms.some(s => s.symptom_name.toLowerCase().includes(q));

    // subtypes that directly match
    const matchedSubtypeIds = new Set(
      disorders
        .filter(d => d.is_subtype && disorderMatches(d))
        .map(d => d.disorder_id)
    );

    // parents that match directly, or have a matching subtype
    const filteredParents = parents.filter(p =>
      disorderMatches(p) ||
      (subtypeMap[p.disorder_id] ?? []).some(s => matchedSubtypeIds.has(s.disorder_id))
    );

    return { filteredParents, matchedSubtypeIds };
  }, [search, parents, subtypeMap, disorders]);

  // total counts for the header
  const totalDisorders = parents.length;
  const totalSymptoms = disorders.reduce((sum, d) => sum + d.symptoms.length, 0);

  return (
    <SidebarProvider>
      <AppSideBar />
      <SidebarInset>
        <TooltipProvider>
          <div className="p-6 space-y-6 w-full">

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-violet-600" />
                  DSM Reference Library
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Browse disorders, subtypes, and their diagnostic criteria
                </p>
              </div>

              {/* Stats */}
              {!loading && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4" />
                    {totalDisorders} disorders
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Activity className="h-4 w-4" />
                    {totalSymptoms} symptoms
                  </span>
                </div>
              )}
            </div>

            {/*search bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                className="pl-9"
                placeholder="Search disorders, DSM codes, or symptoms…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/*results count when searching*/}
            {search && !loading && (
              <p className="text-sm text-muted-foreground -mt-2">
                {filteredParents.length === 0
                  ? "No results found"
                  : `${filteredParents.length} disorder${filteredParents.length !== 1 ? "s" : ""} found`
                }
              </p>
            )}


            {error && (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
                <BookOpen className="h-8 w-8" />
                <p className="font-medium text-destructive">Failed to load reference data</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* skeletons when loading from rest api */}
            {loading && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* disorders */}
            {!loading && !error && (
              <div className="space-y-4">
                {filteredParents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
                    <Search className="h-8 w-8" />
                    <p className="font-medium">No disorders match your search</p>
                    <p className="text-sm">Try a different term or clear the search</p>
                  </div>
                ) : (
                  filteredParents.map((parent) => {
                    const subtypes = subtypeMap[parent.disorder_id] ?? [];

                    // when searching, only show subtypes that matched
                    const visibleSubtypes = search.trim()
                      ? subtypes.filter(s => matchedSubtypeIds.has(s.disorder_id))
                      : subtypes;

                    // auto open cards when theres an active search
                    const forceOpen = !!search.trim();

                    return (
                      <div key={parent.disorder_id} className="space-y-2">
                        {/* parent disorder card */}
                        <DisorderCard
                          disorder={parent}
                          isSubtype={false}
                          defaultOpen={forceOpen}
                        />

                        {/* subtype cards */}
                        {visibleSubtypes.length > 0 && (
                          <div className="space-y-2">
                            {visibleSubtypes.map((subtype) => (
                              <DisorderCard
                                key={subtype.disorder_id}
                                disorder={subtype}
                                isSubtype={true}
                                defaultOpen={forceOpen}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </TooltipProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}