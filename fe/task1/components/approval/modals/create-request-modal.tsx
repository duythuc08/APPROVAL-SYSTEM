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
import { X, Loader2 } from "lucide-react"
import { creationApprovalRequest } from "@/lib/service/approval-api"
import { productService } from "@/lib/service/product-api"
import { userService } from "@/lib/service/user-api"

// ─── Types ────────────────────────────────────────────────────────────────────

const PRODUCT_TYPE_LABEL: Record<string, string> = {
    OFFICE_SUPPLIES: "Văn phòng phẩm",
    OFFICE_EQUIPMENT: "Thiết bị văn phòng",
    UNIFORM_PPE: "Đồng phục / BHLĐ",
}

interface Product {
    productId: number
    productName: string
    productDescription: string
    productType: string
}

interface TableRow {
    id: number
    productId: number | null
    quantity: number
}

interface AppUser {
    userId: string
    userName: string
    name: string
    email: string
}

interface CreateRequestModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

interface FormState {
    title: string
    approvalDescription: string
    currentApproverId: string
}

const INITIAL_FORM: FormState = {
    title: "",
    approvalDescription: "",
    currentApproverId: "",
}

const makeInitialRows = (): TableRow[] => [{ id: Date.now(), productId: null, quantity: 1 }]

// ─── Avatar chữ cái đầu ───────────────────────────────────────────────────────
function UserInitialAvatar({ name }: { name: string }) {
    return (
        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
            {name?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
    )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateRequestModal({
    open,
    onOpenChange,
    onSuccess,
}: CreateRequestModalProps) {
    const [form, setForm] = useState<FormState>(INITIAL_FORM)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const [productOptions, setProductOptions] = useState<Product[]>([])
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [tableRows, setTableRows] = useState<TableRow[]>(makeInitialRows)

    const [approverOptions, setApproverOptions] = useState<AppUser[]>([])
    const [loadingApprovers, setLoadingApprovers] = useState(false)

    // ── Reset khi đóng modal, fetch approvers khi mở ─────────────────────────
    useEffect(() => {
        if (!open) {
            setForm(INITIAL_FORM)
            setTableRows(makeInitialRows())
            setProductOptions([])
            setError("")
            return
        }

        const fetchApprovers = async () => {
            setLoadingApprovers(true)
            try {
                const json = await userService.getAllUsersWithRoles("APPROVER")
                setApproverOptions(json.result ?? [])
            } catch {
                setApproverOptions([])
            } finally {
                setLoadingApprovers(false)
            }
        }

        fetchApprovers()
    }, [open])

    // ── Fetch products của approver khi chọn người nhận ───────────────────────
    useEffect(() => {
        if (!form.currentApproverId) {
            setProductOptions([])
            setTableRows(makeInitialRows())
            return
        }
        const approver = approverOptions.find((a) => a.userId === form.currentApproverId)
        if (!approver) return

        const fetchProductsByApprover = async () => {
            setLoadingProducts(true)
            setTableRows(makeInitialRows())
            try {
                const json = await productService.getProductsByOwner(approver.userName)
                setProductOptions(json.result ?? [])
            } catch {
                setProductOptions([])
            } finally {
                setLoadingProducts(false)
            }
        }

        fetchProductsByApprover()
    }, [form.currentApproverId, approverOptions])

    // ── Helpers ──────────────────────────────────────────────────────────────
    const set = (key: "title" | "approvalDescription") => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

    const handleAddRow = () => {
        setTableRows((prev) => [...prev, { id: Date.now(), productId: null, quantity: 1 }])
    }

    const handleRowProductChange = (rowId: number, productId: string) => {
        setTableRows((prev) =>
            prev.map((r) => r.id === rowId ? { ...r, productId: Number(productId) } : r)
        )
    }

    const handleRowQuantityChange = (rowId: number, value: string) => {
        const qty = Math.max(1, parseInt(value) || 1)
        setTableRows((prev) =>
            prev.map((r) => r.id === rowId ? { ...r, quantity: qty } : r)
        )
    }

    const handleRemoveRow = (rowId: number) => {
        setTableRows((prev) => prev.filter((r) => r.id !== rowId))
    }

    const usedProductIds = tableRows.map((r) => r.productId).filter(Boolean) as number[]

    const selectedApprover = approverOptions.find((a) => a.userId === form.currentApproverId)

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!form.title.trim()) {
            setError("Tiêu đề không được để trống.")
            return
        }
        if (!form.currentApproverId) {
            setError("Vui lòng chọn người duyệt.")
            return
        }
        const validRows = tableRows.filter((r) => r.productId !== null)
        if (validRows.length === 0) {
            setError("Vui lòng chọn ít nhất một sản phẩm.")
            return
        }

        setError("")
        setLoading(true)

        try {
            await creationApprovalRequest({
                title: form.title,
                approvalDescription: form.approvalDescription,
                productQuantities: Object.fromEntries(
                    validRows.map((r) => [r.productId!, r.quantity])
                ),
                currentApproverId: form.currentApproverId,
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
                        Điền thông tin bên dưới để gửi yêu cầu phê duyệt.
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
                            value={form.title}
                            onChange={set("title")}
                        />
                    </div>

                    {/* Mô tả */}
                    <div className="space-y-1.5">
                        <Label htmlFor="desc">Mô tả yêu cầu</Label>
                        <Textarea
                            id="desc"
                            className="border-black/50"
                            placeholder="Mô tả chi tiết về yêu cầu..."
                            value={form.approvalDescription}
                            onChange={set("approvalDescription")}
                            rows={3}
                        />
                    </div>

                    {/* Chọn người duyệt */}
                    <div className="space-y-1.5">
                        <Label>
                            Người nhận <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                            <Select
                                value={form.currentApproverId}
                                onValueChange={(value) =>
                                    setForm((prev) => ({ ...prev, currentApproverId: value }))
                                }
                                disabled={loadingApprovers}
                            >
                                <SelectTrigger className="border-black/50 h-auto cursor-pointer w-fit min-w">
                                    {selectedApprover ? (
                                        <div className="flex items-center gap-2 py-0.5 ">
                                            <UserInitialAvatar name={selectedApprover.name} />
                                            <span className="text-xs font-medium">{selectedApprover.name}</span>
                                        </div>
                                    ) : (
                                        <SelectValue placeholder={loadingApprovers ? "Đang tải..." : "Chọn người duyệt..."} />
                                    )}
                                </SelectTrigger>
                                <SelectContent>
                                    {approverOptions.map((a) => (
                                        <SelectItem key={a.userId} value={a.userId} className="cursor-pointer py-2">
                                            <div className="flex items-center gap-3">
                                                <UserInitialAvatar name={a.name} />
                                                <span className="text-sm font-medium">{a.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedApprover && (
                                <button
                                    type="button"
                                    onClick={() => setForm((prev) => ({ ...prev, currentApproverId: "" }))}
                                    className="cursor-pointer p-1.5 rounded hover:bg-destructive/50 text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Bảng sản phẩm */}
                    <div className="space-y-2">
                        <Label>
                            Sản phẩm <span className="text-red-500">*</span>
                        </Label>
                        {!form.currentApproverId && (
                            <p className="text-xs text-muted-foreground italic">
                                Vui lòng chọn người nhận trước để xem danh sách sản phẩm.
                            </p>
                        )}
                        <div className="border border-black/50 rounded-md overflow-hidden">
                            {/* Header */}
                            <div className="grid grid-cols-[1fr_140px_80px_32px] gap-2 px-3 py-2 bg-primary text-primary-foreground text-xs font-medium border-b">
                                <span>Tên sản phẩm</span>
                                <span className="text-center">Loại</span>
                                <span className="text-center">Số lượng</span>
                                <span />
                            </div>
                            {/* Rows */}
                            {tableRows.map((row) => {
                                const selectedProduct = productOptions.find((p) => p.productId === row.productId)
                                const availableForRow = productOptions.filter(
                                    (p) => !usedProductIds.includes(p.productId) || p.productId === row.productId
                                )
                                return (
                                    <div
                                        key={row.id}
                                        className="grid grid-cols-[1fr_140px_80px_32px] gap-2 items-center px-3 py-2 border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                                    >
                                        {/* Cột tên SP */}
                                        <Select
                                            value={row.productId !== null ? String(row.productId) : ""}
                                            onValueChange={(val) => handleRowProductChange(row.id, val)}
                                            disabled={loadingProducts || !form.currentApproverId}
                                        >
                                            <SelectTrigger className="h-8 text-sm cursor-pointer">
                                                <SelectValue placeholder={
                                                    !form.currentApproverId ? "Chọn người nhận trước..."
                                                    : loadingProducts ? "Đang tải..."
                                                    : "Chọn sản phẩm..."
                                                } />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableForRow.map((p) => (
                                                    <SelectItem key={p.productId} value={String(p.productId)} className="cursor-pointer text-sm">
                                                        {p.productName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {/* Cột loại */}
                                        {selectedProduct ? (
                                            <Badge variant="secondary" className="justify-center text-xs">
                                                {PRODUCT_TYPE_LABEL[selectedProduct.productType] ?? selectedProduct.productType}
                                            </Badge>
                                        ) : (
                                            <span className="text-center text-muted-foreground text-sm">—</span>
                                        )}
                                        {/* Cột số lượng */}
                                        <Input
                                            type="number"
                                            min={1}
                                            value={row.quantity}
                                            disabled={row.productId === null}
                                            onChange={(e) => handleRowQuantityChange(row.id, e.target.value)}
                                            className="h-8 text-center text-sm px-1"
                                        />
                                        {/* Nút xóa dòng */}
                                        <button
                                            type="button"
                                            disabled={tableRows.length === 1}
                                            onClick={() => handleRemoveRow(row.id)}
                                            className="cursor-pointer items-center p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <X className="w-5 h-4 " />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddRow}
                            disabled={!form.currentApproverId || productOptions.length === 0 || usedProductIds.length >= productOptions.length}
                            className="cursor-pointer w-full border-dashed text-muted-foreground hover:text-foreground"
                        >
                            + Thêm dòng
                        </Button>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <DialogFooter className="shrink-0 pt-2 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="cursor-pointer">
                        Huỷ
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
