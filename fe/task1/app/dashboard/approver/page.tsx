"use client"

import { useEffect, useRef, useState } from "react"
import { ApprovalTable } from "@/components/approval/approval-table"
import { ApprovalRequest, PagedApprovalResult } from "@/types/approval"
import { getPendingApprovalRequests } from "@/lib/service/approval-api"
import { useUser } from "@/context/UserContext"

const PAGE_SIZE = 5

export default function ApproverDashboard() {
    const { userInfo } = useUser()
    const [data, setData] = useState<ApprovalRequest[]>([])
    const [initialLoading, setInitialLoading] = useState(true)
    const [isFetching, setIsFetching] = useState(false)
    const [pageIndex, setPageIndex] = useState(0)
    const [pageCount, setPageCount] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const cache = useRef<Map<string, PagedApprovalResult>>(new Map())

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPageIndex(0)
            cache.current.clear()
        }, 400)
        return () => clearTimeout(timer)
    }, [search])

    const applyResult = (result: PagedApprovalResult) => {
        setData(result.content)
        setPageCount(result.totalPages)
        setTotalElements(result.totalElements)
    }

    const prefetchPage = (page: number, q: string) => {
        const key = `${page}-${q}`
        if (cache.current.has(key)) return
        getPendingApprovalRequests(page, PAGE_SIZE, q)
            .then(result => cache.current.set(key, result))
            .catch(() => {})
    }

    const fetchData = async (page: number, q: string) => {
        const key = `${page}-${q}`
        if (cache.current.has(key)) {
            applyResult(cache.current.get(key)!)
            prefetchPage(page + 1, q)
            return
        }
        setIsFetching(true)
        try {
            const result = await getPendingApprovalRequests(page, PAGE_SIZE, q)
            cache.current.set(key, result)
            applyResult(result)
            if (page + 1 < result.totalPages) prefetchPage(page + 1, q)
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err)
        } finally {
            setIsFetching(false)
            setInitialLoading(false)
        }
    }

    useEffect(() => { fetchData(pageIndex, debouncedSearch) }, [pageIndex, debouncedSearch])

    const handleReset = () => {
        setSearch("")
        setDebouncedSearch("")
        setPageIndex(0)
        cache.current.clear()
    }

    // Chỉ hiển thị request mà user hiện tại là người được duyệt ở bước này (PENDING),
    // hoặc request đã hoàn tất (APPROVED/REJECTED) để xem lịch sử
    const filteredData = userInfo?.name
        ? data.filter((r) =>
            r.approvalStatus !== "PENDING" || r.currentApproverName === userInfo.name
        )
        : []

    if (initialLoading) return <div className="p-8 text-muted-foreground">Đang tải...</div>

    return (
        <div className="container mx-auto py-8 space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Yêu cầu cần duyệt</h1>
            </div>
            <ApprovalTable
                data={filteredData}
                role="APPROVER"
                currentUserName={userInfo?.name}
                isFetching={isFetching}
                onDataChange={() => { cache.current.clear(); fetchData(pageIndex, debouncedSearch) }}
                serverPagination={{ pageIndex, pageCount, totalElements, onPageChange: setPageIndex }}
                filterState={{
                    search,
                    status: "ALL",
                    onSearchChange: setSearch,
                    onStatusChange: () => {},
                    onReset: handleReset,
                }}
            />
        </div>
    )
}
