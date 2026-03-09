"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { creationApprovalRequest } from "@/lib/service/approval-api"
import { workflowService } from "@/lib/service/workflow-api"
import { WorkflowTemplate } from "@/types/workflow"

interface CreateRequestModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

const ROLE_LABELS: Record<string, string> = {
    USER: "Người dùng",
    APPROVER: "Người duyệt",
    ADMIN: "Quản trị viên",
}

export function CreateRequestModal({ open, onOpenChange, onSuccess }: CreateRequestModalProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [templateId, setTemplateId] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
    const [loadingTemplates, setLoadingTemplates] = useState(false)

    // Reset khi đóng modal, fetch templates khi mở
    useEffect(() => {
        if (!open) {
            setTitle("")
            setDescription("")
            setTemplateId("")
            setError("")
            return
        }
        const fetchTemplates = async () => {
            setLoadingTemplates(true)
            try {
                const data = await workflowService.getAll()
                setTemplates(data)
            } catch {
                setTemplates([])
            } finally {
                setLoadingTemplates(false)
            }
        }
        fetchTemplates()
    }, [open])

    const selectedTemplate = templates.find((t) => String(t.id) === templateId)

    const handleSubmit = async () => {
        if (!title.trim()) {
            setError("Tiêu đề không được để trống.")
            return
        }
        if (!templateId) {
            setError("Vui lòng chọn quy trình.")
            return
        }

        setError("")
        setLoading(true)

        try {
            await creationApprovalRequest({
                title,
                templateId: Number(templateId),
                requestData: {
                    description,
                },
            })
            onOpenChange(false)
            onSuccess?.()
        } catch {
            setError("Tạo yêu cầu thất bại. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl flex flex-col max-h-[90vh]">
                <DialogHeader className="shrink-0">
                    <DialogTitle>Tạo yêu cầu mới</DialogTitle>
                    <DialogDescription>
                        Chọn quy trình và điền thông tin để gửi yêu cầu phê duyệt.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2 overflow-y-auto flex-1 pr-1">

                    {/* Tiêu đề */}
                    <div className="space-y-1.5">
                        <Label htmlFor="title">
                            Tiêu đề <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            className="border-black/50"
                            placeholder="VD: Yêu cầu văn phòng phẩm tháng 06/2026"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Chọn quy trình */}
                    <div className="space-y-1.5">
                        <Label>
                            Quy trình <span className="text-red-500">*</span>
                        </Label>
                        <Select value={templateId} onValueChange={setTemplateId} disabled={loadingTemplates}>
                            <SelectTrigger className="border-black/50 cursor-pointer">
                                <SelectValue placeholder={loadingTemplates ? "Đang tải..." : "Chọn quy trình..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)} className="cursor-pointer">
                                        <div>
                                            <span className="font-medium">{t.name}</span>
                                            <span className="text-muted-foreground ml-2 text-xs">({t.steps.length} bước)</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Hiển thị các bước của quy trình đã chọn */}
                    {selectedTemplate && (
                        <div className="space-y-2">
                            <Label>Các bước duyệt</Label>
                            <div className="border rounded-md divide-y">
                                {selectedTemplate.steps.map((step) => (
                                    <div key={step.id} className="flex items-center gap-3 px-3 py-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                                            {step.stepOrder}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">{step.stepName}</p>
                                        </div>
                                        {step.specificApproverName ? (
                                            <Badge variant="secondary" className="text-xs shrink-0">
                                                {step.specificApproverName}
                                            </Badge>
                                        ) : step.requiredRole ? (
                                            <Badge variant="outline" className="text-xs shrink-0">
                                                {ROLE_LABELS[step.requiredRole] ?? step.requiredRole}
                                            </Badge>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                            {selectedTemplate.description && (
                                <p className="text-xs text-muted-foreground italic">{selectedTemplate.description}</p>
                            )}
                        </div>
                    )}

                    {/* Mô tả */}
                    <div className="space-y-1.5">
                        <Label htmlFor="desc">Mô tả yêu cầu</Label>
                        <Textarea
                            id="desc"
                            className="border-black/50"
                            placeholder="Mô tả chi tiết về yêu cầu..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <DialogFooter className="shrink-0 pt-2 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="cursor-pointer">
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="cursor-pointer">
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang gửi...</>
                        ) : "Gửi yêu cầu"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}