"use client"

// components/approval/approval-toolbar.tsx

import { Table } from "@tanstack/react-table"
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
import { CurrentRole, ApprovalRequest } from "@/types/approval"

interface ApprovalToolbarProps {
    table: Table<ApprovalRequest>
    role: CurrentRole
    onCreateClick?: () => void   // Chỉ dùng khi role === "USER"
}

export function ApprovalToolbar({ table, role, onCreateClick }: ApprovalToolbarProps) {
    const isFiltered =
        table.getState().columnFilters.length > 0 ||
        !!table.getState().globalFilter

    return (
        <div className="flex items-center justify-between gap-2 flex-wrap">

            {/* ── Bên trái: Search + Filter ── */}
            <div className="flex items-center gap-2 flex-wrap flex-1">

                {/* Global search */}
                <Input
                    placeholder="Tìm kiếm tiêu đề, mô tả..."
                    value={(table.getState().globalFilter as string) ?? ""}
                    onChange={(e) => {
                        table.setGlobalFilter(e.target.value)
                        table.setPageIndex(0)   // Reset về trang 1 khi search
                    }}
                    className="max-w-xs"
                />

                {/* Filter theo trạng thái */}
                <Select
                    value={
                        (table.getColumn("ApprovalStatus")?.getFilterValue() as string[])?.[0] ?? "ALL"
                    }
                    onValueChange={(value) => {
                        if (value === "ALL") {
                            table.getColumn("ApprovalStatus")?.setFilterValue(undefined)
                        } else {
                            table.getColumn("ApprovalStatus")?.setFilterValue([value])
                        }
                        table.setPageIndex(0)
                    }}
                >
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

                {/* Nút xoá bộ lọc */}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            table.resetColumnFilters()
                            table.setGlobalFilter("")
                        }}
                        className="h-8 px-2"
                    >
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