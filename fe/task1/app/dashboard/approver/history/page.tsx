"use client"

import { useEffect, useRef, useState } from "react"
import { ApprovalTable } from "@/components/approval/approval-table"
import { ApprovalRequest, PagedApprovalResult } from "@/types/approval"
import { getApproverHistory } from "@/lib/service/approval-api"
import { useUser } from "@/context/UserContext"

const PAGE_SIZE = 5

export default function ApproverHistoryPage() {
    const { userInfo } = useUser()
    const [data, setData] = useState<ApprovalRequest[]>([])
    const [initialLoading, setInitialLoading] = useState(true)
    const [isFetching, setIsFetching] = useState(false)
    const [pageIndex, setPageIndex] = useState(0)
    const [pageCount, setPageCount] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const cache = useRef<Map<string, PagedApprovalResult>>(new Map())

    const applyResult = (result: PagedApprovalResult) => {
        setData(result.content)
        setPageCount(result.totalPages)
        setTotalElements(result.totalElements)
    }

    const prefetchPage = (page: number) => {
        const key = String(page)
        if (cache.current.has(key)) return
        getApproverHistory(page, PAGE_SIZE)
            .then(result => cache.current.set(key, result))
            .catch(() => {})
    }

    const fetchData = async (page: number) => {
        const key = String(page)
        if (cache.current.has(key)) {
            applyResult(cache.current.get(key)!)
            prefetchPage(page + 1)
            return
        }
        setIsFetching(true)
        try {
            const result = await getApproverHistory(page, PAGE_SIZE)
            cache.current.set(key, result)
            applyResult(result)
            if (page + 1 < result.totalPages) prefetchPage(page + 1)
        } catch (err) {
            console.error("Loi tai du lieu:", err)
        } finally {
            setIsFetching(false)
            setInitialLoading(false)
        }
    }

    useEffect(() => { fetchData(pageIndex) }, [pageIndex])

    if (initialLoading) return <div className="p-8 text-muted-foreground">Dang tai...</div>

    return (
        <div className="container mx-auto py-8 space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Lich su hoat dong</h1>
                <p className="text-muted-foreground text-sm">Cac yeu cau ban da duyet hoac tu choi</p>
            </div>
            <ApprovalTable
                data={data}
                role="APPROVER"
                currentUserName={userInfo?.name}
                isFetching={isFetching}
                onDataChange={() => { cache.current.clear(); fetchData(pageIndex) }}
                serverPagination={{ pageIndex, pageCount, totalElements, onPageChange: setPageIndex }}
                filterState={{
                    search: "",
                    status: "ALL",
                    onSearchChange: () => {},
                    onStatusChange: () => {},
                    onReset: () => {},
                }}
            />
        </div>
    )
}
