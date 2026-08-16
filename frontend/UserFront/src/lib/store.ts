import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
    user: {
        id: string
        name: string
        email: string
        role: 'instructor' | 'student' | 'admin' | null
        avatar?: string
    } | null
    setUser: (user: UserState['user']) => void
    logout: () => void
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            logout: () => set({ user: null }),
        }),
        {
            name: 'user-storage',
        }
    )
)

interface AppState {
    sidebarOpen: boolean
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))

export const useNotificationStore = create<any>((set) => ({
    notifications: [],
    setNotifications: (notifications: any[]) => set({ notifications }),
    updateNotification: (id: string, updates: any) => set((state: any) => ({
        notifications: state.notifications.map((n: any) => 
            (n._id === id || n.id === id) ? { ...n, ...updates } : n
        )
    })),
    removeNotification: (id: string) => set((state: any) => ({
        notifications: state.notifications.filter((n: any) => n._id !== id && n.id !== id)
    })),
    markAllAsReadStore: () => set((state: any) => ({
        notifications: state.notifications.map((n: any) => ({ ...n, isRead: true }))
    })),
    addNotification: (notification: any) => set((state: any) => {
        const exists = state.notifications.some((n: any) => (n._id || n.id) === (notification._id || notification.id));
        if (exists) return state;
        return { notifications: [notification, ...state.notifications] };
    })
}))
