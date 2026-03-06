"use client"
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { userService } from "@/lib/service/user-api";
import { Loader2 } from "lucide-react"; // Import icon loading

export const AVAILABLE_ROLES = [
    { id: "ADMIN", label: "Admin" },
    { id: "USER", label: "User" },
    { id: "APPROVER", label: "Approver" },
];

export const DEPARTMENTS = [
    { value: "MARKETING", label: "Marketing" },
    { value: "SALES", label: "Sales" },
    { value: "GENERAL_ADMINISTRATION", label: "Hành chính tổng hợp" },
    { value: "PROCUREMENT_FACILITIES", label: "Mua sắm & Cơ sở vật chất" },
    { value: "HUMAN_RESOURCE", label: "Nhân sự" },
    { value: "SECURITY_TEAM", label: "Bảo vệ" },
    { value: "TECHNICAL_TEAM", label: "Kỹ thuật" },
];

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    userData: any | null;
    onSuccess: () => void;
}

export function CreateUpdateUserModal({ isOpen, onClose, userData, onSuccess }: UserModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false); // State quản lý loading

    const form = useForm({
        defaultValues: {
            userName: "",
            passWord: "",
            email: "",
            name: "",
            department: "",
            roles: [] as string[],
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (userData) {
                form.reset({
                    userName: userData.userName,
                    passWord: "",
                    email: userData.email,
                    name: userData.name,
                    department: userData.department || "",
                    roles: userData.roles?.map((r: any) => r.roleName) || [],
                });
            } else {
                form.reset({
                    userName: "",
                    passWord: "",
                    email: "",
                    name: "",
                    department: "",
                    roles: ["USER"],
                });
            }
        }
    }, [userData, form, isOpen]);

    const onSubmit = async (values: any) => {
        setIsSubmitting(true); // Bắt đầu loading
        try {
            if (userData) {
                await userService.updateUser(userData.userId, values);
            } else {
                await userService.createUser(values);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Lỗi khi lưu user:", error);
        } finally {
            setIsSubmitting(false); // Kết thúc loading
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{userData ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="userName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên đăng nhập</FormLabel>
                                    <FormControl>
                                        <Input  placeholder="admin123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {!userData && (
                            <FormField
                                control={form.control}
                                name="passWord"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mật khẩu</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSubmitting} type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Họ và Tên</FormLabel>
                                    <FormControl>
                                        <Input disabled={isSubmitting} placeholder="Nguyễn Văn A" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input disabled={isSubmitting} type="email" placeholder="example@gmail.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phòng ban</FormLabel>
                                    <Select
                                        disabled={isSubmitting}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Chọn phòng ban" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {DEPARTMENTS.map((dept) => (
                                                <SelectItem key={dept.value} value={dept.value}>
                                                    {dept.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="roles"
                            render={() => (
                                <FormItem>
                                    <FormLabel className="text-base">Vai trò (Roles)</FormLabel>
                                    <div className="grid grid-cols-3 gap-2 border p-3 rounded-md bg-slate-50/50">
                                        {AVAILABLE_ROLES.map((role) => (
                                            <FormField
                                                key={role.id}
                                                control={form.control}
                                                name="roles"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <Checkbox
                                                                    className="cursor-pointer"
                                                                    disabled={isSubmitting}
                                                                    checked={field.value?.includes(role.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...field.value, role.id])
                                                                            : field.onChange(field.value?.filter((value) => value !== role.id))
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal cursor-pointer text-sm">
                                                                {role.label}
                                                            </FormLabel>
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="cursor-pointer"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="cursor-pointer min-w-[100px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    userData ? "Lưu thay đổi" : "Tạo mới"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}