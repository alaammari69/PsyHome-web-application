// ─── required shadcn components — run these if not installed yet ───
// npx shadcn@latest add table
// npx shadcn@latest add badge
// npx shadcn@latest add button
// npx shadcn@latest add skeleton
// npx shadcn@latest add alert-dialog

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const API_URL = import.meta.env.VITE_API_URL


export default function AdminPage() {

    // useState holds data, when we call the setter the page rerenders
    const [psychiatrists, setPsychiatrists] = useState([]) 
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // fetch the list once when the page loads
    // useEffect with [] runs only once after the component first appears
    useEffect(() => {
        async function fetchAll() {
            try {
                const res = await fetch(`${API_URL}/all_psychiatrists`, {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: sessionStorage.getItem("token"),
                    },
                })
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const data = await res.json()
                setPsychiatrists(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    // toggle account_verified true / false
    // we send a PATCH to the API then update local state so UI reflects instantly
    async function toggleVerified(id, currentValue) {
        try {
            const res = await fetch(`${API_URL}/psychiatrist/verification`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    authorization: sessionStorage.getItem("token"),
                },
                body: JSON.stringify({
                    psych_id: id,
                    account_verified: !currentValue
                }),
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)

            // .map() goes through every item; update only the matching one
            setPsychiatrists(prev =>
                prev.map(p => p.id === id ? { ...p, account_verified: !currentValue } : p)
                //                           ↑ spread keeps all other fields, just overrides account_verified
            )
        } catch (err) {
            alert(`Failed: ${err.message}`)
        }
    }

    // ── Action: toggle psy_type "PSY" ↔ "ADMIN" ──
    async function toggleType(id, currentType) {
        const newType = currentType === "ADMIN" ? "PSY" : "ADMIN"
        try {
            const res = await fetch(`${API_URL}/psychiatrist/access`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    authorization: sessionStorage.getItem("token"),
                },
                body: JSON.stringify({
                    psych_id: id,
                    psy_type: newType
                }),
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)

            setPsychiatrists(prev =>
                prev.map(p => p.id === id ? { ...p, psy_type: newType } : p)
            )
        } catch (err) {
            alert(`Failed: ${err.message}`)
        }
    }

    // ── Action: delete a psychiatrist ──
    // AlertDialog (confirm popup) calls this after the user confirms
    async function deleteAccount(id) {
        try {
            const res = await fetch(`${API_URL}/psychiatrist`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    authorization: sessionStorage.getItem("token"),
                },
                body: JSON.stringify({
                    psy_id: id
                })
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)

            // .filter() removes the deleted item from local state
            setPsychiatrists(prev => prev.filter(p => p.id !== id))
        } catch (err) {
            alert(`Failed: ${err.message}`)
        }
    }

    // ─────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────
    return (
        <div className="p-8 space-y-6 max-w-6xl mx-auto">

            {/* ── Header ── */}
            <div>
                <h1 className="text-2xl font-semibold">Psychiatrists</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {!loading && `${psychiatrists.length} accounts`}
                </p>
            </div>

            {/* ── Error state ── */}
            {error && (
                <p className="text-sm text-destructive">Failed to load: {error}</p>
            )}

            {/* ── Table ── */}
            {/* shadcn Table = styled <table> split into sub-components:
                  TableHeader > TableRow > TableHead   (= <thead><tr><th>)
                  TableBody  > TableRow > TableCell    (= <tbody><tr><td>) */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {loading ? (
                        // Skeleton rows while waiting for API response
                        // Array.from({length:5}) creates 5 empty slots to loop over
                        Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({ length: 6 }).map((_, j) => (
                                    <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : psychiatrists.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                No psychiatrists found
                            </TableCell>
                        </TableRow>
                    ) : (
                        // .map() turns each dict from the API into a table row
                        // "key" is required by React to track rows efficiently
                        psychiatrists.map((p) => (
                            <TableRow key={p.id}>

                                {/* Name */}
                                <TableCell className="font-medium">
                                    {p.first_name} {p.last_name}
                                    <div className="text-xs text-muted-foreground font-mono">{p.cin}</div>
                                </TableCell>

                                {/* Email */}
                                <TableCell className="text-sm text-muted-foreground">
                                    {p.email}
                                </TableCell>

                                {/* Specialization */}
                                <TableCell className="text-sm">
                                    {p.specialization ?? "—"}
                                </TableCell>

                                {/* Type badge — shadcn Badge with variant based on type */}
                                <TableCell>
                                    <Badge variant={p.psy_type === "ADMIN" ? "default" : "secondary"}>
                                        {p.psy_type}
                                    </Badge>
                                </TableCell>

                                {/* Verified badge */}
                                <TableCell>
                                    {/* ternary: condition ? valueIfTrue : valueIfFalse */}
                                    <Badge variant={p.account_verified ? "default" : "outline"}>
                                        {p.account_verified ? "Verified" : "Unverified"}
                                    </Badge>
                                </TableCell>

                                {/* Action buttons */}
                                <TableCell>
                                    <div className="flex items-center gap-2">

                                        {/* Verify / Unverify toggle */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleVerified(p.id, p.account_verified)}
                                        >
                                            {p.account_verified ? "Unverify" : "Verify"}
                                        </Button>

                                        {/* Type toggle PSY ↔ ADMIN */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleType(p.id, p.psy_type)}
                                        >
                                            {p.psy_type === "ADMIN" ? "Make PSY" : "Make Admin"}
                                        </Button>

                                        {/* Delete — wrapped in AlertDialog so user must confirm first */}
                                        {/* AlertDialog shows a modal popup asking "are you sure?" */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                {/* asChild makes Button the trigger instead of a wrapper div */}
                                                <Button variant="destructive" size="sm">
                                                    Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete account?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete {p.first_name} {p.last_name}'s account.
                                                        This cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteAccount(p.id)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                    </div>
                                </TableCell>

                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}