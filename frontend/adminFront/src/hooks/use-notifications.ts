"use client";

import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useNotificationStore } from "@/lib/store";

const API_URL = process.env.NEXT_PUBLIC_NOTIFICATION_API_URL as string;

export function useNotifications(user: any) {
  const { notifications, setNotifications, updateNotification, removeNotification, markAllAsReadStore, addNotification } = useNotificationStore();
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user || (!user.id && !user._id)) {
      setLoading(false);
      return;
    }
    
    let mappedRole = user.role ? String(user.role).toUpperCase() : "USER";
    if (mappedRole === "INSTRUCTOR") mappedRole = "TEACHER";
    
    const userId = user._id || user.id;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}?recipientType=${mappedRole}&recipientId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  }, [user, setNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}/read`, { method: "PATCH" });
      if (res.ok) {
        updateNotification(id, { isRead: true });
      }
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user || (!user.id && !user._id)) return;
    let mappedRole = user.role ? String(user.role).toUpperCase() : "USER";
    if (mappedRole === "INSTRUCTOR") mappedRole = "TEACHER";
    const userId = user._id || user.id;

    try {
      const res = await fetch(`${API_URL}/read-all`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientType: mappedRole, recipientId: userId })
      });
      if (res.ok) {
        markAllAsReadStore();
      }
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        removeNotification(id);
      }
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

useEffect(() => {
  if (!user || (!user.id && !user._id)) return;

  const socketUrl =
    process.env.NEXT_PUBLIC_NOTIFICATION_SOCKET_URL || window.location.origin;

  const socketPath =
    process.env.NEXT_PUBLIC_NOTIFICATION_SOCKET_PATH || "/socket.io";

  const socket: Socket = io(socketUrl, {
    path: socketPath,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);

    let mappedRole = user.role ? String(user.role).toUpperCase() : "USER";
    if (mappedRole === "INSTRUCTOR") mappedRole = "TEACHER";

    socket.emit("join", {
      userId: user._id || user.id,
      role: mappedRole,
    });
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("notification:new", (notification: any) => {
    console.log("New notification received:", notification);
    addNotification(notification);
  });

  return () => {
    socket.disconnect();
  };
}, [user, addNotification]);

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications
  };
}
