import axios from "@/lib/axios";


interface productCreationData {
    productName: string;
    productDescription: string;
    productQuantity: number;
    productType: string;
}

export const productService = {
    getAllProducts: async (): Promise<any> => {
        const response = await axios.get("/products");
        return response.data; // Axios tự động parse JSON cho bạn
    },

    getProductsByOwner: async (ownerUserName: string): Promise<any> => {
        const response = await axios.get(`/products/department/${ownerUserName}`);
        return response.data;
    },

    createProduct: async (productCreationData: any): Promise<any> => {
        const response = await axios.post("/products/create", productCreationData);
        return response.data;
    },

    deleteProductById: async (productId: number): Promise<void> => {
        await axios.delete(`/products/delete/${productId}`);
    }
}