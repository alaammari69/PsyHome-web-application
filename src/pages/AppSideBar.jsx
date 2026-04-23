import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export default function AppSideBar() {
    const { open } = useSidebar()
    return (<>      
        <Sidebar collapsible="icon" variant="floating">
            <div className="relative">
                <SidebarTrigger className="absolute -right-8 top-4" />
            </div>
            <SidebarHeader className="relative">
                {open && <h2>PsyHome</h2>}
            </SidebarHeader>

            <SidebarContent>

                <SidebarGroup>
                    <SidebarGroupLabel>MAIN</SidebarGroupLabel>
                    <SidebarGroupAction></SidebarGroupAction>
                    <SidebarGroupContent></SidebarGroupContent>
                    <SidebarMenu>
                        {/* side bar items */}
                        <SidebarMenuItem>
                            <SidebarMenuButton></SidebarMenuButton>
                            <SidebarMenuAction></SidebarMenuAction>
                            <SidebarMenuBadge></SidebarMenuBadge>
                        </SidebarMenuItem>

                    </SidebarMenu>
                </SidebarGroup>

            </SidebarContent>
        </Sidebar>
    </>)
}