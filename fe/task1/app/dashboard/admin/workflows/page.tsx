"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { Loader2, Plus, Pencil, Trash2, X } from "lucide-react"
import { workflowService } from "@/lib/service/workflow-api"
import { userService } from "@/lib/service/user-api"
import { WorkflowTemplate } from "@/types/workflow"

const ROLE_OPTIONS = [
    { value: "USER", label: "Người dùng" },
    { value: "APPROVER", label: "Người duyệt" },
    { value: "ADMIN", label: "Quản trị viên" },
]

interface StepForm {
    id: number
    stepOrder: number
    stepName: string
    requiredRole: string
    specificApproverId: string
    deadlineHours: string
}

interface Approver {
    userId: string
    name: string
    userName: string
}

export default function WorkflowManagement() {
    const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    // Form state
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [steps, setSteps] = useState<StepForm[]>([])
    const [formError, setFormError] = useState("")
    const [saving, setSaving] = useState(false)
    const [approvers, setApprovers] = useState<Approver[]>([])

    const fetchTemplates = async () => {
        try {
            const data = await workflowService.getAll()
            setTemplates(data)
        } catch {
            console.error("Lỗi tải danh sách quy trình")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTemplates()
    }, [])

    const fetchApprovers = async () => {
        try {
            const json = await userService.getAllUsersWithRoles("APPROVER")
            setApprovers(json.result ?? [])
        } catch {
            setApprovers([])
        }
    }

    const openCreate = () => {
        setEditingId(null)
        setName("")
        setDescription("")
        setSteps([{ id: Date.now(), stepOrder: 1, stepName: "", requiredRole: "APPROVER", specificApproverId: "", deadlineHours: "" }])
        setFormError("")
        fetchApprovers()
        setModalOpen(true)
    }

    const openEdit = (t: WorkflowTemplate) => {
        setEditingId(t.id)
        setName(t.name)
        setDescription(t.description ?? "")
        setSteps(
            t.steps.map((s, i) => ({
                id: Date.now() + i,
                stepOrder: s.stepOrder,
                stepName: s.stepName,
                requiredRole: s.requiredRole ?? "",
                specificApproverId: s.specificApproverId ?? "",
                deadlineHours: s.deadlineHours != null ? String(s.deadlineHours) : "",
            }))
        )
        setFormError("")
        fetchApprovers()
        setModalOpen(true)
    }

    const handleAddStep = () => {
        setSteps((prev) => [
            ...prev,
            { id: Date.now(), stepOrder: prev.length + 1, stepName: "", requiredRole: "APPROVER", specificApproverId: "", deadlineHours: "" },
        ])
    }

    const handleRemoveStep = (id: number) => {
        setSteps((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, stepOrder: i + 1 })))
    }

    const handleStepChange = (id: number, field: keyof StepForm, value: string) => {
        setSteps((prev) => prev.map((s) => {
            if (s.id !== id) return s
            const updated = { ...s, [field]: value }
            // Khi chọn ADMIN thì xóa người cụ thể (không cần chọn)
            if (field === "requiredRole" && value === "ADMIN") {
                updated.specificApproverId = ""
            }
            return updated
        }))
    }

    // Lấy danh sách userId đã được chọn ở các bước khác
    const getSelectedApproverIds = (currentStepId: number) => {
        return steps
            .filter((s) => s.id !== currentStepId && s.specificApproverId)
            .map((s) => s.specificApproverId)
    }

    const handleSave = async () => {
        if (!name.trim()) {
            setFormError("Tên quy trình không được để trống.")
            return
        }
        if (steps.length === 0) {
            setFormError("Phải có ít nhất 1 bước.")
            return
        }
        if (steps.some((s) => !s.stepName.trim())) {
            setFormError("Tên bước không được để trống.")
            return
        }

        setFormError("")
        setSaving(true)

        const payload = {
            name,
            description,
            steps: steps.map((s) => ({
                stepOrder: s.stepOrder,
                stepName: s.stepName,
                requiredRole: s.requiredRole || "",
                specificApproverId: s.specificApproverId || "",
                deadlineHours: s.deadlineHours ? Number(s.deadlineHours) : undefined,
            })),
        }

        try {
            if (editingId) {
                await workflowService.update(editingId, payload)
            } else {
                await workflowService.create(payload)
            }
            setModalOpen(false)
            fetchTemplates()
        } catch {
            setFormError("Lưu thất bại. Vui lòng thử lại.")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await workflowService.delete(deleteId)
            fetchTemplates()
        } catch {
            console.error("Xóa thất bại")
        } finally {
            setDeleteId(null)
        }
    }
    const handleBlur = (id: number, value: string) => {
        const num = Number(value);
        if (isNaN(num) || num <= 0) {
            // Nếu nhập sai, tự động reset về 1 hoặc giá trị mặc định của bạn
            handleStepChange(id, "deadlineHours", "1");
        }
    };
    if (loading) return <div className="p-8 text-muted-foreground">Đang tải...</div>

    return (
        <div className="container mx-auto py-8 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý quy trình</h1>
                    <p className="text-muted-foreground text-sm">Tạo và quản lý các quy trình phê duyệt</p>
                </div>
                <Button onClick={openCreate} className="cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" /> Tạo quy trình
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên quy trình</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead className="text-center">Số bước</TableHead>
                            <TableHead>Các bước</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {templates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    Chưa có quy trình nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            templates.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium">{t.name}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                        {t.description ?? "--"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary">{t.steps.length}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {t.steps.map((s) => (
                                                <Badge key={s.id} variant="outline" className="text-xs">
                                                    {s.stepOrder}. {s.stepName}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => openEdit(t)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="cursor-pointer text-red-600 hover:text-red-700" onClick={() => setDeleteId(t.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-xl max-h-[90vh] flex flex-col">
                    <DialogHeader className="shrink-0">
                        <DialogTitle>{editingId ? "Sửa quy trình" : "Tạo quy trình mới"}</DialogTitle>
                        <DialogDescription>
                            Định nghĩa các bước duyệt cho quy trình này.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2 overflow-y-auto flex-1 pr-1">
                        <div className="space-y-1.5">
                            <Label>Tên quy trình <span className="text-red-500">*</span></Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Duyệt vật tư" className="border-black/50" />
                        </div>

                        <div className="space-y-1.5">
                            <Label>Mô tả</Label>
                            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả quy trình..." rows={2} className="border-black/50" />
                        </div>

                        <div className="space-y-2">
                            <Label>Các bước duyệt <span className="text-red-500">*</span></Label>
                            <div className="border rounded-md divide-y">
                                {steps.map((step) => (
                                    <div key={step.id} className="flex items-start gap-2 p-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                                            {step.stepOrder}
                                        </div>
                                        <div className="flex-1 space-y-2 min-w-0">
                                            <Input
                                                value={step.stepName}
                                                onChange={(e) => handleStepChange(step.id, "stepName", e.target.value)}
                                                placeholder="Tên bước (VD: Trưởng phòng duyệt)"
                                                className="h-8 text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <Select
                                                    value={step.requiredRole}
                                                    onValueChange={(v) => handleStepChange(step.id, "requiredRole", v)}
                                                >
                                                    <SelectTrigger className="h-8 text-xs w-[140px]">
                                                        <SelectValue placeholder="Vai trò..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ROLE_OPTIONS.map((r) => (
                                                            <SelectItem key={r.value} value={r.value} className="text-xs">{r.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {step.requiredRole !== "ADMIN" && (() => {
                                                    const selectedIds = getSelectedApproverIds(step.id)
                                                    const availableApprovers = approvers.filter((a) => !selectedIds.includes(a.userId))
                                                    return (
                                                        <Select
                                                            value={step.specificApproverId}
                                                            onValueChange={(v) => handleStepChange(step.id, "specificApproverId", v)}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs flex-1">
                                                                <SelectValue placeholder="Người cụ thể (tùy chọn)" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {availableApprovers.map((a) => (
                                                                    <SelectItem key={a.userId} value={a.userId} className="text-xs">{a.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )
                                                })()}
                                                {step.requiredRole === "ADMIN" && (
                                                    <span className="text-xs text-muted-foreground italic flex items-center flex-1">
                                                        Gửi trực tiếp đến quản trị viên
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={step.deadlineHours}
                                                    onChange={(e) => handleStepChange(step.id, "deadlineHours", e.target.value)}
                                                    placeholder="Deadline (giờ)"
                                                    className="h-8 text-xs flex-1"
                                                    onBlur={event => handleBlur(step.id,event.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveStep(step.id)}
                                            disabled={steps.length === 1}
                                            className="cursor-pointer p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 disabled:opacity-30 mt-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddStep}
                                    className="cursor-pointer w-full border-dashed text-muted-foreground">
                                + Thêm bước
                            </Button>
                        </div>

                        {formError && <p className="text-sm text-red-500">{formError}</p>}
                    </div>

                    <DialogFooter className="shrink-0 pt-2 border-t">
                        <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving} className="cursor-pointer">
                            Hủy
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
                            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</> : "Lưu"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Quy trình sẽ bị vô hiệu hóa. Các yêu cầu đã tạo trước đó không bị ảnh hưởng.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="cursor-pointer bg-red-600 hover:bg-red-700">
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}