"use client"

// components/approval/approval-toolbar.tsx

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CurrentRole } from "@/types/approval"

interface ApprovalToolbarProps {
    search: string
    status: string
    onSearchChange: (value: string) => void
    onStatusChange: (value: string) => void
    onReset: () => void
    role: CurrentRole
    onCreateClick?: () => void
}

export function ApprovalToolbar({ search, status, onSearchChange, onStatusChange, onReset, role, onCreateClick }: ApprovalToolbarProps) {
    const isFiltered = !!search || status !== "ALL"

    return (
        <div className="flex items-center justify-between gap-2 flex-wrap">

            {/* ── Bên trái: Search + Filter ── */}
            <div className="flex items-center gap-2 flex-wrap flex-1">

                {/* Global search */}
                <Input
                    placeholder="Tìm kiếm tiêu đề, mô tả..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="max-w-xs"
                />

                {/* Filter theo trạng thái — ẩn với APPROVER vì BE đã cố định PENDING */}
                {role !== "APPROVER" && (
                    <Select value={status} onValueChange={onStatusChange}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả</SelectItem>
                            <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                            <SelectItem value="APPROVED">Đã chấp thuận</SelectItem>
                            <SelectItem value="REJECTED">Từ chối</SelectItem>
                        </SelectContent>
                    </Select>
                )}

                {/* Nút xoá bộ lọc */}
                {isFiltered && (
                    <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2">
                        Xoá bộ lọc
                        <X className="ml-1 h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* ── Bên phải: Tạo yêu cầu (chỉ USER) ── */}
            {role === "USER" && (
                <Button onClick={onCreateClick} size="sm">
                    + Tạo yêu cầu
                </Button>
            )}
        </div>
    )
}