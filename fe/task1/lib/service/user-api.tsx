import axios from "@/lib/axios";

interface userCreationData {
    userName: string;
    passWord: string;
    email: string;
    name: string;
    department: string;
    roles: string[]; // "ROLE_USER", "ROLE_ADMIN", "ROLE_APPROVER"
}
interface userUpdateData {
    userName: string;
    email: string;
    name: string;
    department: string;
    roles: string[]; // "ROLE_USER", "ROLE_ADMIN", "ROLE_APPROVER"
}

export const userService = {
    getAllUsers: async (): Promise<any> => {
        const response = await axios.get("/users/getUsers");
        return response.data; // Axios tự động parse JSON cho bạn
    },
    getAllUsersWithRoles: async (role: string): Promise<any> => {
        const response = await axios.get("/users/getUserByRole", {
            params: { role }
        });
        return response.data; // Axios tự động parse JSON cho bạn
    },

    getMyInfo: async (): Promise<any> => {
        const response = await axios.get("/users/getMyInfo");
        return response.data; // Axios tự động parse JSON cho bạn
    },

    createUser: async (userCreationData: any): Promise<any> => {
        const response = await axios.post("/users/create", userCreationData);
        return response.data; // Axios tự động parse JSON cho bạn
    },

    updateUser: async (userId: string, userUpdateData: any): Promise<any> => {
        const response = await axios.put(`/users/updateUser/${userId}`, userUpdateData);
        return response.data; // Axios tự động parse JSON cho bạn
    },

    deleteUserById: async (userId: string): Promise<any> => {
        const response = await axios.delete(`/users/deleteUser/${userId}`);
        return response.data; // Axios tự động parse JSON cho bạn
    }
}