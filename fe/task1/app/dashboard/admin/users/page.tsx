"use client"
import React, { useEffect, useState } from "react";
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

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const response = await userService.getAllUsers();
            setUsers(response.result);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId: string) => {
        setDeletingId(userId);
        try {
            await userService.deleteUserById(userId);
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

    if (loading) return <div className="p-10 text-center">Đang tải danh sách người dùng...</div>;
    return (
        <div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <Button onClick={handleCreate} size="sm" className="cursor-pointer flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    + Thêm người dùng mới
                </Button>
                <CreateUpdateUserModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    userData={selectedUser}
                    onSuccess={fetchUsers}
                />
            </div>
        <div className="rounded-md border bg-white p-4 mt-3">
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
                    {users.map((user) => (
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
                                        setSelectedUser(user); // Phải set user được chọn vào đây
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
        </div>
    );
}