"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Users, FileCheck, LayoutDashboard, GitBranch } from "lucide-react";
import { productService } from "@/lib/service/product-api";
import { useUser } from "@/context/UserContext";

const adminMenuItems = [
    { name: "Tổng quan", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Quản lý yêu cầu", href: "/dashboard/admin/requests", icon: FileCheck },
    { name: "Quản lý quy trình", href: "/dashboard/admin/workflows", icon: GitBranch },
    { name: "Quản lý người dùng", href: "/dashboard/admin/users", icon: Users },
];

const baseApproverMenuItems = [
    { name: "Yêu cầu cần duyệt", href: "/dashboard/approver", icon: FileCheck },
    { name: "Danh sách sản phẩm", href: "/dashboard/approver/products", icon: LayoutDashboard },
];

export function AdminSidebar() {
    const pathname = usePathname();
    return (
        <aside className="w-64 border-r bg-white h-[calc(100vh-3.5rem)] sticky top-14">
            <div className="p-4 space-y-2">
                <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Menu Quản trị
                </p>
                <nav className="space-y-1">
                    {adminMenuItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <div className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                                pathname === item.href
                                    ? "bg-blue-50 text-blue-600 shadow-sm"
                                    : "text-slate-600 hover:bg-slate-50"
                            )}>
                                <item.icon className={cn("w-4 h-4", pathname === item.href ? "text-blue-600" : "text-slate-400")} />
                                {item.name}
                            </div>
                        </Link>
                    ))}
                </nav>
            </div>
        </aside>
    );
}

export function ApproverSidebar() {
    const pathname = usePathname();
    const { userInfo } = useUser();
    const [hasProducts, setHasProducts] = useState(false);

    useEffect(() => {
        if (!userInfo?.userName) return;
        productService.getProductsByOwner(userInfo.userName)
            .then((res) => setHasProducts((res.result ?? []).length > 0))
            .catch(() => setHasProducts(false));
    }, [userInfo?.userName]);

    const approverMenuItems = baseApproverMenuItems.filter(
        (item) => item.href !== "/dashboard/approver/products" || hasProducts
    );

    return (
        <aside className="w-64 border-r bg-white h-[calc(100vh-3.5rem)] sticky top-14">
            <div className="p-4 space-y-2">
                <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Menu
                </p>
                <nav className="space-y-1">
                    {approverMenuItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <div className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                                pathname === item.href
                                    ? "bg-blue-50 text-blue-600 shadow-sm"
                                    : "text-slate-600 hover:bg-slate-50"
                            )}>
                                <item.icon className={cn("w-4 h-4", pathname === item.href ? "text-blue-600" : "text-slate-400")} />
                                {item.name}
                            </div>
                        </Link>
                    ))}
                </nav>
            </div>
        </aside>
    );
}