"use client"
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { Navbar } from "@/components/navbar";
import {AdminSidebar, ApproverSidebar} from "@/components/sidebar";
import {cn} from "@/lib/utils";
import {NotificationProvider} from "@/context/NotificationContext";
import {Toaster} from "@/components/ui/sonner";
import {useWebSocket} from "@/hooks/useWebSocket";
import {useNotifications} from "@/context/NotificationContext";

// Component rieng de goi useWebSocket + load thong bao cu tu DB
function WebSocketConnector({ role, token }: { role: string; token: string }) {
    const { loadNotifications } = useNotifications();
    useWebSocket(role, token);
    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);
    return null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);
    const [role, setRole] = useState("");
    const [token, setToken] = useState("");

    useEffect(() => {
        const storedToken = localStorage.getItem("token");

        if (!storedToken) {
            router.push("/");
            return;
        }

        try {
            const decoded: any = jwtDecode(storedToken);
            const userRole = decoded.scope; // "ROLE_USER", "ROLE_ADMIN", "ROLE_APPROVER"

            if (pathname.startsWith("/dashboard/admin") && userRole !== "ROLE_ADMIN") {
                router.push("/");
            } else if (pathname.startsWith("/dashboard/approver") && userRole !== "ROLE_APPROVER") {
                router.push("/");
            } else if (pathname.startsWith("/dashboard/user") && userRole !== "ROLE_USER") {
                router.push("/");
            } else {
                setAuthorized(true);
                setRole(userRole);
                setToken(storedToken);
            }
        } catch (error) {
            localStorage.removeItem("token");
            router.push("/");
        }
    }, [pathname, router]);

    if (!authorized) return null;

    const isAdminRoute = pathname.startsWith("/dashboard/admin");
    const isApproverRoute = pathname.startsWith("/dashboard/approver");
    return (
        <NotificationProvider>
            <WebSocketConnector role={role} token={token} />
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex flex-1">
                    {isAdminRoute && <AdminSidebar />}
                    {isApproverRoute && <ApproverSidebar />}
                    <main className={cn(
                        "flex-1 p-6 bg-slate-50/50",
                        !isAdminRoute && "container mx-auto"
                    )}>
                        {children}
                    </main>
                </div>
            </div>
            <Toaster />
        </NotificationProvider>
    );
}