"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { userService } from "@/lib/service/user-api";
import { authService } from "@/lib/service/auth-api";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {NotificationBell} from "@/components/notifications/NotificationBell";

// Component Avatar nhỏ gọn
function UserAvatar({ name }: { name: string }) {
    return (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 cursor-pointer hover:bg-blue-700 transition-colors">
            {name?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
    )
}

export function Navbar() {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<any>(null);

    const handleLogout = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                await authService.logout(token);
            } catch (error) {
                console.error("Logout BE failed:", error);
            }
        }
        localStorage.removeItem("token");
        localStorage.removeItem("token_expiry");
        router.push("/login");
        router.refresh();
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchUserInfo = async () => {
            try {
                const response = await userService.getMyInfo();
                if (response && response.result) {
                    setUserInfo(response.result);
                }
            } catch (error) {
                console.error("Failed to fetch user info:", error);
                handleLogout();
            }
        };

        if (!userInfo) {
            fetchUserInfo();
        }
    }, [userInfo, router]);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center justify-between px-8">
                {/* Bên trái: Tên dự án */}
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold tracking-tight">
                        APPROVAL SYSTEM
                    </span>
                </div>

                {/* Bên phải: User Menu */}
                <div className="flex items-center gap-4">
                    {userInfo ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-3 cursor-pointer outline-none">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-semibold leading-none">{userInfo.name}</p>
                                    </div>
                                    <UserAvatar name={userInfo.name} />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{userInfo.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Trang cá nhân</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Cài đặt</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-500 focus:text-red-500 cursor-pointer"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Đăng xuất</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="h-8 w-24 animate-pulse bg-muted rounded-md" /> // Loading skeleton
                    )}
                    <NotificationBell />
                </div>
            </div>
        </header>
    );
}