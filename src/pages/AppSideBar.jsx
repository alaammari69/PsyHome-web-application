import { useLocation, useNavigate } from "react-router-dom";
import {
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
    SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
    SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    Users, BookOpen, User, LogOut, Brain, LayoutDashboard,
} from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";

// ── Nav items ─────────────────────────────────────────────────
const MAIN_NAV = [
    { label: "Patients", icon: Users, path: "/patients" },
    { label: "Reference", icon: BookOpen, path: "/reference" },
];

const BOTTOM_NAV = [
    { label: "My Profile", icon: User, path: "/profile" },
];

export default function AppSideBar() {
    const { open } = useSidebar();
    const location = useLocation();
    const navigate = useNavigate();

    function isActive(path) {
        return location.pathname.startsWith(path);
    }

    function handleLogout() {
        sessionStorage.removeItem("token");
        navigate("/login");
    }

    return (
        <TooltipProvider>
            <Sidebar collapsible="icon" variant="floating">

                {/* ── Trigger (collapse/expand button) ── */}
                <div className="relative">
                    <SidebarTrigger className="absolute -right-8 top-4" />
                </div>

                {/* ── Header — app name + logo ── */}
                <SidebarHeader className="px-3 py-4">
                    <div className="flex items-center gap-2.5">
                        {/* Logo mark — always visible even when collapsed */}
                        <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                            <Brain className="h-4 w-4 text-white" />
                        </div>
                        {/* App name — hidden when collapsed */}
                        {open && (
                            <div>
                                <p className="font-bold text-sm leading-none">PsyHome</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    Clinical Dashboard
                                </p>
                            </div>
                        )}
                    </div>
                </SidebarHeader>

                <Separator />

                {/* ── Main content ── */}
                <SidebarContent className="px-2 py-3">

                    {/* Main navigation */}
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest text-muted-foreground px-2 mb-1">
                            MAIN
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {MAIN_NAV.map(({ label, icon: Icon, path }) => (
                                    <SidebarMenuItem key={path}>
                                        <SidebarMenuButton
                                            onClick={() => navigate(path)}
                                            isActive={isActive(path)}
                                            tooltip={label} // shown when collapsed
                                            className={`
                                            gap-3 rounded-md transition-colors
                                            ${isActive(path)
                                                    ? "bg-violet-50 text-violet-700 font-medium hover:bg-violet-100"
                                                    : "hover:bg-muted"
                                                }
                                        `}
                                        >
                                            <Icon className={`h-4 w-4 shrink-0 ${isActive(path) ? "text-violet-600" : "text-muted-foreground"}`} />
                                            <span>{label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                </SidebarContent>

                {/* ── Footer — profile + logout ── */}
                <SidebarFooter className="px-2 py-3">
                    <Separator className="mb-3" />
                    <SidebarMenu>
                        {/* Profile */}
                        {BOTTOM_NAV.map(({ label, icon: Icon, path }) => (
                            <SidebarMenuItem key={path}>
                                <SidebarMenuButton
                                    onClick={() => navigate(path)}
                                    isActive={isActive(path)}
                                    tooltip={label}
                                    className={`
                                    gap-3 rounded-md transition-colors
                                    ${isActive(path)
                                            ? "bg-violet-50 text-violet-700 font-medium hover:bg-violet-100"
                                            : "hover:bg-muted"
                                        }
                                `}
                                >
                                    <Icon className={`h-4 w-4 shrink-0 ${isActive(path) ? "text-violet-600" : "text-muted-foreground"}`} />
                                    <span>{label}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}

                        {/* Logout */}
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={handleLogout}
                                tooltip="Log out"
                                className="gap-3 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                            >
                                <LogOut className="h-4 w-4 shrink-0" />
                                <span>Log out</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>

            </Sidebar>
        </TooltipProvider>
    );
}