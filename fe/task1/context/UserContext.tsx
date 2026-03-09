"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { userService } from "@/lib/service/user-api"

interface UserInfo {
    userName: string
    name: string
    email: string
    department: string
    roles: string[]
}

interface UserContextValue {
    userInfo: UserInfo | null
    loading: boolean
}

const UserContext = createContext<UserContextValue>({ userInfo: null, loading: true })

export function UserProvider({ children }: { children: ReactNode }) {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        userService.getMyInfo()
            .then((res) => setUserInfo(res.result ?? null))
            .catch(() => setUserInfo(null))
            .finally(() => setLoading(false))
    }, [])

    return (
        <UserContext.Provider value={{ userInfo, loading }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    return useContext(UserContext)
}

