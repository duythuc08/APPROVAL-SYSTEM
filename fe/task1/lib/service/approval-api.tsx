import {ApprovalRequest, CreateApprovalRequestDTO} from "@/types/approval";

const BASE_URL = "http://localhost:8080/task1";

async function authFetch(url: string){
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}${url}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if(!response.ok)
        throw new Error("API ERROR!");
    return response.json();
}

//ADMIN
export async function getAllApprovalRequests(): Promise<ApprovalRequest[]> {
    const json = await authFetch("/approval-requests")
    return json.result;
}

// APPROVER
export async function getPendingApprovalRequests(): Promise<ApprovalRequest[]> {
    const json = await authFetch("/approval-requests/myApprover")
    return json.result;
}

// USER
export async function getMyRequests(): Promise<ApprovalRequest[]> {
    const json = await authFetch("/approval-requests/myUser")
    return json.result
}

export async function confirmApprovalRequest(
    id: number, approvalStatus: "APPROVED" | "REJECTED", feedback: string): Promise<void> {
    const token =localStorage.getItem("token");
    return fetch(`${BASE_URL}/approval-requests/${id}/confirm`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({approvalStatus, feedback})
    }).then(response => {
        if(!response.ok)
            throw new Error("API ERROR!");
    });
}

export async function creationApprovalRequest(payload: CreateApprovalRequestDTO): Promise<void> {
    const token =localStorage.getItem("token");
    return fetch(`${BASE_URL}/approval-requests/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    }).then(response => {
        if(!response.ok)
            throw new Error("API ERROR!");
        return response.json();
    });
}