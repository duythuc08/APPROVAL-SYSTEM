import api from "@/lib/axios";
export const authService = {
    login: async (userName: string, passWord: string) : Promise<any> => {
        const response = await api.post("/auth/login", {userName,passWord});
        return response.data; // Axios tự động parse JSON cho bạn
    },

    logout: async (token: string): Promise<any> => {
        return api.post("/auth/logout", { token });
    }
};