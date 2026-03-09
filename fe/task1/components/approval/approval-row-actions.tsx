"use client"

import { Row } from "@tanstack/react-table"
import { ApprovalRequest, CurrentRole } from "@/types/approval"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ReviewModal } from "./modals/review-modal"
import { DetailModal } from "./modals/detail-modal"

interface RowActionsProps {
    row: Row<ApprovalRequest>
    role: CurrentRole
    onDataChange?: () => void
}

export function DataTableRowActions({ row, role, onDataChange }: RowActionsProps) {
    const request = row.original
    const [reviewAction, setReviewAction] = useState<"APPROVED" | "REJECTED" | null>(null)
    const [showDetail, setShowDetail] = useState(false)
    const isPending = request.approvalStatus === "PENDING"

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setShowDetail(true)}>
                Chi tiết
            </Button>

            {role === "APPROVER" && isPending && (
                <>
                    <Button
                        size="sm"
                        className="border-green-700 bg-green-200 text-green-700 cursor-pointer"
                        variant="secondary"
                        onClick={() => setReviewAction("APPROVED")}
                    >
                        Duyệt
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={() => setReviewAction("REJECTED")}
                    >
                        Từ chối
                    </Button>
                </>
            )}

            {reviewAction && (
                <ReviewModal
                    open={!!reviewAction}
                    request={request}
                    action={reviewAction}
                    onOpenChange={(open) => { if (!open) setReviewAction(null) }}
                    onSuccess={() => {
                        setReviewAction(null)
                        onDataChange?.()
                    }}
                />
            )}

            {showDetail && (
                <DetailModal
                    open={showDetail}
                    request={request}
                    onOpenChange={(open) => setShowDetail(open)}
                />
            )}
        </div>
    )
}