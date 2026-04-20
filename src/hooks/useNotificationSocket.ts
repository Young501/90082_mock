import { useAuthStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

export function useNotificationSocket() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setHasUnreadMessages = useAuthStore((s) => s.setHasUnreadMessages);
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelay = useRef(1000);

  useEffect(() => {
    if (!token) return;

    const wsBase = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";
    let destroyed = false;

    function connect() {
      if (destroyed) return;

      const ws = new WebSocket(`${wsBase}/ws/notification/?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectDelay.current = 1000; // Reset backoff on successful connect
      };

      ws.onclose = () => {
        if (destroyed) return;

        setTimeout(connect, reconnectDelay.current);
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "new_message") {
          // Refetch messages / conversations when new message arrives
          queryClient.invalidateQueries({ queryKey: ["messaging", "conversations"] });

          // Only show toast and set unread badge if the message was NOT sent by the current user
          if (data.sender_id !== user?.id) {
            // Show toast only when user isn't already on the messaging page
            if (!pathname.startsWith("/messaging")) {
              toast.info(`New message from ${data.sender_name}: ${data.preview}`, {
                toastId: `msg-${data.conversation_id}`,
                onClick: () => { router.push(`/messaging/?conversation=${data.conversation_id}`) }
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
  }, [token, user?.id, pathname]);

  return;
}