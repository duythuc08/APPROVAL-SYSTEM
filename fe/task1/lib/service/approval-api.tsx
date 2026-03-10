import { CreateApprovalRequestDTO, PagedApprovalResult } from "@/types/approval"

const BASE_URL = "http://localhost:8080/task1"

async function authFetch(url: string) {
    const token = localStorage.getItem("token")
    const response = await fetch(`${BASE_URL}${url}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    })
    if (!response.ok) throw new Error("API ERROR!")
    return response.json()
}

function buildFilter(search: string, status: string): string {
    const parts: string[] = []
    if (search.trim()) {
        const q = search.trim().replace(/'/g, "\\'")
        parts.push(`title ~ '*${q}*'`)
    }
    if (status && status !== "ALL") {
        parts.push(`approvalStatus : '${status}'`)
    }
    return parts.join(" and ")
}

function buildParams(page: number, size: number, search: string, status: string): string {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    const filter = buildFilter(search, status)
    if (filter) params.set("filter", filter)
    return params.toString()
}

// ADMIN
export async function getAllApprovalRequests(page = 0, size = 5, search = "", status = "ALL"): Promise<PagedApprovalResult> {
    const json = await authFetch(`/approval-requests?${buildParams(page, size, search, status)}&sort=createdAt,desc`)
    return json.result
}

// APPROVER
export async function getPendingApprovalRequests(page = 0, size = 5, search = ""): Promise<PagedApprovalResult> {
    const json = await authFetch(`/approval-requests/myApprover?${buildParams(page, size, search, "ALL")}&sort=createdAt,desc`)
    return json.result
}

// USER
export async function getMyRequests(page = 0, size = 5, search = "", status = "ALL"): Promise<PagedApprovalResult> {
    const json = await authFetch(`/approval-requests/myUser?${buildParams(page, size, search, status)}&sort=createdAt,desc`)
    return json.result
}

// APPROVER — Lịch sử đã duyệt/từ chối
export async function getApproverHistory(page = 0, size = 10): Promise<PagedApprovalResult> {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    const json = await authFetch(`/approval-requests/myApproverHistory?${params}`)
    return json.result
}

export async function confirmApprovalRequest(
    id: number, approvalStatus: "APPROVED" | "REJECTED", feedback: string
): Promise<void> {
    const token = localStorage.getItem("token")
    const response = await fetch(`${BASE_URL}/approval-requests/${id}/confirm`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ approvalStatus, feedback }),
    })
    if (!response.ok) throw new Error("API ERROR!")
}

export async function creationApprovalRequest(payload: CreateApprovalRequestDTO): Promise<void> {
    const token = localStorage.getItem("token")
    const response = await fetch(`${BASE_URL}/approval-requests/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error("API ERROR!")
}
