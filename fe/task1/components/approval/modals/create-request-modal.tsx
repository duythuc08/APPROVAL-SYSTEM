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
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Package } from "lucide-react"
import { creationApprovalRequest } from "@/lib/service/approval-api"
import { workflowService } from "@/lib/service/workflow-api"
import { productService } from "@/lib/service/product-api"
import { WorkflowTemplate } from "@/types/workflow"

interface ProductItem {
    productId: number
    productName: string
    productDescription: string
    productQuantity: number
    productType: string
    ownerName: string
    department: string
}

interface SelectedProduct {
    productId: number
    productName: string
    quantity: number
    maxQuantity: number
    productType: string,
}

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

    const [products, setProducts] = useState<ProductItem[]>([])
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
    //const [overrideDeadlineHours, setOverrideDeadlineHours] = useState("")
    const [stepDeadlines, setStepDeadlines] = useState<Record<number, string>>({})
    // Reset khi đóng modal, fetch templates khi mở
    useEffect(() => {
        if (!open) {
            setTitle("")
            setDescription("")
            setTemplateId("")
            setError("")
            setSelectedProducts([])
            setProducts([])
            //setOverrideDeadlineHours("")
            setStepDeadlines({})
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
    const isSupplyWorkflow = selectedTemplate?.name?.toLowerCase().includes("thiết bị") ?? false
    // Khi đổi template: xóa sản phẩm đã chọn + load sản phẩm theo approver trong quy trình
    useEffect(() => {
        setSelectedProducts([])
        if (!isSupplyWorkflow || !selectedTemplate) {
            setProducts([])
            return
        }

        // Lấy danh sách username approver từ các bước duyệt
        const approverNames = selectedTemplate.steps
            .map((step) => step.specificApproverUserName)
            .filter((name): name is string => !!name)

        if (approverNames.length === 0) {
            setProducts([])
            return
        }

        const fetchProductsByApprovers = async () => {
            setLoadingProducts(true)
            try {
                const results = await Promise.all(
                    approverNames.map((name) => productService.getProductsByOwner(name))
                )
                const allProducts = results.flatMap((res) => res.result ?? [])
                // Loại trùng theo productId
                const unique = allProducts.filter(
                    (p, i, arr) => arr.findIndex((x) => x.productId === p.productId) === i
                )
                setProducts(unique)
            } catch {
                setProducts([])
            } finally {
                setLoadingProducts(false)
            }
        }
        fetchProductsByApprovers()
    }, [templateId, isSupplyWorkflow])

    const toggleProduct = (product: ProductItem) => {
        setSelectedProducts((prev) => {
            const exists = prev.find((p) => p.productId === product.productId)
            if (exists) return prev.filter((p) => p.productId !== product.productId)
            return [...prev, {
                productId: product.productId,
                productName: product.productName,
                quantity: 1,
                maxQuantity: product.productQuantity,
                productType: product.productType,
            }]
        })
    }

    const updateQuantity = (productId: number, quantity: number) => {
        setSelectedProducts((prev) =>
            prev.map((p) => p.productId === productId ? { ...p, quantity } : p)
        )
    }

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

        // Chuyển đổi stepDeadlines từ string sang number
        const customDeadlines = Object.fromEntries(
            Object.entries(stepDeadlines)
                .filter(([_, value]) => value !== "") // Chỉ gửi những bước có nhập giá trị
                .map(([order, value]) => [order, Number(value)])
        );

        const requestData: Record<string, any> = {
            description: description.trim(),
            // Thêm thông tin để BE xử lý Auto-approve
            productType: selectedProducts.length > 0 ? selectedProducts[0].productType : null,
            totalQuantity: selectedProducts.reduce((sum, p) => sum + p.quantity, 0),
            // Đính kèm deadline tùy chỉnh vào requestData [cite: 342]
            customDeadlines: customDeadlines
        };
        if (description.trim()) requestData.description = description
        if (selectedProducts.length > 0) {
            requestData.products = selectedProducts.map((p) => ({
                productId: p.productId,
                productName: p.productName,
                quantity: p.quantity,
                productType: p.productType
            }))
        }

        try {
            await creationApprovalRequest({
                title,
                templateId: Number(templateId),
                requestData,
                // stepDeadlines: customDeadlines
                //...(overrideDeadlineHours ? { overrideDeadlineHours: Number(overrideDeadlineHours) } : {}),
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
                        <Label htmlFor="title" className="text-blue-500 font-bold">
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
                        <Label className="text-blue-500 font-bold">
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

                    {/* Chọn sản phẩm — chỉ hiện khi quy trình duyệt vật tư (đặt TRƯỚC bước duyệt để user thấy ngưỡng) */}
                    {isSupplyWorkflow && <div className="space-y-1.5">
                        <Label className="text-blue-500 font-bold">
                            <Package className="w-3.5 h-3.5 inline mr-1" />
                            Sản phẩm yêu cầu
                        </Label>
                        {loadingProducts ? (
                            <p className="text-sm text-muted-foreground">Đang tải sản phẩm...</p>
                        ) : products.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Không có sản phẩm nào.</p>
                        ) : (
                            <div className="border border-black/50 rounded-md divide-y max-h-[200px] overflow-y-auto">
                                {products.map((product) => {
                                    const selected = selectedProducts.find((p) => p.productId === product.productId)
                                    return (
                                        <div key={product.productId} className="flex items-center gap-3 px-3 py-2 border-black/30">
                                            <Checkbox
                                                checked={!!selected}
                                                onCheckedChange={() => toggleProduct(product)}
                                                className="cursor-pointer"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{product.productName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Tồn kho: {product.productQuantity} &middot; {product.ownerName}
                                                </p>
                                            </div>
                                            {selected && (
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={product.productQuantity}
                                                    value={selected.quantity}
                                                    onChange={(e) => updateQuantity(product.productId, Math.max(1, Math.min(product.productQuantity, Number(e.target.value))))}
                                                    className="w-20 h-8 text-sm"
                                                />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        {selectedProducts.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                Đã chọn {selectedProducts.length} sản phẩm
                            </p>
                        )}
                    </div>}

                    {/* Hiển thị các bước của quy trình đã chọn */}
                    {/*{selectedTemplate && (*/}
                    {/*    <div className="space-y-2">*/}
                    {/*        <Label className="text-blue-500 font-bold">Các bước duyệt</Label>*/}
                    {/*        <div className="border border-black/50 rounded-md divide-y">*/}
                    {/*            {selectedTemplate.steps.map((step) => (*/}
                    {/*                <div key={step.id} className="flex items-center gap-3 px-3 py-2 border-black/30">*/}
                    {/*                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">*/}
                    {/*                        {step.stepOrder}*/}
                    {/*                    </div>*/}
                    {/*                    <div className="flex-1 min-w-0">*/}
                    {/*                        <p className="text-sm font-medium">{step.stepName}</p>*/}
                    {/*                        {step.deadlineHours && (*/}
                    {/*                            <p className="text-xs text-muted-foreground">Thời hạn: {step.deadlineHours} giờ</p>*/}
                    {/*                        )}*/}
                    {/*                    </div>*/}
                    {/*                    {step.specificApproverName ? (*/}
                    {/*                        <Badge variant="secondary" className="text-xs shrink-0">*/}
                    {/*                            {step.specificApproverName}*/}
                    {/*                        </Badge>*/}
                    {/*                    ) : step.requiredRole ? (*/}
                    {/*                        <Badge variant="outline" className="text-xs shrink-0">*/}
                    {/*                            {ROLE_LABELS[step.requiredRole] ?? step.requiredRole}*/}
                    {/*                        </Badge>*/}
                    {/*                    ) : null}*/}
                    {/*                </div>*/}
                    {/*            ))}*/}
                    {/*        </div>*/}
                    {/*        {selectedTemplate.description && (*/}
                    {/*            <p className="text-xs text-muted-foreground italic">{selectedTemplate.description}</p>*/}
                    {/*        )}*/}
                    {/*    </div>*/}
                    {/*)}*/}

                    {/* Mô tả */}
                    <div className="space-y-1.5">
                        <Label htmlFor="desc" className="text-blue-500 font-bold">Mô tả yêu cầu</Label>
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