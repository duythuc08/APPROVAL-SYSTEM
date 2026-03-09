export interface WorkflowStep {
    id: number
    stepOrder: number
    stepName: string
    requiredRole: string | null
    specificApproverId: string | null
    specificApproverName: string | null
    specificApproverUserName: string | null
}

export interface WorkflowTemplate {
    id: number
    name: string
    description: string | null
    steps: WorkflowStep[]
}
