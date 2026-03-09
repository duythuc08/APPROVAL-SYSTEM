"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ApprovalRequest } from "@/types/approval"
import { confirmApprovalRequest } from "@/lib/service/approval-api"

interface ReviewModalProps {
    open: boolean
    request: ApprovalRequest
    action: "APPROVED" | "REJECTED"
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function ReviewModal({ open, request, action, onOpenChange, onSuccess }: ReviewModalProps) {
    const [feedback, setFeedback] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const isApprove = action === "APPROVED"

    const handleConfirm = async () => {
        if (!isApprove && !feedback.trim()) {
            setError("Vui lòng nhập lý do từ chối.")
            return
        }
        setError("")
        setLoading(true)
        try {
            await confirmApprovalRequest(request.approvalRequestId, action, feedback)
            setFeedback("")
            onOpenChange(false)
            onSuccess?.()
        } catch {
            setError("Thao tác thất bại. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isApprove ? "Xác nhận chấp thuận" : "Xác nhận từ chối"}
                    </DialogTitle>
                    <DialogDescription>
                        Yêu cầu: <span className="font-semibold text-foreground">{request.title}</span>
                        <br />
                        <span className="text-xs text-muted-foreground">
                            Bước {request.currentStepOrder}/{request.totalSteps}
                            {request.currentStepName && ` — ${request.currentStepName}`}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="feedback">
                            Phản hồi{!isApprove && <span className="text-red-500"> *</span>}
                        </Label>
                        <Textarea
                            id="feedback"
                            placeholder={isApprove ? "Ghi chú thêm (tùy chọn)..." : "Nhập lý do từ chối..."}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={3}
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="cursor-pointer">
                        Hủy
                    </Button>
                    <Button
                        variant={isApprove ? "default" : "destructive"}
                        onClick={handleConfirm}
                        disabled={loading}
                        className="cursor-pointer"
                    >
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xử lý...</>
                        ) : isApprove ? "Chấp thuận" : "Từ chối"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}