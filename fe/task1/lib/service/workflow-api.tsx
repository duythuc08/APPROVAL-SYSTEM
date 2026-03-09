import axiosInstance from "@/lib/axios"
import { WorkflowTemplate } from "@/types/workflow"

export const workflowService = {
    async getAll(): Promise<WorkflowTemplate[]> {
        const res = await axiosInstance.get("/workflows")
        return res.data.result
    },

    async getById(id: number): Promise<WorkflowTemplate> {
        const res = await axiosInstance.get(`/workflows/${id}`)
        return res.data.result
    },

    async create(data: {
        name: string
        description: string
        steps: { stepOrder: number; stepName: string; requiredRole?: string; specificApproverId?: string }[]
    }) {
        const res = await axiosInstance.post("/workflows/create", data)
        return res.data.result
    },

    async update(id: number, data: {
        name: string
        description: string
        steps: { stepOrder: number; stepName: string; requiredRole?: string; specificApproverId?: string }[]
    }) {
        const res = await axiosInstance.put(`/workflows/${id}`, data)
        return res.data.result
    },

    async delete(id: number) {
        const res = await axiosInstance.delete(`/workflows/${id}`)
        return res.data
    },
}
