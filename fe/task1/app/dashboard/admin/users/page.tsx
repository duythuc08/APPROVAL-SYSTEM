"use client"
import React, { useEffect, useRef, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {UserCog, Shield, Delete, DeleteIcon, ArchiveX, Loader2} from "lucide-react";
import { userService } from "@/lib/service/user-api";
import {CreateUpdateUserModal, DEPARTMENTS} from "@/app/dashboard/admin/users/create-updateUser";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const ROLES = [
    { value: "ALL", label: "Tất cả" },
    { value: "ADMIN", label: "Admin" },
    { value: "APPROVER", label: "Approver" },
    { value: "USER", label: "User" },
];

const PAGE_SIZE = 5;

type UserPageResult = { users: any[]; totalPages: number }

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const cache = useRef<Map<string, UserPageResult>>(new Map());

    const applyResult = (result: UserPageResult) => {
        setUsers(result.users);
        setTotalPages(result.totalPages);
    };

    const prefetchPage = (page: number, role: string) => {
        if (role !== "ALL") return;
        const key = `${page}-${role}`;
        if (cache.current.has(key)) return;
        userService.getAllUsers(page, PAGE_SIZE)
            .then(res => cache.current.set(key, { users: res.result.content, totalPages: res.result.totalPages }))
            .catch(() => {});
    };

    const fetchUsers = async (page: number, role: string) => {
        const key = `${page}-${role}`;
        if (cache.current.has(key)) {
            applyResult(cache.current.get(key)!);
            prefetchPage(page + 1, role);
            return;
        }
        setIsFetching(true);
        try {
            let result: UserPageResult;
            if (role !== "ALL") {
                const response = await userService.getAllUsersWithRoles(role);
                result = { users: response.result, totalPages: 1 };
            } else {
                const response = await userService.getAllUsers(page, PAGE_SIZE);
                result = { users: response.result.content, totalPages: response.result.totalPages };
            }
            cache.current.set(key, result);
            applyResult(result);
            if (role === "ALL" && page + 1 < result.totalPages) prefetchPage(page + 1, role);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setIsFetching(false);
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(0);
        cache.current.clear();
    }, [selectedRole]);

    useEffect(() => {
        fetchUsers(currentPage, selectedRole);
    }, [selectedRole, currentPage]);

    const handleDeleteUser = async (userId: string) => {
        setDeletingId(userId);
        try {
            await userService.deleteUserById(userId);
            cache.current.clear();
            setUsers((prev) => prev.filter((user) => user.userId !== userId));
        } catch (error) {
            setError("Không thể xóa người dùng. Vui lòng thử lại sau.");
        } finally {
            setDeletingId(null);
        }
    }

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    if (initialLoading) return (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
            Đang tải...
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <Button onClick={handleCreate} size="sm" className="cursor-pointer flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        + Thêm người dùng mới
                    </Button>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="w-[150px] h-9 text-sm cursor-pointer">
                            <SelectValue placeholder="Lọc vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                            {ROLES.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <CreateUpdateUserModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    userData={selectedUser}
                    onSuccess={() => { cache.current.clear(); fetchUsers(currentPage, selectedRole); }}
                />
            </div>
        <div className="relative rounded-md border bg-white p-4 mt-3">
            {isFetching && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/60">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            )}
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50">
                        <TableHead>Họ và Tên</TableHead>
                        <TableHead>Tên đăng nhập</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phòng ban</TableHead>
                        <TableHead>Vai trò</TableHead>
                        <TableHead className="text-center w-[150px]">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                Không có người dùng nào.
                            </TableCell>
                        </TableRow>
                    ) : users.map((user) => (
                        <TableRow key={user.userId}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.userName}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{DEPARTMENTS.find(d => d.value === user.department)?.label ?? "—"}</TableCell>
                            <TableCell>
                                {user.roles?.map((role: any) => (
                                    <Badge
                                        key={role.roleId}
                                        variant="secondary"
                                        className="flex w-fit items-center gap-1 bg-blue-50 text-blue-600 border-blue-100"
                                    >
                                        <Shield className="h-3 w-3" />
                                        {role.roleName}
                                    </Badge>
                                ))}
                            </TableCell>
                            <TableCell className="text-center flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <UserCog className="h-4 w-4" />
                                    Sửa
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={deletingId === user.userId}
                                            className="cursor-pointer flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                        >
                                            {deletingId === user.userId
                                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                                : <ArchiveX className="h-4 w-4" />}
                                            {deletingId === user.userId ? "Đang xóa..." : "Xóa"}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Bạn có chắc muốn xóa người dùng này không? Hành động này không thể hoàn tác.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteUser(user.userId)}>Xóa</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
            {selectedRole === "ALL" && totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mt-3">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 0 || isFetching}
                        onClick={() => setCurrentPage((p) => p - 1)}
                    >
                        Trước
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Trang {currentPage + 1} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages - 1 || isFetching}
                        onClick={() => setCurrentPage((p) => p + 1)}
                    >
                        Sau
                    </Button>
                </div>
            )}
        </div>
    );
}
