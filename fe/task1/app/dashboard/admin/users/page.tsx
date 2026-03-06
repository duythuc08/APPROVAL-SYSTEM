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

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState("ALL");

    const fetchUsers = async (role: string = "ALL") => {
        setLoading(true);
        try {
            const response = role !== "ALL"
                ? await userService.getAllUsersWithRoles(role)
                : await userService.getAllUsers();
            setUsers(response.result);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(selectedRole);
    }, [selectedRole]);

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
                    onSuccess={() => fetchUsers(selectedRole)}
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
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                                Đang tải...
                            </TableCell>
                        </TableRow>
                    ) : users.length === 0 ? (
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