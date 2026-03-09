"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Clock, CircleDot } from "lucide-react"
import { ApprovalRequest, ApprovalHistoryItem } from "@/types/approval"

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

const statusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
        PENDING: { label: "Chờ duyệt", className: "border-yellow-500 bg-yellow-50 text-yellow-700" },
        APPROVED: { label: "Đã duyệt", className: "border-green-500 bg-green-50 text-green-700" },
        REJECTED: { label: "Từ chối", className: "border-red-500 bg-red-50 text-red-700" },
    }
    const c = config[status] ?? { label: status, className: "" }
    return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

function WorkflowTimeline({ request }: { request: ApprovalRequest }) {
    const { history, totalSteps, currentStepOrder, approvalStatus } = request

    // Tạo danh sách tất cả bước (đã duyệt + đang chờ + chưa tới)
    const steps: { stepOrder: number; stepName: string; status: "done" | "waiting" | "pending" | "rejected" | "skipped"; historyItem?: ApprovalHistoryItem }[] = []

    for (let i = 1; i <= totalSteps; i++) {
        const h = history.find((item) => item.stepOrder === i)
        if (h) {
            steps.push({
                stepOrder: i,
                stepName: h.stepName,
                status: h.action === "APPROVED" ? "done" : "rejected",
                historyItem: h,
            })
        } else if (approvalStatus === "REJECTED") {
            steps.push({ stepOrder: i, stepName: `Bước ${i}`, status: "skipped" })
        } else if (i === currentStepOrder) {
            steps.push({
                stepOrder: i,
                stepName: request.currentStepName ?? `Bước ${i}`,
                status: "waiting",
            })
        } else {
            steps.push({ stepOrder: i, stepName: `Bước ${i}`, status: "pending" })
        }
    }

    const iconMap = {
        done: <CheckCircle className="w-5 h-5 text-green-600" />,
        rejected: <XCircle className="w-5 h-5 text-red-600" />,
        waiting: <CircleDot className="w-5 h-5 text-blue-600 animate-pulse" />,
        pending: <Clock className="w-5 h-5 text-slate-300" />,
        skipped: <Clock className="w-5 h-5 text-slate-200" />,
    }

    return (
        <div className="space-y-1">
            {steps.map((step, idx) => (
                <div key={step.stepOrder} className="flex gap-3">
                    {/* Đường kẻ + Icon */}
                    <div className="flex flex-col items-center">
                        {iconMap[step.status]}
                        {idx < steps.length - 1 && (
                            <div className={`w-0.5 flex-1 my-1 ${
                                step.status === "done" ? "bg-green-300" :
                                    step.status === "rejected" ? "bg-red-300" : "bg-slate-200"
                            }`} />
                        )}
                    </div>
                    {/* Nội dung */}
                    <div className="pb-4 min-w-0 flex-1">
                        <p className={`text-sm font-medium ${
                            step.status === "skipped" ? "text-slate-300 line-through" :
                                step.status === "pending" ? "text-slate-400" : ""
                        }`}>
                            B{step.stepOrder}: {step.stepName}
                        </p>
                        {step.historyItem && (
                            <div className="mt-0.5">
                                <p className="text-xs text-muted-foreground">
                                    {step.historyItem.approverName} — {new Date(step.historyItem.decidedAt).toLocaleString("vi-VN")}
                                </p>
                                {step.historyItem.feedback && (
                                    <p className="text-xs italic text-yellow-600 mt-0.5">
                                        &quot;{step.historyItem.feedback}&quot;
                                    </p>
                                )}
                            </div>
                        )}
                        {step.status === "waiting" && request.currentApproverName && (
                            <p className="text-xs text-blue-600 mt-0.5">
                                Đang chờ: {request.currentApproverName}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export function DetailModal({ open, request, onOpenChange }: DetailModalProps) {
    const description = request.requestData?.description as string | undefined

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chi tiết yêu cầu</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <InfoRow label="Tiêu đề" value={<span className="font-medium">{request.title}</span>} />
                    {description && <InfoRow label="Mô tả" value={description} />}

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <InfoRow label="Trạng thái" value={statusBadge(request.approvalStatus)} />
                            <InfoRow label="Quy trình" value={request.templateName} />
                        </div>
                        <div className="space-y-4">
                            <InfoRow
                                label="Thời gian tạo"
                                value={<span>{new Date(request.createdAt).toLocaleString("vi-VN")}</span>}
                            />
                            {request.updatedAt && (
                                <InfoRow
                                    label="Thời gian hoàn tất"
                                    value={<span>{new Date(request.updatedAt).toLocaleString("vi-VN")}</span>}
                                />
                            )}
                        </div>
                    </div>

                    <Separator />

                    <InfoRow label="Người yêu cầu" value={<span className="font-medium">{request.creatorName}</span>} />

                    <Separator />

                    {/* Workflow Timeline */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Tiến trình duyệt ({request.history.length}/{request.totalSteps} bước)
                        </p>
                        <WorkflowTimeline request={request} />
                    </div>

                    {/* Sản phẩm yêu cầu */}
                    {request.requestData?.products && Array.isArray(request.requestData.products) && request.requestData.products.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Sản phẩm yêu cầu
                                </p>
                                <div className="border rounded-md divide-y">
                                    {(request.requestData.products as { productId: number; productName: string; quantity: number }[]).map((p) => (
                                        <div key={p.productId} className="flex items-center justify-between px-3 py-2">
                                            <span className="text-sm font-medium">{p.productName}</span>
                                            <Badge variant="secondary" className="text-xs">SL: {p.quantity}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Request Data khác (ngoài description và products) */}
                    {request.requestData && Object.keys(request.requestData).filter(k => k !== "description" && k !== "products").length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Dữ liệu yêu cầu
                                </p>
                                <pre className="text-xs bg-slate-50 p-3 rounded-md overflow-x-auto">
                                    {JSON.stringify(
                                        Object.fromEntries(
                                            Object.entries(request.requestData).filter(([k]) => k !== "description" && k !== "products")
                                        ),
                                        null,
                                        2
                                    )}
                                </pre>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}