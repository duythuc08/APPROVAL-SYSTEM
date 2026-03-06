"use client"
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { productService } from "@/lib/service/product-api";
import { Loader2 } from "lucide-react";

export const PRODUCT_TYPES = [
    { value: "OFFICE_SUPPLIES", label: "Văn phòng phẩm" },
    { value: "OFFICE_EQUIPMENT", label: "Thiết bị văn phòng" },
    { value: "UNIFORM_PPE", label: "Đồng phục / BHLĐ" },
];

interface CreateProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateProductModal({ isOpen, onClose, onSuccess }: CreateProductModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        defaultValues: {
            productName: "",
            productDescription: "",
            productQuantity: 1,
            productType: "",
        },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({
                productName: "",
                productDescription: "",
                productQuantity: 1,
                productType: "",
            });
        }
    }, [isOpen, form]);

    const onSubmit = async (values: any) => {
        setIsSubmitting(true);
        try {
            await productService.createProduct({
                ...values,
                productQuantity: Number(values.productQuantity),
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Lỗi khi tạo sản phẩm:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Thêm sản phẩm mới</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="productName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên sản phẩm</FormLabel>
                                    <FormControl>
                                        <Input disabled={isSubmitting} placeholder="VD: Bút bi xanh" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="productDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mô tả</FormLabel>
                                    <FormControl>
                                        <Input disabled={isSubmitting} placeholder="Mô tả sản phẩm..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="productQuantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Số lượng tồn kho</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isSubmitting}
                                            type="number"
                                            min={1}
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="productType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Loại sản phẩm</FormLabel>
                                    <Select
                                        disabled={isSubmitting}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Chọn loại sản phẩm" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {PRODUCT_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="cursor-pointer"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="cursor-pointer min-w-[100px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : "Tạo mới"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
