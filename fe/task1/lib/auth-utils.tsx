import {jwtDecode} from "jwt-decode";
import {redirect} from "next/navigation";

interface TokenPayload {
    "iss": string,
    "sub": string,
    "exp": number,
    "iat": number,
    "jti": string,
    "scope": string
}

export function getTokenPayload(): TokenPayload | null {
    const token = localStorage.getItem("token");
    if (!token) {
        return null;
    }

    try {
        const decoded = jwtDecode<TokenPayload>(token);
        return decoded;
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
}

export function redirectByRole(token: string) {
    const payload = jwtDecode<TokenPayload>(token);
    const userRole = payload.scope;

    if (userRole === "ROLE_ADMIN") {
        redirect("/dashboard/admin");
    } else if (userRole === "ROLE_USER") {
        redirect("/dashboard/user");
    } else {
        redirect("/dashboard/approver");
    }
}