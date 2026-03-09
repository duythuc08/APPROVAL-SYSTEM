"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ApprovalRequest, CurrentRole } from "@/types/approval"
import { DataTableRowActions } from "@/components/approval/approval-row-actions"

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
        label: "Từ chối",
        variant: "outline",
        icon: <XCircle className="w-3 h-3" />,
        className: "border-red-500 bg-red-50 text-red-700",
    },
}

export function getColumns(role: CurrentRole): ColumnDef<ApprovalRequest>[] {

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
            const templateName = row.original.templateName
            return (
                <div className="max-w-[280px]">
                    <p className="font-medium text-sm truncate">{title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{templateName}</p>
                </div>
            )
        },
    }

    const creatorColumn: ColumnDef<ApprovalRequest> = {
        accessorKey: "creatorName",
        header: "Người yêu cầu",
        enableSorting: false,
        cell: ({ row }) => {
            const name: string = row.getValue("creatorName")
            return (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {name?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <p className="text-sm font-medium">{name}</p>
                </div>
            )
        },
    }

    const progressColumn: ColumnDef<ApprovalRequest> = {
        id: "progress",
        header: "Tiến trình",
        enableSorting: false,
        cell: ({ row }) => {
            const { currentStepOrder, totalSteps, approvalStatus } = row.original
            const completed = approvalStatus === "APPROVED"
                ? totalSteps
                : approvalStatus === "REJECTED"
                    ? currentStepOrder
                    : currentStepOrder - 1
            const pct = totalSteps > 0 ? (completed / totalSteps) * 100 : 0
            return (
                <div className="flex items-center gap-2 min-w-[100px]">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${
                                approvalStatus === "REJECTED" ? "bg-red-400" :
                                    approvalStatus === "APPROVED" ? "bg-green-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {completed}/{totalSteps}
                    </span>
                </div>
            )
        },
    }

    const currentApproverColumn: ColumnDef<ApprovalRequest> = {
        id: "currentApprover",
        header: "Đang chờ",
        enableSorting: false,
        cell: ({ row }) => {
            const { currentApproverName, currentStepName, approvalStatus } = row.original
            if (approvalStatus !== "PENDING") {
                return <span className="text-muted-foreground text-sm">--</span>
            }
            return (
                <div className="max-w-[160px]">
                    <p className="text-sm font-medium truncate">{currentApproverName ?? currentStepName ?? "--"}</p>
                    {currentStepName && currentApproverName && (
                        <p className="text-xs text-muted-foreground truncate">{currentStepName}</p>
                    )}
                </div>
            )
        },
    }

    const statusColumn: ColumnDef<ApprovalRequest> = {
        accessorKey: "approvalStatus",
        header: "Trạng thái",
        cell: ({ row }) => {
            const status: string = row.getValue("approvalStatus")
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

    const actionsColumn: ColumnDef<ApprovalRequest> = {
        id: "actions",
        header: "Hành động",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row, table }) => (
            <DataTableRowActions
                row={row}
                role={role}
                onDataChange={(table.options.meta as any)?.onDataChange}
            />
        ),
    }

    if (role === "ADMIN") {
        return [titleColumn, creatorColumn, progressColumn, currentApproverColumn, statusColumn, actionsColumn]
    }

    if (role === "APPROVER") {
        return [titleColumn, creatorColumn, progressColumn, statusColumn, actionsColumn]
    }

    // USER
    return [titleColumn, progressColumn, statusColumn, actionsColumn]
}