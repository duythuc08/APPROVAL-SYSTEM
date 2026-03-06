
"use client"
// app/dashboard/admin/page.tsx

import { useEffect, useState } from "react"
import { ApprovalTable } from "@/components/approval/approval-table"
import { ApprovalRequest } from "@/types/approval"
import {getAllApprovalRequests} from "@/lib/service/approval-api";
import {Button} from "@/components/ui/button";
import {Navbar} from "@/components/navbar";

export default function RequestsManagement() {
    const [data, setData] = useState<ApprovalRequest[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const result = await getAllApprovalRequests()
            setData(result)
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    if (loading) return <div className="p-8 text-muted-foreground">Đang tải...</div>

    return (
        <div className="container mx-auto py-8 space-y-4">
            <div>
                <div>
                    <h1 className="text-2xl font-bold">Tất cả yêu cầu</h1>
                    <p className="text-muted-foreground text-sm">Xem toàn bộ yêu cầu trong hệ thống</p>
                </div>
            </div>
            <ApprovalTable data={data} role="ADMIN" onDataChange={fetchData} />
        </div>
    )
}