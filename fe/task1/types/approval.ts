// Luôn bắt đầu từ đây để có type-safety toàn app

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface Product {
    productId: number
    productName: string
    productDescription: string
    productPrice: number
}

export interface AppUser {
    userId: string
    userName: string
    name: string
    email: string
    roles: Role[]
}

export interface Role {
    roleId: number
    roleName: "USER" | "APPROVER" | "ADMIN"
    permissions: Permission[]
}

export interface Permission {
    permissionId: number
    permissionName: string
    permissionDescription: string
}

export interface ApprovalRequest {
    approvalRequestId: number
    title: string
    approvalDescription: string
    ApprovalStatus: ApprovalStatus
    products: Product[]
    productQuantities: Record<number, number> // productId → số lượng yêu cầu
    creatorUser: AppUser
    currentApprover: AppUser
    feedback: string | null
    createdAt: string
    updatedAt: string | null
}

export interface PagedApprovalResult {
    content: ApprovalRequest[]
    totalElements: number
    totalPages: number
    number: number
}

export interface CreateApprovalRequestDTO {
    title: string
    approvalDescription: string
    productQuantities: Record<number, number> // { productId: quantity }
    currentApproverId: string
}

export interface ColumnCallbacks {
    onApprove?: (request: ApprovalRequest) => void
    onReject?: (request: ApprovalRequest) => void
    onViewDetail?: (request: ApprovalRequest) => void
}

// Role của người đang đăng nhập
export type CurrentRole = "ADMIN" | "USER" | "APPROVER"