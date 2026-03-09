"use client"

import { useState,useMemo } from "react"
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    PaginationState,
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

interface ServerPagination {
    pageIndex: number
    pageCount: number
    totalElements: number
    onPageChange: (page: number) => void
}

interface FilterState {
    search: string
    status: string
    onSearchChange: (value: string) => void
    onStatusChange: (value: string) => void
    onReset: () => void
}

interface ApprovalTableProps {
    data: ApprovalRequest[]
    role: CurrentRole
    currentUserName?: string
    onDataChange?: () => void
    serverPagination: ServerPagination
    isFetching?: boolean
    filterState: FilterState
}

export function ApprovalTable({ data, role, currentUserName, onDataChange, serverPagination, isFetching, filterState }: ApprovalTableProps) {

    // ── Table state ────────────────────────────────────────────────────────────
    const [sorting, setSorting]       = useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

    // ── Modal state (chỉ còn Create) ──────────────────────────────────────────
    const [createOpen, setCreateOpen] = useState(false)

    const columns = useMemo(
        () => getColumns(role, currentUserName, data),
        [role, currentUserName, data]
    )

    const pagination: PaginationState = { pageIndex: serverPagination.pageIndex, pageSize: 5 }

    // ── Table instance ─────────────────────────────────────────────────────────
    const table = useReactTable({
        data,
        columns,
        meta: { onDataChange },
        state: { sorting, columnVisibility, pagination },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: (updater) => {
            const next = typeof updater === "function" ? updater(pagination) : updater
            serverPagination.onPageChange(next.pageIndex)
        },
        manualPagination: true,
        pageCount: serverPagination.pageCount,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <div className="space-y-4">

            {/* Toolbar */}
            <ApprovalToolbar
                search={filterState.search}
                status={filterState.status}
                onSearchChange={filterState.onSearchChange}
                onStatusChange={filterState.onStatusChange}
                onReset={filterState.onReset}
                role={role}
                onCreateClick={() => setCreateOpen(true)}
            />

            {/* Bảng chính */}
            <div className={`rounded-md border relative transition-opacity duration-150 ${isFetching ? "opacity-50 pointer-events-none" : ""}`}>
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
                {(() => {
                    const { pageIndex, pageSize } = table.getState().pagination
                    const total = serverPagination.totalElements
                    const from = total === 0 ? 0 : pageIndex * pageSize + 1
                    const to = Math.min((pageIndex + 1) * pageSize, total)
                    return (
                        <p className="text-sm text-muted-foreground">
                            Hiển thị <strong>{from}–{to}</strong> / <strong>{total}</strong> yêu cầu
                        </p>
                    )
                })()}

                <div className="flex items-center gap-2">

                    <Button
                        className="cursor-pointer"
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage() || isFetching}
                    >
                        ← Trước
                    </Button>

                    <span className="text-sm">
                        Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                    </span>

                    <Button
                        className="cursor-pointer"
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage() || isFetching}
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