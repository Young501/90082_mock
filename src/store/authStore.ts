import { create } from "zustand"
import { persist } from "zustand/middleware"
import { User } from "@/app/types/user"

export interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    setAuthData: (token: string, user: User) => void
    logout: () => void
    setUserType: (userType: string) => void
    getCurrentUser: () => User | null
    getCurrentToken: () => string | null
    getUserType: () => string | undefined
    signupSelectedUserType: string | null
    setSignupSelectedUserType: (userType: string | null) => void
    getSignupSelectedUserType: () => string | null
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            signupSelectedUserType: null,

            setAuthData: (token: string, user: User) => {
                set({
                    user,
                    token,
                    isAuthenticated: true,
                })
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                })

                if (typeof window !== "undefined") {
                    window.location.href = "/login"
                }
            },

            setUserType: (userType: string) => {
                const { user } = get()
                if (!user) return

                const updatedUser: User = {
                    ...user,
                    user_types: [userType],
                }

                set({ user: updatedUser })
            },

            getCurrentUser: () => get().user,
            getCurrentToken: () => get().token,
            getUserType: () => get().user?.user_types?.[0],

            setSignupSelectedUserType: (userType: string | null) => {
                set({ signupSelectedUserType: userType })
            },
            getSignupSelectedUserType: () => get().signupSelectedUserType,
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
