"use client"

import { useState } from "react"
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ApprovalRequest, CurrentRole } from "@/types/approval"
import { getColumns } from "./columns"
import { ApprovalToolbar } from "./approval-toolbar"
import { CreateRequestModal } from "./modals/create-request-modal"
// FIX: Xoá import ReviewModal và DetailModal
// — 2 modal này đã được xử lý bên trong DataTableRowActions

interface ApprovalTableProps {
    data: ApprovalRequest[]
    role: CurrentRole
    onDataChange?: () => void
}

export function ApprovalTable({ data, role, onDataChange }: ApprovalTableProps) {

    // ── Table state ────────────────────────────────────────────────────────────
    const [sorting, setSorting]             = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [globalFilter, setGlobalFilter]   = useState("")

    // ── Modal state (chỉ còn Create) ──────────────────────────────────────────
    const [createOpen, setCreateOpen] = useState(false)

    // FIX: getColumns chỉ nhận role, không cần callbacks nữa
    const columns = getColumns(role)

    // ── Table instance ─────────────────────────────────────────────────────────
    const table = useReactTable({
        data,
        columns,
        meta:{
                onDataChange, // Truyền callback xuống cell nếu cần
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            pagination: { pageSize: 10 },
        },
    })

    return (
        <div className="space-y-4">

            {/* Toolbar */}
            <ApprovalToolbar
                table={table}
                role={role}
                onCreateClick={() => setCreateOpen(true)}
            />

            {/* Bảng chính */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Không có dữ liệu.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2">
                <p className="text-sm text-muted-foreground">
                    Hiển thị{" "}
                    <strong>
                        {table.getFilteredRowModel().rows.length === 0
                            ? 0
                            : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                        –
                        {Math.min(
                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                            table.getFilteredRowModel().rows.length
                        )}
                    </strong>{" "}
                    / <strong>{table.getFilteredRowModel().rows.length}</strong> yêu cầu
                </p>

                <div className="flex items-center gap-2">
                    <Select
                        value={String(table.getState().pagination.pageSize)}
                        onValueChange={(value) => table.setPageSize(Number(value))}
                    >
                        <SelectTrigger className="w-[100px] h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[5, 10, 20, 50].map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size} / trang
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        ← Trước
                    </Button>

                    <span className="text-sm">
                        Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Tiếp →
                    </Button>
                </div>
            </div>

            {/* Chỉ còn CreateRequestModal — Review và Detail nằm trong DataTableRowActions */}
            <CreateRequestModal
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSuccess={onDataChange}
            />
        </div>
    )
}