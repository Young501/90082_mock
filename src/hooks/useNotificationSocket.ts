import { useAuthStore } from "@/store";
import { PROFILE_COLORS } from "@/theme/theme";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function useNotificationSocket() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const userType = useAuthStore((s) => s.getUserType());
  const accentColor = PROFILE_COLORS[(userType as keyof typeof PROFILE_COLORS) ?? "student"] ?? PROFILE_COLORS.student;
  const setHasUnreadMessages = useAuthStore((s) => s.setHasUnreadMessages);
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelay = useRef(1000);
  const pathnameRef = useRef(pathname);

  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

  useEffect(() => {
    if (!token) return;

    const wsBase = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";
    let destroyed = false;

    function connect() {
      if (destroyed) return;

      const ws = new WebSocket(`${wsBase}/ws/messaging/notifications/?token=${encodeURIComponent(token!)}`);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectDelay.current = 1000; // Reset backoff on successful connect
      };

      ws.onerror = (event) => {
        if (process.env.NODE_ENV === "development") {
          console.error("WebSocket Error:", event);
        }
      }

      ws.onclose = (event) => {
        if (destroyed) return;
        // 4001 means the token is invalid — reconnecting won't help
        if (event.code === 4001) return;

        setTimeout(connect, reconnectDelay.current);
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
      };

      ws.onmessage = (event) => {
        let data: { event?: string; message_id?: number; conversation_id?: number; sender_id?: number; sender_name?: string; preview?: string };
        try {
          data = JSON.parse(event.data);
        } catch {
          if (process.env.NODE_ENV === "development") {
            console.error("WebSocket: failed to parse message", event.data);
          }
          return;
        }

        if (data.event === "new_message") {
          // Refetch messages / conversations when new message arrives
          queryClient.invalidateQueries({ queryKey: ["messaging", "conversations"] });
          queryClient.invalidateQueries({ queryKey: ["homepage"] });

          // Only show toast and set unread badge if the message was NOT sent by the current user
          if (data.sender_id !== user?.id) {
            // Show toast only when user isn't already on the messaging page
            if (!pathnameRef.current.startsWith("/messaging")) {
              toast(`New message from ${data.sender_name}`, {
                id: `msg-${data.conversation_id}`,
                description: data.preview,
                action: {
                  label: "View",
                  onClick: () => router.push(`/messaging/?conversation=${data.conversation_id}`),
                },
                style: { borderLeft: `4px solid ${accentColor}` },
                actionButtonStyle: { backgroundColor: accentColor, color: "#fff", padding: "6px 16px", fontSize: "13px" },
              });
            }
            setHasUnreadMessages(true);
          }
        }
      }
    }

    connect();

    return () => {
      destroyed = true;
      wsRef.current?.close();
    };
  }, [token, user?.id, accentColor, queryClient, router, setHasUnreadMessages]);

  return;
}