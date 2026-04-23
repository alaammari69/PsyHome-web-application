import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSideBar from "./AppSideBar";

export default function DashBoard() {
    return (<>
        
        <SidebarProvider>
            <AppSideBar/>
        </SidebarProvider>
    </>)
}