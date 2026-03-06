"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuLabel,
//     DropdownMenuSeparator,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
import {
    ApprovalRequest,
    AppUser,
    Product,
    CurrentRole,
    ColumnCallbacks,
} from "@/types/approval"
import {DataTableRowActions} from "@/components/approval/approval-row-actions";

// ─── Status config ─────────────────────────────────────────────────────────────

const statusConfig: Record<string, {
    label: string
    variant: "outline" | "secondary" | "destructive"
    icon: React.ReactNode
    className: string
}> = {
    PENDING: {
        label: "Chờ duyệt",
        variant: "outline",
        icon: <Clock className="w-3 h-3" />,
        className: "border-yellow-500 bg-yellow-50 text-yellow-700",
    },
    APPROVED: {
        label: "Đã duyệt",
        variant: "outline",
        icon: <CheckCircle className="w-3 h-3" />,
        className: "border-green-500 bg-green-50 text-green-700",
    },
    REJECTED: {
        label: "Đã từ chối",
        variant: "outline",
        icon: <XCircle className="w-3 h-3" />,
        className: "border-red-500 bg-red-50 text-red-700",
    },
}

// ─── Avatar ────────────────────────────────────────────────────────────────────

function UserAvatar({ name }: { name: string }) {
    return (
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {name?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
    )
}

// ─── getColumns ────────────────────────────────────────────────────────────────

export function getColumns(
    role: CurrentRole,
): ColumnDef<ApprovalRequest>[] {

    const titleColumn: ColumnDef<ApprovalRequest> = {
        accessorKey: "title",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="px-0 font-semibold"
            >
                Tiêu đề
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const title: string = row.getValue("title")
            const desc = row.original.approvalDescription
            return (
                <div className="max-w-[280px]">
                    <p className="font-medium text-sm truncate">{title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{desc}</p>
                </div>
            )
        },
    }

    const productsColumn: ColumnDef<ApprovalRequest> = {
        accessorKey: "products",
        header: "Sản phẩm",
        enableSorting: false,
        cell: ({ row }) => {
            const products: Product[] = row.getValue("products")
            const visible = products.slice(0, 2)
            const remaining = products.length - 2
            return (
                <div className="flex flex-wrap gap-1">
                    {visible.map((p) => (
                        <Badge key={p.productId} variant="outline" className="text-xs">
                            {p.productName}
                        </Badge>
                    ))}
                    {remaining > 0 && (
                        <Badge variant="secondary" className="text-xs">+{remaining}</Badge>
                    )}
                </div>
            )
        },
    }

    const creatorColumn: ColumnDef<ApprovalRequest> = {
        accessorKey: "creatorUser",
        header: "Người yêu cầu",
        enableSorting: false,
        filterFn: (row, _id, filterValue: string) => {
            const user: AppUser = row.getValue("creatorUser")
            return user.name.toLowerCase().includes(filterValue.toLowerCase())
        },
        cell: ({ row }) => {
            const user: AppUser = row.getValue("creatorUser")
            return (
                <div className="flex items-center gap-2">
                    <UserAvatar name={user.name} />
                    <div>
                        <p className="text-sm font-medium">{user.name}</p>
                    </div>
                </div>
            )
        },
    }

    const approverColumn: ColumnDef<ApprovalRequest> = {
        accessorKey: "currentApprover",
        header: "Người duyệt",
        enableSorting: false,
        cell: ({ row }) => {
            const approver: AppUser = row.getValue("currentApprover")
            return (
                <div className="flex items-center gap-2">
                    <UserAvatar name={approver.name} />
                    <div>
                        <p className="text-sm font-medium">{approver.name}</p>
                    </div>
                </div>
            )
        },
    }

    const statusColumn: ColumnDef<ApprovalRequest> = {
        accessorKey: "ApprovalStatus",
        header: "Trạng thái",
        filterFn: (row, columnId, filterValue: string[]) => {
            if (!filterValue?.length) return true
            const status: string = row.getValue(columnId)
            return filterValue.includes(status)
        },
        cell: ({ row }) => {
            const status: string = row.getValue("ApprovalStatus")
            const config = statusConfig[status] ?? {
                label: status,
                variant: "outline" as const,
                icon: null,
                className: "",
            }
            return (
                <Badge
                    variant={config.variant}
                    className={`flex items-center gap-1 w-fit ${config.className}`}
                >
                    {config.icon}
                    {config.label}
                </Badge>
            )
        },
    }

    const feedbackColumn: ColumnDef<ApprovalRequest> = {
        accessorKey: "feedback",
        header: "Phản hồi",
        enableSorting: false,
        cell: ({ row }) => {
            const feedback: string | null = row.getValue("feedback")
            if (!feedback) return <span className="text-muted-foreground text-sm">—</span>
            return (
                <span className="text-sm italic text-yellow-600 max-w-[180px] truncate block">
                    `{feedback}`
                </span>
            )
        },
    }

    const timeColumn: ColumnDef<ApprovalRequest> = {
        accessorKey: "createdAt",
    }

    const actionsColumn: ColumnDef<ApprovalRequest> = {
        id: "actions",
        header: "Hành động",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row, table }) => (
            <DataTableRowActions
                row={row}
                role={role}
                onDataChange={(table.options.meta as any)?.onDataChange}  // ← lấy từ meta
            />
        ),
    }

    if (role === "ADMIN") {
        return [titleColumn, creatorColumn, approverColumn, statusColumn, feedbackColumn, actionsColumn]
    }

    if (role === "APPROVER") {
        return [titleColumn, creatorColumn, statusColumn, feedbackColumn, actionsColumn]
    }

    // USER
    return [titleColumn, statusColumn, feedbackColumn, actionsColumn]
}