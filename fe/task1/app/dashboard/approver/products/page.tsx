"use client"
import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArchiveX, Loader2, Package } from "lucide-react";
import { productService } from "@/lib/service/product-api";
import { userService } from "@/lib/service/user-api";
import { CreateProductModal, PRODUCT_TYPES } from "@/app/dashboard/approver/products/create-product";

export default function ProductsManagement() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchProducts = async () => {
        try {

            const meResponse = await userService.getMyInfo();
            const ownerUserName = meResponse.result?.userName;
            if (!ownerUserName) throw new Error("Không lấy được thông tin người dùng.");

            const response = await productService.getProductsByOwner(ownerUserName);
            setProducts(response.result ?? []);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Không thể tải danh sách sản phẩm.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDeleteProduct = async (productId: number) => {
        setDeletingId(productId);
        try {
            await productService.deleteProductById(productId);
            setProducts((prev) => prev.filter((p) => p.productId !== productId));
        } catch {
            setError("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return <div className="p-10 text-center">Đang tải danh sách sản phẩm...</div>;

    return (
        <div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <Button
                    onClick={() => setIsModalOpen(true)}
                    size="sm"
                    className="cursor-pointer flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                    + Thêm sản phẩm mới
                </Button>
                <CreateProductModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchProducts}
                />
            </div>

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

            <div className="rounded-md border bg-white p-4 mt-3">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead>Tên sản phẩm</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead className="text-center">Tồn kho</TableHead>
                            <TableHead>Loại sản phẩm</TableHead>
                            <TableHead className="text-center w-[120px]">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                                    Chưa có sản phẩm nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.productId}>
                                    <TableCell className="font-medium">{product.productName}</TableCell>
                                    <TableCell className="text-muted-foreground">{product.productDescription}</TableCell>
                                    <TableCell className="text-center">{product.productQuantity}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100">
                                            <Package className="h-3 w-3 mr-1" />
                                            {PRODUCT_TYPES.find((t) => t.value === product.productType)?.label ?? product.productType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={deletingId === product.productId}
                                                    className="cursor-pointer flex items-center gap-2"
                                                >
                                                    {deletingId === product.productId
                                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                                        : <ArchiveX className="h-4 w-4" />}
                                                    {deletingId === product.productId ? "Đang xóa..." : "Xóa"}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Bạn có chắc muốn xóa sản phẩm <strong>{product.productName}</strong>? Hành động này không thể hoàn tác.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteProduct(product.productId)}>
                                                        Xóa
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
