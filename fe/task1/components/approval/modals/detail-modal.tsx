"use client"

// components/approval/modals/detail-modal.tsx

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ApprovalRequest } from "@/types/approval"

interface DetailModalProps {
    open: boolean
    request: ApprovalRequest
    onOpenChange: (open: boolean) => void
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            <div className="text-sm">{value}</div>
        </div>
    )
}

export function DetailModal({ open, request, onOpenChange }: DetailModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chi tiết yêu cầu</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <InfoRow label="Tiêu đề" value={<span className="font-medium">{request.title}</span>} />
                    <InfoRow label="Mô tả" value={request.approvalDescription} />

                    <Separator />

                    <InfoRow
                        label="Trạng thái"
                        value={
                            <Badge variant={
                                request.ApprovalStatus === "PENDING" ? "pending"
                                    : request.ApprovalStatus === "REJECTED" ? "destructive"
                                        : "success"
                            }>
                                {request.ApprovalStatus}
                            </Badge>
                        }
                    />

                    {request.feedback && (
                        <InfoRow
                            label="Phản hồi"
                            value={
                                <span className="italic text-yellow-600">`{request.feedback}`</span>
                            }
                        />
                    )}

                    <Separator />

                    <InfoRow
                        label="Người yêu cầu"
                        value={
                            <div>
                                <p className="font-medium">{request.creatorUser.name}</p>
                                <p className="text-xs text-muted-foreground">{request.creatorUser.email}</p>
                            </div>
                        }
                    />

                    <InfoRow
                        label="Người duyệt"
                        value={
                            <div>
                                <p className="font-medium">{request.currentApprover.name}</p>
                                <p className="text-xs text-muted-foreground">{request.currentApprover.email}</p>
                            </div>
                        }
                    />

                    <Separator />

                    <InfoRow
                        label={`Sản phẩm (${request.products.length})`}
                        value={
                            <div className="space-y-2 mt-1">
                                {request.products.map((p) => {
                                    const qty = request.productQuantities?.[p.productId] ?? 0
                                    return (
                                        <div
                                            key={p.productId}
                                            className="flex items-center justify-between rounded-md border px-3 py-2"
                                        >
                                            <div>
                                                <p className="font-medium">{p.productName}</p>
                                                {p.productDescription && (
                                                    <p className="text-xs text-muted-foreground">{p.productDescription}</p>
                                                )}
                                            </div>
                                            <div className="shrink-0 ml-4 text-right">
                                                <p className="text-xs text-muted-foreground">Số lượng yêu cầu</p>
                                                <p className="text-sm font-semibold text-blue-600">{qty}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        }
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}