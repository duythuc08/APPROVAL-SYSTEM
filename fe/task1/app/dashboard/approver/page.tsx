"use client"

import { useEffect, useState } from "react"
import { ApprovalTable } from "@/components/approval/approval-table"
import { ApprovalRequest } from "@/types/approval"
import { getPendingApprovalRequests } from "@/lib/service/approval-api"

export default function ApproverDashboard() {
    const [data, setData] = useState<ApprovalRequest[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const result = await getPendingApprovalRequests()
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
                <h1 className="text-2xl font-bold">Yêu cầu cần duyệt</h1>
            </div>
            <ApprovalTable data={data} role="APPROVER" onDataChange={fetchData} />
        </div>
    )
}
