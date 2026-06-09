import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UIState {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  hasUnreadMessages: boolean;
  unreadCount: number;
  setHasUnreadMessages: (hasUnread: boolean) => void;
  setUnreadCount: (count: number) => void;
  resetUnread: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      isSidebarCollapsed: false,
      hasUnreadMessages: false,
      unreadCount: 0,
      toggleSidebar: () =>
        set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
      setHasUnreadMessages: (hasUnread: boolean) => {
        if (get().hasUnreadMessages !== hasUnread) {
          set({ hasUnreadMessages: hasUnread });
        }
      },
      setUnreadCount: (count: number) => {
        set({ unreadCount: count, hasUnreadMessages: count > 0 });
      },
      resetUnread: () => {
        set({ hasUnreadMessages: false, unreadCount: 0 });
      },
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
);
