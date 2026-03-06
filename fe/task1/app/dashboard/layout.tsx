"use client"
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { Navbar } from "@/components/navbar";
import {AdminSidebar, ApproverSidebar} from "@/components/sidebar";
import {cn} from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/"); // Không có token thì về trang login
            return;
        }

        try {
            const decoded: any = jwtDecode(token);
            const role = decoded.scope; // "ROLE_USER", "ROLE_ADMIN", "ROLE_APPROVER"

            // Logic bảo vệ Route:
            // Nếu pathname bắt đầu bằng /admin mà role không phải ADMIN thì redirect
            if (pathname.startsWith("/dashboard/admin") && role !== "ROLE_ADMIN") {
                router.push("/");
            } else if (pathname.startsWith("/dashboard/approver") && role !== "ROLE_APPROVER") {
                router.push("/");
            } else if (pathname.startsWith("/dashboard/user") && role !== "ROLE_USER") {
                router.push("/");
            } else {
                setAuthorized(true);
            }
        } catch (error) {
            localStorage.removeItem("token");
            router.push("/");
        }
    }, [pathname, router]);

    if (!authorized) return null; // Hoặc loading spinner

    const isAdminRoute = pathname.startsWith("/dashboard/admin");
    const isApproverRoute = pathname.startsWith("/dashboard/approver");
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                {/* Chỉ hiện Sidebar nếu là route admin */}
                {isAdminRoute && <AdminSidebar />}

                {/* Hiện sidebar tương tự cho approver */}
                {isApproverRoute && <ApproverSidebar />}
                <main className={cn(
                    "flex-1 p-6 bg-slate-50/50",
                    !isAdminRoute && "container mx-auto" // Nếu là user thường thì căn giữa
                )}>
                    {children}
                </main>
            </div>
        </div>
    );
}