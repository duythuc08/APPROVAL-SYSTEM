// Types cho Approval Workflow

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface ApprovalHistoryItem {
    stepOrder: number
    stepName: string
    approverName: string
    action: "APPROVED" | "REJECTED"
    feedback: string | null
    decidedAt: string
}

export interface ApprovalRequest {
    approvalRequestId: number
    title: string
    approvalStatus: ApprovalStatus
    creatorName: string
    templateName: string
    currentStepOrder: number
    totalSteps: number
    currentStepName: string | null
    currentApproverName: string | null
    requestData: Record<string, any> | null
    history: ApprovalHistoryItem[]
    createdAt: string
    updatedAt: string | null
    currentStepDeadline: string | null
}

export interface PagedApprovalResult {
    content: ApprovalRequest[]
    totalElements: number
    totalPages: number
    number: number
}

export interface CreateApprovalRequestDTO {
    title: string
    templateId: number
    requestData: Record<string, any>
    overrideDeadlineHours?: number
}

export interface ColumnCallbacks {
    onApprove?: (request: ApprovalRequest) => void
    onReject?: (request: ApprovalRequest) => void
    onViewDetail?: (request: ApprovalRequest) => void
}

export type CurrentRole = "ADMIN" | "USER" | "APPROVER"
