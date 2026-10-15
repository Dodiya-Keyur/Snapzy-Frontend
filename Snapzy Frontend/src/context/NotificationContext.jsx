import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingUnread, setLoadingUnread] = useState(false);

    // Fetch unread count from backend
    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) {
            setUnreadCount(0);
            return;
        }

        try {
            setLoadingUnread(true);
            const response = await api.get("/noti/notifications/unread-count");
            if (response.data && typeof response.data.count === "number") {
                setUnreadCount(Math.max(0, response.data.count));
            }
        } catch (error) {
            // Silently log; avoid spamming console on network hiccups
            console.warn(
                "Failed to fetch unread count:",
                error.response?.data?.message || error.message
            );
        } finally {
            setLoadingUnread(false);
        }
    }, [isAuthenticated]);

    // Initial fetch and user state change
    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
        } else {
            setUnreadCount(0);
        }
    }, [isAuthenticated, user?._id, fetchUnreadCount]);

    // Window focus & custom event synchronization
    useEffect(() => {
        if (!isAuthenticated) return;

        const handleSync = () => {
            fetchUnreadCount();
        };

        window.addEventListener("focus", handleSync);
        window.addEventListener("snapzy:notifications-changed", handleSync);

        // Periodically refresh unread count every 30 seconds
        const intervalId = setInterval(handleSync, 30000);

        return () => {
            window.removeEventListener("focus", handleSync);
            window.removeEventListener("snapzy:notifications-changed", handleSync);
            clearInterval(intervalId);
        };
    }, [isAuthenticated, fetchUnreadCount]);

    // Mark all as read API helper
    const markAllAsRead = useCallback(async () => {
        setUnreadCount(0);
        try {
            const res = await api.patch("/noti/notifications/read-all");
            window.dispatchEvent(new CustomEvent("snapzy:notifications-changed"));
            return res.data;
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
            // Re-fetch to sync actual state
            fetchUnreadCount();
            throw error;
        }
    }, [fetchUnreadCount]);

    // Delete single notification API helper
    const deleteNotificationApi = useCallback(
        async (notificationId, wasUnread = false) => {
            if (wasUnread) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }

            try {
                const res = await api.delete(
                    `/noti/delete-notifications/${notificationId}`
                );
                window.dispatchEvent(
                    new CustomEvent("snapzy:notifications-changed")
                );
                return res.data;
            } catch (error) {
                console.error("Failed to delete notification:", error);
                fetchUnreadCount();
                throw error;
            }
        },
        [fetchUnreadCount]
    );

    // Delete all notifications API helper
    const deleteAllNotificationsApi = useCallback(async () => {
        setUnreadCount(0);
        try {
            const res = await api.delete(
                "/noti/notifications/delete-notifications"
            );
            window.dispatchEvent(
                new CustomEvent("snapzy:notifications-changed")
            );
            return res.data;
        } catch (error) {
            console.error("Failed to delete all notifications:", error);
            fetchUnreadCount();
            throw error;
        }
    }, [fetchUnreadCount]);

    // Decrement unread count locally
    const decrementUnreadCount = useCallback((amount = 1) => {
        setUnreadCount((prev) => Math.max(0, prev - amount));
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                unreadCount,
                hasUnread: unreadCount > 0,
                loadingUnread,
                setUnreadCount,
                fetchUnreadCount,
                decrementUnreadCount,
                markAllAsRead,
                deleteNotificationApi,
                deleteAllNotificationsApi,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        return {
            unreadCount: 0,
            hasUnread: false,
            loadingUnread: false,
            setUnreadCount: () => {},
            fetchUnreadCount: async () => {},
            decrementUnreadCount: () => {},
            markAllAsRead: async () => {},
            deleteNotificationApi: async () => {},
            deleteAllNotificationsApi: async () => {},
        };
    }
    return context;
};
