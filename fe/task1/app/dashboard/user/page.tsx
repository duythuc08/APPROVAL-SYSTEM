
"use client"

import { useEffect, useRef, useState } from "react"
import { ApprovalTable } from "@/components/approval/approval-table"
import { ApprovalRequest, PagedApprovalResult } from "@/types/approval"
import { getMyRequests } from "@/lib/service/approval-api"

const PAGE_SIZE = 5

export default function UserDashboard() {
    const [data, setData] = useState<ApprovalRequest[]>([])
    const [initialLoading, setInitialLoading] = useState(true)
    const [isFetching, setIsFetching] = useState(false)
    const [pageIndex, setPageIndex] = useState(0)
    const [pageCount, setPageCount] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("ALL")
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

    const prefetchPage = (page: number, q: string, st: string) => {
        const key = `${page}-${q}-${st}`
        if (cache.current.has(key)) return
        getMyRequests(page, PAGE_SIZE, q, st)
            .then(result => cache.current.set(key, result))
            .catch(() => {})
    }

    const fetchData = async (page: number, q: string, st: string) => {
        const key = `${page}-${q}-${st}`
        if (cache.current.has(key)) {
            applyResult(cache.current.get(key)!)
            prefetchPage(page + 1, q, st)
            return
        }
        setIsFetching(true)
        try {
            const result = await getMyRequests(page, PAGE_SIZE, q, st)
            cache.current.set(key, result)
            applyResult(result)
            if (page + 1 < result.totalPages) prefetchPage(page + 1, q, st)
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err)
        } finally {
            setIsFetching(false)
            setInitialLoading(false)
        }
    }

    useEffect(() => { fetchData(pageIndex, debouncedSearch, status) }, [pageIndex, debouncedSearch, status])

    const handleStatusChange = (value: string) => {
        setStatus(value)
        setPageIndex(0)
        cache.current.clear()
    }

    const handleReset = () => {
        setSearch("")
        setDebouncedSearch("")
        setStatus("ALL")
        setPageIndex(0)
        cache.current.clear()
    }

    if (initialLoading) return <div className="p-8 text-muted-foreground">Đang tải...</div>

    return (
        <div className="container mx-auto py-8 space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Yêu cầu của tôi</h1>
            </div>
            <ApprovalTable
                data={data}
                role="USER"
                isFetching={isFetching}
                onDataChange={() => { cache.current.clear(); fetchData(pageIndex, debouncedSearch, status) }}
                serverPagination={{ pageIndex, pageCount, totalElements, onPageChange: setPageIndex }}
                filterState={{
                    search,
                    status,
                    onSearchChange: setSearch,
                    onStatusChange: handleStatusChange,
                    onReset: handleReset,
                }}
            />
        </div>
    )
}